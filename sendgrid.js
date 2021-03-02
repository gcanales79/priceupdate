require("dotenv").config();

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
//javascript
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: "gustavo.canales@me.com", // Change to your recipient
  from: "katcon.updateprices@katcon.com", // Change to your verified sender
  //subject: 'Sending with SendGrid is Fun',
  //text: 'and easy to do anywhere, even with Node.js',
  //html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  template_id: "d-c47303c9884e43dfadd95cdf600de57f",
  dynamic_template_data: {
    link: "https://netzwerk.mx/",
  },
};
sgMail
  .send(msg)
  .then(() => {
    console.log("Email sent");
  })
  .catch((error) => {
    console.error(error.response.body);
  });
