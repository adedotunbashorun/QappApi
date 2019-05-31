'use strict'
const Category = require('../Models/Category')
const Schedule = require('../../Site/Models/Schedule')
const Question = require('../../Question/Models/Question')
const Activity = require('../../../functions/activity')

class CategoryController {    

    static create(req, res, next) {
        try {
            if (!req.body.name) {
                return res.status(422).json({ 'error': 'Please provide name' })
            }
            if (!req.body.description) {
                return res.status(422).json({ 'error': 'Please provide description' })
            }
            const category = new Category(req.body)
            category.save(function (error) {
                if (error) {
                    return res.json({ error: error, msg: error.message })
                } else {
                    Activity.activity_log(req, req.user, 'Created Category')
                    return res.status(201).json({ msg: 'Category message Successfully received.' })
                }
            })
        } catch (error) {
            return res.status(422).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            Category.find({}, null, { sort: { 'createdAt': -1 } }).then((categories) => {
                return res.status(201).json({ categories: categories })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json({ error: err, msg: err.message})
        }
    }

    static getOne(req, res, next) {
        try {
            Category.findOne({ _id: req.params.id, deleted_at: null }, function (error, category) {
                if (error) {
                    (req.user) ? Activity.activity_log(req, req.user._id, 'View a user record') : ''
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    return res.status(201).json({ category: category })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

    static update(req, res, next) {
        Category.findById(req.params.id, function (error, category) {
            if (error) {
                return res.json({ error: error, msg: error.message })
            } else {
                category.name = (req.body.name) ? req.body.name : category.name
                category.description = (req.body.description) ?req.body.description  : category.description
                category.save()
                return res.status(201).json({ msg: 'Category Successfully updated.' })
            }
        })
    }

    static delete(req, res, next) {
        try {                     
            Category.findOneAndRemove({ _id: req.params.id}).then( category =>{   
                if (category) {
                    Schedule.find({ category_id: req.params.id }).remove().exec()
                    Question.find({ category_id: req.params.id }).remove().exec()
                }                            
                (req.user) ? Activity.activity_log(req, req.user._id, 'deleted a user') : ''
                return res.json({ msg: "category was deleted successfully" })
            }).catch(error=>{
                (req.user) ? Activity.activity_log(req, req.user._id, 'error deleting a user') : ''
                return res.status(501).json({ error: error, msg: error.message })
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

}

module.exports = CategoryController