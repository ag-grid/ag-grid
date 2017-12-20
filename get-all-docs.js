var menu = require('./src/documentation-main/menu.json');

function outputUrls(items) {
    items.forEach( item => {
        if (item.url) {
            console.log(item.url)
        }

        if (item.items) {
            outputUrls(item.items);
        }
    }

    )
}

outputUrls(menu)
