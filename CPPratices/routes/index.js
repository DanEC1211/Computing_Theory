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

module.exports = router;
