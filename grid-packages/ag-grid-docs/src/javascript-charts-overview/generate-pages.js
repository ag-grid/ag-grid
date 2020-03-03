/*
    This script is used to generate the pages for the chart gallery. You can edit the configuration in gallery.json
    and then run node generate-pages.js to automatically create all the PHP pages. JavaScript examples will then be
    generated when they are picked up from the generated PHP pages.
*/
const fs = require('fs');
const Path = require('path');
const { execSync } = require('child_process');

function hasArgument(name) {
    return process.argv.some(arg => arg === `--${name}`);
}

const options = {
    galleryJsonFile: 'gallery.json',
    rootDirectory: 'javascript-charts-overview',
    thumbnailDirectory: 'thumbnails',
    encoding: 'utf8',
};

console.log('Generating gallery using gallery.json');

const galleryConfig = getJson(options.galleryJsonFile);

generateGalleryPages(galleryConfig);
generateIndexPage(galleryConfig);
updateMenu(galleryConfig);
generateThumbnails(galleryConfig);

console.log('Finished!');

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
    const categories = Object.keys(galleryConfig);
    const namesByCategory = categories.reduce(
        (names, c) => names.concat(Object.keys(galleryConfig[c]).map(k => ({ category: c, name: k }))),
        []);

    namesByCategory.forEach(({ category, name }, i) => {
        const config = galleryConfig[category][name];
        const title = `ag-Charts Gallery: ${name}`;
        const navigation = [];

        if (i > 0) {
            const previousName = namesByCategory[i - 1].name;
            navigation.push(`<a class="chart-navigation__left" href="./${getPageName(previousName)}">\u276e&nbsp;&nbsp;${previousName}</a>`);
        }

        if (i < namesByCategory.length - 1) {
            const nextName = namesByCategory[i + 1].name;
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

    const expectedFileNames = namesByCategory.map(x => getPageName(x.name)).concat('index.php');

    fs.readdirSync('.')
        .filter(file => file.endsWith('.php') && expectedFileNames.indexOf(file) < 0)
        .forEach(file => fs.unlinkSync(file));
};

function generateGallerySection(title, exampleNames) {
    return `<h3 id="${toKebabCase(title)}" class="chart-gallery__title">${title}</h3>

<div class="chart-gallery">
    ${exampleNames.map(getGalleryItem).join('\n    ')}
    ${[...new Array((3 - exampleNames.length % 3) % 3)].map(getEmptyGalleryItem).join('\n    ')}
</div>`;
}

function generateIndexPage(galleryConfig) {
    console.log('Generating index page...');

    const title = 'ag-Charts';
    const categories = Object.keys(galleryConfig);
    const contents = `${getHeader(title)}

<h1 class="heading">${title}</h1>

<p class="lead">
    Our standalone chart library ag-Charts is flexible and powerful, enabling you to create your own charts without needing to go
    through the grid. If you want to jump straight in, click through to the Getting Started section for your preferred
    framework, or head to the <a href='../javascript-charts-api-explorer/'>API Explorer</a>. Alternatively, scroll down
    for a gallery of examples demonstrating the variety of visualisations you can produce using our library.
</p>

<p>
    As with the grid, the "ag" part of ag-Charts stands for "agnostic". The internal ag-Charts engine is implemented in
    TypeScript with zero dependencies. You can just use the vanilla JavaScript ag-Charts library, or alternatively
    take advantage of the framework-specific ag-Charts Components to integrate with any major framework of your choice.
</p>

<div id="get-started-frameworks">
    <div class="row no-gutters">
        <div>
            <div class="get-started-framework card-javascript">
                <a href="../javascript-charts/">JavaScript</a>
                <div>
                    <p><a href="../javascript-charts/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-angular">
                <a href="../angular-charts/">Angular</a>
                <div>
                    <p><a href="../angular-charts/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-react">
                <a href="../react-charts/">React</a>
                <div>
                    <p><a href="../react-charts/">Get Started</a></p>
                </div>
            </div>
        </div>

        <div>
            <div class="get-started-framework card-vue-inverted">
                <a href="../vuejs-charts/">Vue.js</a>
                <div>
                    <p><a href="../vuejs-charts/">Get Started</a></p>
                </div>
            </div>
        </div>
    </div>
</div>

<h2 class="chart-gallery__title">Gallery</h2>

${categories.map(c => generateGallerySection(c, Object.keys(galleryConfig[c]))).join('\n\n')}

<h2>Next Up</h2>

<p>
    Continue to the next section to see the <a href="../javascript-charts-api/">API Reference</a>.
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

    galleryObject.items = Object.keys(galleryConfig).map(category => ({
        title: category,
        url: rootPath + `#${toKebabCase(category)}`,
        disableActive: true,
        // by including children but hiding them, the menu will still expand correctly when those children pages are open
        hideChildren: true,
        items: Object.keys(galleryConfig[category]).map(name => ({
            title: name,
            url: rootPath + getPageName(name),
        }))
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
    } else if (shouldGenerateAllScreenshots) {
        emptyDirectory(thumbnailDirectory);
    }

    const chrome = '"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"';
    const changedDirectories = getChangedDirectories();
    const names = Object.keys(galleryConfig).reduce((names, c) => names.concat(Object.keys(galleryConfig[c])), []);

    names
        .sort()
        .map(toKebabCase)
        .filter(name => shouldGenerateAllScreenshots || changedDirectories.indexOf(name) >= 0)
        .forEach(name => {
            try {
                const url = `http://localhost:8080/example-runner/chart-vanilla.php?section=${options.rootDirectory}&example=${name}&generated=1`;
                execSync(`${chrome} --headless --disable-gpu --screenshot --window-size=800,570 "${url}"`, { stdio: 'pipe' });
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
    return name.replace(/ \w/g, v => `-${v.trim().toLowerCase()}`).replace(/[^\w]/g, '-').toLowerCase();
}

function getJson(path) {
    return JSON.parse(fs.readFileSync(path, { encoding: options.encoding }));
}

function emptyDirectory(directory) {
    if (!directory || directory.trim().indexOf('/') === 0) { return; }

    try {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const filePath = Path.join(directory, file);

            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
            else {
                emptyDirectory(filePath);
            }
        });
    }
    catch (e) {
        console.error(`Failed to empty ${directory}`, e);
        return;
    }
}

function writeFile(path, contents) {
    const { encoding } = options;

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