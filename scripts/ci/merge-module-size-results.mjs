#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Merge multiple module-size-results shard files into a single file.
 * Each shard file includes the base module (empty modules array) at the start,
 * so we need to deduplicate by module key.
 *
 * Usage: node merge-module-size-results.mjs <shards-directory> <output-file>
 */

const shardsDir = process.argv[2];
const outputFile = process.argv[3];

if (!shardsDir || !outputFile) {
    console.error('Usage: node merge-module-size-results.mjs <shards-directory> <output-file>');
    process.exit(1);
}

function getModuleKey(modules) {
    return modules.length === 0 ? '__base__' : modules.sort().join('+');
}

// Find all JSON files in the shards directory
const files = fs
    .readdirSync(shardsDir)
    .filter((f) => f.endsWith('.json'))
    .sort(); // Sort to ensure consistent ordering

if (files.length === 0) {
    console.error(`No JSON files found in ${shardsDir}`);
    process.exit(1);
}

console.log(`Found ${files.length} shard files to merge`);

// Merge results, deduplicating by module key
const mergedMap = new Map();

for (const file of files) {
    const filePath = path.join(shardsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const results = JSON.parse(content);

    console.log(`  - ${file}: ${results.length} entries`);

    for (const result of results) {
        const key = getModuleKey(result.modules);
        // Keep the first occurrence (all shards should have consistent base values)
        if (!mergedMap.has(key)) {
            mergedMap.set(key, result);
        }
    }
}

// Convert map to array and sort for consistent output
const merged = Array.from(mergedMap.values());

// Sort: base module first, then by module name
merged.sort((a, b) => {
    if (a.modules.length === 0) return -1;
    if (b.modules.length === 0) return 1;
    return getModuleKey(a.modules).localeCompare(getModuleKey(b.modules));
});

// Write merged results
fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));
console.log(`Merged ${merged.length} unique entries to ${outputFile}`);
