'use strict'

const BulkMessage = require('../Models/BulkMessage')
const Activity = require('../../../functions/activity')

class BulkMessageController {

    static create(req, res, next) {
        try {
            if (!req.body.title) {
                res.status(422).json({ 'error': 'Please provide subject of the message' })
            }
            if (!req.body.message) {
                res.status(422).json({ 'error': 'Please provide message' })
            }
            if (!req.body.medium) {
                res.status(422).json({ 'error': 'Please provide medium' })
            }
            if (!req.body.receiver) {
                res.status(422).json({ 'error': 'Please provide user type' })
            }
            const message = new BulkMessage(req.body)
            message.save(function(error) {
                if (error) {
                    return res.status(401).json({ error: error, msg: error.message })
                } else {
                    if (req.body.medium == 'email' && req.body.type == 'immediate') {
                        Activity.BulkEmail(message)
                    } else {
                        // Activity.BulkSms(message)
                    }
                    Activity.activity_log(req, req.body.user_id, ' Send Bulk  message')
                    return res.status(201).json({ msg: 'bulk message successfully sent.' })
                }
            })
        } catch (error) {
            return res.status(422).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            BulkMessage.find({}, null, { sort: { 'createdAt': -1 } }).populate('user_id').then((messages) => {
                return res.status(201).json({ messages: messages })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static update(req,res,next){
        BulkMessage.findOneAndUpdate({ _id: req.params._id }, req.body, { upsert: true}, function (error) {
            if (error) {
                return res.status(401).json({ error: error, msg: error.message })
            } else {
                return res.status(201).json({ msg: 'Message Successfully updated.' })
            }
        })
    }

    static getMessage(req, res, next) {
        BulkMessage.findOne({ id: req.params._id }).populate("user_id").then(function (message) {
            return res.status(201).json({ message: message })
        }, function (error) {
            return res.status(501).json({ "success": false, "message": error })
        })
    }
}

module.exports = BulkMessageController