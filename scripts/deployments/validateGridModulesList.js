const fs = require('fs');
const parser = require('@typescript-eslint/parser');

const ALL_COMMUNITY_MODULE_NAME = 'CommunityModuleName';
const ALL_ENTERPRISE_MODULE_NAME = 'EnterpriseModuleName';
/**
 * The source of truth of all community and enterprise module names
 */
const SOURCE_MODULE_TYPES_FILE = 'packages/ag-grid-community/src/interfaces/iModule.ts';
const CHECK_MODULES_FILE = 'documentation/ag-grid-docs/src/content/module-mappings/modules.json';
const IGNORED_MODULES = [
    // Bundled module
    'AllCommunityModule',
    // Bundled module
    'AllEnterpriseModule',
    // Deprecated in favour of `IntegratedChartsModule`
    'GridChartsModule',
    // Deprecated
    'MenuModule',
    // Deprecated
    'RangeSelectionModule',
];
const MODULE_SETUP_PAGE_URL = 'https://www.ag-grid.com/javascript-data-grid/modules/#selecting-modules';

function getUnionTypes(node, typeName) {
    let nodeUnionTypes;
    if (node.declaration?.id && node.declaration?.id.name === typeName && node.declaration?.typeAnnotation) {
        const unionTypes = node.declaration?.typeAnnotation?.types;
        if (unionTypes) {
            nodeUnionTypes = unionTypes.map((t) => t.literal.value);
        }
    }

    return nodeUnionTypes;
}

const getTypeUnionValues = ({ node, typeNames }) => {
    if (Array.isArray(node)) {
        return node.map((n) => {
            return getTypeUnionValues({ node: n, typeNames });
        });
    } else if (node && typeof node === 'object') {
        const typeUnionValues = {};
        if (node.declaration?.type === 'TSTypeAliasDeclaration') {
            typeNames.forEach((name) => {
                const unionTypes = getUnionTypes(node, name);
                if (unionTypes) {
                    typeUnionValues[name] = unionTypes;
                }
            });
        }

        const childrenNodes =
            node.body?.map((n) => {
                return getTypeUnionValues({ node: n, typeNames });
            }) || [];
        const childrenTypeUnionValues = Object.assign({}, ...childrenNodes);

        return {
            ...typeUnionValues,
            ...childrenTypeUnionValues,
        };
    }

    return {};
};

const appendModule = (name) => `${name}Module`;
const createRemoveIgnoredModules = (ignoredModules) => (moduleName) => {
    return !ignoredModules.includes(moduleName);
};

const getModuleNames = ({ sourceFile, communityTypeName, enterpriseTypeName }) => {
    const fileContent = fs.readFileSync(sourceFile, 'utf8');
    const ast = parser.parse(fileContent, {
        sourceType: 'module',
        ecmaVersion: 2020,
        range: true,
    });

    const typeUnionValues = getTypeUnionValues({
        node: ast,
        typeNames: [communityTypeName, enterpriseTypeName],
    });

    return {
        community: typeUnionValues[communityTypeName].map(appendModule),
        enterprise: typeUnionValues[enterpriseTypeName].map(appendModule),
    };
};

function flattenModulesChildren(node) {
    if (node.groups) {
        return flattenModulesChildren(node.groups);
    } else if (Array.isArray(node)) {
        return node.flatMap((n) => {
            return flattenModulesChildren(n);
        });
    } else if (node.children) {
        return node.children.flatMap((n) => {
            return flattenModulesChildren(n);
        });
    } else {
        return node;
    }
}

function validateModules({ moduleNames, modules, ignoredModules }) {
    const communityModules = modules.filter(({ isEnterprise }) => !isEnterprise);
    const enterpriseModules = modules.filter(({ isEnterprise }) => isEnterprise);
    const removeIgnoredModules = createRemoveIgnoredModules(ignoredModules);

    const missingCommunityModules = moduleNames.community
        .filter((name) => {
            return !communityModules.some(({ moduleName }) => moduleName === name);
        })
        .filter(removeIgnoredModules);
    const missingEnterpriseModules = moduleNames.enterprise
        .filter((name) => {
            return !enterpriseModules.some(({ moduleName }) => moduleName === name);
        })
        .filter(removeIgnoredModules);

    const extraCommunityModules = communityModules
        .filter(({ moduleName }) => {
            return !moduleNames.community.includes(moduleName);
        })
        .filter(removeIgnoredModules);
    const extraEnterpriseModules = enterpriseModules
        .filter(({ moduleName }) => {
            return !moduleNames.enterprise.includes(moduleName);
        })
        .filter(removeIgnoredModules);

    return {
        missingCommunityModules,
        missingEnterpriseModules,
        extraCommunityModules,
        extraEnterpriseModules,
    };
}

const hasErrors = ({ validateModulesResults }) => {
    return (
        validateModulesResults.missingCommunityModules.length ||
        validateModulesResults.missingEnterpriseModules.length ||
        validateModulesResults.extraCommunityModules.length ||
        validateModulesResults.extraEnterpriseModules.length
    );
};

function logReport({ validateModulesResults }) {
    if (!hasErrors({ validateModulesResults })) {
        console.log(`Modules are in sync with module setup page`);
        return;
    }

    console.error(
        `ERROR: Modules are not in sync on module setup page (${MODULE_SETUP_PAGE_URL})\nPlease update: '${CHECK_MODULES_FILE}'`
    );
    const { missingCommunityModules, missingEnterpriseModules, extraCommunityModules, extraEnterpriseModules } =
        validateModulesResults;
    if (missingCommunityModules.length) {
        console.error('Missing community modules:', missingCommunityModules);
    }
    if (missingEnterpriseModules.length) {
        console.error('Missing enterprise modules:', missingEnterpriseModules);
    }
    if (extraCommunityModules.length) {
        console.error('Extra community modules:', extraCommunityModules);
    }
    if (extraEnterpriseModules.length) {
        console.error('Extra enterprise modules:', extraEnterpriseModules);
    }
}

function main() {
    const moduleNames = getModuleNames({
        sourceFile: SOURCE_MODULE_TYPES_FILE,
        communityTypeName: ALL_COMMUNITY_MODULE_NAME,
        enterpriseTypeName: ALL_ENTERPRISE_MODULE_NAME,
    });
    const modulesFile = fs.readFileSync(CHECK_MODULES_FILE, 'utf8');
    const modules = flattenModulesChildren(JSON.parse(modulesFile));

    const validateModulesResults = validateModules({
        moduleNames,
        modules,
        ignoredModules: IGNORED_MODULES,
    });

    logReport({ validateModulesResults });
    if (hasErrors({ validateModulesResults })) {
        process.exit(1);
    }
}

main();
