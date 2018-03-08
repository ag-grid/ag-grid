const puppeteer = require('puppeteer');
const menu = require('./src/documentation-main/menu.json')
const algoliasearch = require('algoliasearch')
const algoliaClient = algoliasearch('O1K1ESGB5K', process.env['ALGOLIA_KEY'])
var index = algoliaClient.initIndex('AG-GRID')

const records = []
const host = 'http://localhost:8080/'

const synonyms = [{
    objectID: 'lockVisible',
    type: 'synonym',
    synonyms: ['lockVisible', 'show', 'hide', 'freeze', 'hide/show']
},{
    objectID: 'angularjs',
    type: 'synonym',
    synonyms: ['angularjs', 'AngularJS 1.X']
}
]

index.batchSynonyms(synonyms, { forwardToReplicas: true, replaceExistingSynonyms: true }, function(err, content) { if(err) { console.error(err); } });

async function forEachMenu(callback) {
    rank = 10000;
    async function iterateItems(items, prefix = '') {
        if (!items) {
            return
        }

        const branchPrefix = prefix ? prefix + ' > ' : ''

        for (var item of items) {
            if (item.url && !item.skipIndex) {
                const record = await callback(branchPrefix + item.title, item.url)
                rank -= 10;
                records.push({ ...record, rank })
            }

            await iterateItems(item.items, branchPrefix + item.title)
        }
    }

    await iterateItems(menu)
}

async function crawl(title, path) {
    console.log('Indexing ', path)

    await page.goto(`${host}${path}`, { waitUntil: 'domcontentloaded' });

    const record = await page.evaluate(() => {
        document
            .querySelectorAll('pre')
            .forEach(el => el.parentNode.removeChild(el))

        var headingEl = document.querySelector('#content h1')

        return {
            heading: headingEl ? headingEl.innerText : '',
            text: document.querySelector('#content').innerText.slice(0, 19000)
        }
    })

    return { title, ...record, objectID: path }
}

let browser, page;

async function run() {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    page = await browser.newPage();
    await forEachMenu(crawl).catch(console.error.bind(console))

    index.setSettings({
        attributesToSnippet: ['text:80']
    })

    index.saveObjects(records, function(err, content) {
        console.log('response from algolia:', content)
    })


    browser.close()
}

run().catch(console.error.bind(console))
