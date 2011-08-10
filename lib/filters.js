
/*!
 * murmur
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */




// hack to add the commonly used method of listing posts
//
exports.listPosts = function(obj) {
  var res;

//  console.log(JSON.stringify(obj, null, 4));

//  if(Array.isArray(obj)) {
    res = "<ul>\n";
    for(var i = 0;i<obj._posts._files.length;i++) {
      res += "<li>\n"
      res += "\t<a href=\"" + obj._posts._files[i]  + "\">\n";
      res += "\t\t" + obj._posts[obj._posts._files[i]].page.title + "\n";
      res += "\t</a>\n"
      res += "</li>\n"
    }
    res += "</ul>\n";
//  } else {
//    res = JSON.stringify(obj, null, 4);
//  }

  return res;
};

