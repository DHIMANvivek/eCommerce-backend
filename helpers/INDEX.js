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
    }
    td {
      padding: 8px;
      text-align: left;
    }

    td.header {
      border-block-end : 1px solid #f5f6f7;
    }

  </style>
</head>
<body>
<div class="outer-div">
<table >
  <tr>
    <td class="header" colspan="2">
      <h1>Welcome to our community!
      
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

// <img src="https://cdn.filestackcontent.com/orYXP4hDTryz5vNbCfBo" alt="logo" width="140" height="35"/>

module.exports = { ForgetTemplate, SignupTemplate }