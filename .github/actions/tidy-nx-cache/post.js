const { execSync } = require('child_process');
const { existsSync } = require('fs');

// Find and log large website cache entries
if (existsSync('.nx/cache')) {
    try {
        const result = execSync('du -sk .nx/cache', { encoding: 'utf8' });
        const sizeKB = parseInt(result.split('\t')[0], 10);
        const sizeMB = Math.round(sizeKB / 1024);
        console.log(`Final Nx cache size: ${sizeMB}MB`);
    } catch (error) {
        console.error('Failed to get cache size:', error.message);
    }
}

console.log('Cleaned .nx/cache.');
