function ForgetTemplate(token) {
  let html =
    `<!DOCTYPE html>
<html>
<head>
  <style>
    /* Add inline CSS for better email client compatibility */
    table {
      font-family: Arial, sans-serif;
      border-collapse: collapse;
      width: 60%;
      margin: 0 auto;
    }

    table, td {
      border: 1px solid #ddd;
      margin-block: 30px;
    }
    .outer-div{
      background-color : #f5f6f7;
      padding-top : 50px;
      padding-bottom : 50px;
    }
    td {
      padding: 8px;
      text-align: left;
    }

    td.header {
      border-block-end : 1px solid #f5f6f7;
    }
    tr {
      background-color : white;
    }

  </style>
</head>
<body>
<div class="outer-div">
<table >
  <tr>
    <td class="header" colspan="2">
    <img src="http://drive.google.com/uc?export=view&id=1Bxzu7SoWFK1soNkb_R99kft1X3cWJqyE" alt="logo" width="150" height="50">
      
    </td>
  </tr>
  <tr>
    <td class="content" colspan="2">
   
      <p>Dear Sir/Ma'am,</p>
      <p>A password reset event has been triggered. The password reset window is limited to 5 minutes.</p>
      <p>If you do not reset your password within five minutes, you will need to submit a new request.</p>
      <p>Complete the password reset process, visit the following link:</p>
      <a href=http://localhost:4200/auth/forgetPassword/${token}> Forget Password</a>
    </td>
  </tr>
</table>
</div>

</body>
</html>

`
  return html;

}

function SignupTemplate() {
  let html =
    `
<!DOCTYPE html>
<html>
<head>
  <style>
    table {
      font-family: Arial, sans-serif;
      border-collapse: collapse;
      width: 60%;
      margin: 0 auto;
    }

    table, td {
      border: 0.5px solid #ddd;
    }
    .outer-div{
      background-color : #f5f6f7;
      padding-top : 50px;
      padding-bottom : 50px;
    }
    td {
      padding: 8px;
      text-align: left;
    }

    td.header {
      border-block-end : 1px solid #f5f6f7;
    }
    tr, td {
      background-color: #ffffff;
    }
  </style>
</head>
<body>
<div class="outer-div">
<table >
  <tr>
    <td class="header" colspan="2">
      <img src="http://drive.google.com/uc?export=view&id=1Bxzu7SoWFK1soNkb_R99kft1X3cWJqyE" alt="logo" width="150" height="50">
    </td>
  </tr>
  <tr >
    <td colspan="2" style="padding: 15px">
      <p>Dear Sir/Ma'am,</p>
      <p>Welcome to Trade Vogue! We're thrilled to have you join our online shopping community. Thank you for signing up and becoming a part of our family.</p>
      <p>As a member of Trade Vogue, you'll enjoy exclusive benefits, personalized recommendations, and access to a wide range of products and deals.</p>
      <p>We can't wait to see you on our website and make your shopping experience memorable. Thank you for choosing us.</p>
      <p>Happy shopping!</p>
    </td>
  </tr>
</table>
</div>

</body>
</html>

`


  return html;
}

function SubscribeTemplate() {
  let html =
    `<!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Add inline CSS for better email client compatibility */
      table {
        font-family: Arial, sans-serif;
        border-collapse: collapse;
        width: 60%;
        margin: 0 auto;
      }
  
      table, td {
        border: 1px solid #ddd;
        margin-block: 30px;
      }
      .outer-div{
        background-color : #f5f6f7;
        padding-top : 50px;
        padding-bottom : 50px;
      }
      td {
        padding: 8px;
        text-align: left;
      }
  
      td.header {
        border-block-end : 1px solid #f5f6f7;
      }
      tr {
        background-color : white;
      }
  
    </style>
  </head>
  <body>
  <div class="outer-div">
  <table >
    <tr>
      <td class="header" colspan="2">
        <h1>Dear User,</h1>
      </td>
    </tr>
    <tr>
      <td class="content" colspan="2">
        <p>Dear Sir/Ma'am,</p>
        <p>We hope this message finds you well. We are excited to express our gratitude for your continued support and loyalty. It's subscribers like you who make our community special, and we want to thank you for being a part of our journey.</p>
        <p>As a token of our appreciation, we are pleased to offer you an exclusive 25% discount on your next purchase! This is our way of saying "thank you" for choosing to be a part of our family.</p>
        <p>To redeem your 25% discount, simply use the following promo code at checkout: SUBSCRIBE25</p>
      </td>
    </tr>
  </table>
  </div>

  </body>
  </html>
  
  `
  return html;
}



async function TicketStatusTemplate(mailData) {
  let statusText = mailData.status === 'open' ? 'Open' : 'Closed';

  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Add inline CSS for better email client compatibility */
    table {
      font-family: Arial, sans-serif;
      border-collapse: collapse;
      width: 60%;
      margin: 0 auto;
    }

    table, td {
      border: 1px solid #ddd;
      margin-block: 30px;
    }

    .outer-div {
      background-color: #f5f6f7;
      padding-block: 30px;
      padding-top : 50px;
      padding-bottom : 50px;
    }

    td {
      padding: 8px;
      text-align: left;
    }

    td.header {
      border-block-end: 1px solid #f5f6f7;
    }

    tr, td {
      background-color: #ffffff;
    }

  </style>
</head>
<body>
<div class="outer-div">
  <table>
    <tr>
      <td class="header" colspan="2">
        <h1>Ticket Status Notification</h1>
      </td>
    </tr>
    <tr>
      <td class="content" colspan="2">
        <p>Dear Sir/Ma'am,</p>
        <p>Your support ticket status has been updated to: <strong>${statusText}</strong></p>
        <p>Message : <strong>${mailData.message}</strong></p>
        <p>Our team is here to assist you. If you have any further questions or need additional help, please don't hesitate to reach out to us.</p>
        <p>Thank you for choosing our services. We are committed to providing the best support for you.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>
  `;

  return html;
}

async function sendInvoiceTemplate(paymentData) {
  let productList = JSON.parse(paymentData.description);

  let productRows = productList.map(product => {
    let productDetails = product.id.map((productId, index) => {
      return `
        <a href="http://localhost:4200/product/${productId}" style="text-decoration: none; color: #007bff;">${product.name[index]}: ${productId}</a>
      `;
    }).join('<br>');

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #dddddd;">${productDetails}</td>
        <td style="padding: 8px; border: 1px solid #dddddd;"> ${paymentData.amount / 100} ${paymentData.currency}</td>
      </tr>
    `;
  }).join('');

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Add inline CSS for better email client compatibility */
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }

        .outer-div {
          width: 70%;
          margin: 20px auto;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        h1 {
          color: #333;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background-color: #f2f2f2;
          padding: 8px;
          border: 1px solid #dddddd;
        }

        td {
          padding: 8px;
          border: 1px solid #dddddd;
        }

        a {
          text-decoration: none;
          color: #007bff;
        }

        a:hover {
          color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="outer-div">
        <h1>Payment Successful</h1>
        <p>Dear Customer,</p>
        <p>Your payment was successful. Below are the details:</p>
        <table>
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <p><strong>Total Amount:</strong> ${paymentData.amount / 100} ${paymentData.currency}</p>
        <p><strong>Payment ID:</strong> ${paymentData.id}</p>
        <p><strong>Receipt Email:</strong> ${paymentData.receipt_email}</p>
        <p>Our team is here to assist you. If you have any further questions or need additional help, please don't hesitate to reach out to us.</p>
        <p>Thank you for your purchase. We appreciate your business!</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

async function sendDiscountTemplate(discountData) {
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Add inline CSS for better email client compatibility */
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }

        .outer-div {
          width: 70%;
          margin: 20px auto;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        h1 {
          color: #333;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background-color: #f2f2f2;
          padding: 8px;
          border: 1px solid #dddddd;
        }

        td {
          padding: 8px;
          border: 1px solid #dddddd;
        }

        a {
          text-decoration: none;
          color: #007bff;
        }
        img {
          width : 100%;
          height: 200px;
        }

        a:hover {
          color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="outer-div">
        <h1>New Discount</h1>
        <p>Dear Customer,</p>
        <p>Hurry! As we have discount going up in our products</p>
    <a href="${discountData.Link}"><img src=${discountData.Image}  alt="img" width="200" height="100"></a>
        <h2><strong>${discountData.Title}</strong></h2>
        <h2><strong>${discountData.Description}</strong></h2>
        <h2><strong>${discountData.startDate}</strong></h2>
        <h2><strong>${discountData.endDate}</strong></h2>
        <p>We hope that you will enjoy our offers and discounts.</p>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    </body>
    </html>
  `;

  return html;
}






// <img src="https://cdn.filestackcontent.com/orYXP4hDTryz5vNbCfBo" alt="logo" width="140" height="35"/>

module.exports = {
  ForgetTemplate,
  SignupTemplate,
  SubscribeTemplate,
  TicketStatusTemplate,
  sendInvoiceTemplate,
  sendDiscountTemplate,
}