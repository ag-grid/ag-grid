const glob = require('glob');

const getAllModules = () => {
    const agGridCommunityModules = []; /*glob.sync("../ag-grid-community/!*Module.js")
        .map(module => module.replace('../ag-grid-community/', ''))
        .map(module => module.replace('.js', ''));*/

    const agGridEnterpriseModules = []; /*glob.sync("../ag-grid-enterprise/!*Module.js")
        .map(module => module.replace('../ag-grid-enterprise/', ''))
        .map(module => module.replace('.js', ''));*/

    const communityModules = glob.sync("../../community-modules/*")
        .filter(module => module.indexOf('grid-all-modules') === -1)
        .map(module => module.replace('../../community-modules/', ''));

    const enterpriseModules = glob.sync("../../enterprise-modules/*")
        .filter(module => module.indexOf('grid-all-modules') === -1)
        .map(module => module.replace('../../enterprise-modules/', ''));

    return {agGridCommunityModules, agGridEnterpriseModules, communityModules, enterpriseModules};
};

exports.getAllModules = getAllModules;
