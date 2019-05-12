'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MailSettingsSchema = new Schema({    
    data: { type: Object },
    is_active: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('MailSettings', MailSettingsSchema)