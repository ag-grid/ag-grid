import nodeGlob from 'glob';

/**
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
export async function glob(pattern) {
    return await (new Promise((resolve, reject) => {
        nodeGlob(pattern, (err, matches) => {
            if (err) reject(err);
            else resolve(matches);
        });
    }))
}
