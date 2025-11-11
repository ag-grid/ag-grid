import type { Framework, InternalFramework } from '@ag-grid-types';
import { FRAMEWORK_DISPLAY_TEXT } from '@constants';

export const getFrameworkDisplayText = (framework: Framework): string => {
    return FRAMEWORK_DISPLAY_TEXT[framework];
};

export function getNewFrameworkPath({
    path,
    currentFramework,
    newFramework,
}: {
    path: string;
    currentFramework: string;
    newFramework: string;
}) {
    return path.replace(`/${currentFramework}`, `/${newFramework}`);
}

export const getFrameworkFromInternalFramework = (internalFramework: InternalFramework): Framework => {
    switch (internalFramework) {
        case 'typescript':
        case 'vanilla':
            return 'javascript';
        case 'reactFunctionalTs':
        case 'reactFunctional':
            return 'react';
        case 'vue3':
            return 'vue';
        default:
            return internalFramework;
    }
};

/**
 * The "internalFramework" is the framework name we use inside the example runner depending on which options the
 * user has selected. It can be one of the following:
 *
 * - 'vanilla' (JavaScript)
 * - 'react' (React Classes)
 * - 'reactFunctional' (React Hooks)
 * - 'angular' (Angular)
 * - 'vue3' (Vue 3)
 */
export const getInternalFramework = ({
    framework,
    useTypescript,
}: {
    framework: string;
    useTypescript?: boolean;
}): InternalFramework => {
    switch (framework) {
        case 'vue':
            return 'vue3';
        case 'javascript':
            return useTypescript ? 'typescript' : 'vanilla';
        case 'react':
            return useTypescript ? 'reactFunctionalTs' : 'reactFunctional';
        default:
            return framework as InternalFramework;
    }
};

export const isReactInternalFramework = (internalFramework: InternalFramework) => {
    const reactInternalFrameworks: InternalFramework[] = ['reactFunctional', 'reactFunctionalTs'];
    if (!internalFramework) {
        return false;
    }

    return reactInternalFrameworks.includes(internalFramework);
};

export const isVueInternalFramework = (internalFramework: InternalFramework) => {
    const vueInternalFrameworks: InternalFramework[] = ['vue3'];
    if (!internalFramework) {
        return false;
    }

    return vueInternalFrameworks.includes(internalFramework);
};

export function replaceDynamicFrameworkPath({
    dynamicFrameworkPath,
    framework,
}: {
    dynamicFrameworkPath: string;
    framework: Framework;
}) {
    return dynamicFrameworkPath.replace('[framework]', framework);
}

export function isDynamicFrameworkPath(path: string) {
    return path.includes('[framework]');
}
