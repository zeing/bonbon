
const fs = require("fs");
import _ from 'lodash'
const Twitter = require("twitter-lite");
require('dotenv').config();

const clientTwitter_api = new Twitter({
  version: process.env.TWITTER_API_VERSION,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const clientTwitter_upload = new Twitter({
  subdomain: 'upload',
  version: process.env.TWITTER_API_VERSION,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const tweet = (payload) => {
  payload = _.pickBy(payload, _.identity);
  console.log(payload)
  return clientTwitter_api.post('statuses/update', payload)
}

const uploadImg = ({ media = null, media_data = null }) => {
  return clientTwitter_upload.post("media/upload", { media_data, media_category: 'tweet_image' })
}

export {
  uploadImg,
  tweet
}