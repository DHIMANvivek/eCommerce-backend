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
      <h1>Password Reset
      
    </td>
  </tr>
  <tr>
    <td class="content" colspan="2">
      <p>Dear Sir/Ma'am,</p>
      <p>A password reset event has been triggered. The password reset window is limited to two hours.</p>
      <p>If you do not reset your password within two hours, you will need to submit a new request.</p>
      <p>o complete the password reset process, visit the following link:</p>
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

function SignupTemplate(email) {
  let html =
    `
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
    .outer-div{
      background-color : #f5f6f7;
      padding-block : 30px;
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
      <h1>Welcome to Trade Vogue!
      
    </td>
  </tr>
  <tr>
    <td class="content" colspan="2">
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

function SubscribeTemplate(email) {
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
  console.log(mailData , "status")
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


// <img src="https://cdn.filestackcontent.com/orYXP4hDTryz5vNbCfBo" alt="logo" width="140" height="35"/>

module.exports = { ForgetTemplate, SignupTemplate, SubscribeTemplate, TicketStatusTemplate }