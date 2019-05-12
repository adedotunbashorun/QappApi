'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BulkMessageSchema = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'User' },
    medium: { type: String,required: true },
    receiver: { type: String, required: true },    
    type: { type: String, required: true },
    others: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('BulkMessage', BulkMessageSchema)