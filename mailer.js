const nm = require('nodemailer');
confirmationIH = function(email, orderinfo){
    return new Promise((res, rej) => {   
        console.log('Starting mailer')     
        let transporter = nm.createTransport({
        name: process.env.MAILNAME,
        host: process.env.MAILSERVER,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
        },
        tls: {
            rejectUnauthorized: false
        }
        });
        let template = ''
        let quantcount = function(its){
            let it = '<ul>'
            for (i = 0; i < its.length; i++) {
                it += `<li style="">${its[i].size}, ${its[i].number}</li>`
            }
            it += '</ul>'
            return it
        }
        let temp = function(oi){
            return `<div style="max-width: 100%; overflow-x: hidden; padding: 10px; margin: 10px 0px; text-align: center;">${oi.product} <br> ${quantcount(oi.quantity)}</div>`
        }
        // console.log(JSON.stringify(orderinfo))
        // console.log(JSON.stringify(orderinfo.orderItems))
        orderinfo.orderItems.forEach(item => {template += temp(item)})
        let confirmemail = {
            from: '"GENISIS - LIVING WORD" <info@livingwordonline.com>', // sender address
            to: email, // list of receivers
            subject: `ORDER CONFIRMATION ${orderinfo._id}. PICK UP AT THE CHURCH!`, // Subject line
            // plain text body
            text: `META TAG (title): Email
                THANK YOU FOR YOUR ORDER, ${email}. Please show us this email when you pick up your order at Living Word Mesa.
                3520 E Brown Rd, Mesa, AZ 85213
                ${template}
                If you have not yet gotten your tickets, CLICK HERE!
                Thank you, 
                Living Word
            `,
            // html body
            html: `<!doctype html>
            <html>
            <head>
            <meta charset="utf-8">
            <title>Email</title>
            </head>
            <body style="max-width: 100%; padding: 10px; overflow-X: hidden;">
                <div style="max-width: 33%; oveflow: hidden; padding: 10px;"><img style="max-width: 100%;" src="https://influenced.link/static/lwlogo.png"></div>
                <div style="max-width: 100%; padding: 20px; overflow-x: hidden; text-align: center;">THANK YOU FOR YOUR ORDER, ${email}. Please show us this email when you pick up your order at Living Word Mesa.<br><br>3520 E Brown Rd,<br>Mesa, AZ 85213</div>
                ${template}
                <div style="width: 100%; margin: 10px 0px; font-weight: 800; font-size: 18px;">YOUR TOTAL $${orderinfo.paymentAmount}.00 on ${orderinfo.orderDate}</div>
                <a style="text-decoration: none;" href="https://genesisconf.com"><div style="max-width: 100%; padding: 20px; overflow-x: hidden; text-align: center;">If you have not yet gotten your tickets, CLICK HERE!</div></a>
                <div style="max-width: 100%; padding: 20px; overflow-x: hidden; text-align: center;">Thank you, <br> Living Word</div>
            </body>
            </html>`
        }
        console.log('starting to send mail')
        transporter.sendMail(confirmemail, (err, info) => {
            if (err) {
            console.log(err);
            return res(false)
            }
            if (info) {
            console.log(`message sent to: ${email} info: ${JSON.stringify(info)}`);
            return res(true)
            }
        })
    })
}
confirmationDL = function(email, subject, markup){
    return new Promise((res, rej) => {        
        let transporter = nm.createTransport({
        name: process.env.MAILNAME,
        host: process.env.MAILSERVER,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
        },
        tls: {
            rejectUnauthorized: false
        }
        });
        let confirmemail = {
            from: '"GENISIS - LIVING WORD" <email@email.com>', // sender address
            to: email, // list of receivers
            subject: `${subject}`, // Subject line
            // plain text body
            text: `META TAG (title): Email
                ${markup}
            `,
            // html body
            html: `<!doctype html>
            <html>
            <head>
            <meta charset="utf-8">
            <title>Email</title>
            </head>
            <body style="max-width: 100%; padding: 10px; overflow-X: hidden;">
                ${markup}
            </body>
            </html>`
        }
        transporter.sendMail(confirmemail, (err, info) => {
            if (err) {
            console.log(err);
            return res(false)
            }
            if (info) {
            console.log(`message sent to: ${email} info: ${JSON.stringify(info)}`);
            return res(true)
            }
        })
    })
}
module.exports = {
    confirmationIH: confirmationIH,
    confirmationDL: confirmationDL
}