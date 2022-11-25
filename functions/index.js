const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
require("dotenv").config();

const db = admin.firestore();

const { SENDER_EMAIL, SENDER_APP_PASSWORD } = process.env;

const authData = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_APP_PASSWORD,
  },
});

exports.sendEmail = functions.firestore
  .document("contacts/{contactId}")
  .onCreate(async (snap, context) => {
    let recipients = [];
    const snapshot = await db.collection("recipients").get();
    snapshot.forEach((doc) => {
      if (doc.data().email != undefined) {
        recipients.push(doc.data().email);
      }
    });
    const data = snap.data();

    const html = `<p>A new contact information was created.</p>
                      <table>
                        <tr>
                          <th> Name </th>
                          <th> Email </th>
                          <th> Phone Number </th>
                          <th> Address </th>
                        </tr>
                        <tr>
                          <td> ${data.name} </td>
                          <td> ${data.email} </td>
                          <td> ${data.phonenumber} </td>
                          <td> ${data.address} </td>
                        </tr>
                      </table>`;

    authData
      .sendMail({
        from: SENDER_EMAIL,
        to: recipients,
        subject: "New Contact Info Created",
        html: html,
      })
      .then((res) => console.log("successfully sent email"))
      .catch((err) => console.log(err));
  });
