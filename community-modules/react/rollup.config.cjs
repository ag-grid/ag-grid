const base = require('@nx/react/plugins/bundle-rollup');

function fixName(name) {
    return name.replace('.cjs.js', '.cjs').replace('.esm.js', '.mjs');
}

module.exports = (config) => {
    const { output, ...result } = base(config);

    output.entryFileNames = fixName(output.entryFileNames);
    output.chunkFileNames = fixName(output.chunkFileNames);

    return { output, ...result };
};
