# line-bot-nodejs-starter
starter point to create new line bot project

## How it work
Start express server to handle webhook from LINE

# Install
Clone and run
```
npm install
```
Rename `.env` instant of `.env.example` and modify your `key`
```
PORT = 
CHANNEL_ACCESS_TOKEN =
CHANNEL_SECRET =
consumer_key =
consumer_secret =
access_token_key =
access_token_secret =
```
Run
```
npm start
```
then you can access [http://localhost:3000](http://localhost:3000)

Use [ngrok](https://ngrok.com/) to expose your local url
```
path/to/ngrok http 3000
```
config webhook url in developer console then enjoy your bot!

## Author
Witthawin Sirisiwaphak
