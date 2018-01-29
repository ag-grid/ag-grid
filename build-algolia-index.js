const { Chromeless } = require('chromeless')
const menu = require('./src/documentation-main/menu.json')
const algoliasearch = require('algoliasearch')
const algoliaClient = algoliasearch('O1K1ESGB5K', process.env['ALGOLIA_KEY'])
var index = algoliaClient.initIndex('AG-GRID')

const records = []

async function forEachMenu(callback) {
  async function iterateItems(items, prefix = '') {
    if (!items) {
      return
    }

    const branchPrefix = prefix ? prefix + ' > ' : ''

    for (var item of items) {
      if (item.url && !item.skipIndex) {
        const record = await callback(branchPrefix + item.title, item.url)
        console.log(item.url, 'size: ', record.text.length)
        records.push(record)
      }

      await iterateItems(item.items, branchPrefix + item.title)
    }
  }

  await iterateItems(menu)
}

async function crawl(title, url) {
  console.log('Indexing ', url)
  const record = await chromeless
    .goto(`http://localhost:8080/${url}`)
    .wait('#content')
    .evaluate(() => {
      document
        .querySelectorAll('pre')
        .forEach(el => el.parentNode.removeChild(el))

      var headingEl = document.querySelector('#content h1')

      return {
        heading: headingEl ? headingEl.innerText : '',
        text: document.querySelector('#content').innerText.slice(0, 19000)
      }
    })

  return { title, ...record, objectID: url }
}

const chromeless = new Chromeless()

async function run() {
  await forEachMenu(crawl).catch(console.error.bind(console))

  index.setSettings({
    attributesToSnippet: ['text:80']
  })
  index.saveObjects(records, function(err, content) {
    console.log('response from algolia:', content)
  })

  await chromeless.end()
}

run().catch(console.error.bind(console))
