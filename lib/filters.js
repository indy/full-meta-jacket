
/*!
 * murmur
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */




// hack to add the commonly used method of listing posts
//
exports.listPosts = function(obj) {
  var res;

//  if(Array.isArray(obj)) {
    res = "<ul>\n";
    for(var i = 0;i<obj._posts._files.length;i++) {
      res += "<li>\n"
      res += "<a href=\"" + obj._posts._files[i]  + "\">\n";
      res += obj._posts[obj._posts._files[i]].page.title + "\n";
      res += "</a>\n"
      res += "</li>\n"
    }
    res += "</ul>\n";
//  } else {
//    res = JSON.stringify(obj, null, 4);
//  }

  return res;
};

exports.prefixWith2 = function(obj, prefix) {
  return Array.isArray(obj)
    ? obj.map(function(i){ return prefix + i}).join('\n')
    : prefix + String(obj) + '\n';
};
