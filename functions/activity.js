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
    try {
        var email = {
            from: config.app_name,
            to: (data.email) ? data.email : config.email,
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

function Sms() {
    var options = {
        method: 'POST',
        json: true,
        url: 'https://start.engagespark.com/api/v1/messages/sms',
        headers: {
            'Authorization': 'Token 2f30b186d54c12d89262dd0bb4a0eb8c03caedfd',
            'Content-type': 'application/json'
        },
        body:{
            "organization_id": "3130",
            "recipient_type": "mobile_number",
            "mobile_numbers": ["2349034268873"],
            "message": "Sample message to you.",
            "sender_id": "QApp"
        }
    };
    request(options, (err, body) => {
        if(err) 
            console.log(err)
        else
            console.log(body)
    });
}

Activity.html = function (data){
    return  '<div id="content" style="background-color: #1D4BB7width:100%">'+
                '<nav>'+
                    '<div class="container-fluid">'+
                            '<span><a href="https://qapp.herokuapp.com"><img src="https://sofatotravels.com/static/images/sofato/logo/Sofato-Logo-Allwhite.png" style="width: 120px height: 45px padding:10px" class="img-responsive"></a></span>'+
                    '</div>'+
                '</nav>'+
                '<div style="background-color: #fefefepadding:20pxcolor:#000">'+ data + '</div>'+
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

Activity.BulkEmail = async(message) => {
    if (message.others !== '' && message.medium === 'email') {
        var str = message.others
        var str_array = str.split(',')

        for (var i = 0; i < str_array.length; i++) {
            // Trim the excess whitespace.
            str_array[i] = str_array[i].replace(/^\s*/, "").replace(/\s*$/, "")
            // Add additional code here, such as:
            console.log(str_array[i])
            try {
                var email = {
                    from: config.app_name,
                    to: str_array[i],
                    subject: message.title,
                    html: this.html(message.message)
                }

                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Message sent: " + info.response)
                    }
                })
            } catch (error) {
                console.log(error)
                // return res.status(401).json({ "success": false, "message": error })
            }
        }
    }
    if (message.receiver === 'subscribers'){
        this.Subscribers(message)
    } else if (message.receiver === 'all users'){
        this.Users(message)
    } else if (message.receiver === 'all') {
        this.Users(message)
        this.Subscribers(message)
    }else{
        User.find({ user_type: message.receiver }, null, { sort: { 'created_at': -1 } }, function(error, users) {
            if (error) return res.json(error)
            for (user of users) {
                try {
                    var email = {
                        from: config.app_name,
                        to: user.email,
                        subject: message.title,
                        html: this.html(message.message)
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
        })
    }   
}

Activity.Subscribers = (message)=>{
    EmailAlert.find({ status: 1 }, null, { sort: { 'created_at': -1 } }, function (error, emails) {
        if (error) return res.json(error)
        for (user of emails) {
            try {
                var email = {
                    from: config.app_name,
                    to: user.email,
                    subject: message.title,
                    html: this.html(message.message)
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
    })
}

Activity.Users = (message) => {
    User.find({ deleted_at: null }, null, { sort: { 'created_at': -1 } }, function (error, users) {
        if (error) return res.json(error)
        for (user of users) {
            try {
                var email = {
                    from: config.app_name,
                    to: user.email,
                    subject: message.title,
                    html: this.html(message.message)
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
    })
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

Activity.scheduleTime = () =>{
    
    User.findOne({ is_scheduled: { $ne: true }, user_type:{ $ne: 'admin'} }, null, { sort: { 'createdAt': -1 } }).then((user) => {
        if(user){
            Schedule.find({ user_id: user._id }).countDocuments().then(count => {
                if (count == 8) {
                    user.is_scheduled = true
                    user.save()
                }
            })
           
            try {
                Category.find({}).then((categories) => {
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
                                            Schedule.findOne({ user_id: user._id, scheduled_date: date }).then((dates) => {
                                                console.log(dates,'date')
                                                if (dates == null) {
                                                    let schedule = new Schedule()
                                                    schedule.user_id = user._id
                                                    schedule.category_id = result.category_id
                                                    schedule.question_id = result._id
                                                    schedule.scheduled_date = date
                                                    schedule.save()
                                                } else {
                                                    throw new Error("date exist");
                                                }

                                            })
                                        }
                                    })
                                }else{
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

    // User.findOne({ is_scheduled: { $ne: true }, user_type: { $ne: 'admin' } }, null, { sort: { 'createdAt': -1 } }).then((user) => {
    //     if (user) {
    //         Schedule.find({ user_id: user._id }).then((scheds) => {
    //             if (scheds.length === 8) {
    //                 user.is_scheduled = true
    //                 user.save();
    //             } else {
    //                 Category.find({}).then((categories) => {
    //                     categories.forEach((category) => {
    //                         let cat = category
    //                         Question.find({ category_id: cat._id }).then((questions) => {
    //                             let question = random_item(questions)
    //                             Schedule.find({ user_id: user._id, category_id: cat._id, question_id: question._id }).then((schedules) => {
    //                                 if (schedules.length === 0) {
    //                                     Schedule.findOne({ user_id: user._id, scheduled_date: date }).then((schedule) => {
    //                                         // console.log(schedule)
    //                                         if (schedule === null) {
    //                                             let schedule = new Schedule()
    //                                             schedule.user_id = user._id
    //                                             schedule.category_id = cat._id
    //                                             schedule.question_id = question._id
    //                                             schedule.scheduled_date = date
    //                                             schedule.save()
    //                                         }
    //                                     })

    //                                 } else {
    //                                     if (schedules.length != 4) {
    //                                         // Schedule.findOne({ user_id: user._id, category_id: cat._id, question_id: question._id }).then((schedule) => {
    //                                         //     if (schedule) {
    //                                         //         console.log('it exist');
    //                                         //     } else {
    //                                         //         let schedule = new Schedule()
    //                                         //         schedule.user_id = user._id
    //                                         //         schedule.category_id = cat._id
    //                                         //         schedule.question_id = question._id
    //                                         //         schedule.scheduled_date = date
    //                                         //         schedule.save()
    //                                         //     }
    //                                         // })
    //                                     } else {

    //                                     }
    //                                 }
    //                             })
    //                         })
    //                     });
    //                 })
    //             }
    //         })
    //     }
    // })
module.exports = Activity