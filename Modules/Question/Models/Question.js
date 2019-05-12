'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
    // user_id: { type: Schema.ObjectId, ref: 'User', default: null },
    category_id: { type: Schema.ObjectId, ref: 'Category', default: null },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true })


module.exports = mongoose.model('Question', QuestionSchema)