export type TransformTsFileExt = undefined | '.js' | '.tsx';

export interface ExampleSettings {
    enterprise?: boolean;
}

export type FileContents = Record<string, string>;

export interface GeneratedContents {
    files: FileContents;
    /**
     * `files` with the TypeScript sources replaced by the transpiled modules the browser
     * loads. Only present on the contents endpoint, for exports without a build step.
     */
    moduleFiles?: FileContents;
    entryFileName: string;
    mainFileName: string;
    sourceFileList: string[];
    scriptFiles: string[];
    styleFiles: string[];
    isEnterprise: boolean;
    isLocale?: boolean;
    isIntegratedCharts?: boolean;
    hasExampleConsoleLog?: boolean;
    hasSimpleHtml?: boolean;
    scriptNonce?: string;
    boilerPlateFiles: FileContents;
    packageJson: Record<string, string>;
    extras?: string[];
    supportedFrameworks?: InternalFramework[];
    excluded?: boolean;
}

export type InternalFramework = 'vanilla' | 'typescript' | 'reactFunctional' | 'reactFunctionalTs' | 'angular' | 'vue3';

export const TYPESCRIPT_INTERNAL_FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular'];
