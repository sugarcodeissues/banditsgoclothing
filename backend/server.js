// Import required modules
require('dotenv').config(); // Load .env variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Confirming that environment variables are loaded correctly
console.log('Environment Variables Loaded:');
console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'Loaded' : 'Not Loaded');
console.log('CLIENT_EMAIL:', process.env.CLIENT_EMAIL || 'Not Loaded');
console.log('PROJECT_ID:', process.env.PROJECT_ID || 'Not Loaded');
console.log('EMAIL:', process.env.EMAIL ? 'Loaded' : 'Not Loaded');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'Not Loaded');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Email transporter setup using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail)
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

// Helper function to send confirmation email
async function sendConfirmationEmail(email, name) {
  const mailOptions = {
    from: process.env.EMAIL, // Sender email
    to: email, // Receiver email
    subject: 'Waitlist Confirmation',
    text: `Hello ${name},\n\nThank you for joining the waitlist! We’ll keep you updated.\n\nBest regards,\nTeam Bandits Got Clothing`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

// Endpoint to handle email sending
app.post('/send-email', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).send('Email and Name are required!');
  }

  try {
    await sendConfirmationEmail(email, name);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in /send-email endpoint:', error);
    res.status(500).send({ message: 'Failed to send email' });
  }
});

// Google Sheets setup
const SPREADSHEET_ID = '1giienkr9U7mR0k6lNFahis8upsJ0M98plyZGH5Hhg1M'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name

// Load credentials from environment variables
const credentials = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
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

  console.log('Request received at /submit:', req.body);

  try {
    // Add data to Google Sheets
    await addDataToGoogleSheet([name, email, phone]);

    // Send confirmation email
    await sendConfirmationEmail(email, name);

    res.status(200).send('Successfully added to Google Sheet and email sent');
  } catch (error) {
    console.error('Error in /submit endpoint:', error);
    res.status(500).send(error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
