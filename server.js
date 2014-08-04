var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var sessions = require('routes');

/*Mongo Scheme */

var produceSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  type: String,
  image: String,
});

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  produce: [{
    produce_name: String,
    date_picked: Date,
    days_old: Number,
    fresh_count: Number,
    image: String
  }]
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);
var Produce = mongoose.model('Produce', produceSchema);

mongoose.connect('localhost');



/*Express Middleware*/

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

app.post('/api/login', passport.authenticate('local'), function(req, res) {
  res.cookie('user', JSON.stringify(req.user));
  res.send(req.user);
});

app.get('/api/logout', function(req, res) {
  req.logout();
  res.send(200);
});

app.post('/api/signup', function(req, res, next) {
  var user = new User({
    email: req.body.email,
    password: req.body.password
  });
  user.save(function(err) {
    if (err) return next(err);
    res.send(200);
  });
});

app.get('/api/lists', function(req, res) {
    var query = User.find();
    query.limit(10);

    query.exec(function(err, lists) {
        if (err) return next(err);
        res.send(lists);
  });

});