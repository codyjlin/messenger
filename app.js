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

let joinQuickReplies = [
  {
    content_type: "text",
    title: "Yes!",
    payload: "yes",
    image_url: "https://img.icons8.com/flat_round/64/000000/checkmark.png",
  },
  {
    content_type: "text",
    title: "No",
    payload: "no",
    image_url: "https://img.icons8.com/cute-clipart/64/000000/close-window.png",
  },
];
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
let getInvolvedQuickReplies = [
  {
    content_type: "text",
    title: "Donate",
    payload: "donate",
    image_url: "https://img.icons8.com/bubbles/50/000000/money.png",
  },
  {
    content_type: "text",
    title: "Support local businesses",
    payload: "support",
    image_url: "https://img.icons8.com/doodle/48/000000/dining-room.png",
  },
  {
    content_type: "text",
    title: "Peacefully protest",
    payload: "protest",
    image_url: "https://img.icons8.com/dusk/64/000000/strike.png",
  },
  {
    content_type: "text",
    title: "Email an official",
    payload: "email",
    image_url: "https://img.icons8.com/bubbles/50/000000/email.png",
  },
  {
    content_type: "text",
    title: "Spread the word",
    payload: "share",
    image_url:
      "https://img.icons8.com/pastel-glyph/64/000000/bullhorn-megaphone--v2.png",
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
      "Printing req.body.entry[0].changes[0].value.from: ",
      req.body.entry[0].changes[0].value.from
    );
  }
  // console.log(
  //   "Printing req.body.entry[0].messaging: ",
  //   req.body.entry[0].messaging
  // );
  // console.log(
  //   "Printing req.body.entry[0].messaging[0]: ",
  //   req.body.entry[0].messaging[0]
  // );
  // console.log(
  //   "Printing req.body.entry[0].messaging[0].message: ",
  //   req.body.entry[0].messaging[0].message
  // );

  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED"); // Iterates over each entry - there may be multiple if batched

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // comment or post
      if ("changes" in entry) {
        let change = entry.changes[0].value;
        switch (change.item) {
          case "post":
            sendText(
              { post_id: change.post_id },
              {
                text:
                  "Thanks for reaching out to me! Are you interested in supporting the BLM movement in your local area?",
                quick_replies: joinQuickReplies,
              }
            );
            break;
          case "comment":
            sendText(
              { comment_id: change.comment_id },
              {
                text:
                  "Thanks for reaching out to me! Are you interested in supporting the BLM movement in your local area?",
                quick_replies: joinQuickReplies,
              }
            );
            break;
          default:
            console.log("Unsupported feed change type.");
        }
      }

      // dm
      if ("messaging" in entry) {
        if (
          entry.messaging[0].message &&
          ["Hello!", "Hi", "Here", "Hello", "Hello?", "hi", "hello"].includes(
            entry.messaging[0].message.text
          )
        ) {
          let sender = entry.messaging[0].sender.id;
          sendText(
            { id: sender },
            {
              text:
                "Thanks for reaching out to me! Are you interested in supporting the BLM movement in your local area?",
              quick_replies: joinQuickReplies,
            }
          );
        }

        for (let i = 0; i < entry.messaging.length; i++) {
          let event = entry.messaging[i];
          let sender = event.sender.id;

          if (event.message.quick_reply) {
            let quickReply = event.message.quick_reply.payload;

            switch (quickReply) {
              case "yes": {
                sendText(
                  { id: sender },
                  {
                    text: "Great! What would you like to do?",
                    quick_replies: actQuickReplies,
                  }
                );
                break;
              }
              case "no": {
                let oppquickReplyMillisecondsToWait = millisecondsToWait + 30;
                sendText(
                  { id: sender },
                  {
                    text:
                      "No worries! It would still be a huge help if you could connect me with your friends. Here's my page (https://www.facebook.com/BLMtest) and contact info (m.me/BLMtest)",
                  }
                );
                break;
              }
              case "getInvolved": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "You rock! Here are some ways you can make a difference:",
                    quick_replies: getInvolvedQuickReplies,
                  }
                );
                break;
              }
              case "addOpportunity": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "That's awesome! Please give us the details in an email to username@email.com",
                  }
                );
                break;
              }
              case "donate": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "Great choice! You can donate directly to the movement at https://www.gofundme.com/f/blmla",
                  }
                );
                break;
              }
              case "support": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "Great choice! Here's a thorough list of the nearby businesses you can directly support: https://www.latimes.com/lifestyle/story/2020-06-03/black-owned-businesses-in-los-angeles",
                  }
                );
                break;
              }
              case "protest": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "Great choice! There are a lot of options near you - you can keep up to date at this page:  https://www.facebook.com/MarchAndRallyLA/",
                  }
                );
                break;
              }
              case "email": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "Great choice! You can share your opinions with Gilbert Cedillo, an LA Council Member at gilbert.cedillo@lacity.org",
                  }
                );
                break;
              }
              case "share": {
                sendText(
                  { id: sender },
                  {
                    text:
                      "It would still be a great help if you could connect me with your friends. Here's my page (https://www.facebook.com/BLMtest) and contact info (m.me/BLMtest)",
                  }
                );
                break;
              }
            }
          }
        }
      }
    });
  }
});

/* Code for sleeping
      let millisecondsToWait = 40;
      setTimeout(() => {
        // Whatever you want to do after the wait
        askForZipcode(sender);
      }, millisecondsToWait);
*/

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
      messaging_type: "RESPONSE",
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

respondGetInvolved = (sender) => {
  console.log("RESPONDING TO ADDRESS AFTER GET INVOLVED QUICK REPLY");
  let imageData = {
    attachment: {
      type: "image",
      //   type: "file",
      payload: {
        url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Fist.svg/1200px-Fist.svg.png",
        is_resuable: true,
      },
    },
  };
  request({
    url: "https://graph.facebook.com/v7.0/me/messages",
    qs: { access_token: token },
    method: "POST",
    json: {
      messaging_type: "RESPONSE",
      recipient: { id: sender },
      message: imageData,
      // filedata: ("img/blm.jpg", "image/jpeg"),
      // filedata: "@/img/blm.jpg",
      // type: "image/jpeg"
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

sendText = (recipient, messageData) => {
  console.log("SENDING TEXT");
  request({
    url: "https://graph.facebook.com/v7.0/me/messages",
    qs: { access_token: token },
    method: "POST",
    json: {
      recipient: recipient,
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
