var moment = require('moment');
var blogs = require('./src/blogs.json');

for (var blog of blogs) {
    if (!blog.medium) {
        continue;
    }
    var momentDate = moment(blog.date, 'Do MMMM YYYY');
    var dmy = momentDate.format('YYYY-MM-DD');
    var url = blog.medium.replace(/\?.+$/, '');
    console.log(url + ',', dmy);
}
