// Import required modules
require('dotenv').config(); // Load .env variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Confirming that environment variables are loaded correctly
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google Sheets setup
const SPREADSHEET_ID = '1giienkr9U7mR0k6lNFahis8upsJ0M98plyZGH5Hhg1M'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name

// Load credentials from environment variables
const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.replace(/\\n/g, '\n') : undefined, // Ensure proper formatting for private key
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

if (!credentials.private_key || !credentials.client_email || !credentials.project_id) {
  console.error('Error: Missing required Google credentials. Please check your .env file.');
  process.exit(1);
}

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const range = 'Sheet1!A:C';
const data = [
  ['Value A1', 'Value B1', 'Value C1'], // First row (A, B, C)
  ['Value A2', 'Value B2', 'Value C2'], // Second row (A, B, C)
];


// Helper function to add data to Google Sheet
async function addDataToGoogleSheet(data) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`, // Columns for Name, Email, Phone
      valueInputOption: 'RAW',
      resource: {
        values: [data],
      },
    });
    console.log('Data added successfully:', response.data);
  } catch (error) {
    console.error('Error adding data to Google Sheet:', error);
    throw new Error('Failed to add data to Google Sheet');
  }
}

// Endpoint to handle form submissions
app.post('/submit', async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send('Error: Missing required fields');
  }

  console.log("Request received at /submit:", req.body);

  try {
    // Call the helper function to add data to Google Sheets
    await addDataToGoogleSheet([name, email, phone]);
    res.status(200).send('Successfully added to Google Sheet');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Email transporter setup using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

// Helper function to send confirmation email
async function sendConfirmationEmail(email, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: email, // Receiver email
    subject: 'Waitlist Confirmation',
    text: `Hello ${name},\n\nThank you for joining the waitlist! We’ll keep you updated.\n\nBest regards,\nTeam Banditsgoclothing`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
