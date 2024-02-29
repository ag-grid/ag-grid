export type ExampleType = 'generated' | 'mixed' | 'typescript';

export type TransformTsFileExt = undefined | '.js' | '.tsx';

export interface ExampleSettings {
    enterprise?: boolean;
}

export type FileContents = Record<string, string>;

/** Matches the JSON file exampleConfig.json and the schema defined in .vscode/settings.json */
export interface ExampleConfig {
    extras?: string[];
    noStyle?: boolean;
    licenseKey?: boolean;
};

export interface GeneratedContents extends ExampleConfig {
    isEnterprise: boolean;
    entryFileName: string;
    mainFileName: string;
    files: FileContents;
    scriptFiles: string[];
    styleFiles: string[];
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
