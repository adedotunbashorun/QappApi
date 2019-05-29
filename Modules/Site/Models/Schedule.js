'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ScheduleSchema = new Schema({
    user_id: { type: Schema.ObjectId, ref: 'User', default: null },
    category_id: { type: Schema.ObjectId, ref: 'Category', default: null },
    question_id: { type: Schema.ObjectId, ref: 'Question', default: null },
    scheduled_date: { type: String, required: true },
    status:{type:Boolean, default: false},
    is_reply: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Schedule', ScheduleSchema)