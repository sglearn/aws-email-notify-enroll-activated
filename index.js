"use strict"

const aws = require('aws-sdk');

// Create a new SES object. 
const ses = new aws.SES({
  region: process.env.REGION ||' us-east-1'
});

const sender = `${process.env.SENDER_NAME} <${process.env.SENDER_MAIL_ADDRESS}>`;

function sendEmail({recipient, courses, customer = 'Customer'}) {

  // The subject line for the email.
  const subject = `Your enrollment at ${process.env.SERVICE} is processed`;

  const signature = `
    ${process.env.SIGNATURE}
  `

  // The email body for recipients with non-HTML email clients.
   // The email body for recipients with non-HTML email clients.
  let body_text = "Dear " + customer + ",\r\n"
                  + "Your enrollment has been processed successfully \r\n"
                  + "The following courses has been activated \r\n"

  
  courses.forEach( course =>  {
    body_text += " " + course.title + "\r\n"
  })       

  body_text +=  "Thank you for using our service.\r\n"
  + "This email is auto-generated. Please do not reply this email.\r\n"
  + "Sincerely,\r\n"

  body_text += signature



  // The HTML body of the email.
  let body_html = `<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      table, th, td {
        border: 1px solid black;
      }
      table {
        border-collapse: collapse;
      }
      th, td {
        padding: 15px;
        text-align: left;
      }
      th {
        background-color: #4CAF50;
        color: white;
      }
      .bold {
        font-weight: bold;
      }
      .orange {
        color: #ff9800;
      }
    </style>
  </head>
  <body>
    <p> Dear ${customer}, </p>
    <p> Your enrollment has been processed successfully </p>
    <p> The following courses has been activated </p>
  `

  body_html += `
    <table>
      <tr>
        <th> Course </th>
        <th> Status </th>
      </tr>
  `

  courses.forEach(course => {
    body_html += `
        <tr>
          <td> ${course.title} </td>
          <td> Activated </td>
        </tr>
    `
  }) 
  
  body_html += `
    </table>
  `

  body_html += `
    <br />
    <p> Thank you for using our service. </p>
    <p> This email is auto-generated. Please <b>do not reply</b> this email </p>
  `

  body_html += `
    <br />
    <p> Sincerely, </p>
    ${signature}
  </body>
  </html>
  `

  // The character encoding for the email.
  const charset = "UTF-8";

  // Specify the parameters to pass to the API.
  const params = { 
    Source: sender, 
    Destination: { 
      ToAddresses: [
        recipient 
      ],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: body_text,
          Charset: charset 
        },
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    },
    // ConfigurationSetName: configuration_set
  };

  //Try to send the email.
  console.log(`Sending email from ${sender} to ${recipient}`)
  return new Promise((resolve, reject) => {
    ses.sendEmail(params, function(err, data) {
      // If something goes wrong, print an error message.
      if(err) {
        console.log(err.message);
        reject(err);
      } else {
        console.log("Email sent! Message ID: ", data.MessageId);
        resolve(data);
      }
    });
  })

}

exports.handler = async (event) => {
  await sendEmail(event);
  return 'done'
};