const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let client_id = '901575350388-bemr326mj23hbtbb9sg70l2p83i10vgu.apps.googleusercontent.com';
let apiKey = 'AIzaSyCq2AW4pGDHRSzBouk_maitgu9SOq6n_A8';
let scopes = 'https://www.googleapis.com/auth/gmail.readonly';
let client_secret = "sbzqVCE_E55fuUayWDBvXlp5";
let redirect_uris = ["http://localhost:5000","https://qappdevtestapi.herokuapp.com"]

// Load client secrets from a local file.
fs.readFile('qapp.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    // const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[1]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
            displayInbox(gmail)
        } else {
            console.log('No labels found.');
        }
    });
}

displayInbox = function (gmail) {
    gmail.users.messages.list({
        'userId': 'me',
        'labelIds': 'INBOX',
        'maxResults': 10
    },(err, response) =>{
        // console.log(response.data.messages)
            response.data.messages.forEach((message) => {
                // console.log(message)
            var messageRequest = gmail.users.messages.get({
                'userId': 'me',
                'id': message.id
            });

            this.appendMessageRow(messageRequest)
        });
    });
}

appendMessageRow= function (message) {
    console.log(message)
    // let from = getHeader(message.payload.headers, 'From')
    // let subject = getHeader(message.payload.headers, 'Subject') 
    // let date = this.getHeader(message.payload.headers, 'Date')
    // let body = this.getBody(message.payload)
    
},

getHeader= function (headers, index) {
    var header = '';

    $.each(headers, function () {
        if (this.name === index) {
            header = this.value;
        }
    });
    return header;
}

getBody= function (message) {
    var encodedBody = '';
    if (typeof message.parts === 'undefined') {
        encodedBody = message.body.data;
    }
    else {
        encodedBody = this.getHTMLPart(message.parts);
    }
    encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

getHTMLPart = function(arr) {
    for (var x = 0; x <= arr.length; x++) {
        if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
                return arr[x].body.data;
            }
        }
        else {
            return this.getHTMLPart(arr[x].parts);
        }
    }
    return '';
}