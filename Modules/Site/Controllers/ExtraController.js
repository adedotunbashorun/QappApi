'use strict'

// const Support = require('../../Support/Models/Support')
const EmailAlert = require('../Models/Email')
const User = require('../../User/Models/User')
const Question = require('../../Question/Models/Question')
const Activity = require('../../../functions/activity')
const Response = require('../Models/Response')
const Archieve = require('../Models/Archieve')
const Schedule = require('../Models/Schedule')
const ResponseService = require('../Service/ResponseService')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const result = {}
class ExtraController {

    static userSmsResponse(req,res,next){  
        let str = req.body.Body
        let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
        User.findOne({ phone: req.body.From }).then((user)=>{
            Schedule.findOne({ user_id: user._id , scheduled_date: current_date, is_reply: false }).then((resp) => {

                let response = new Response()
                response.schedule_id = resp._id
                response.user_id = resp.user_id
                response.question_id = resp.question_id
                response.from = req.body.From
                response.data = req.body.Body
                response.save()

                resp.is_reply = true
                resp.replied_date = new Date()
                resp.save()

                return res.status(201).json('successfully received') 

            }).catch(err => {
                let arc = new Archieve()
                arc.from = req.body.From
                arc.data = req.body.Body
                arc.save()
                return res.status(401).json(err.message)
            }) 
        }).catch((err) =>{
            let arc = new Archieve()
            arc.from = req.body.From
            arc.data = req.body.Body
            arc.save()
            return res.status(401).json(err.message) 
        })   
    }

    static userEmailResponse(req, res, next) {
        let datas = ResponseService.logic()             
        return res.status(201).json({ datas: datas })
    }

    static getResponse(req, res, next) {        
        Response.find({}).populate('schedule_id').populate('user_id').populate('question_id').sort('-createdAt').then((responses) => {
            return res.status(201).json({ responses: responses})
        }).catch(err => {
            return res.status(401).json(err)
        })
    }

    static getUserResponse(req, res, next) {        
        Response.find({user_id: req.params.user_id}).populate('schedule_id').populate('question_id').sort('-createdAt').then((responses) => {
            return res.status(201).json({ responses: responses})
        }).catch(err => {
            return res.status(401).json(err)
        })
    }

    static getArchieve(req, res, next) {
        Archieve.find({}).sort('-createdAt').then((archieves) => {
            return res.status(201).json({ archieves: archieves })
        }).catch(err => {
            return res.status(401).json(err)
        })
    }
    

    static countAllDoc(req, res, next) {

        User.countDocuments({}).exec((err ,count) =>{            
            result.users_count = count
            Question.countDocuments({}).exec((err ,count) =>{
                result.questions_count = count
                Schedule.countDocuments({}).exec((err ,count) =>{
                    result.schedules_count = count
                    Response.countDocuments({}).exec((err ,count) =>{
                        result.responses_count = count
                        Schedule.countDocuments({ status: true}).exec((err ,count) =>{
                            result.schedules_sent = count
                            Schedule.countDocuments({ status: true,is_reply: { $ne: true}}).exec((err ,count) =>{
                                result.schedules_failed = count
                                Archieve.countDocuments({}).exec((err ,count) =>{
                                    result.archieves_count = count
                                    return res.status(201).json({result})
                                })
                            })
                        })
                    })
            
                    
                })
            })
        })
    }

    static deactivateAlertEmail(req, res, next) {
        EmailAlert.findOne({ email: req.params.email }).then(function (email) {
            email.status = 0
            email.save()
            return res.status(201).json({ msg: 'you have unsubscribed from latest deals alert.' })
        }, function (error) {
            return res.status(501).json({ "success": false, "message": error })
        })
    }

    static emailAlert(req,res,next){
        EmailAlert.findOne({ email: req.params.email }).then(function (email) {
            if(email.email === req.params.email)
                return res.status(201).json({ msg: 'you are a subscribed member, thanks you!' })
            else
                Activity.alertEmail(req)
                Activity.Email(req.body, 'Qapp Alert', Activity.html('<p style="color: #000">Hello ' + req.body.email + '<br>, Thank you for creating a price alert at Brax Map.we will update you with our latest and cheapest deals.<br><br><br><br><br>click <a href="https://braxmap.com/unsubscribe/"' + req.body.email + '>here</a> to unsubscribe</p>'))
                return res.status(201).json({ msg: 'Email Alert Successfully Activated.' })
        }, function (error) {
            return res.status(501).json({ "success": false, "message": error })
        })
        
    }

    static sendResponse(req,res,next){ 
        User.findById(req.body.user_id).then( user =>{
            if(req.body.medium === 'Sms'){
                Activity.Sms(user.phone,req.body.message)
            }
            if(req.body.medium === 'Email'){
                Activity.Email(user, 'User Response', Activity.html('<p style="color: #000">Hello ' + user.first_name +' '+ user.last_name + ',<br>'+ req.body.message +'</p>'))
            }
            return res.status(201).json({ msg: 'message sent successfully!' })
        }).catch( err =>{
            return res.json({ error: err, msg: err.message })
        })
        
    }
}
module.exports = ExtraController