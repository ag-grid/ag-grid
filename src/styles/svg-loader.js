const loaderUtils = require("loader-utils")

module.exports = function(content) {
    options = loaderUtils.parseQuery(this.resourceQuery)

    if (options.color) {
        content = content.replace(/#000000/g, options.color) 
    }
    return content;
}
