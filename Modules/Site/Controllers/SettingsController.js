'use strict'

const SystemSettings = require('../Models/SystemSettings')

class SystemSettingsController {

    static create(req, res, next) {
        try {
            let setting = {
                data: req.body
            }
            if(req.body._id !== ""){
                SystemSettings.findOneAndUpdate({_id: req.body._id }, setting ,{upsert: true, new: true},function(error) {
                    if (error) {
                        return res.status(401).json({ error: error, msg: error.message })
                    } else {
                        return res.status(201).json({ msg: 'Settings Successfully updated.' })
                    }
                })
            }else{
                var settings = new SystemSettings(setting)
                settings.save(function(error) {
                    if (error) {
                        return res.status(401).json({ error: error, msg: error.message })
                    } else {
                        return res.status(201).json({ msg: 'Settings Successfully saved.' })
                    }
                })
            }
        } catch (error) {
            return res.status(422).json({ error: error, msg: error.message })
        }
    }

    static getAll(req, res, next) {
        try {
            SystemSettings.findOne({}, null, { sort: { 'createdAt': -1 } }).then((settings) => {
                return res.status(201).json({ settings: settings })
            }, (error) => {
                return res.status(501).json({ "success": false, "message": error })
            })
        } catch (err) {
            return res.status(500).json(err)
        }
    }
}
module.exports = SystemSettingsController