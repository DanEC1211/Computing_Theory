var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var pract1Routes = require('./routes/prac1.js');
var pract2Routes = require('./routes/prac2.js');
const pract3Routes = require('./routes/prac3.js');
const pract4Routes = require('./routes/prac4.js');
const pract5Routes = require('./routes/prac5.js');
const pract6Routes = require('./routes/prac6.js');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/', pract1Routes);
app.use('/', pract2Routes);
app.use('/', pract3Routes);
app.use('/', pract4Routes);
app.use('/', pract5Routes);
app.use('/', pract6Routes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
