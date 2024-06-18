var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/practica1', function(req, res, next) {
  res.render('prac1');
});

router.get('/practica2', function(req, res, next) {
  res.render('prac2');
});

router.get('/practica3', function(req, res, next) {
  res.render('prac3');
});

router.get('/practica4', function(req, res, next) {
  res.render('prac4');
});

router.get('/practica5', function(req, res, next) {
  res.render('prac5');
});

router.get('/practica6', function(req, res, next) {
  res.render('prac6');
});

router.get('/practica7', function(req, res, next) {
  res.render('prac7');
});


module.exports = router;
