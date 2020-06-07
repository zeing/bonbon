'use strict';
const Twitter = require("twitter-lite");
const line = require('@line/bot-sdk');
const express = require('express');
require('dotenv').config();
const app = express();

// create LINE SDK client
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}

const client = new line.Client(config);

const clientTwitter = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    // console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// Make post request on media endpoint. Pass file data as media parameter
function tweet(status) {
  return clientTwitter.post('statuses/update', { status })
}

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  tweet(message.text).then((tweet) => {
    return replyText(replyToken, `Tweeted !! | See at https://twitter.com/bon2_official/status/${tweet.id_str}`);
  })
    .catch((error) => {
      return replyText(replyToken, `error try again`);
    })
}

function handleImage(message, replyToken) {
  return unavailableNow(message, replyToken)
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return unavailableNow(message, replyToken)
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return unavailableNow(message, replyToken)
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return unavailableNow(message, replyToken)
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return unavailableNow(message, replyToken)
  return replyText(replyToken, 'Got Sticker');
}

function unavailableNow(message, replyToken) {
  return replyText(replyToken, `${message.type} is unavailable now`);

}

const port = process.env.PORT;
app.listen(port || 3000, () => {
  console.log(`listening on ${port}`);
});
