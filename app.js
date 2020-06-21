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

let actQuickReplies = [
  {
    content_type: "text",
    title: "How to get involved",
    payload: "getInvolved",
    image_url:
      "https://media1.s-nbcnews.com/i/newscms/2016_14/1038571/red-dot-puzzle-tease-today-160406_7042d4e863c03b4a32720f424d48501b.JPG",
  },
  {
    content_type: "text",
    title: "Add an opportunity",
    payload: "addOpportunity",
    image_url:
      "https://newyork.cbslocal.com/wp-content/uploads/sites/14578484/2011/12/yellowdot_420_1.jpg?w=420&h=316&crop=1",
  },
];

// Our page now has a test post for the purpose of testing private replies
let sample_post_id = 105528631213517;

app.post("/webhook", (req, res) => {
  console.log("----------- post webhook ---------------");
  // console.log("Printing req.body: ", req.body);
  //   console.log("Printing req.body.entry: ", req.body.entry);
  //   console.log(
  //     "Printing req.body.entry[0].messaging: ",
  //     req.body.entry[0].messaging
  //   );
  //   console.log(
  //     "Printing req.body.entry[0].messaging[0]: ",
  //     req.body.entry[0].messaging[0]
  //   );
  console.log(
    "Printing req.body.entry[0].messaging[0].message: ",
    req.body.entry[0].messaging[0].message
  );

  let messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    let event = messaging_events[i];
    let sender = event.sender.id;
    // first check for private stories
    if (event.message && event.message.text && event.sender.comment_id) {
        console.log("--------- got a comment! --------");
        sendText(sender, {
            text: "This is a private story reply echo" + text.substring(0, 100),
            quick_replies: actQuickReplies,
          });
    } else if (event.message && event.message.text) {
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

sendText = (sender, text) => {
  console.log("SENDING TEXT");
  let messageData = {
    text: text,
    quick_replies: [
      {
        content_type: "text",
        title: "How to get involved",
        payload: "getInvolved",
        image_url:
          "https://media1.s-nbcnews.com/i/newscms/2016_14/1038571/red-dot-puzzle-tease-today-160406_7042d4e863c03b4a32720f424d48501b.JPG",
      },
      {
        content_type: "text",
        title: "Add an opportunity",
        payload: "addOpportunity",
        image_url:
          "https://newyork.cbslocal.com/wp-content/uploads/sites/14578484/2011/12/yellowdot_420_1.jpg?w=420&h=316&crop=1",
      },
    ],
  };
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
