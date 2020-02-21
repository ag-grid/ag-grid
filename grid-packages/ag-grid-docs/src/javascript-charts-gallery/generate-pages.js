/*
    This script is used to generate the pages for the chart gallery. You can edit the configuration in gallery.json
    and then run node generate-pages.js to automatically create all the PHP pages. JavaScript examples will then be
    generated when they are picked up from the generated PHP pages.
*/
const fs = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

console.log('Generating gallery using gallery.json');

const options = {
    galleryJsonFile: 'gallery.json',
    rootDirectory: 'javascript-charts-gallery',
    thumbnailDirectory: 'thumbnails',
};

const galleryConfig = getJson(options.galleryJsonFile);

generateGalleryPages(galleryConfig);
generateIndexPage(galleryConfig);
updateMenu(galleryConfig);
generateThumbnails(galleryConfig);

console.log('Finished!');

function writeFile(path, contents) {
    const encoding = 'utf8';

    if (fs.existsSync(path) && fs.readFileSync(path, { encoding }) === contents) {
        return;
    }

    fs.writeFileSync(path, contents, encoding, err => {
        if (err) {
            console.log(`An error occurred when writing to ${path} :(`);
            return console.log(err);
        }
    });
}

function getHeader(title) {
    return `<?php
// NOTE: This page is generated automatically; please do not edit it directly. See generate-pages.js
$pageTitle = '${title}';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
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

<?= chart_example('${name}', '${toKebabCase(name)}', 'generated', array('exampleHeight' => '60vh')) ?>

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
    const exampleNames = Object.keys(galleryConfig);
    const contents = `${getHeader(title)}

<h1 class="heading">${title}</h1>

<p class="lead">
    The standalone charting library is flexible and powerful, allowing you to create a variety of different
    visualisations of your data. Here are some examples.
</p>

<div class="chart-gallery">
${exampleNames.map(getGalleryItem).join('\n')}
${[...new Array((3 - exampleNames.length % 3) % 3)].map(getEmptyGalleryItem).join('\n')}
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
        <img class="chart-gallery-item__thumbnail" src="./${options.thumbnailDirectory}/${kebabCase}.png" /><br />
        <div class="chart-gallery-item__name">${name}</div>
    </a>
</div>`;
}

function getEmptyGalleryItem() {
    return '<div class="chart-gallery-item chart-gallery-item--empty"></div>';
}

function updateMenu(galleryConfig) {
    console.log('Updating menu...');

    const rootPath = options.rootDirectory + '/';
    const menuPath = '../documentation-main/menu.json';
    const menu = getJson(menuPath);
    const galleryObject = findItemWithUrl(menu, rootPath);

    galleryObject.items = Object.keys(galleryConfig).map(name => ({
        title: name,
        url: rootPath + getPageName(name),
    }));

    writeFile(menuPath, JSON.stringify(menu, null, 2));
}

function getChangedDirectories() {
    const diffOutput = execSync(`git diff --dirstat=files,0 HEAD`).toString().split('\n');

    return diffOutput
        .filter(entry => entry.indexOf(`/${options.rootDirectory}/`) > 0)
        .map(entry => entry.replace(new RegExp(`^.*?${options.rootDirectory}`), '').replace(/^\/|\/$/g, ''))
        .filter(entry => entry.length > 0 && entry !== options.thumbnailDirectory);
}

function hasArgument(name) {
    return process.argv.some(arg => arg === `--${name}`);
}

function generateThumbnails(galleryConfig) {
    if (hasArgument('skip-thumbnails')) {
        console.log("Skipping thumbnails.");
        return;
    }

    const shouldGenerateAllScreenshots = hasArgument('force-thumbnails');

    console.log(`Generating ${shouldGenerateAllScreenshots ? 'all' : 'changed'} thumbnails...`);

    const startTime = Date.now();
    const { thumbnailDirectory } = options;

    if (!fs.existsSync(thumbnailDirectory)) {
        fs.mkdirSync(thumbnailDirectory);
    }

    const chrome = '"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"';
    const changedDirectories = getChangedDirectories();

    Object.keys(galleryConfig)
        .map(toKebabCase)
        .filter(name => shouldGenerateAllScreenshots || changedDirectories.indexOf(name) >= 0)
        .forEach(name => {
            try {
                const url = `http://localhost:8080/example-runner/chart-vanilla.php?section=${options.rootDirectory}&example=${name}&generated=1`;
                execSync(`${chrome} --headless --disable-gpu --screenshot --window-size=800,600 "${url}"`, { stdio: 'pipe' });
                fs.renameSync('screenshot.png', Path.join(thumbnailDirectory, `${name}.png`));
                console.log(`Generated thumbnail for ${name}`);
            } catch (e) {
                console.error(`Failed to generate thumbnail for ${name}`, e);
            }
        });

    console.log(`Finished generating thumbnails in ${(Date.now() - startTime) / 1000}s`);
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
    return name.replace(/ \w/g, v => `-${v.trim().toLowerCase()}`).toLowerCase();
}

function getJson(path) {
    return JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
}