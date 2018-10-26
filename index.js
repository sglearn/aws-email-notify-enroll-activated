"use strict"

const aws = require('aws-sdk');

// Create a new SES object. 
const ses = new aws.SES({
  region: process.env.REGION ||' us-east-1'
});

const sender = `${process.env.SENDER_NAME} <${process.env.SENDER_MAIL_ADDRESS}>`;

function sendEmail({recipient, course, customer = 'Customer'}) {

  // The subject line for the email.
  const subject = `Your enrollment for course ${course.courseId} at ${process.env.SERVICE} is completed`;

  // The email body for recipients with non-HTML email clients.
  const body_text = "Dear " + customer + ",\r\n"
                  + "Your enrollment for the following course(s) is completed successfully \r\n" 
                  + course.title + " (" + course.courseId + ")" + "\r\n"
                  + "To go to your study page, please access the following link\r\n"
                  + `${process.env.LEARNDESK}/course/${course.courseId}\r\n`
                  + "Enjoy your study\r\n"
                  + "This email is auto-generated. Please do not reply this email.\r\n"
                  + "Thank you for using our services.\r\n"
                  + "Sincerely, \r\n"
                  + process.env.SIGNATURE;

  // The HTML body of the email.
  const body_html = `<html>
  <head>
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
    <p>Dear ${customer},</p>
    <p>Your enrollment for the following course(s) is completed successfully</p>
    <table>
      <tr>
        <th> Code </th>
        <th> Name </th>
      </tr>
      <tr>
        <td> ${course.courseId} </td>
        <td> ${course.title} </td>
      </tr>
    </table>
    <p> To go to your study page, please access the following link <p>
    <a href='${process.env.LEARNDESK}/course/${course.courseId}' > ${process.env.LEARNDESK}/course/${course.courseId} </a>
    <p> Enjoy your study </p>
    <p> This email is auto-generated. Please <b>do not reply</b> this email.</p>
    <p> Thank you for using our services </p>
    <p> Sincerely, </p>
    <p> ${process.env.SIGNATURE} </p>
  </body>
  </html>`;

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