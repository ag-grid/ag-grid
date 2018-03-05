var blogs = require("./src/blogs.json");

for (var blog of blogs) {
    if (!blog.medium) {
        continue;
    }
    var url = blog.medium.replace(/\?.+$/, "");
    console.log('RewriteRule', blog.link.replace('../', '^').replace('/', '/$'), url, '[R=301,L]')
}
