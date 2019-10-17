const glob = require('glob');

const getAllModules = () => {
    const mapModules = moduleRoot => glob.sync(`../../${moduleRoot}/*`)
        .map(module => glob.sync(`${module}/src/*Module.ts`)[0])
        .map(module => {
            // this relies on the module name within the module class to be the same as the filename
            const fullPath = `${module}`;
            const filename = module.substr(module.lastIndexOf('/') + 1);
            const moduleName = filename.charAt(0).toUpperCase() + filename.slice(1).replace('.ts', '');

            let moduleDirName = fullPath.replace(`../../${moduleRoot}/`, '');
            moduleDirName = moduleDirName.substr(0, moduleDirName.lastIndexOf("/src"));

            const sourceDir = fullPath.substr(0, fullPath.lastIndexOf("/"));
            const rootDir = sourceDir.substr(0, sourceDir.lastIndexOf("/"));

            const barrelNamePrefix = moduleRoot === 'community-modules' ? '@ag-community' : '@ag-enterprise';
            const publishedName = `${barrelNamePrefix}/${moduleDirName}`;

            return {
                publishedName,
                fullPath,
                filename,
                moduleName,
                sourceDir,
                rootDir,
                moduleDirName
            }
        });


    const communityModules = mapModules('community-modules');
    const enterpriseModules = mapModules('enterprise-modules');

    return {communityModules, enterpriseModules};
};

exports.getAllModules = getAllModules;
