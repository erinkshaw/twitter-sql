'use strict';
const express = require('express');
const router = express.Router();
// const tweetBank = require('../tweetBank');
const client = require('../db/index.js')
const bodyParser = require('body-parser');

module.exports = io => {

  // a reusable function
  const respondWithAllTweets = (req, res, next) => {
      client.query('SELECT * FROM users INNER JOIN tweets ON tweets.user_id = users.id', function (err, result) {
  if (err) return next(err); // pass errors to Express
  var tweets = result.rows;
  // console.log('test')
  res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
});
}

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', (req, res, next) => {

    client.query('SELECT * FROM users INNER JOIN tweets ON tweets.user_id = users.id WHERE name=$1', [req.params.username], function (err, data) {
      if (err) next(err);
      var tweets = data.rows;

    res.render('index', {
      title: 'Twitter.js',
      tweets: tweets,
      showForm: true,
      username: req.params.username
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', (req, res, next) => {
      client.query('SELECT * FROM users INNER JOIN tweets on users.id = tweets.user_id WHERE tweets.id=$1', [req.params.id], function (err, data) {
        if (err) next(err);
        var tweet = data.rows
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweet // an array of only one element ;-)
      });
    });
  });

  // create a new tweet
  router.post('/tweets', (req, res, next) => {
    var name = req.body.name
    var content = req.body.text
   client.query('SELECT id FROM users WHERE name=$1', [name], function(err, data) {
      if (err) next(err);
      var user_id = data.rows[0].id
           client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [user_id, content], function (err, data) {
          // console.log('USER ID!', user_id);
      if (err) next(err);
    //   var newTweet = data.rows
    // io.sockets.emit('new_tweet', newTweet);
    res.redirect('/');
        });
    });
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', => (req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });


  return router;
}
