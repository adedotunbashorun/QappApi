module.exports = local = {
    app: {
        port: process.env.PORT || 7000
    },
    db: {
        url: process.env.DEV_URL || 'mongodb://localhost:27017/QappApi',
        host: process.env.DEV_DB_HOST,
        port: parseInt(process.env.DEV_DB_PORT) || 27017,
        name: process.env.DEV_DB_DATABASE || 'QappApi'
    }
}