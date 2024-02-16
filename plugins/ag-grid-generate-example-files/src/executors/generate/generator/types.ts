export type ExampleType = 'generated' | 'mixed' | 'typescript' | 'multi';

export type TransformTsFileExt = undefined | '.js' | '.tsx';

export interface ExampleSettings {
    enterprise?: boolean;
}

export type FileContents = Record<string, string>;

export interface GeneratedContents {
    files: FileContents;
    entryFileName: string;
    mainFileName: string;
    scriptFiles: string[];
    styleFiles: string[];
    isEnterprise: boolean;
    sourceFileList: string[];
    boilerPlateFiles: FileContents;
    providedExamples: FileContents;
    generatedFiles: FileContents;
    packageJson: Record<string, any>;
}

export type InternalFramework =
    | 'vanilla'
    | 'typescript'
    | 'reactFunctional'
    | 'reactFunctionalTs'
    | 'angular'
    | 'vue'
    | 'vue3';

export const FRAMEWORKS: InternalFramework[] = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue',
    'vue3',
];
export const TYPESCRIPT_INTERNAL_FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular'];
