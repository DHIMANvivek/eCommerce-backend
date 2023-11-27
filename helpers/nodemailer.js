const nodemailer = require("nodemailer")
const {ForgetTemplate,SignupTemplate, SubscribeTemplate, TicketStatusTemplate, sendInvoiceTemplate}=require('../helpers/INDEX');

async function sendMail(data, Template) {
  
    try {
        console.log('mail send started ---->');
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'testnodemailerapis@gmail.com',
                pass: 'eznt vjmy ctpx wngf'
            }
        });
        let details = {
            from: 'testnodemailerapis@gmail.com',
            to: data.email,
            subject: data.subject,
            html: await Template
        }
        await transport.sendMail(details, (error) => {
            if (error) {
                console.log('error inside sendmail si ',error);
            }
        })

        console.log('mail send finished ---->');
    }
    catch (error) {
        console.log('error come up is ',error);
      res.status(500).json(error);
    }
}

module.exports = sendMail
