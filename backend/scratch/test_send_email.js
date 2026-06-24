const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sendPortraitEmail } = require('../src/services/emailService');

const recipient = "ananyashar24@gmail.com";
const name = "TestUser";
const imageUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=256&h=256&q=80";

console.log(`Sending test email to ${recipient}...`);
sendPortraitEmail(recipient, name, imageUrl)
  .then(res => {
    console.log("Email Sent Successfully!", res);
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed to send email:", err);
    process.exit(1);
  });
