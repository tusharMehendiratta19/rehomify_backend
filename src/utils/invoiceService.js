const Order = require("../models/Order");
const puppeteer = require("puppeteer");
const invoiceTemplate = require("../invoice/invoiceTemplate");
const uploadToS3 = require("./s3");
const sendEmail = require("./email");

exports.processInvoiceAndEmail = async function (orderId) {
    try {
        if (!orderId) throw new Error("orderId is required");

        const order = await Order.findById(orderId)
            .select("quantity createdAt productId customerId deliveryAddress color")
            .populate({
                path: "productId",
                select: "name price color image"
            })
            .populate({
                path: "customerId",
                select: "name email mobileNo address"
            });

        if (!order) throw new Error("Order not found");

        // ------- Build customer address -------
        const addr = order.customerId?.address || {};
        const customerAddress =
            `${addr.addressLine1 || ""} ${addr.addressLine2 || ""} ${addr.city || ""} ${addr.state || ""}-${addr.pinCode || ""}`.trim();

        // ------- Date / Time -------
        const date = order.createdAt.toISOString().split("T")[0];
        const time = order.createdAt.toTimeString().split(" ")[0];

        // ------- HTML Template -------
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
            deliveryAddress: customerAddress,
            customerEmail: order.customerId?.email || ""
        });

        // ------- Generate PDF -------
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();

        // ------- Upload to S3 -------
        const filePath = `invoice/${orderId}.pdf`;
        const s3Url = await uploadToS3(pdfBuffer, filePath, orderId);

        // ------- Send Email -------
        await sendEmail(
            order.customerId.email,
            order.customerId.name,
            `${orderId}.pdf`,
            pdfBuffer
        );

        return {
            success: true,
            message: "Invoice created and email sent",
            s3Url
        };

    } catch (err) {
        console.error("Invoice Processing Error:", err);
        throw err;
    }
};
