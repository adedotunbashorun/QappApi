const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const Response = require('../Models/Response')
const Archieve = require('../Models/Archieve')
const User = require('../../User/Models/User')
const Schedule = require('../Models/Schedule')
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const Activity = require('../../../functions/activity')
const TOKEN_PATH = './token.json';

let client_id = '901575350388-bemr326mj23hbtbb9sg70l2p83i10vgu.apps.googleusercontent.com';
let apiKey = 'AIzaSyCq2AW4pGDHRSzBouk_maitgu9SOq6n_A8';
let client_secret = "sbzqVCE_E55fuUayWDBvXlp5";
let redirect_uris = ["http://localhost:5000", "https://qappdevtestapi.herokuapp.com"]

class ResponseService {

    __constructor(){
        
    }
    // If modifying these scopes, delete token.json.
    static logic() {
        return this.authorize(this.displayInbox);
    }

    // Load client secrets from a local file.

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    static authorize (callback) {
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            return callback(oAuth2Client);
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
                return callback(oAuth2Client);
            });
        });
    }

    static displayInbox (auth) {
        const gmail = google.gmail({ version: 'v1', auth });
        let result ={}
        let datas = []
        gmail.users.messages.list({
            'userId': 'me',
            'labelIds': 'INBOX',
            'maxResults': 10
        }, (err, response) => {
            if(err){
                return err
            }
            response.data.messages.forEach((message,index) => {
                gmail.users.messages.get({
                    'userId': 'me',
                    'id': message.id
                }, (err, res) => {  
                    if(err){
                        return err
                    }
                    result = Activity.appendMessageRow(res.data)
                    datas.push(result)
                    let data = result
                    let str = data.from
                    let rs =str.replace(/</g, '').replace(/>/g,'')
                    let schedule = rs.split(' ')

                    console.log(schedule[1])                 
                    let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
                    User.findOne({ $or: [{ _id: schedule[1], _id: schedule[2], _id: schedule[3] }] }).then((user)=>{
                        Schedule.findOne({ user_id: user._id , scheduled_date: current_date, is_reply: false }).then((resp) => {
                            Response.find({_id: resp._id}).then( res =>{
                                if(res.length === 0){
                                    let response = new Response()
                                    response.schedule_id = resp._id
                                    response.user_id = resp.user_id
                                    response.question_id = resp.question_id
                                    response.from = data.from
                                    response.data = data.body
                                    response.save()
                                }
                            }).catch(err => {})

                            resp.is_reply = true
                            resp.save()

                        }).catch(err => {                            
                            // console.log(err.message)
                            return err.message
                        })
                    }).catch(err =>{
                        Archieve.find({data: data.body}).then( res =>{
                            if(res.length === 0){
                                let arc = new Archieve()
                                arc.from = data.from
                                arc.data = data.body
                                arc.save()                        
                            }
                        }).catch(err => {})
                    })
                    return datas                    
                });
            });
            
        });
       
    }

    

}


module.exports = ResponseService