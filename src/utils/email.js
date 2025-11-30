const nodemailer = require("nodemailer");

exports.sendEmail = async (to, name, fileName, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: "Order Confirmed",
    text: `Hi ${name}, Your order is confirmed. Please find the invoice attached with this email.`,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer
      }
    ]
  });
};
