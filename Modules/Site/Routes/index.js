'use strict'

const express = require('express')
const router = express.Router()
const Guard = require('../../../Middleware/auth')
const ExtraController = require('../Controllers/ExtraController')
const ContactController = require('../Controllers/ContactController')
const ActivityController = require('../Controllers/ActivityController')
const MailSettingsController = require('../Controllers/MailSettingsController')
const SystemSettingsController = require('../Controllers/SettingsController')


router.post('/system/create', (req, res, next) => {
    SystemSettingsController.create(req, res, next)
})

router.get('/system/all', (req, res, next) => {
    SystemSettingsController.getAll(req, res, next)
})

router.post('/mail/create', (req, res, next) => {
    MailSettingsController.create(req, res, next)
})

router.get('/mail/all', (req, res, next) => {
    MailSettingsController.getAll(req, res, next)
})

router.get('/activities', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getAll(req, res, next)
})

router.get('/incomming/message',(req,res,next) =>{
    ExtraController.userSmsResponse(req,res,next)
})

router.get('/all/gmail/message', (req, res, next) => {
    ExtraController.userEmailResponse(req, res, next)
})

router.get('/responses', (req, res, next) => {
    ExtraController.getResponse(req, res, next)
})

router.get('/my_activities/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getuserAll(req, res, next)
})

router.get('/my_recent_activities/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getuserLastFive(req, res, next)
})

router.post('/contact/create', (req, res, next) => {
    ContactController.create(req, res, next)
})

router.get('/contact/all', (req, res, next) => {
    ContactController.getAll(req, res, next)
})

router.get('/schedules/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getUserSchedule(req, res, next)
})

router.get('/schedules/total/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getUserScheduleTotal(req, res, next)
})

router.get('/schedules/sent/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getUserScheduleTotalSent(req, res, next)
})

router.get('/schedules/replied/:user_id', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getUserScheduleTotalReplied(req, res, next)
})

router.get('/schedules', [Guard.isValidUser], (req, res, next) => {
    ActivityController.getAllSchedule(req, res, next)    
})

router.post('/email_alert', (req, res, next) => {
    ExtraController.emailAlert(req, res, next)
})

router.get('/unsubscribe/:email', (req, res, next) => {
    ExtraController.deactivateAlertEmail(req, res, next)
})

router.get('/', (req, res, next) => {
    res.send("Welcome to QAPP API visit <a href='https://qappdevtest.herokuapp.com/'>QAPP</a> for the interface.")
})

module.exports = router