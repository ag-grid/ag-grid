var menu = require('./src/documentation-main/menu.json');

var urls = [];

function getUrls(items) {
    for (var item of items) {
        if (item.url) {
            urls.push(item.url);
        }

        if (item.items) {
            getUrls(item.items);
        }

    }
}

getUrls(menu);

urls.map( u => u.split('/')[0].split('#')[0] ).forEach(u => console.log(u));


