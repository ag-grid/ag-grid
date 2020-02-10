/*
    This script is used to generate the pages for the chart gallery. You can edit the configuration in gallery.json
    and then run node generate-pages.js to automatically create all the PHP pages. JavaScript examples will then be
    generated when they are picked up from the generated PHP pages.
*/
const fs = require('fs');

console.log('Generating gallery using gallery.json');

const galleryConfig = getJson('gallery.json');

generateGalleryPages(galleryConfig);
generateIndexPage(galleryConfig);
updateMenu(galleryConfig);

console.log('Finished!');

function writeFile(path, contents) {
    fs.writeFile(path, contents, 'utf8', function(err) {
        if (err) {
            console.log(`An error occurred when writing to ${path} :(`);
            return console.log(err);
        }
    });
}

function getHeader(title) {
    return `<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = "${title}";
$pageDescription = "ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>`;
}

function generateGalleryPages(galleryConfig) {
    console.log('Generating gallery pages...');

    Object.keys(galleryConfig).forEach(name => {
        const config = galleryConfig[name];
        const title = `Charts Standalone Gallery: ${name}`;

        const contents = `${getHeader(title)}

<h1 class="heading">${title}</h1>

<p class="lead">
    ${config.description}
</p>

<?= chart_example('${name}', '${toKebabCase(name)}', 'generated') ?>

<?php include '../documentation-main/documentation_footer.php'; ?>`;

        writeFile(getPageName(name), contents);
    });
};

function generateIndexPage(galleryConfig) {
    console.log('Generating index page...');

    const title = "Charts Standalone: Gallery";
    const contents = `${getHeader(title)}

<h1 class="heading">${title}</h1>

<p class="lead">
    The standalone charting library is flexible and powerful, allowing you to create a variety of different
    visualisations of your data. Here are some examples.
</p>

<ul>
${Object.keys(galleryConfig).map(name => `<li><a href="./${getPageName(name)}">${name}</a></li>`).join('\n')}
</ul>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the: <a href="../javascript-charts-features/">Standalone Chart Features</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>`;

    writeFile('index.php', contents);
}

function updateMenu(galleryConfig) {
    console.log('Updating menu...');

    const menuPath = '../documentation-main/menu.json';
    const menu = getJson(menuPath);
    const galleryObject = findItemWithUrl(menu, "javascript-charts-gallery/");

    galleryObject.items = Object.keys(galleryConfig).map(name => ({
        "title": name,
        "url": `javascript-charts-gallery/${getPageName(name)}`,
    }));

    writeFile(menuPath, JSON.stringify(menu, null, 2));
}

function getPageName(name) {
    return `${toKebabCase(name)}.php`;
}

function findItemWithUrl(items, url) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.url === url) {
            return item;
        }
    }

    for (let i = 0; i < items.length; i++) {
        const children = items[i].items;

        if (children) {
            const item = findItemWithUrl(children, url);

            if (item) {
                return item;
            }
        }
    }

    return null;
}

function toKebabCase(name) {
    return name.replace(/ [A-Z]/g, v => `-${v.trim().toLowerCase()}`).toLowerCase();
}

function getJson(path) {
    return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
}