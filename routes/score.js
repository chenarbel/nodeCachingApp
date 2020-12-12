// required libraries
const mongoose = require('mongoose');
const Score = mongoose.model('Score');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

// tickets API needed information
const TICKET_ENDPOINT = 'https://chenarbel.wixanswers.com/api/v1/tickets/guest';
const TICKET_METHOD = 'POST';
var ticetkOptions = {"userEmail":"arbel.chenlia@gmail.com","loacle":"en"}; 

// labels API needed information
const LABEL_ENDPOINT = 'https://chenarbel.wixanswers.com/api/v1/tickets/'; 
const ADD_LABEL_METHOD = 'PUT';
var labelData = {"addedLabelIds":["Not Spam"]};

// spamcheck API needed information
const SPAMCHECK_ENDPOINT = 'https://spamcheck.postmarkapp.com/filter'; 
const SPAMCHECK_METHOD = 'POST';

module.exports = app => {
  app.get('/api/score', async (req, res) => {
    const scores = await Score.find().cache({ expire: 100 });
    
    res.json(scores);
  });
  
  app.post('/api/score', async (req, res) => {
    console.log(req.body);
    var email = req.body.email;
    var score = req.body.score;
    var date = req.body.date;
    
    if (!email || !score || !date) {
      return res.status(400).send('Missing email, score or date')
    }
    
    const score1 = new Score({
      email,
      score,
      date
    });
    
    try {
      await score1.save();
      res.send(score1);
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
};

createNewTicket(TICKET_METHOD, TICKET_ENDPOINT, ticetkOptions).then(function(response){
  // the following object is for testing purposes
  var dummyTicketResponse = {
    "id":"77bc8694-5ccf-436c-ab2b-543563a5f425",
    "locale":"en",
    "subject":"Ticket Subject",
    "content":"Ticket HTML",
    "user":{},
    "userInfo":{"name":"chen","email":"arbel.chenlia@gmail.com"},
    "status":120,
    "priority":20,
    "repliesCount":2,
    "channel":130,
    "channelData":{
      "mailboxId":"12345",
      "mailboxEmail":"info@wixanswers.com"
    },
    "relatedArticleIds":["e932c0a3-6e9b-43cf-b3a9-90f6ee6a5b07"],
    "ticketNumber":1234,
    "creationDate":1528883681793,
    "lastUpdateDate":1529515777757,
    "assignedBy":{},
    "assignedUser":{},
    "lastAgentReplyDate":1529245296000,
    "lastOpenedDate":1528910191000,
    "lastStatusChangeDate":1528910191000,
    "handledByUserIds":["e932c0a3-6e9b-43cf-b3a9-80f6ee6a5b08"],
    "repliedByUserIds":["e932c0a3-6e9b-43cf-b3a9-60f6ee6a5b09"],
    "hasAgentReply":true,
    "spam":false,
    "unauthenticated":false,
    "createdOnBehalf":false
    
  };  
  var email = dummyTicketResponse.userInfo.email; // or response.email
  var id = dummyTicketResponse.id;
  var creationDate = dummyTicketResponse.creationDate
  
  if (isScoreAlreadyCachedForThisEmail(email)){
    if(!has24HoursPassed(creationDate)){
      applyLabel(id);
    } else {
      handleSpamScore(email, id, creationDate);
    }
  } else{
    handleSpamScore(email, id, creationDate);
  }
});

function isScoreAlreadyCachedForThisEmail(emailAdd){
  var getValuesFromCache = module.exports = app => {
    app.get('/api/score', async (req, res) => {
      const scores = await Score.find().cache({ expire: 100 });
      
      res.json(scores);
    });
  };
  return getValuesFromCache.forEach(function(cachedValue){
    return cachedValue.email === emailAdd ? 'true' : 'false';
  });
}

function has24HoursPassed(creationDate){
  var todaysDate = new Date();
  return (todaysDate.getTime() - creationDate) / (60*60*1000) >= 24 ? false : true;
}

function handleSpamScore(email, ticketId, date){
  var score = checkSpam(email);
  if(score > 7){
    applyLabel(ticketId);
    setValueToCache(email, score, date); 
  }
}

function setValueToCache(email, score, date){
  module.exports = app => {
    app.post('/api/score', async (req, res) => {
      console.log(req.body);
      var email = req.body.email;
      var score = req.body.score;
      var date = req.body.date;
      
      if (!email || !score || !date) {
        return res.status(400).send('Missing email, score or date')
      }
      
      const score1 = new Score({
        email,
        score,
        date
      });
      
      try {
        await score1.save();
        res.send(score1);
      } catch (err) {
        res.status(400).send(err.message);
      }
    });
  };
}

function checkSpam(email){
  return httpAsync(SPAMCHECK_METHOD, SPAMCHECK_ENDPOINT, {"email": email, "options":"short"}).then(function(response){
    return response.report;
  });
}

function createNewTicket(method, url, data){
  return httpAsync(method, url, data);
}

function httpAsync(method, url, data) {
  return new Promise(function(resolve, reject) {
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        resolve(xmlHttp.responseText);
      } else (reject());
    };
    xmlHttp.open(method, url, true);
    
    xmlHttp.setRequestHeader('Authorization', 'Bearer ' + token);
    xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    xmlHttp.setRequestHeader('Accept', 'application/json');
    
    xmlHttp.send(data);
  });
  
}

function applyLabel(ticketId){
  httpAsync(ADD_LABEL_METHOD, LABEL_ENDPOINT+ ticketId +'/labels',labelData);
}