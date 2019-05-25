'use strict'

// const Support = require('../../Support/Models/Support')
const EmailAlert = require('../Models/Email')
const User = require('../../User/Models/User')
const Activity = require('../../../functions/activity')
const Response = require('../Models/Response')
const Archieve = require('../Models/Archieve')
const Schedule = require('../Models/Schedule')
const ResponseService = require('../Service/ResponseService')

class ExtraController {

    static userSmsResponse(req,res,next){
        let str = req.query.message
        let schedule = str.split(' ',1)
        let current_date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
        User.findOne({ phone: req.query.from }).then((user)=>{
            Schedule.findOne({ user_id: user._id , scheduled_date: new Date(current_date), is_reply: false }).then((resp) => {

                let response = new Response()
                response.schedule_id = resp._id
                response.user_id = resp.user_id
                response.question_id = resp.question_id
                response.from = req.query.from
                response.data = req.query.message
                response.save()

                resp.is_reply = true
                resp.save()

                return res.status(201).json('successfully received') 

            }).catch(err => {
                let arc = new Archieve()
                arc.from = req.query.from
                arc.data = req.query.message
                arc.save()
                return res.status(401).json(err.message)
            }) 
        }).catch((err) =>{
            let arc = new Archieve()
            arc.from = req.query.from
            arc.data = req.query.message
            arc.save()
            return res.status(401).json(err.message) 
        })   
    }

    static userEmailResponse(req, res, next) {
        let datas = ResponseService.logic()             
        return res.status(201).json({ datas: datas })
    }

    static getResponse(req, res, next) {        
        Response.find({}).populate('schedule_id').populate('user_id').populate('question_id').then((responses) => {
            return res.status(201).json({ responses: responses})
        }).catch(err => {
            return res.status(401).json(err)
        })
    }

    static getArchieve(req, res, next) {
        Archieve.find({}).then((responses) => {
            return res.status(201).json({ archieves: archieves })
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