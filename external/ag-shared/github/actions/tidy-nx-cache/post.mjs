import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Log the final Nx cache size for observability (repo-agnostic; no removal here).
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
