import { readFileSync } from 'fs';

import { getEnterprisePackageName } from '../constants';
import type { InternalFramework } from '../types';

interface Params {
    isEnterprise: boolean;
    isLocale: boolean;
    internalFramework: InternalFramework;
    importType: 'modules' | 'packages';
}

function getPackageJsonVersion(packageName: string, isModule: boolean = false) {
    const path = isModule
        ? `${process.cwd()}/community-modules/${packageName}/package.json`
        : `${process.cwd()}/packages/${packageName}/package.json`;
    const packageJsonStr = readFileSync(path, 'utf-8');
    const packageJson = JSON.parse(packageJsonStr);
    return '^' + packageJson.version;
}

export function getPackageJson({ isEnterprise, isLocale, internalFramework, importType }: Params) {
    return addPackageJson(isEnterprise, isLocale, internalFramework, 'packages');
}

/** Used for type checking in plunker, and type checking & dep installation with codesandbox */
function addPackageJson(isEnterprise, isLocale, framework, importType) {
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
        addDependency('@angular/core', '^17');
        addDependency('@angular/common', '^17');
        addDependency('@angular/forms', '^17');
        addDependency('@angular/platform-browser', '^17');
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

    const agGridVersion = getPackageJsonVersion('ag-grid-community');
    const agGridEnterpriseVersion = getPackageJsonVersion('ag-grid-enterprise');
    const agGridReactVersion = getPackageJsonVersion('ag-grid-react');
    const agGridAngularVersion = getPackageJsonVersion('ag-grid-angular');
    const agGridLocaleVersion = getPackageJsonVersion('locale', true);

    if (isLocale) {
        addDependency('@ag-grid-community/locale', agGridLocaleVersion);
    }

    if (framework === 'angular') {
        addDependency('ag-grid-angular', agGridAngularVersion);
    }
    if (isFrameworkReact()) {
        addDependency('ag-grid-react', agGridReactVersion);
    }
    addDependency('ag-grid-community', agGridVersion);
    addDependency(getEnterprisePackageName(), agGridEnterpriseVersion);

    return packageJson;
}
