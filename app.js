const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys');

require('./models/Score');
require('./utils/redis');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/express-mongo-app', { 
  useUnifiedTopology: true,
  useNewUrlParser: true
});

require('./routes/score')(app);

app.listen(port, () => console.log(`app is listening on port ${port}!`));