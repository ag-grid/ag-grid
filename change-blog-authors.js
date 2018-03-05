var moment = require("moment");
var blogs = require("./src/blogs.json");

var authors = {
    niall: "@niall.crosby",
    john: "@john.masterson",
    sean: "@sean_35243",
    amit: "@amitmoryossef",
    sophia: "@sophialazarova"
};

for (var blog of blogs) {
    if (!blog.medium) {
        continue;
    }
    var url = blog.medium.replace(/\?.+$/, "");
    console.log(url + ",", authors[blog.author]);
}
