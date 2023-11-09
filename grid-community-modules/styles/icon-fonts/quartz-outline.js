const fs = require('fs');
const path = require('path');
const webfontsGenerator = require('@vusion/webfonts-generator');
const { Readable } = require('stream');
const SVGFixer = require('oslllo-svg-fixer');


const LUCIDE_STROKE_WIDTH = 2;


const quartzLucideIconMap = {
    'aggregation': 'sigma',
    'arrows': 'move',
    'asc': 'arrow-up',
    'cancel': 'x-circle',
    'chart': 'bar-chart-2',
    'color-picker': 'paint-bucket',
    'columns': 'table-2',
    'contracted': 'chevron-right',
    'copy': 'copy',
    'cross': 'x',
    'cut': 'scissors',
    'desc': 'arrow-down',
    'down': 'arrow-down',
    'excel': 'x',
    'expanded': 'chevron-left',
    'eye-slash': 'eye-off',
    'eye': 'eye',
    'filter': 'list-filter',
    'first': 'chevron-first',
    'grip': 'grip',
    'group': 'list-start',
    'last': 'chevron-last',
    'left': 'arrow-left',
    'linked': 'link-2',
    'loading': 'loader',
    'maximize': 'maximize-2',
    'menu': 'menu',
    'minimize': 'minimize-2',
    'minus': 'minus-circle',
    'next': 'chevron-right',
    'none': 'chevrons-up-down',
    'not-allowed': 'ban',
    'paste': 'clipboard-paste',
    'pin': 'pin',
    'pivot': 'table-properties',
    'plus': 'plus-circle',
    'previous': 'chevron-left',
    'right': 'arrow-right',
    'save': 'arrow-down-to-line',
    'tick': 'check',
    'tree-closed': 'chevron-down',
    'tree-indeterminate': 'minus',
    'tree-open': 'chevron-down',
    'unlinked': 'link-2-off',
    'up': 'arrow-up',
}

const main = async() => {
    const workDir = path.join(__dirname, "__tmp-work");
    const quartzIconsDir = path.join(__dirname, "fonts/agGridQuartz")
    fs.rmSync(workDir, {recursive: true, force: true});
    fs.mkdirSync(workDir);
    for (const [gridIconName, lucideIconName] of Object.entries(quartzLucideIconMap)) {
        const originalPath = path.join(__dirname, `node_modules/lucide-static/icons/${lucideIconName}.svg`);
        const destinationPath = path.join(workDir, `${gridIconName}.svg`)
        let content = fs.readFileSync(originalPath, "utf8")
        if (!content.includes('stroke-width="2"')) {
            throw new Error(`No stroke-width="2" in content for ${originalPath} (${content})`);
        }
        content = content.replaceAll('stroke-width="2"', `stroke-width="${LUCIDE_STROKE_WIDTH}"`)
        fs.writeFileSync(destinationPath, content, "utf8");
    }
    await SVGFixer(workDir, quartzIconsDir, {showProgressBar: true}).fix();
    fs.rmSync(workDir, {recursive: true, force: true});
}

void main();