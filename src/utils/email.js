const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, name, fileName, pdfBuffer) => {
  try {
    // Ensure buffer is actually a Buffer
    const buffer =
      Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    //console.log("PDF TYPE:", typeof pdfBuffer);
    //console.log("IS BUFFER:", Buffer.isBuffer(pdfBuffer));
    //console.log("ENCODED LENGTH:", buffer.toString("base64").length);

    const msg = {
      to,
      from: process.env.SENDGRID_SENDER,
      subject: "Order Confirmed",
      text: `Hi ${name}, Your order is confirmed. Please find the invoice attached.`,
      attachments: [
        {
          content: buffer.toString("base64"),
          filename: fileName,
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };

    await sgMail.send(msg);
    //console.log("Email sent via SendGrid");

    return true;

  } catch (error) {
    console.error("SendGrid Error:", JSON.stringify(error.response?.body, null, 2));
    throw new Error("Failed to send email");
  }
};
