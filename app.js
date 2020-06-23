const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.set("port", process.env.PORT || 5000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// to test web interface at https://hidden-reaches-75568.herokuapp.com/
app.get("/", (req, res) => res.send("Hi I am a chatbot."));

/* ONLY NEEDED ONCE FOR SETUP TO CONNECT APP CODE TO FB
app.get("/webhook/", (req, res) => {
if (req.query["hub.verify_token"] === "cacheRegister112358") {
    res.send(req.query["hub.challenge"]);
}
res.send("Wrong token");
});
*/

let token =
  "EAAEAaBJDBFQBALdr7koRDeS7MMcPvLnUZBuwFMuJ0GNx1jb9cCyQyVHUSX1nbJaMjF3uNpZA71TxegrbvhfQwC29ZAKAmRqJlBUYJtNlZAQwkNTWR91ZAtpBzDWCGgQrOOBZAaxye4mjox6lfw2cgBeJmbQGCRs71HlQW9rrpdlet4dFav7O1f7S2MRnQI8BoZD";
let pageID = "100485215051192";

let actQuickReplies = [
  {
    content_type: "text",
    title: "How to get involved",
    payload: "getInvolved",
    image_url:
      "https://ih1.redbubble.net/image.296010023.6499/st,small,507x507-pad,600x600,f8f8f8.jpg",
  },
  {
    content_type: "text",
    title: "Add an opportunity",
    payload: "addOpportunity",
    image_url: "https://img.icons8.com/doodle/48/000000/plus--v1.png",
  },
];

// Our page now has a test post for the purpose of testing private replies
let sample_post_id = 105528631213517;

app.post("/webhook", (req, res) => {
  console.log("----------- post webhook ---------------");
  console.log("Printing req.body: ", req.body);
  // console.log("Printing req.body.entry: ", req.body.entry);
  if (req.body.entry && req.body.entry[0].changes) {
    console.log(
      "Printing req.body.entry[0].changes: ",
      req.body.entry[0].changes
    );
    console.log(
      "Printing req.body.entry[0].changes.value.from: ",
      req.body.entry[0].changes[0].value.from
    );
  }

  let messaging_events = req.body.entry[0].messaging;
  let body = req.body;
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i];
    let sender = event.sender.id;

    console.log("---- user id is -----");
    console.log(sender);
    
  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      if ("changes" in entry) {
        // Handle Page Changes event
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
                sendText(sender, {
                    text: "Post Echo of: " + change.post_id + text.substring(0, 100),
                    quick_replies: actQuickReplies,
                    });
              break;
            case "comment":
                sendText(sender, {
                    text: "Comment Echo of: " + change.comment_id + text.substring(0, 100),
                    quick_replies: actQuickReplies,
                    });
              break;
            default:
              console.log('Unsupported feed change type.');
              return;
          }
        }
      }
    }
  )}

    






    // first check for private stories
    if (event.message && event.message.text) {
      let text = event.message.text;

      sendText(sender, {
        text: "Echo of: " + text.substring(0, 100),
        quick_replies: actQuickReplies,
      });
      askForZipcode(sender);

      if (event.message.quick_reply) {
        let quickReply = event.message.quick_reply.payload;

        switch (quickReply) {
          case "getInvolved": {
            sendText(sender, { text: "you clicked get involved" });
            break;
          }
          case "addOpportunity": {
            sendText(sender, { text: "you clicked add opportunity" });
            break;
          }
        }
      }
    }

    // let body = req.body; // Checks if this is an event from a page subscription

    if (body.object === "page") {
      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED"); // Iterates over each entry - there may be multiple if batched

      body.entry.forEach(function (entry) {
        if ("changes" in entry) {
          // Handle Page Changes event
          if (entry.changes[0].field === "feed") {
            let change = entry.changes[0].value;
            switch (change.item) {
              case "post":
                sendText(sender, {
                  text:
                    "Post Echo of: " + change.post_id + text.substring(0, 100),
                  quick_replies: actQuickReplies,
                });
                break;
              case "comment":
                sendText(sender, {
                  text:
                    "Comment Echo of: " +
                    change.comment_id +
                    text.substring(0, 100),
                  quick_replies: actQuickReplies,
                });
                break;
              default:
                console.log("Unsupported feed change type.");
                return;
            }
          }
        }
      });
    }

    res.sendStatus(200);
  }
  console.log("---------------- end post webhook ----------");
});

askForZipcode = (sender) => {
  console.log("ASKING FOR ZIPCODE HERE");
  let messageData = {
    text: "What is your zipcode?",
  };
  request({
    url: "https://graph.facebook.com/v7.0/me/messages",
    qs: { access_token: token },
    method: "POST",
    json: {
      messaging_type: "UPDATE",
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

sendText = (sender, messageData) => {
  console.log("SENDING TEXT");
  request({
    url: "https://graph.facebook.com/v7.0/me/messages",
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
      console.log("**** RESPONSE START ******");
      console.log(response);
      console.log("**** RESPONSE END ******");
    };
};

app.listen(app.get("port"), () => {
  console.log("Running on port");
});
