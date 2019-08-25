const local = require('./local')
const production = require('./production')
const development = require('./development')

let config = {};
if (process.env.NODE_ENV == 'production') {
    config = production;
} else if (process.env.NODE_ENV == 'development') {
    config = production;
}else{
    config = production;
}

module.exports = config