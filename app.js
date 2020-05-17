const express = require('express')
const config = require('config')
const path = require('path')
const mongoose = require('mongoose')
const https = require('https')
const fs = require('fs')

const app = express()

app.use(express.json({extended: true}))

app.use('/api/auth', require('./routes/auth.routes'))

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })

    const httpsOptions = {
        key: fs.readFileSync("/etc/ssl/private.key"), // путь к ключу
        cert: fs.readFileSync("/etc/ssl/memenomicon.crt") // путь к сертификату
    }
}

const PORT = config.get("port") || 5000

async function start() {
    try {
        await  mongoose.connect(config.get("mongoUri"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
        if (process.env.NODE_ENV === 'production') {
            https.createServer(httpsOptions, app).listen(443)
        }
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()
