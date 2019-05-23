const fs = require('fs');
const readline = require('readline');
var base64 = require('js-base64').Base64;
const { google } = require('googleapis');
var striptags = require('striptags');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = '../../../token.json';
const config = '../../../qapp.json';

let client_id = '901575350388-bemr326mj23hbtbb9sg70l2p83i10vgu.apps.googleusercontent.com';
let apiKey = 'AIzaSyCq2AW4pGDHRSzBouk_maitgu9SOq6n_A8';
let client_secret = "sbzqVCE_E55fuUayWDBvXlp5";
let redirect_uris = ["http://localhost:5000", "https://qappdevtestapi.herokuapp.com"]

class ResponseService {

    __constructor(){
        
    }
    // If modifying these scopes, delete token.json.
    static logic() {
        fs.readFile(config, (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Gmail API.
            authorize(this.displayInbox);
        });
    }

    // Load client secrets from a local file.

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    static authorize (callback) {
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[1]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
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
    static getNewToken (oAuth2Client, callback) {
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

    static displayInbox (auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        let data = []
        gmail.users.messages.list({
            'userId': 'me',
            'labelIds': 'INBOX',
            'maxResults': 2
        }, (err, response) => {
            response.data.messages.forEach((message) => {
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, res) => {                    
                    // console.log(res.data)
                    data.push(this.appendMessageRow(res.data))
                });

                // this.appendMessageRow(messageRequest)
            });
        });
        return data;
    }

    static appendMessageRow  (message) {
        let from = this.getHeader(message.payload.headers, 'From')
        let subject = this.getHeader(message.payload.headers, 'Subject')
        let date = this.getHeader(message.payload.headers, 'Date')
        let body = this.getBody(message.payload)
        return {from, subject, date, body}
    }

    static getHeader  (headers, index) {
        let head = '';
        headers.forEach((header, i) => {
            if (header.name === index) {
                head = header.value;
            }
        })
        return head;
    }

    static getBody (message) {
        let encodedBody = '';
        if (typeof message.parts === 'undefined') {
            encodedBody = message.body.data;
        }
        else {
            encodedBody = this.getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return striptags(base64.decode(encodedBody)).replace(/\n |\r/g, "").replace(/\n |\n/g, "")
        // return decodeURIComponent(escape(atob(encodedBody)));
    }

    static getHTMLPart  (arr) {
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

}


module.exports = ResponseService