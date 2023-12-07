const nodemailer = require("nodemailer")
const { ForgetTemplate, SignupTemplate, SubscribeTemplate, TicketStatusTemplate, sendInvoiceTemplate } = require('../helpers/INDEX');
const logger = require('./../logger');

async function sendMail(data, Template) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'business.tradevogue@gmail.com',
                pass: 'rnpp kfjp dsol xcqj'
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
                logger.error(error);
            }
        })

    }
    catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

module.exports = sendMail