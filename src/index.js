'use strict';
const line = require('@line/bot-sdk');
const express = require('express');
require('dotenv').config();
const app = express();
import { uploadImg, tweet } from './module/twitter-module'

// create LINE SDK client
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}

const client = new line.Client(config);

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map((event, index) => {
    console.log(event, index)
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
  tweet({ status: message.text })
    .then((tweets) => {
      return replyText(replyToken, `Tweeted !! | See at https://twitter.com/bon2_official/status/${tweets.id_str}`);
    })
    .catch((error) => {
      console.log('tweet error', error)
      return replyText(replyToken, `error try again`);
    })
}

function handleImage(message, replyToken) {
  let chunks = [];
  client.getMessageContent(message.id)
    .then((stream) => {
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      stream.on('end', (chunk) => {
        let buf = Buffer.concat(chunks);
        let base64Img = buf.toString('base64')
        uploadImg({ media_data: base64Img })
          .then((media) => {
            return media.media_id_string
          })
          .then(media_ids => {
            return tweet({ status: `Test media ${(new Date())}`, media_ids })
          })
          .then((tweets) => {
            return replyText(replyToken, `Tweeted !! | See at https://twitter.com/bon2_official/status/${tweets.id_str}`);
          })
          .catch((error) => {
            console.log('error', error)
            return replyText(replyToken, `error try again`);
          })
      });
      stream.on('error', (err) => {
        // error handling
      });
    });
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
