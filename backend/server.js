// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');

console.log("Current Directory:", __dirname);
console.log("Looking for credentials.json in:", __dirname + "/credentials.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google Sheets setup
const SPREADSHEET_ID = '1giienkr9U7mR0k6lNFahis8upsJ0M98plyZGH5Hhg1M'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name

// Load the credentials JSON file
const credentials = JSON.parse(process.env.CREDENTIALS_JSON);

console.log('Loaded credentials:', credentials);



const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
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
        return res.status(400).send('Missing required fields');
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
