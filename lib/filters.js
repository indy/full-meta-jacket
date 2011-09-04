/*!
 * full-meta-jacket
 * Copyright(c) 2011 indy <email@indy.io>
 * MIT Licensed
 */




// hack to add the commonly used method of listing posts
//
exports.listPosts = function(obj) {
  var res;

  res = "<ul>\n";
  for(var i = 0;i<obj.length;i++) {
    res += "<li>\n"
    res += "\t<a href=\"" + obj[i].uri  + "\">\n";
    res += "\t\t" + obj[i].title + "\n";
    res += "\t</a>\n"
    res += "</li>\n"
  }
  res += "</ul>\n";

  return res;
};



exports.listPublished = function(obj) {

  var res = "";

  for(var i=0;i<obj.length;i++) {
    res += "<article class=\"clearfix\">\n";
    res += "  <header class=\"wrapper\">\n";
    res += "      <h2>" + obj[i].publish_title + "</h2>\n";
    res += "      <time class=\"small-date\" pubdate=\"pubdate\">\n";
    res += obj[i].publish_date + "\n";
    res += "      </time>\n";
    res += "  </header>\n";

    res += "<section class=\"wrapper\">";
    res += obj[i].publish_copy;
    res += "</section>\n";
    res += "</article>\n";
  }

  return res;
}

exports.listPublishedOld = function(obj) {

  var res = "";

  for(var i=0;i<obj.length;i++) {
    res += "<article class=\"clearfix\">\n";
    res += "  <div class=\"side-content\">\n";
    res += "      <a href=\"" + obj[i].publish_href + "\">\n";
    res += "        <img class=\"front-page-image\"  \n";
    res += "             title=\"" + obj[i].publish_title + "\" \n";
    res += "             src=\""+  obj[i].publish_image + "\" />\n";
    res += "      </a>\n";
    res += "  </div> <!-- side-content -->\n";
    res += "  <div class=\"inner-content\">\n";
    res += "    <h1>\n";
    res += "      <a href=\"" + obj[i].publish_href + "/\">" + obj[i].publish_title + "</a>\n";
    res += "      <time class=\"small-date\" pubdate=\"pubdate\">\n";
    res += obj[i].publish_date + "\n";
    res += "      </time>\n";
    res += "    </h1>\n";
    res += "    " + obj[i].publish_copy + "\n";
    res += "  </div> <!-- inner-content -->\n";
    res += "</article>\n";
  }

  return res;
}