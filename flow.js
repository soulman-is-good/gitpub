var exec = require('child_process').exec;
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

function flow(cmds, cb) {
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
          exec(cmds[i], function(err, so, se) {
            if(err) {
              defer.reject(err);
              cb && cb(err);
            } else {
              stdout += cmds[i] + '\n' + (so || '');
              done();
            }
          });
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
