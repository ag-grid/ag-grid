const glob = require('glob');

const getAllModules = () => {
    const mapModules = moduleRoot => glob.sync(`../../${moduleRoot}/*`)
        .filter(module => module.indexOf('grid-all-modules') === -1)
        .filter(module => module.indexOf('grid-core') === -1)
        .map(module => glob.sync(`${module}/src/*Module.ts`)[0])
        .map(module => {
            // this relies on the module name within the module class to be the same as the filename
            const fullPath = `../../../${module}`;
            const filename = module.substr(module.lastIndexOf('/') + 1);
            const moduleName = filename.charAt(0).toUpperCase() + filename.slice(1).replace('.ts', '');
            return {
                fullPath,
                moduleName
            }
        });

    const communityModules = mapModules('community-modules');
    const enterpriseModules = mapModules('enterprise-modules');

    return {communityModules, enterpriseModules};
};

exports.getAllModules = getAllModules;
