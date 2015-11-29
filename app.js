"use strict";

process.title = "gitpub";

var fs = require('fs');
var execSync = require('child_process').execSync;
var express = require('express');
var bodyParser = require('body-parser');
var flow = require('./lib/flow');
var app = express();
var config_file = process.env.GITPUB_CONFIG || __dirname + '/config.json';
var config = {};

if(!fs.existsSync(config_file)) {
  throw new Error('You must create config.json. You may use config.template.json for start');
}
config = require(config_file);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', function (req, res, next) {
  var data = req.body;
  if(data.repository) {
    for(var name in config) {
      if(data.repository.name === name) {
        var repo = config[name];
        for(var branch in repo) {
          var current = execSync('cd "' + repo[branch].dir + '" && git rev-parse HEAD')
            .toString().replace(/^\s+|\s+$/g, '');
          var remote_branch, remote_commit, message;
          //get branch name (github/bitbucket)
          if(data.ref) {
            remote_branch = data.ref.replace(/(.+\/)/, '');
            remote_commit = data.commits[0].id;
            message = data.commits[0].message;
          }
          if(data.push && data.push.changes && data.push.changes.length > 0  && data.push.changes[0].new && data.push.changes[0].new.type === "branch") {
            remote_branch = data.push.changes[0].new.name;
            remote_commit = data.push.changes[0].new.target.hash;
            message = data.push.changes[0].new.target.message;
          }
          if(remote_branch===branch && remote_commit !== current) {
            (function(branch, name, repo){
              flow(repo[branch].beforePull, repo[branch].dir).then(function(so) {
                so && console.log(so);
                flow("git pull", repo[branch].dir, function(err, so){
                  if(err) {
                    console.log("=====================================");
                    console.log(new Date(), name + "::" + branch, remote_commit, "failed! Commit message:", message);
                    console.error(err.stack || err);
                  } else {
                    flow(repo[branch].afterPull, repo[branch].dir).then(function(so){
                      console.log("=====================================");
                      console.log(new Date(), name + "::" + branch, remote_commit, "success! Commit message:", message);
                    }).catch(function(err){
                      console.log("=====================================");
                      console.log(new Date(), name + "::" + branch, remote_commit, "failed! Commit message:", message);
                      console.error(err.stack || err || se);
                      flow("git reset --hard " + current, repo[branch].dir);
                    });
                  }
                });
              }).catch(function(err){
                console.log("=====================================");
                console.log(new Date(), name + "::" + branch, remote_commit, "failed! Commit message:", message);
                console.error(err.stack || err);
              });
            }(branch, name, repo));
          } else {
            console.log("=====================================");
            console.log(new Date(), name + "::" + branch, 'Up to date');
          }
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
