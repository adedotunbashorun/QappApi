'use strict'
const Category = require('../Models/Category')
const Activity = require('../../../functions/activity')

class CategoryController {    

    static create(req, res, next) {
        try {
            if (!req.body.name) {
                res.status(422).json({ 'error': 'Please provide name' })
            }
            if (!req.body.description) {
                res.status(422).json({ 'error': 'Please provide description' })
            }
            const category = new Category(req.body)
            category.save(function (error) {
                if (error) {
                    return res.status(401).json({ error: error, msg: error.message })
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
            return res.status(500).json(err)
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
                return res.status(401).json({ error: error, msg: error.message })
            } else {
                category.name = req.body.name
                category.description = req.body.description
                category.save()
                return res.status(201).json({ msg: 'Category Successfully updated.' })
            }
        })
    }

    static delete(req, res, next) {
        try {
            Category.findOneAndRemove({ _id: req.params.id, deleted_at: null }, function (error, category) {
                if (error) {

                    (req.user) ? Activity.activity_log(req, req.user._id, 'error deleting a user') : ''
                    return res.status(501).json({ error: error, msg: error.message })
                } else {
                    (req.user) ? Activity.activity_log(req, req.user._id, 'deleted a user') : ''
                    return res.json({ category: category, msg: category.name + " was deleted successfully" })
                }
            })
        } catch (error) {
            return res.status(501).json({ error: error, msg: error.message })
        }
    }

}

module.exports = CategoryController