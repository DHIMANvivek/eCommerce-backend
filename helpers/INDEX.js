function ForgetTemplate(token) {
  let html =
    `<!DOCTYPE html>
<html>
 
  <body>
    <p>
      Click on this link below to change your password.
    </p>

  <a href=http://localhost:4200/auth/forgetPassword/${token}> Forget Password</a>
  </body>
</html>
`
  return html;

}

function SignupTemplate(email) {
  let html =
    `<!DOCTYPE html>
<html>
  <head>
    <title>Playing with Inline Styles</title>
  </head>


  <body>
    <p>
      I m a big, blue, <strong>strong</strong> paragraph
    </p>

  vfjvjfvif
  </body>
</html>
`


  return html;
}



module.exports = { ForgetTemplate, SignupTemplate }