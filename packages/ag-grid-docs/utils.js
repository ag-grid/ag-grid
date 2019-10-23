const glob = require('glob');

const frameworkModules = [
    'grid-react',
    'grid-angular',
    'grid-vue',
    'grid-polymer'
];

const getAllModules = () => {
    const mapModules = moduleRoot => glob.sync(`../../${moduleRoot}/*`)
        .filter(module => !frameworkModules.includes(module.replace(`../../${moduleRoot}/`, '')))
        .map(module => glob.sync(`${module}/src/*Module.ts`)[0])
        .filter(module => module)
        .map(module => {
            // this relies on the module name within the module class to be the same as the filename
            const fullPath = `${module}`;
            const fullJsPath = fullPath.replace("/ts/", "").replace("/src/", "/dist/cjs/");
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
                fullJsPath,
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
