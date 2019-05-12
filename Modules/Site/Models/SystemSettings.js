'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SystemSettingsSchema = new Schema({
    data: { type: Object },   
}, { timestamps: true })

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema)