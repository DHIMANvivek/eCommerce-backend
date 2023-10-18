const nodemailer = require("nodemailer")
const {ForgetTemplate,SignupTemplate, SubscribeTemplate}=require('../helpers/INDEX');

async function sendMail(data, Template) {
  
    try {
        console.log("nodemailer data", data);
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'testnodemailerapis@gmail.com',
                pass: 'eznt vjmy ctpx wngf'
            }
        })
        let details = {
            from: 'testnodemailerapis@gmail.com',
            to: data.email,
            subject: data.subject,
            html: Template()
        }
        console.log("you are inside nodemailer function");
        await transport.sendMail(details, (error) => {
            if (error) {
                console.log("Some error in using nodemailer", error);
            }
            else {
                `console.log("Mail sent successfully.");`
            }

        })

        console.log("END OF FILE")

    }
    catch (error) {
        console.log("Some error in nodemailer: ", error);
    }
}

module.exports = sendMail
