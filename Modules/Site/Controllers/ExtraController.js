'use strict'

// const Support = require('../../Support/Models/Support')
const EmailAlert = require('../Models/Email')
const User = require('../../User/Models/User')
const Activity = require('../../../functions/activity')
const result = {}
const Response = require('../Models/Response')
const Schedule = require('../Models/Schedule')

class ExtraController {

    static userResponse(req,res,next){
        let str = req.query.message
        let schedule = str.split(' ',1)
        Schedule.findOne({ _id: schedule[0] }).then((resp) => {
            let response = new Response()
            response.schedule_id = resp._id
            response.user_id = resp.user_id
            response.question_id = resp.question_id
            response.from = req.query.from
            response.data = req.query.message
            response.save()
        
            resp.is_reply = true
            resp.save()
        }).catch(err =>{
            return res.status(401).json(err)
        })
        return res.status(201).json('successfully received')        
    }

    static getResponse(req, res, next) {        
        Response.find({}).populate('schedule_id').populate('user_id').populate('question_id').then((responses) => {
            return res.status(201).json({ responses: responses})
        }).catch(err => {
            return res.status(401).json(err)
        })
    }

    // static countUserDoc(req, res, next) {
    //     Support.find({ user_id: req.params.user_id }).countDocuments().then(count => {
    //         result.support_count = count
    //     }).catch(error => {
    //         return res.status(422).json(error)
    //     })
    // }

    // static countAllDoc(req, res, next) {
    //     Support.find({}).countDocuments().then(count => {
    //         result.support_count = count
    //     }).catch(error => {
    //         return res.status(422).json(error)

    //     })
    // }

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
                Activity.Email(req.body, 'Brax Alert', Activity.html('<p style="color: #000">Hello ' + req.body.email + '<br>, Thank you for creating a price alert at Brax Map.we will update you with our latest and cheapest deals.<br><br><br><br><br>click <a href="https://braxmap.com/unsubscribe/"' + req.body.email + '>here</a> to unsubscribe</p>'))
                return res.status(201).json({ msg: 'Email Alert Successfully Activated.' })
        }, function (error) {
            return res.status(501).json({ "success": false, "message": error })
        })
        
    }
}
module.exports = ExtraController