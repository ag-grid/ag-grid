/*
    This script is used to generate the pages for the chart gallery. You can edit the configuration in gallery.json
    and then run node generate-pages.js to automatically create all the PHP pages. JavaScript examples will then be
    generated when they are picked up from the generated PHP pages.
*/
const fs = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

console.log('Generating gallery using gallery.json');

const galleryConfig = getJson('gallery.json');

generateGalleryPages(galleryConfig);
generateIndexPage(galleryConfig);
updateMenu(galleryConfig);
generateThumbnails(galleryConfig);

console.log('Finished!');

function writeFile(path, contents) {
    fs.writeFileSync(path, contents, 'utf8', function(err) {
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
define("skipInPageNav", true);
?>`;
}

function generateGalleryPages(galleryConfig) {
    console.log('Generating gallery pages...');
    const names = Object.keys(galleryConfig);

    Object.keys(galleryConfig).forEach((name, i) => {
        const config = galleryConfig[name];
        const title = `Charts Standalone Gallery: ${name}`;
        const navigation = [];

        if (i > 0) {
            const previousName = names[i - 1];
            navigation.push(`<a class="chart-navigation__left" href="./${getPageName(previousName)}">\u276e&nbsp;&nbsp;${previousName}</a>`);
        }

        if (i < names.length - 1) {
            const nextName = names[i + 1];
            navigation.push(`<a class="chart-navigation__right" href="./${getPageName(nextName)}">${nextName}&nbsp;&nbsp;\u276f</a>`);
        }

        const contents = `${getHeader(title)}

<h1 class="heading">${title}</h1>

<p class="lead">
    ${config.description}
</p>

<?= chart_example('${name}', '${toKebabCase(name)}', 'generated') ?>

<div class="chart-navigation">
    ${navigation.join('\n    ')}
</div>

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

<div class="chart-gallery">
${Object.keys(galleryConfig).map(getGalleryItem).join('\n')}
</div>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about the: <a href="../javascript-charts-features/">Standalone Chart Features</a>.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>`;

    writeFile('index.php', contents);
}

function getGalleryItem(name) {
    const kebabCase = toKebabCase(name);

    return `<div class="chart-gallery-item">
    <a href="./${getPageName(name)}" class="chart-gallery-item__link">
        <img class="chart-gallery-item__thumbnail" src="./thumbnails/${kebabCase}.png" /><br />
        <div class="chart-gallery-item__name">${name}</div>
    </a>
</div>`;
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

function generateThumbnails(galleryConfig) {
    if (process.argv.some(arg => arg === '--skip-thumbnails')) {
        console.log("Skipping thumbnails.");
        return;
    }

    console.log('Generating thumbnails...');

    const chrome = '"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"';
    const thumbnailDirectory = 'thumbnails';

    if (!fs.existsSync(thumbnailDirectory)) {
        fs.mkdirSync(thumbnailDirectory);
    }

    Object.keys(galleryConfig).forEach(name => {
        const kebabCase = toKebabCase(name);

        try {
            execSync(`${chrome} --headless --disable-gpu --screenshot --window-size=800,600 "http://localhost:8080/example-runner/chart-vanilla.php?section=javascript-charts-gallery&example=${kebabCase}&generated=1"`);
            fs.renameSync('screenshot.png', Path.join(thumbnailDirectory, `${kebabCase}.png`));
        } catch (e) {
            console.error(`Failed to generate screenshot for ${name}`, e);
        }
    });
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