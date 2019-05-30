const cron = require("node-cron")
const Activity = require('./activity')
const ResponseService = require('../Modules/Site/Service/ResponseService')



// cron.schedule("*/10 * * * *", function () {
//     console.log("---------------------")
//     console.log("Running Cron Job 1")
// })

cron.schedule("*/01 * * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 2")
    try {       
        Activity.scheduleTime()  
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("* 07 * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 3")
    try {
        Activity.sendScheduleMessage()
    } catch (err) {
        console.log(err)
    }
})

cron.schedule("55 20 * * *", function () {
    console.log("---------------------")
    console.log("Running Cron Job 4")
    try {
        ResponseService.logic()
        Activity.unrepliedScheduleMessage()
    } catch (err) {
        console.log(err)
    }
})
