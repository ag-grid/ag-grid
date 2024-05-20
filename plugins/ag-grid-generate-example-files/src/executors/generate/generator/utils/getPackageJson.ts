import { readFileSync } from 'fs';

import { moduleConfig } from '../_copiedFromCore/modules';
import { getEnterprisePackageName } from '../constants';
import type { InternalFramework } from '../types';

const modules = moduleConfig.filter((m) => m.module && !m.framework);
// const communityModules = modules.filter((m) => {
//     return m.module.includes('community');
// });

interface Params {
    isEnterprise: boolean;
    internalFramework: InternalFramework;
    importType: 'modules' | 'packages';
}

function getPackageJsonVersion(packageName: string, isEnterprise: boolean) {
    const path = `${process.cwd()}/${isEnterprise ? 'enterprise' : 'community'}-modules/${packageName}/package.json`;
    const packageJsonStr = readFileSync(path, 'utf-8');
    const packageJson = JSON.parse(packageJsonStr);
    return '^' + packageJson.version;
}

export function getPackageJson({ isEnterprise, internalFramework, importType }: Params) {
    return addPackageJson(isEnterprise, internalFramework, importType);
}

/** Used for type checking in plunker, and type checking & dep installation with codesandbox */
function addPackageJson(isEnterprise, framework, importType) {
    const supportedFrameworks = new Set(['angular', 'typescript', 'reactFunctional', 'reactFunctionalTs', 'vanilla']);
    if (!supportedFrameworks.has(framework)) {
        return;
    }

    const packageJson = {
        name: `ag-grid-${importType}`,
        dependencies: {},
    };

    const addDependency = (name, version) => {
        packageJson.dependencies[name] = version;
    };

    if (framework === 'angular') {
        addDependency('@angular/core', '^14');
        addDependency('@angular/common', '^14');
        addDependency('@angular/forms', '^14');
        addDependency('@angular/platform-browser', '^14');
    }

    function isFrameworkReact() {
        return new Set(['reactFunctional', 'reactFunctionalTs']).has(framework);
    }

    if (isFrameworkReact()) {
        addDependency('react', '18');
        addDependency('react-dom', '18');

        addDependency('@types/react', '18');
        addDependency('@types/react-dom', '18');
    }

    const agGridVersion = getPackageJsonVersion('core', false);
    const agGridEnterpriseVersion = getPackageJsonVersion('core', true);
    const agGridReactVersion = getPackageJsonVersion('react', false);
    const agGridAngularVersion = getPackageJsonVersion('angular', false);

    if (importType === 'modules' && framework !== 'vanilla') {
        if (framework === 'angular') {
            addDependency('@ag-grid-community/angular', agGridAngularVersion);
        }
        if (isFrameworkReact()) {
            addDependency('@ag-grid-community/react', agGridReactVersion);
        }
        // Just include all modules for now
        modules.forEach((m) => addDependency(m.module, agGridVersion));
    } else {
        if (framework === 'angular') {
            addDependency('ag-grid-angular', agGridAngularVersion);
        }
        if (isFrameworkReact()) {
            addDependency('ag-grid-react', agGridReactVersion);
        }
        addDependency('ag-grid-community', agGridVersion);
        addDependency(getEnterprisePackageName(), agGridEnterpriseVersion);
    }

    return packageJson;
}
