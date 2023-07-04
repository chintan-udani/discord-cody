// db.js
require('dotenv').config();
const { connect, connection, Schema, model } = require('mongoose');


const connectionString = process.env.MONGO_URI;

connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

const apiKeySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
  },
});

//RESPONSE SCHEMA
const responseSchema = new Schema({
  channelId:{
    type:String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const threadDataSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  threadId: {
    type: String,
    required: true,
  },
  responseData: {
    type: Object,
    required: true,
  },
});


const ApiKey = model('ApiKey', apiKeySchema);
const Response = model('Response', responseSchema);
const ThreadData = model('ThreadData', threadDataSchema);

module.exports = {
  ApiKey,
  Response,
  ThreadData,
};
