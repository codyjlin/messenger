const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hi I am a chatbot'))

app.get('/webhook/', (req, res) => {
    // TODO: update this with other token (different than other one)
    if (req.query['hub.verify_token'] === 'our_token_to_be_defined') {
        res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token")
})

// TODO: fill in with fb token when created
let token = 


app.post('/webhook', (req, res) => {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendText(sender, "Echo of: " + text.substring(0, 100))
        }
    }
    res.sendStatus(200)
})

sendText = (sender, text) => {
    let messageData = {text: text}
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token : token},
        method: "POST",
        json: {
            recipient: {id: sender}, 
            message: messageData
        }
    }), (error, response, body) => {
        if (error) {
            console.log("error")
        } else if (response.body.error) {
            console.log("response body error")
        }
    }
}


app.listen(app.get("port"), () => {
    console.log("Running on port")
})


