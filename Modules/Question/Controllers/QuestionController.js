'use strict'
const Question = require('../Models/Question')
const Schedule = require('../../Site/Models/Schedule')
const Response = require('../../Site/Models/Response')

class QuestionController {    
    static create(req, res, next) {
        try {
            if (!req.body.category_id || req.body.category_id == null) {
                return res.status(422).json({ 'error': 'Please provide category of question' })
            }
            if (!req.body.subject) {
                return res.status(422).json({ 'error': 'Please provide name' })
            }
            if (!req.body.description) {
                return res.status(422).json({ 'error': 'Please provide description' })
            }
            const question = new Question(req.body)
            question.save(function (error) {
                if (error) {
                    return res.json({ error: error, msg: error.message })
                } else {
                    // Activity.activity_log(req, req.body, 'Created Question')
                    return res.status(201).json({ msg: 'question message Successfully received.' })
                }
            })
        } catch (error) {
            return res.status(422).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            Question.find({}, null, { sort: { 'createdAt': -1 } }).populate('category_id').then((questions) => {
                return res.status(201).json({ questions: questions })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getCategoryQuestion(req, res, next) {
        try {
            Question.find({ category_id: req.params.category_id}, null, { sort: { 'createdAt': -1 } }).then((questions) => {
                return res.status(201).json({ questions: questions })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }

    static getOne(req, res, next) {
        try {
            Question.findOne({ _id: req.params.id, deleted_at: null }).populate('category_id').then((question) => {
                return res.status(201).json({ question: question })
                
                }, (error) => {
                    (req.user) ? Activity.activity_log(req, req.user._id, 'View a user record') : ''
                    return res.status(501).json({ error: error, msg: error.message })
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static update(req, res, next) {
        Question.findById(req.params.id, function (error, question){
            if (error) {
                return res.json({ error: error, msg: error.message })
            } else {
                question.category_id = (req.body.category_id) ? req.body.category_id : question.category_id
                question.subject = (req.body.subject) ? req.body.subject : question.subject
                question.description = (req.body.description) ? req.body.description : question.description
                question.save()
                return res.status(201).json({ msg: 'Question Successfully updated.' })
            }
        })
    }

    static delete(req, res, next) {
        try {
            Question.findOneAndRemove({ _id: req.params.id, deleted_at: null }).then( (question) => {
                if (question) {
                    Schedule.find({ question_id: req.params.id }).remove().exec()
                    Response.find({ question_id: req.params.id }).remove().exec()
                }  
                (req.user) ? Activity.activity_log(req, req.user._id, 'deleted a question') : ''
                return res.json({ msg:"question was deleted successfully" })                
            }).catch(error =>{
                (req.user) ? Activity.activity_log(req, req.user._id, 'error deleting a question') : ''
                return res.status(501).json({ error: error, msg: error.message })
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

}

module.exports = QuestionController