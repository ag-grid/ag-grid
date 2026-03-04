const path = require('path');

// Custom resolver that forces @angular/* imports to resolve from the
// monorepo root node_modules, avoiding a duplicate Angular runtime from
// packages/ag-grid-angular/node_modules/@angular/* (v18 vs root v19).
const rootDir = path.resolve(__dirname, '..', '..');

module.exports = (request, options) => {
    if (request.startsWith('@angular/')) {
        return options.defaultResolver(request, {
            ...options,
            basedir: rootDir,
        });
    }
    return options.defaultResolver(request, options);
};
