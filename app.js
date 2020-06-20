const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.set("port", process.env.PORT || 5000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hi I am a chatbot."));

app.get("/webhook/", (req, res) => {
  if (req.query["hub.verify_token"] === "cacheRegister112358") {
    res.send(req.query["hub.challenge"]);
  }
  res.send("Wrong token");
});

let token =
  "EAAEAaBJDBFQBALdr7koRDeS7MMcPvLnUZBuwFMuJ0GNx1jb9cCyQyVHUSX1nbJaMjF3uNpZA71TxegrbvhfQwC29ZAKAmRqJlBUYJtNlZAQwkNTWR91ZAtpBzDWCGgQrOOBZAaxye4mjox6lfw2cgBeJmbQGCRs71HlQW9rrpdlet4dFav7O1f7S2MRnQI8BoZD";

app.post("/webhook", (req, res) => {
  let messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      let text = event.message.text;
      sendText(sender, "Echo of: " + text.substring(0, 100));
    }
  }
  res.sendStatus(200);
});

sendText = (sender, text) => {
  let messageData = { text: text, "quick_replies":[
    {
      "content_type":"text",
      "title":"Red",
      "payload":"red",
      "image_url":"https://media1.s-nbcnews.com/i/newscms/2016_14/1038571/red-dot-puzzle-tease-today-160406_7042d4e863c03b4a32720f424d48501b.JPG"
    },{
      "content_type":"text",
      "title":"Yellow",
      "payload":"yellow",
      "image_url":"https://newyork.cbslocal.com/wp-content/uploads/sites/14578484/2011/12/yellowdot_420_1.jpg?w=420&h=316&crop=1"
    }
  ] };
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: { access_token: token },
    method: "POST",
    json: {
      recipient: { id: sender },
      message: messageData,
    },
  }),
    (error, response, body) => {
      if (error) {
        console.log("error");
      } else if (response.body.error) {
        console.log("response body error");
      }
    };
};

app.listen(app.get("port"), () => {
  console.log("Running on port");
});
