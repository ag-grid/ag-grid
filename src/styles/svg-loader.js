const loaderUtils = require("loader-utils")

module.exports = function(content) {
    if (this.resourceQuery) {
        options = loaderUtils.parseQuery(this.resourceQuery)

        if (options.color) {
            content = content.replace(/#000000/g, options.color) 
        }
        if (options.altColor) {
            content = content.replace(/#FFFFFF/g, options.altColor) 
        }
    }
    return content;
}
