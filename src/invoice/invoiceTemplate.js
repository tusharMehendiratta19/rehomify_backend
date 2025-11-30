module.exports = ({ 
  orderId, date, time, product, qty, color, price,
  customerName, customerNumber, deliveryAddress 
}) => {
  return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title {
          font-size: 32px;
          color: #4a90e2;
          font-weight: bold;
        }

        .company-info, .bill-to {
          font-size: 14px;
          line-height: 18px;
        }

        // .invoice-box {
        //   margin-top: 20px;
        //   border: 1px solid #ccc;
        //   padding: 10px 14px;
        //   width: 260px;
        //   font-size: 14px;
        // }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
        }

        th {
          background: #e8eef7;
          text-align: left;
          padding: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        td {
          padding: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        .footer-row td {
          border: none;
          padding-top: 20px;
          font-style: italic;
          font-size: 14px;
        }

        .total-row td {
          font-weight: bold;
          font-size: 16px;
          padding: 14px;
        }

      </style>
    </head>

    <body>

      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <strong>Rehomify</strong><br/>
          admin@rehomify.in<br/>
        </div>

        <div class="title">INVOICE</div>
      </div>

      <!-- Invoice Number / Date -->
      <div class="invoice-box">
        <table>
          <tr>
            <td><strong>INVOICE #</strong></td>
            <td>${orderId}</td>
          </tr>
          <tr>
            <td><strong>DATE</strong></td>
            <td>${date}</td>
          </tr>
          <tr>
            <td><strong>TIME</strong></td>
            <td>${time}</td>
          </tr>
        </table>
      </div>

      <!-- Bill To -->
      <h3 style="margin-top: 40px; background:#e8eef7; padding:6px;">BILL TO</h3>
      <div class="bill-to">
        <strong>${customerName}</strong><br/>
        Phone: ${customerNumber}<br/>
        Address: ${deliveryAddress}<br/>
      </div>

      <!-- Table -->
      <table style="margin-top: 30px;">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>AMOUNT</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <strong>${product}</strong><br/>
              Quantity: ${qty}<br/>
              Color: ${color}
            </td>
            <td>${price}</td>
          </tr>

          <!-- TOTAL -->
          <tr class="total-row">
            <td style="text-align: right;">TOTAL</td>
            <td>${price}</td>
          </tr>
        </tbody>
      </table>

      <table style="margin-top: 10px; width: 100%;">
        <tr class="footer-row">
          <td>Thank you for your Order!</td>
        </tr>
      </table>

    </body>
  </html>`;
};
