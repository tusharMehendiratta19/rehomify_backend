const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const mongoose = require("mongoose");
const puppeteer = require('puppeteer');
const invoiceTemplate = require('../invoice/invoiceTemplate');
const { uploadToS3 } = require('../utils/s3');
const { sendEmail } = require('../utils/email');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .select("productId customerId quantity createdAt deliveryDate status")
      .populate({
        path: "productId",
        select: "category name description price image"
      })
      .populate({
        path: "customerId",
        select: "firstName lastName email phone"
      });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    const formatted = orders.map(order => ({
      id: order._id,
      orderDate: order.createdAt,
      deliveryDate: order.deliveryDate,
      status: order.status,
      quantity: order.quantity,
      product: order.productId
        ? {
          id: order.productId._id,
          category: order.productId.category,
          name: order.productId.name,
          description: order.productId.description,
          price: order.productId.price,
          imageUrl: order.productId.image,
        }
        : null,
      customer: order.customerId
        ? {
          id: order.customerId._id,
          firstName: order.customerId.firstName,
          lastName: order.customerId.lastName,
          email: order.customerId.email,
          phone: order.customerId.phone,
        }
        : null
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const customerId = req.params.custId;

    // Validate customerId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Step 1: Find orders for the customer and get all productIds
    const orders = await Order.find({ customerId }).select("productId quantity createdAt deliveryDate status");
    console.log("orders: ", orders);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this customer" });
    }

    const productIds = orders.map(order => order.productId);
    console.log("productIds: ", productIds);

    // Step 2: Fetch all matching products
    const products = await Product.find({ _id: { $in: productIds } }).select("category name description price image");

    console.log("products: ", products);

    // Step 3: Create a map of productId to product for fast lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });

    // Step 4: Format the order list
    const formattedOrders = orders.map(order => {
      const product = productMap.get(order.productId.toString());

      return {
        id: order._id,
        orderDate: order.createdAt,
        deliveryDate: order.deliveryDate,
        status: order.status,
        quantity: order.quantity,
        product: product ? {
          id: product._id,
          category: product.category,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image,
        } : null,
      };
    });

    return res.status(200).json(formattedOrders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.addOrder = async (req, res) => {
  try {
    const { productId, customerId, quantity } = req.body;

    // Validate required fields
    if (!productId || !customerId) {
      return res.status(400).json({ message: "productId and customerId are required" });
    }

    // Find the product to get sellerId, isNew, isRefurbished
    const product = await Product.findById(productId);
    console.log("product: ", product)

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // else {
    //   return res.send({
    //     status: true,
    //     result: product
    //   })
    // }

    const newOrder = new Order({
      productId,
      customerId,
      quantity,
      sellerId: product.sellerId,
      isNewProduct: product.isNewProduct,
      isRefurbished: product.isRefurbished,
      status: "placed"
    });

    const result = await newOrder.save();

    res.status(201).json({
      status: true,
      message: "Order placed successfully",
      order: result
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findById(orderId)
      .select("quantity createdAt productId customerId deliveryAddress")
      .populate({
        path: "productId",
        select: "name price color image"
      })
      .populate({
        path: "customerId",
        select: "name email mobileNo address"
      });


    const customerAddress = `${order.customerId?.address?.addressLine1 || ""} ${order.customerId?.address?.addressLine2 || ""
      } ${order.customerId?.address?.city || ""} ${order.customerId?.address?.state || ""
      }-${order.customerId?.address?.pinCode || ""}`;

    console.log("POPULATED CUSTOMER:", order.customerId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const date = order.createdAt.toISOString().split("T")[0];
    const time = order.createdAt.toTimeString().split(" ")[0];

    const html = invoiceTemplate({
      orderId,
      date,
      time,
      product: order.productId?.name || "",
      qty: order.quantity,
      color: order.color || order.productId?.color || "",
      customerName: order.customerId?.name || "",
      customerNumber: order.customerId?.mobileNo || "",
      price: order.productId?.price || 0,
      deliveryAddress: customerAddress || "",
      customerEmail: order.customerId?.email || ""
    });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    const filePath = `invoice/${orderId}.pdf`;
    const s3Url = await uploadToS3(pdfBuffer, filePath, orderId);

    // await sendEmail(order.customerId.email, order.customerId.name, filePath, pdfBuffer);

    return res.json({
      success: true,
      message: "Invoice created successfully",
      s3Url
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};


// exports.generateInvoice = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     let customerNorder = Customer.findOne({ _id: custId })

//     const html = invoiceTemplate({
//       orderId, date, time, product, qty, color,
//       customerName, customerNumber, price, deliveryAddress, customerEmail
//     });

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"]
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({ format: 'A4' });
//     await browser.close();

//     const fileName = `invoice/${orderId}.pdf`;

//     const s3Url = await uploadToS3(pdfBuffer, fileName);

//     // await sendEmail(customerEmail, customerName, fileName, pdfBuffer);

//     return res.json({
//       success: true,
//       message: "Invoice created & emailed successfully",
//       s3Url
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, msg: err });
//   }
// };


exports.getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId is required" });
    }

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (!order.invoiceUrl) {
      return res.status(400).json({ success: false, error: "Invoice not generated for this order" });
    }

    // Extract the S3 key from stored URL
    const bucket = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    // Example invoiceUrl:
    // https://rehomifystores.s3.ap-south-1.amazonaws.com/invoices/123.pdf

    const base = `https://${bucket}.s3.${region}.amazonaws.com/`;
    const key = order.invoiceUrl.replace(base, "");

    // Generate signed URL (15 min)
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 900 }
    );

    return res.status(200).json({
      success: true,
      url: signedUrl,
    });

  } catch (error) {
    console.error("getInvoice error:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
