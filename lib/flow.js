var exec = require('child_process').exec;
var util = require('util');
var Defer = require('node-defer');
var waterfall = require('./waterfall');

function after(count, cb) {
  return function() {
    count--;
    if(count <= 0) {
      cb && cb();
    }
  };
}

function flow(cmds, dir, cb) {
  var defer = new Defer();
  var next = waterfall();
  var stdout = '';
  if('string' === typeof cmds) {
    cmds = [[cmds]];
  }
  if(!cmds || cmds.length === 0) {
    defer.resolve();
    cb && cb();
  }
  for(var i in cmds) {
    (function(cmds) {
      next(function(){
        if(cmds.length === 0) {
          return next();
        }
        var done = after(cmds.length, next);
        for(var i in cmds) {
          (function(cmd) {
            exec(util.format('cd "%s" && %s', dir, cmd), function(err, so, se) {
              if(err) {
                defer.reject(err);
                cb && cb(err);
              } else {
                stdout += cmd + '\n' + (so || '');
                done();
              }
            });
          }(cmds[i]));
        }
      });
    }(cmds[i]));
  }
  next(function(){
    defer.resolve(stdout);
    cb && cb(null, stdout);
  });
  next();
  return defer;
}

module.exports = flow;
