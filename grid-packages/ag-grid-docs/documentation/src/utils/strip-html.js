const visit = require('unist-util-visit');

module.exports = stripHtml;

function stripHtml(tree) {
    let fragments = [];

    // don't change this to a lambda function, causes it to break!
    visit(tree, 'text', function(node) {
        fragments.push(node.value);
    });

    return fragments.join(' ');
}