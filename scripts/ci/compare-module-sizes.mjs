#!/usr/bin/env node
import fs from 'node:fs';

const THRESHOLD = 0.5; // Ignore changes below this size change
const HIGHLIGHT_PERCENT = 5; // Highlight table rows when change exceeds this percentage

/**
 * Compare two module-size-results.json files and generate a diff report
 *
 * Usage: node compare-module-sizes.mjs <base-file> <pr-file> <output-file>
 */

const baseFile = process.argv[2];
const prFile = process.argv[3];
const outputFile = process.argv[4] || './module-size-comparison.md';

if (!baseFile || !prFile) {
    console.error('Usage: node compare-module-sizes.mjs <base-file> <pr-file> [output-file]');
    process.exit(1);
}

function loadResults(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Failed to load ${filePath}:`, error.message);
        process.exit(1);
    }
}

function getModuleKey(modules) {
    return modules.length === 0 ? '__base__' : modules.sort().join('+');
}

function formatSize(size) {
    return size.toFixed(2);
}

function formatDiff(diff) {
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(2)}`;
}

function calcPercent(base, diff) {
    if (base === 0) {
        return diff === 0 ? 0 : 100;
    }
    return (diff / base) * 100;
}

function formatPercent(percent) {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
}

function applyHighlight(text, shouldHighlight) {
    return shouldHighlight ? `<mark>${text}</mark>` : text;
}

function getChangeEmoji(diff) {
    if (diff > 0) {
        return '🔺';
    }
    if (diff < 0) {
        return '🟢';
    }
    return '➖';
}

const baseResults = loadResults(baseFile);
const prResults = loadResults(prFile);

// Create maps for easy lookup
const baseMap = new Map();
baseResults.forEach((result) => {
    baseMap.set(getModuleKey(result.modules), result);
});

const prMap = new Map();
prResults.forEach((result) => {
    prMap.set(getModuleKey(result.modules), result);
});

// Calculate diffs
const diffs = [];
const allKeys = new Set([...baseMap.keys(), ...prMap.keys()]);

for (const key of allKeys) {
    const base = baseMap.get(key);
    const pr = prMap.get(key);

    if (base && pr) {
        // Not available on latest so default to 0 for now
        pr.gzipSelfSize = pr.gzipSelfSize || 0;
        base.gzipSelfSize = base.gzipSelfSize || 0;

        const selfSizeDiff = pr.selfSize - base.selfSize;
        const fileSizeDiff = pr.fileSize - base.fileSize;
        const gzipSelfSizeDiff = pr.gzipSelfSize - base.gzipSelfSize;
        const selfSizePercent = calcPercent(base.selfSize, selfSizeDiff);
        const gzipSelfSizePercent = calcPercent(base.gzipSelfSize, gzipSelfSizeDiff);

        diffs.push({
            modules: pr.modules,
            key,
            baseSelfSize: base.selfSize,
            prSelfSize: pr.selfSize,
            selfSizeDiff,
            selfSizePercent,
            baseFileSize: base.fileSize,
            prFileSize: pr.fileSize,
            fileSizeDiff,
            baseGzipSelfSize: base.gzipSelfSize,
            prGzipSelfSize: pr.gzipSelfSize,
            gzipSelfSizeDiff,
            gzipSelfSizePercent,
            isNew: false,
            isRemoved: false,
        });
    } else if (pr && !base) {
        // Not available on latest so default to 0 for now
        pr.gzipSelfSize = pr.gzipSelfSize || 0;
        diffs.push({
            modules: pr.modules,
            key,
            baseSelfSize: 0,
            prSelfSize: pr.selfSize,
            selfSizeDiff: pr.selfSize,
            selfSizePercent: 100,
            baseFileSize: 0,
            prFileSize: pr.fileSize,
            fileSizeDiff: pr.fileSize,
            baseGzipSelfSize: 0,
            prGzipSelfSize: pr.gzipSelfSize,
            gzipSelfSizeDiff: pr.gzipSelfSize,
            gzipSelfSizePercent: 100,
            isNew: true,
            isRemoved: false,
        });
    } else if (base && !pr) {
        // Not available on latest so default to 0 for now
        base.gzipSelfSize = base.gzipSelfSize || 0;
        diffs.push({
            modules: base.modules,
            key,
            baseSelfSize: base.selfSize,
            prSelfSize: 0,
            selfSizeDiff: -base.selfSize,
            selfSizePercent: -100,
            baseFileSize: base.fileSize,
            prFileSize: 0,
            fileSizeDiff: -base.fileSize,
            baseGzipSelfSize: base.gzipSelfSize,
            prGzipSelfSize: 0,
            gzipSelfSizeDiff: -base.gzipSelfSize,
            gzipSelfSizePercent: -100,
            isNew: false,
            isRemoved: true,
        });
    }
}

// Sort by absolute diff size (largest first)
diffs.sort((a, b) => Math.abs(b.selfSizeDiff) - Math.abs(a.selfSizeDiff));

// Find extremes
const maxIncrease = diffs.reduce((max, d) => (d.selfSizeDiff > max.selfSizeDiff ? d : max), diffs[0]);
const maxDecrease = diffs.reduce((min, d) => (d.selfSizeDiff < min.selfSizeDiff ? d : min), diffs[0]);

// Filter significant changes
const significantChanges = diffs.filter((d) => Math.abs(d.selfSizeDiff) >= THRESHOLD);

// Generate markdown report
let report = '';

// Header
report += '## Module Size Comparison\n\n';

// Extremes section - only show if change is >= THRESHOLD_PERCENT
report += '### Extreme Values\n\n';

const showMaxIncrease = maxIncrease && maxIncrease.selfSizeDiff >= THRESHOLD;
const showMaxDecrease = maxDecrease && maxDecrease.selfSizeDiff <= -THRESHOLD;

if (showMaxIncrease) {
    const moduleName = maxIncrease.modules.length === 0 ? 'Base (no modules)' : maxIncrease.modules.join(', ');
    report += `🔺 **Largest Increase:** ${moduleName}\n`;
    report += `   - Self Size: ${formatSize(maxIncrease.baseSelfSize)} KB → ${formatSize(maxIncrease.prSelfSize)} KB (**${formatDiff(maxIncrease.selfSizeDiff)} KB**, ${formatPercent(maxIncrease.selfSizePercent)})\n\n`;
}

if (showMaxDecrease) {
    const moduleName = maxDecrease.modules.length === 0 ? 'Base (no modules)' : maxDecrease.modules.join(', ');
    report += `🟢 **Largest Decrease:** ${moduleName}\n`;
    report += `   - Self Size: ${formatSize(maxDecrease.baseSelfSize)} KB → ${formatSize(maxDecrease.prSelfSize)} KB (**${formatDiff(maxDecrease.selfSizeDiff)} KB**, ${formatPercent(maxDecrease.selfSizePercent)})\n\n`;
}

if (!showMaxIncrease && !showMaxDecrease) {
    report += `✅ No significant changes (all changes < ${THRESHOLD}KB)\n\n`;
}

// Significant changes table
if (significantChanges.length > 0) {
    report += `### Significant Changes (≥ ${THRESHOLD}KB)\n\n`;
    report +=
        '| Module(s) | Base (KB) | PR (KB) | Diff (KB) | Diff % | Base Gzip (KB) | PR Gzip (KB) | Gzip Diff (KB) | Gzip % |\n';
    report +=
        '|-----------|-----------|---------|-----------|--------|----------------|--------------|----------------|--------|\n';

    for (const diff of significantChanges) {
        const moduleName = diff.modules.length === 0 ? 'Base (no modules)' : diff.modules.join(', ');
        const emoji = getChangeEmoji(diff.selfSizeDiff);
        const status = diff.isNew ? ' 🆕' : diff.isRemoved ? ' 🗑️' : '';

        const shouldHighlight = Math.abs(diff.selfSizePercent) >= HIGHLIGHT_PERCENT;
        const cells = [
            applyHighlight(`${emoji} ${moduleName}${status}`, shouldHighlight),
            applyHighlight(formatSize(diff.baseSelfSize), shouldHighlight),
            applyHighlight(formatSize(diff.prSelfSize), shouldHighlight),
            applyHighlight(`**${formatDiff(diff.selfSizeDiff)}**`, shouldHighlight),
            applyHighlight(formatPercent(diff.selfSizePercent), shouldHighlight),
            applyHighlight(formatSize(diff.baseGzipSelfSize), shouldHighlight),
            applyHighlight(formatSize(diff.prGzipSelfSize), shouldHighlight),
            applyHighlight(formatDiff(diff.gzipSelfSizeDiff), shouldHighlight),
            applyHighlight(formatPercent(diff.gzipSelfSizePercent), shouldHighlight),
        ];

        report += `| ${cells.join(' | ')} |\n`;
    }
    report += '\n';
} else {
    report += '### Significant Changes\n\n';
    report += `✅ No modules changed by more than ${THRESHOLD}KB.\n\n`;
}

// New/Removed modules
const newModules = diffs.filter((d) => d.isNew);
const removedModules = diffs.filter((d) => d.isRemoved);

if (newModules.length > 0) {
    report += '### New Modules\n\n';
    for (const m of newModules) {
        const moduleName = m.modules.join(', ');
        report += `- 🆕 **${moduleName}**: ${formatSize(m.prSelfSize)} KB\n`;
    }
    report += '\n';
}

if (removedModules.length > 0) {
    report += '### Removed Modules\n\n';
    for (const m of removedModules) {
        const moduleName = m.modules.join(', ');
        report += `- 🗑️ **${moduleName}**: was ${formatSize(m.baseSelfSize)} KB\n`;
    }
    report += '\n';
}

// Stats
report += '<details>\n<summary>📊 Full Statistics</summary>\n\n';
report += `- **Modules compared:** ${diffs.length}\n`;
report += `- **Modules with increases:** ${diffs.filter((d) => d.selfSizeDiff > 0).length}\n`;
report += `- **Modules with decreases:** ${diffs.filter((d) => d.selfSizeDiff < 0).length}\n`;
report += `- **Modules unchanged:** ${diffs.filter((d) => d.selfSizeDiff === 0).length}\n\n`;

// All changes table
const allChanges = diffs.filter((d) => d.selfSizeDiff !== 0);
if (allChanges.length > 0) {
    report += '#### All Module Changes\n\n';
    report +=
        '| Module(s) | Base (KB) | PR (KB) | Diff (KB) | Diff % | Base Gzip (KB) | PR Gzip (KB) | Gzip Diff (KB) | Gzip % |\n';
    report +=
        '|-----------|-----------|---------|-----------|--------|----------------|--------------|----------------|--------|\n';

    for (const diff of allChanges) {
        const moduleName = diff.modules.length === 0 ? 'Base (no modules)' : diff.modules.join(', ');
        const emoji = getChangeEmoji(diff.selfSizeDiff);
        const status = diff.isNew ? ' 🆕' : diff.isRemoved ? ' 🗑️' : '';

        const shouldHighlight = Math.abs(diff.selfSizePercent) >= HIGHLIGHT_PERCENT;
        const cells = [
            applyHighlight(`${emoji} ${moduleName}${status}`, shouldHighlight),
            applyHighlight(formatSize(diff.baseSelfSize), shouldHighlight),
            applyHighlight(formatSize(diff.prSelfSize), shouldHighlight),
            applyHighlight(`**${formatDiff(diff.selfSizeDiff)}**`, shouldHighlight),
            applyHighlight(formatPercent(diff.selfSizePercent), shouldHighlight),
            applyHighlight(formatSize(diff.baseGzipSelfSize), shouldHighlight),
            applyHighlight(formatSize(diff.prGzipSelfSize), shouldHighlight),
            applyHighlight(formatDiff(diff.gzipSelfSizeDiff), shouldHighlight),
            applyHighlight(formatPercent(diff.gzipSelfSizePercent), shouldHighlight),
        ];

        report += `| ${cells.join(' | ')} |\n`;
    }
    report += '\n';
}

report += '</details>\n';

// Write report
fs.writeFileSync(outputFile, report);
console.log(`Comparison report written to ${outputFile}`);

// Output summary for CI
console.log('\n--- Summary ---');
console.log(`Significant changes (>= ${THRESHOLD}KB): ${significantChanges.length}`);
if (showMaxIncrease) {
    const moduleName = maxIncrease.modules.length === 0 ? 'Base (no modules)' : maxIncrease.modules.join(', ');
    console.log(
        `Largest increase: ${moduleName} (+${formatSize(maxIncrease.selfSizeDiff)} KB, ${formatPercent(maxIncrease.selfSizePercent)})`
    );
}
if (showMaxDecrease) {
    const moduleName = maxDecrease.modules.length === 0 ? 'Base (no modules)' : maxDecrease.modules.join(', ');
    console.log(
        `Largest decrease: ${moduleName} (${formatSize(maxDecrease.selfSizeDiff)} KB, ${formatPercent(maxDecrease.selfSizePercent)})`
    );
}
if (!showMaxIncrease && !showMaxDecrease) {
    console.log(`No significant module size changes detected (all < ${THRESHOLD}KB).`);
}
