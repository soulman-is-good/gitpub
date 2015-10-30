function WaterFall(){
  var waterfall = [];
  var next = function(cb) {
    if ('function' !== typeof cb) {
      (waterfall.shift() || function() {})(cb);
    } else {
      waterfall.push(cb);
    }
  };
  return next;
};

module.exports = WaterFall;
