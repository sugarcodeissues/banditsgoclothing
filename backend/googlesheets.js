const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function addDataToGoogleSheet(data) {
  const authClient = await auth.getClient();
  const SPREADSHEET_ID = "1giienkr9U7mR0k6lNFahis8upsJ0M98plyZGH5Hhg1M";

  const request = {
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:C',
    valueInputOption: 'RAW',
    resource: {
      values: [data],
    },
    auth: authClient,
  };

  try {
    const response = await google.sheets('v4').spreadsheets.values.append(request);
    console.log('Data added:', response.data);
  } catch (error) {
    console.error('Error adding data to Google Sheet:', error);
  }
}

module.exports = { addDataToGoogleSheet };
