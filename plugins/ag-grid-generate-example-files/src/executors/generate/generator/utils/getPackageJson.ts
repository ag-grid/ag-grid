import { readFileSync } from 'fs';

import { integratedChartsUsesChartsEnterprise, INTERNAL_FRAMEWORK_DEPENDENCIES } from '../constants';
import type { InternalFramework } from '../types';

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
    return addPackageJson('grid', internalFramework, importType);
}


/** Used for type checking in plunker, and type checking & dep installation with codesandbox */
function addPackageJson(type, framework, importType) {

    const supportedFrameworks = new Set(['angular', 'typescript', 'reactFunctional', 'reactFunctionalTs', 'vanilla'])
    if (!supportedFrameworks.has(framework)) {
        return;
    }

    const packageJson = {
        name: `ag-${type}-${importType}`,
        dependencies: {},
    };

    const addDependency = (name, version) => {
        packageJson.dependencies[name] = version;
    };

    if (framework === 'angular') {
        addDependency('@angular/core', "^14");
        addDependency('@angular/common', "^14");
        addDependency('@angular/forms', "^14");
        addDependency('@angular/platform-browser', "^14");
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
        if (type === 'grid' && framework === 'angular') {
            addDependency('@ag-grid-community/angular', agGridAngularVersion);
        }
        if (type === 'grid' && isFrameworkReact()) {
            addDependency('@ag-grid-community/react', agGridReactVersion);
        }
        //getModules().forEach(m => addDependency(m, agGridVersion));
    } else {
        if (type === 'grid') {
            if (framework === 'angular') {
                addDependency('ag-grid-angular', agGridAngularVersion);
            }
            if (isFrameworkReact()) {
                addDependency('ag-grid-react', agGridReactVersion);
            }
            addDependency('ag-grid-community', agGridVersion);
            addDependency(`ag-grid-enterprise${integratedChartsUsesChartsEnterprise ? '-charts-enterprise' : ''}`, agGridEnterpriseVersion);
        }
    }

    return packageJson;
}