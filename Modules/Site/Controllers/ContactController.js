'use strict'

const Contact = require('../Models/Contact')
const Activity = require('../../../functions/activity')

class ContactController {

    static create(req, res,next) {
        try {
            if (!req.body.full_name) {
                res.status(422).json({ 'error': 'Please provide full name' })
            }
            if (!req.body.email) {
                res.status(422).json({ 'error': 'Please provide email' })
            }
            if (!req.body.phone) {
                res.status(422).json({ 'error': 'Please provide phone number' })
            }
            if (!req.body.message) {
                res.status(422).json({ 'error': 'Please provide message' })
            }
            const contact = new Contact(req.body)
            contact.save(function(error) {
                if (error) {
                    return res.status(401).json({ error: error, msg: error.message })
                } else {
                    Activity.Email('', 'New Contact Message',  Activity.html('<p style="color: #000">Hello Administrator,' + contact.message + '<br> from ' + contact.email + ' with the phone number ' + contact.phone + '.</p>'))
                    Activity.Email(contact, 'New Contact Message Recieve',  Activity.html('<p style="color: #000">Hello ' + contact.full_name + ", <br> Your message has been recieved, we will get back to you shortly.</p>"))
                    Activity.activity_log(req, null, contact.full_name + ' Sent Administrator a message')
                    return res.status(201).json({ msg: 'Contact message Successfully received.' })
                }
            })
        } catch (error) {
            return res.status(422).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            Contact.find({}, null, { sort: { 'createdAt': -1 } }).then((contacts) => {
                return res.status(201).json({ contacts: contacts })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }
}
module.exports = ContactController