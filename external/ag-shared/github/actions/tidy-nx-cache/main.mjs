import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Get the branch type input (pr, latest, release)
const branchType = process.env.INPUT_BRANCH_TYPE || 'pr';

// Cache size thresholds in MB
const CACHE_SIZE_THRESHOLD_MB = 1024; // 1GB
const CACHE_SIZE_AGGRESSIVE_THRESHOLD_MB = 700; // 700MB for PR branches

console.log(`Tidy Nx Cache - Branch type: ${branchType}`);

// Check if .nx/cache exists
if (!existsSync('.nx/cache')) {
    console.log('No .nx/cache directory found, skipping cache tidy.');
    process.exit(0);
}

// Get cache size in MB
function getCacheSizeMB() {
    try {
        // Use du to get size in KB, then convert to MB
        const result = execSync('du -sk .nx/cache', { encoding: 'utf8' });
        const sizeKB = parseInt(result.split('\t')[0], 10);
        return Math.round(sizeKB / 1024);
    } catch (error) {
        console.error('Failed to get cache size:', error.message);
        return 0;
    }
}

const cacheSizeMB = getCacheSizeMB();
console.log(`Current Nx cache size: ${cacheSizeMB}MB`);

// Determine if we should reset based on branch type and cache size
let shouldReset = false;
let reason = '';

if (branchType === 'pr') {
    // Aggressive cleanup for PR branches - reset on every run if cache > 700MB
    if (cacheSizeMB > CACHE_SIZE_AGGRESSIVE_THRESHOLD_MB) {
        shouldReset = true;
        reason = `PR branch cache exceeds ${CACHE_SIZE_AGGRESSIVE_THRESHOLD_MB}MB threshold`;
    }
} else {
    // Less aggressive for latest/release branches - only reset if > 1GB
    if (cacheSizeMB > CACHE_SIZE_THRESHOLD_MB) {
        shouldReset = true;
        reason = `${branchType} branch cache exceeds ${CACHE_SIZE_THRESHOLD_MB}MB threshold`;
    }
}

if (shouldReset) {
    console.log(`${reason} (${cacheSizeMB}MB)`);
    console.log('Performing nx reset to clear cache before build...');
    console.log('The cache will be repopulated during this CI run and saved at the end.');

    try {
        const result = spawnSync('yarn', ['nx', 'reset'], {
            stdio: 'inherit',
            encoding: 'utf8',
        });

        if (result.status === 0) {
            const newCacheSizeMB = getCacheSizeMB();
            console.log(
                `Cache reset complete. New size: ${newCacheSizeMB}MB (freed ${cacheSizeMB - newCacheSizeMB}MB)`
            );
            console.log('Cache will be rebuilt during this CI run.');
        } else {
            console.error('nx reset failed with status:', result.status);
        }
    } catch (error) {
        console.error('Failed to run nx reset:', error.message);
    }
} else {
    console.log(`Cache size is within limits (${cacheSizeMB}MB), no reset needed.`);
}
