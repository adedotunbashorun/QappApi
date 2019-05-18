'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ResponseSchema = new Schema({
    schedule_id: { type: Schema.ObjectId, ref: 'Schedule', default: null },
    user_id: { type: Schema.ObjectId, ref: 'User', default: null },
    question_id: { type: Schema.ObjectId, ref: 'Question', default: null },
    from:{ type:String},
    data: { type: String },
}, { timestamps: true })


module.exports = mongoose.model('Response', ResponseSchema)