"use strict";

process.title = "gitpub";

var fs = require('fs');
var util = require('util');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var flow = require('./flow');
var app = express();
var config = {};
var puller = util.format.bind(util, 'cd "%s" && git pull');
var reset = util.format.bind(util, 'cd "%s" && git reset %s');

if(!fs.existsSync('./config.json')) {
  throw new Error('You must create config.json. You may use config.template.json for start');
}
config = require('./config.json');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', function (req, res, next) {
  var data = req.body;
  for(var name in config) {
    if(data.repository.name === name) {
      var repo = config[name];
      for(var branch in repo) {
        var current = fs.readFileSync(path.join(repo[branch].dir, "/.git/ORIG_HEAD"))
          .toString().replace(/^\s+|\s+$/g, '');
        if(data.ref.replace(/(.+\/)/,'')===branch && data.after !== current) {
          flow(repo[branch].beforePull).then(function(so) {
            so && console.log(so);
            flow(puller(repo[branch].dir), function(err, so){
              if(err) {
                console.error(err);
              } else {
                flow(repo[branch].afrerPull).then(function(so){
                  console.log("=====================================");
                  console.log(new Date(), name + "::" + branch);
                  console.log(so);
                }).catch(function(err){
                  console.log("=====================================");
                  console.log(new Date());
                  console.error(err || se);
                  flow(reset(repo[branch].dir, current));
                });
              }
            });
          }).catch(function(err){});
        } else {
          console.log("=====================================");
          console.log(new Date(), name + "::" + branch);
          console.log('Up to date');
        }
      }
    }
  }
  res.end();
});

app.use(function(err, req, res) {
  if(!res.headersSent) {
    res.end(err.message);
  }
  console.error(err.message);
  console.error(err.stack);
});

var server = app.listen(6543, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);
});
