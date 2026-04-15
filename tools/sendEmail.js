const nodemailer = require("nodemailer")
require("dotenv").config()
async function sendEmail(to, subject, text){
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_FROM,
            pass:process.env.SMTP_APP_PASSWORD
        }
    })

    const mailOptions = {
        from:process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        text: text
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        return info
    } catch (error) {
        console.log("Error Sending Email", error)
        return error    
    }
}


module.exports = {
    sendEmail
}