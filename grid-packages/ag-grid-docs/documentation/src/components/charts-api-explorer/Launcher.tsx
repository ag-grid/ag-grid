import { AgChartOptions } from 'ag-charts-community';
import React, { useMemo } from 'react';
import GlobalContextConsumer from '../../components/GlobalContext';
import isServerSideRendering from '../../utils/is-server-side-rendering';
import { getExampleInfo, openPlunker } from '../example-runner/helpers';
import { useExampleFileNodes } from '../example-runner/use-example-file-nodes';
import { Icon } from '../Icon';
import { doOnEnter } from '../key-handlers';
import styles from './Launcher.module.scss';

interface LauncherProps {
    framework: string;
    options: {};

    fullScreen: boolean;
    setFullScreen(fullScreen: boolean): void;

    fullScreenGraph: boolean;
    setFullScreenGraph(fullScreenGraph: boolean): void;
}

export const Launcher = (props: LauncherProps) => {
    return (
        <GlobalContextConsumer>
            {({ exampleImportType, enableVue3, useVue3, useTypescript, set }) => {
                const innerProps = {
                    ...props,
                    exampleImportType,
                    enableVue3,
                    useVue3: enableVue3 ? useVue3 : false,
                    useTypescript,
                    set,
                };

                return <LauncherInner {...innerProps} />;
            }}
        </GlobalContextConsumer>
    );
};

const LauncherInner = ({
    framework,
    options,
    fullScreen,
    setFullScreen,
    fullScreenGraph,
    setFullScreenGraph,
    enableVue3,
    useVue3,
    useTypescript,
    set,
}) => {
    const nodes = useExampleFileNodes();
    const exampleInfo = useMemo(
        () => buildExampleInfo(nodes, framework, options, useVue3, useTypescript),
        [nodes, framework, options, useVue3, useTypescript]
    );
    const isGenerated = isGeneratedExample(exampleInfo.type);

    return (
        <div className={styles.launcher}>
            <div className={styles.simpleSelects}>
                {/* perversely we don't show the hook/class when the type is react as the example provided will be displayed "as is" */}
                {exampleInfo.framework === 'react' && exampleInfo.type !== 'react' && (
                    <ReactStyleSelector
                        useTypescript={useTypescript}
                        onChange={(event) => {
                            switch (event.target.value) {                               
                                case 'hooks':
                                    set({ useTypescript: false });
                                    break;
                                case 'hooksTs':
                                    set({ useTypescript: true });
                                    break;
                                default:
                                    set({ useTypescript: true });
                                    break;
                            }
                        }}
                    />
                )}
                {enableVue3 && exampleInfo.framework === 'vue' && (
                    <VueStyleSelector
                        useVue3={useVue3}
                        onChange={(event) => set({ useVue3: JSON.parse(event.target.value) })}
                    />
                )}
                {exampleInfo.framework === 'javascript' &&
                    (isGenerated || exampleInfo.type === 'multi') &&
                    (exampleInfo.internalFramework === 'vanilla' || exampleInfo.internalFramework === 'typescript') && (
                        <TypescriptStyleSelector
                            useTypescript={useTypescript}
                            onChange={(event) => set({ useTypescript: JSON.parse(event.target.value) })}
                        />
                    )}
            </div>
            <button
                className="button-style-none"
                onClick={() => setFullScreenGraph(!fullScreenGraph)}
                onKeyDown={(e) => doOnEnter(e, () => setFullScreenGraph(!fullScreenGraph))}
                role="button"
                tabIndex={0}
                title="Open chart preview fullscreen"
            >
                <Icon name="docs-integrated-charts" />
            </button>
            <button
                className="button-style-none"
                onClick={() => setFullScreen(!fullScreen)}
                onKeyDown={(e) => doOnEnter(e, () => setFullScreen(!fullScreen))}
                role="button"
                tabIndex={0}
                title={fullScreen ? 'Exit fullscreen' : 'Open fullscreen'}
            >
                {fullScreen ? <Icon name="minimize" /> : <Icon name="maximize" />}
            </button>
            <button
                className="button-style-none"
                onClick={() => openPlunker(exampleInfo)}
                onKeyDown={(e) => doOnEnter(e, () => openPlunker(exampleInfo))}
                role="button"
                tabIndex={0}
                title="Edit on Plunker"
            >
                <Icon name="plunker" />
            </button>
        </div>
    );
};

const ReactStyleSelector = ({ useTypescript, onChange }) => {
    const formId = `chart-api-explorer-react-style-selector`;
    return isServerSideRendering() ? null : (
        <>
            <label htmlFor={formId}>Language:</label>{' '}
            <select
                id={formId}
                value={(useTypescript ? 'hooksTs' : 'hooks')}
                onChange={onChange}
                onBlur={onChange}
            >
                <option value="hooks">Javascript</option>
                <option value="hooksTs">Typescript</option>
            </select>
        </>
    );
};

const VueStyleSelector = ({ useVue3, onChange }) => {
    const formId = `chart-api-explorer-vue-style-selector`;
    return isServerSideRendering() ? null : (
        <>
            <label htmlFor={formId}>Version:</label>{' '}
            <select id={formId} value={JSON.stringify(useVue3)} onChange={onChange} onBlur={onChange}>
                <option value="false">Vue 2</option>
                <option value="true">Vue 3</option>
            </select>
        </>
    );
};

const TypescriptStyleSelector = ({ useTypescript, onChange }) => {
    const formId = `chart-api-explorer-typescript-style-selector`;
    return isServerSideRendering() ? null : (
        <>
            <label htmlFor={formId}>Language:</label>{' '}
            <select id={formId} value={JSON.stringify(useTypescript)} onChange={onChange} onBlur={onChange}>
                <option value="false">Javascript</option>
                <option value="true">Typescript</option>
            </select>
        </>
    );
};

interface ExampleFile {
    base: string;
    content?: Promise<string>;
    relativePath: string;
    publicURL: string;
}

interface ExampleInfo {
    title: string;
    sourcePath: string;
    framework: string;
    type: string;
    internalFramework: string;
    boilerplatePath: string;
    getFiles(...args: any[]): ExampleFile[];
}

const determineFrameworks = (
    framework: string = 'javascript',
    useVue3 = false,
    useTypescript = false
) => {
    let mainFile = 'main.js';

    switch (framework) {
        case 'vue':
            break;
        case 'javascript':
            mainFile = useTypescript ? 'main.ts' : 'main.js';
            break;
        case 'angular':
            mainFile = 'app.component.ts';
            break;
        case 'react':
            mainFile = useTypescript ? 'index.tsx' : 'index.jsx';
            break;
        default:
            console.warn(`AG Grid Docs - unable to determine internalFramework for: ${framework}`);
            framework = 'javascript';
    }

    return { framework, useVue3, useTypescript, mainFile };
};

const applyChartOptions = (name: string, source: string, options: AgChartOptions) => {
    const toInject = Object.entries(options)
        .filter(([_, value]) => value !== undefined)
        .map(([name, value]) => `  ${name}: ${JSON.stringify(value, null, 2)}`)
        .join(',\n');

    const modifiedSource = source.replace('  // INSERT OPTIONS HERE.', toInject);

    return Promise.resolve(modifiedSource);
};

const mutateMainFile = (file: ExampleFile, options: AgChartOptions) => {
    return {
        ...file,
        content: fetch(file.publicURL)
            .then((response) => response.text())
            .then((source) => applyChartOptions(file.base, source, options)),
    };
};

const mutateExampleInfo = (exampleInfo: ExampleInfo, mainFile: string, options: AgChartOptions) => {
    return {
        ...exampleInfo,
        // Patch main file with options configuration.
        getFiles: (...args) => {
            return exampleInfo.getFiles(...args).map((file) => {
                if (file.base.endsWith(mainFile)) {
                    return mutateMainFile(file, options);
                }

                return file;
            });
        },
    };
};

const buildExampleInfo = (
    nodes: any,
    providedFramework: string,
    options: AgChartOptions,
    useVue3 = false,
    useTypescript = false
): ExampleInfo => {
    const { framework, mainFile } = determineFrameworks(providedFramework, useVue3, useTypescript);
    const library = 'charts';
    const pageName = 'charts-api-explorer';
    const exampleName = 'baseline';
    const title = 'Charts API Explorer Generated Example';
    const type = 'generated';
    const exampleOptions = {};
    const exampleImportType = 'modules';

    const exampleInfo: ExampleInfo = getExampleInfo(
        nodes,
        library,
        pageName,
        exampleName,
        title,
        type,
        exampleOptions,
        framework,
        useVue3,
        useTypescript,
        exampleImportType
    );

    return mutateExampleInfo(exampleInfo, mainFile, options);
};

const isGeneratedExample = (type) => ['generated', 'mixed', 'typescript'].includes(type);
