const ActivityLog = require('../Modules/Site/Models/ActivityLog')
const EmailAlert = require('../Modules/Site/Models/Email')
const Schedule = require('../Modules/Site/Models/Schedule')
const Category = require('../Modules/Category/Models/Category')
const Question = require('../Modules/Question/Models/Question')
const User = require('../Modules/User/Models/User')
const request = require('request')
var nodemailer = require("nodemailer")
var sgTransport = require("nodemailer-sendgrid-transport")
var base64 = require('js-base64').Base64
var striptags = require('striptags')
const config = require('../qapp.json')
const accountSid = config.accountSid
const authToken = config.authToken
const clients = require('twilio')(accountSid, authToken)



let options = {
    auth: {
        api_user: process.env.SENDGRID_USERNAME,
        api_key: process.env.SENDGRID_PASSWORD
    }
}
let client = nodemailer.createTransport(sgTransport(options))
// let options2 = {
//     host: 'smtp.googlemail.com', // Gmail Host
//     port: 465, // Port
//     secure: true, // this is true as port is 465
//     auth: {
//         user: config.GMAIL_USERNAME, //Gmail username
//         pass: config.GMAIL_PASSWORD // Gmail password
//     }
// }

// var client = nodemailer.createTransport(options2)

var fs = require('fs')
const Activity = {}

Activity.makeid = function(length) {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }console.log(text)
    return text
}

Activity.appendMessageRow = (message) => {
    let data = { from: '', subject: '', date: '', body: '' }
    data.from = getHeader(message.payload.headers, 'From')
    data.subject = getHeader(message.payload.headers, 'Subject')
    data.date = getHeader(message.payload.headers, 'Date')
    data.body = getBody(message.payload)
    return data
}

const getHeader = (headers, index) => {
    let head = '';
    headers.forEach((header, i) => {
        if (header.name === index) {
            head = header.value;
        }
    })
    return head;
}

const getBody = (message) => {
    let encodedBody = '';
    if (typeof message.parts === 'undefined' || message.parts === '' ) {
        encodedBody = message.body.data;
    }
    else {
        encodedBody = getHTMLPart(message.parts);
    }

    encodedBody = encodedBody.replace(/-/g, '').replace(/_/g, '').replace(/\s/g, '');
    return striptags(base64.decode(encodedBody)).replace(/\n |\r/g, "").replace(/\n |\n/g, "")
    // return decodeURIComponent(escape(atob(encodedBody)));
}

const getHTMLPart = (arr) => {
    for (var x = 0; x <= arr.length; x++) {
        // if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
                return arr[x].body.data || arr[x].body;
            }
            return (arr[x].body.data) ? arr[x].body.data : 'empty body received, please check your gmail to confirm mail message.';
        // }
        // else {
        //     return getHTMLPart(arr[x].parts);
        // }
    }
    return '';
}

Activity.Base64_encode = function(file) {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64')
}

Activity.Email = function(data, subject, message) {
    Email(data, subject, message)
}

const Email = function(data, subject, message){
    try {
        var email = {
            from: config.email + ' ' + config.app_name,
            to: (data.email) ? data.email : config.email,
            subject: subject,
            html: message
        }

        client.sendMail(email, function (err, info) {
            if (err) {
                console.log(err, 'hy')
            } else {
                console.log("Message sent: " + info.messageId)
            }
        })
    } catch (error) {
        return res.status(401).json({ "success": false, "message": error })
    }
}


Activity.html = (data) => {
    return data
}

const html = (data) =>{
    return `<div id="content" style="background-color: #1D4BB7;width:100%;">
                <nav>
                    <div class="container-fluid">
                        <span><a href="https://qappdevtest.herokuapp.com"><img src="https://qappdevtest.herokuapp.com/images/Blueform_LOGO_MARK_COLORED_NO_BG.png" style="width: 80px; height: 45px; padding:10px" class="img-responsive"><h3>QAPP</h3></a></span>
                    </div>
                </nav>
            <div style="background-color: #fefefe;padding:20px;color:#000;">${data} </div>
        </div>`
}

Activity.SupportEmail = function(data, subject, message) {
    try {
        var email = {
            from: config.app_name,
            to: (data.user_id) ? data.user_id.email : config.email,
            subject: subject,
            html: message
        }

        client.sendMail(email, function(err, info) {
            if (err) {
                console.log(err)
            } else {
                console.log("Message sent: " + info.response)
            }
        })
    } catch (error) {
        return res.status(401).json({ "success": false, "message": error })
    }
}

Activity.activity_log = async(req, user_id, description) => {
    if (user_id) {
        let logs = new ActivityLog()
        logs.user_id = user_id
        logs.description = description
        logs.ip_address = req.header('x-forwarded-for') || req.connection.remoteAddress
        return logs.save()
    }
}

Activity.alertEmail = async (req) => {
    if (req) {
        let alert = new EmailAlert()
        alert.email = req.body.email
        alert.ip_address = req.header('x-forwarded-for') || req.connection.remoteAddress
        return alert.save()
    }
}

const randomDate = (start, end, startHour, endHour) => {
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

const random_item = (items) =>{  
    return items[Math.floor(Math.random()*items.length)];     
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function removeDuplicates(arr) {
    let unique_array = []
    for (let i = 0; i < arr.length; i++) {
        if (unique_array.indexOf(arr[i]) == -1) {
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

Activity.Sms = (number,message) => {
    Sms(number,message)
}

const Sms = (number, msg) => {
    clients.messages
    .create({
        body: msg,
        from: config.TwilioNumber,
        to: number
    })
  .then(message => console.log(message.sid))
  .catch(err => { console.log(err)});    
}

const SmsEngageSpark = (number, message) => {
    var options = {
        method: 'POST',
        json: true,
        url: 'https://start.engagespark.com/api/v1/messages/sms',
        headers: {
            'Authorization': 'Token 2f30b186d54c12d89262dd0bb4a0eb8c03caedfd',
            'Content-type': 'application/json'
        },
        body: {
            "organization_id": "3130",
            "recipient_type": "mobile_number",
            "mobile_numbers": [number],
            "message": message,
            "sender_id": "12044800573"
        }
    };
    request(options, (err, body) => {
        if (err)
            console.log(err,'error')
        else
            console.log(body,'success')
    });
}

const TodaySchedules = async () => {
    try {

        let today = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()

        let schedules = await Schedule.find({ status: false, schedule_date: today })

        return schedules
    } catch (error) {
        throw new Error(error.message)
    }
    
}

const UserData = async (schedule) => {
    try {
        let user = await User.findOne({ _id: schedule.user_id})

        return user
    } catch (error) {
        throw new Error(error.message)
    }    
}

const QuestionData = async (schedule) => {

    try {
        let question = await Question.findOne({ _id: schedule.question_id}).populate('category_id')

        return question
    } catch (error) {
        throw new Error(error.message)
    }
}

Activity.sendScheduleMessage = async () =>{
    try {

        let schedules = await TodaySchedules();
        
        for(let i = 0; i < schedules.length; ++i ){
            let schedule = schedules[i]

            let schedule_date = new Date(schedule.scheduled_date).getFullYear() + '-' + (new Date(schedule.scheduled_date).getMonth() + 1) + '-' + new Date(schedule.scheduled_date).getDate()

            let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()

            if (schedule && schedule_date === current_date ){

                let user = await UserData(schedule)

                let question = await QuestionData(schedule)
                
                if(user.medium === 'Sms'){
                    Sms(user.phone, 'Good morning '+ user.title + ' ' + user.last_name+','+question.subject + '\r\n' +question.description)
                }else{
                    Email(user, question.category_id.name, html('Good morning ' + user.title + ' ' + user.last_name +',\r\n '+question.subject+'\r\n'+question.description))                                
                }
                
                let schedule = await Schedule.findOne({ _id: schedule._id  }).then((sched) =>{
                    sched.status = true;
                    sched.save()
                })
            }
        }
    } catch (error) {
        console.log()
    }
}

Activity.unrepliedScheduleMessage = async () =>{
    try {

        let schedules = Schedule.find({ is_reply: { $ne: true}})
        for(let i = 0; i < schedules.length; ++i ){
            let schedule = schedules[i]

            let schedule_date = new Date(schedule.scheduled_date).getFullYear() + '-' + (new Date(schedule.scheduled_date).getMonth() + 1) + '-' + new Date(schedule.scheduled_date).getDate()

            let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()

            if (schedule && schedule_date === current_date ){
                let user = await UserData(schedule)

                let question = await QuestionData(schedule)
                
                if(user.medium === 'Sms'){
                    Sms('2349034268873', "Hi adedotun,\r\n I'm emailing you because it is past 8pm and I haven’t heard whether or not you have completed today’s task.")
                    Sms(user.phone, "Hi " + user.title + ' ' + user.last_name + ",\r\n I'm emailing you because it is past 8pm and I haven’t heard whether or not you have completed today’s task.")
                    Sms(user.phone, "If you simply forgot to email me to indicate that you had completed the task, please email me as soon as you can with your photographic evidence to let me know. If however, it completely skipped your mind, don’t worry. It is normal to forget things on occasion.")
                    Sms(user.phone, "There will be additional opportunities to earn more ballots for the draw to win the gift card.\r\nIf, however, you no longer wish to participate in the study, please let me know as well.")
                    Sms(user.phone, "Please let me know what the circumstance is for me not hearing from you so that I can update my records accordingly.\r\nThank you and have a nice night!\r\nKarley.")
                    
                }else{
                    Email(user, question.category_id.name, html("Hi " + user.title + ' ' + user.last_name + ",\r\n I'm emailing you because it is past 8pm and I haven’t heard whether or not you have completed today’s task. \r\nIf you simply forgot to email me to indicate that you had completed the task, please email me as soon as you can with your photographic evidence to let me know. If however, it completely skipped your mind, don’t worry. It is normal to forget things on occasion. There will be additional opportunities to earn more ballots for the draw to win the gift card.\r\nIf, however, you no longer wish to participate in the study, please let me know as well.\r\nPlease let me know what the circumstance is for me not hearing from you so that I can update my records accordingly.\r\nThank you and have a nice night!\r\nKarley."))                                
                }
            }
        }
    } catch (error) {
        console.log()
    }
}

Activity.scheduleTime = async () => {
  try {
    const user = await User.findOne(
      { is_scheduled: { $ne: true }, user_type: { $ne: "admin" } },
      null,
      { sort: { createdAt: -1 } }
    );

    if (user) {
        try {
            const count = await Schedule.find({ user_id: user._id }).countDocuments();

            if (count === 8) {
                user.is_scheduled = true;
                user.save();
                return false;
            }

            const categories = await Category.find({}).sort("createdAt").limit(2);

            for (let i = 0; i < categories.length; ++i) {

                let schedule_date = randomDate(new Date(),new Date(Date.now() + 12096e5),9,10);

                let date = schedule_date.getFullYear() + "-" + (schedule_date.getMonth() + 1) + "-" + schedule_date.getDate();

                const scheduleCount = await Schedule.find({ user_id: user._id, scheduled_date: date }).countDocuments();

                if (scheduleCount === 1) {
                    console.log("exists");
                    return false;
                } else {

                    const questions = await Question.find({ category_id: categories[i]._id });

                    const result = random_item(questions);
                    let cat = categories[i];
                    // console.log(result)

                    if (result) {
                        const schedules = await Schedule.find({ user_id: user._id, category_id: cat._id }).countDocuments();

                        if (schedules < 4) {
                            const schedule = await Schedule.findOne({ user_id: user._id, question_id: result._id }).countDocuments();

                            if (schedule === 0) {

                                const dates = await Schedule.find({ user_id: user._id, scheduled_date: date }).countDocuments();

                                if (dates === 0) {
                                    let schedule = new Schedule();
                                    schedule.user_id = user._id;
                                    schedule.category_id = result.category_id;
                                    schedule.question_id = result._id;
                                    schedule.scheduled_date = date;
                                    schedule.save();
                                } 
                            }
                            
                        }
                    }
                }

                const delSchedule = await Schedule.find({ user_id: user._id, scheduled_date: date });

                if (delSchedule.length > 1) {
                    delSchedule.forEach(schedule => {
                    const res = Schedule.findByIdAndDelete(schedule._id);
                    if (res) console.log("deleted");
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
  } catch (error) {
    console.log(error);
  }
};

    
module.exports = Activity