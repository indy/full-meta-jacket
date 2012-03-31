exports.asPeriod = function(d) {
  var m = d.getMonth();
  var period;
  if(m < 3) { 
    period = "early ";
  } else if(m < 7) {
    period = "mid ";
  } else {
    period = "late ";
  }
  return period + d.getFullYear();
}
