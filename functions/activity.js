const ActivityLog = require('../Modules/Site/Models/ActivityLog')
const EmailAlert = require('../Modules/Site/Models/Email')
const Schedule = require('../Modules/Site/Models/Schedule')
const Category = require('../Modules/Category/Models/Category')
const Question = require('../Modules/Question/Models/Question')
const User = require('../Modules/User/Models/User')
const request = require('request')
var nodemailer = require("nodemailer")
var sgTransport = require("nodemailer-sendgrid-transport")
const config = require('../qapp.json')

var options = {
    auth: {
        api_user: config.sendgrid_user_name,
        api_key: config.sendgrid_password
    }
}

var client = nodemailer.createTransport(sgTransport(options))

var fs = require('fs')
const Activity = {}



Activity.Base64_encode = function(file) {
    // read binary data
    var bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64')
}

Activity.Email = function(data, subject, message) {
    Email(data, subject, message)
}

const Email = function (data, subject, message) {
    try {
        var email = {
            from: config.app_name,
            to: (data.email) ? data.email : config.email,
            subject: subject,
            html: message
        }

        client.sendMail(email, function (err, info) {
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



Activity.html = (data) => {
    html(data)
}

const html = (data) =>{
    return '<div id="content" style="background-color: #1D4BB7;width:100%;">' +
        '<nav>' +
        '<div class="container-fluid">' +
        '<span><a href="https://qappdevtest.herokuapp.com"><img src="https://qappdevtest.herokuapp.com/images/Blueform_LOGO_MARK_COLORED_NO_BG.png" style="width: 80px; height: 45px; padding:10px" class="img-responsive"><h3>QAPP</h3></a></span>' +
        '</div>' +
        '</nav>' +
        '<div style="background-color: #fefefe;padding:20px;color:#000;">' + data + '</div>' +
        '</div>'
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

function getUnique(arr, comp) {

  const unique = arr
       .map(e => e[comp])

     // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);

   return unique;
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

const Sms = (number, message) => {
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
            "sender_id": "+12044800573"
        }
    };
    request(options, (err, body) => {
        if (err)
            console.log(err,'error')
        else
            console.log(body,'success')
    });
}

Activity.sendScheduleMessage = async () =>{
    try {
        // Email(data = { email: 'adedotunolawale@gmail.com' }, 'subject', html('good morning wale'))
        // Email(data = { email: ' aadum@coronams.com' }, 'subject', html("good morning koko, this is a cron job that runs every 8'O clock in the morning. "))
        Schedule.find({ status: { $ne: true}}).then((schedules) =>{
            for(let i = 0; i < schedules.length; ++i ){
                let schedule = schedules[i]
                let schedule_date = new Date(schedule.scheduled_date).getFullYear() + '-' + (new Date(schedule.scheduled_date).getMonth() + 1) + '-' + new Date(schedule.scheduled_date).getDate()
                let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
                if (schedule && schedule_date == current_date ){
                    User.findOne({ _id: schedule.user_id}).then((user) => {
                        Question.findOne({ _id: schedule.question_id}).populate('category_id').then((question) =>{
                            if(user.medium == 'Sms'){
                                Sms(user.phone, schedule._id+'\r\n'+question.subject + '\r\n' +question.description)
                                Schedule.findOne({ _id: schedule._id }).then((sched) => {
                                    sched.status = true;
                                    sched.save()
                                })
                            }else{
                                Email(user, question.category_id.name, html(schedule._id + '\r\n '+question.subject+'\r\n'+question.description))
                                Schedule.findOne({ _id: schedule._id  }).then((sched) =>{
                                    sched.status = true;
                                    sched.save()
                                })
                            }
                        }).catch(err =>{
                            throw new Error(err)
                        })
                    }).catch( err => {
                        throw new Error(err)
                    })
                }
            }
        }).catch(err => {
            throw new Error(err)
        })
    } catch (error) {
        console.log()
    }
}

Activity.unrepliedScheduleMessage = async () =>{
    try {
        // Email(data = { email: 'adedotunolawale@gmail.com' }, 'subject', html('good morning wale'))
        // Email(data = { email: ' aadum@coronams.com' }, 'subject', html("good morning koko, this is a cron job that runs every 8'O clock in the morning. "))
        Schedule.find({ is_reply: { $ne: true}}).then((schedules) =>{
            for(let i = 0; i < schedules.length; ++i ){
                let schedule = schedules[i]
                let schedule_date = new Date(schedule.scheduled_date).getFullYear() + '-' + (new Date(schedule.scheduled_date).getMonth() + 1) + '-' + new Date(schedule.scheduled_date).getDate()
                let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
                if (schedule && schedule_date == current_date ){
                    User.findOne({ _id: schedule.user_id}).then((user) => {
                        Question.findOne({ _id: schedule.question_id}).populate('category_id').then((question) =>{
                            if(user.medium == 'Sms'){
                                Sms(user.phone, "Good Evening " + user.title + ' ' + user.last_name + '\r\n We are yet to recieve a response from you regarding the task assign to you, please any issues.\r\n Thank you.')
                                
                            }else{
                                Email(user, question.category_id.name, html("Good Evening "+ user.title + ' '+ user.last_name+'\r\n We are yet to recieve a response from you regarding the task assign to you, please any issues.\r\n Thank you.'))
                                
                            }
                        }).catch(err =>{
                            throw new Error(err)
                        })
                    }).catch( err => {
                        throw new Error(err)
                    })
                }
            }
        }).catch(err => {
            throw new Error(err)
        })
    } catch (error) {
        console.log()
    }
}

Activity.scheduleTime = () => {
    User.findOne({ is_scheduled: { $ne: true }, user_type: { $ne: 'admin' } }, null, { sort: { 'createdAt': -1 } }).then((user) => {
        if (user) {
            Schedule.find({ user_id: user._id }).countDocuments().then(count => {
                if (count == 8) {
                    user.is_scheduled = true
                    user.save()
                }
            })

            try {
                Category.find({}).sort('createdAt').limit(2).then((categories) => {
                    for (let i = 0; i < categories.length; ++i) {
                        let schedule_date = randomDate(new Date(), new Date(Date.now() + 12096e5), 9, 10)
                        let date = schedule_date.getFullYear() + '-' + (schedule_date.getMonth() + 1) + '-' + schedule_date.getDate()
                        Question.find({ category_id: categories[i]._id }).then((questions) => {
                            let result = random_item(questions)
                            let cat = categories[i]
                            // console.log(result)
                            Schedule.find({ user_id: user._id, category_id: cat._id }).then((schedules) => {
                                console.log(schedules.length)
                                if (schedules.length < 4) {
                                    Schedule.findOne({ user_id: user._id, question_id: result._id }).then((schedule) => {
                                        if (schedule == null) {
                                            Schedule.find({ user_id: user._id, scheduled_date: new Date(date) }).then((dates) => {
                                                if (dates.length == 0) {
                                                    let schedule = new Schedule()
                                                    schedule.user_id = user._id
                                                    schedule.category_id = result.category_id
                                                    schedule.question_id = result._id
                                                    schedule.scheduled_date = date
                                                    schedule.save()
                                                } else {
                                                    throw "date exist"
                                                }

                                            }).catch(err =>{
                                                console.log(err.message)
                                            })
                                        }
                                    }).catch(err =>{
                                        console.log(err)
                                    })
                                } else {
                                    console.log('completed')
                                }
                            })
                        })
                    }
                })
            } catch (error) {
                console.log(error)
            }

        }
    })

}

    
module.exports = Activity