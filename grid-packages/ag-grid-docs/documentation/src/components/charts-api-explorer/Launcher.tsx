import { faChartLine, faCompress, faExternalLinkAlt, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgChartOptions } from 'ag-charts-community';
import GlobalContextConsumer from 'components/GlobalContext';
import React, { useMemo } from 'react';
import isServerSideRendering from 'utils/is-server-side-rendering';
import { getExampleInfo, openPlunker } from '../example-runner/helpers';
import { useExampleFileNodes } from '../example-runner/use-example-file-nodes';
import { doOnEnter } from '../key-handlers';
import styles from './Launcher.module.scss';
interface LauncherProps {
    framework: string;
    options: AgChartOptions;

    fullScreen: boolean;
    setFullScreen(fullScreen: boolean): void;

    fullScreenGraph: boolean;
    setFullScreenGraph(fullScreenGraph: boolean): void;
}

export const Launcher = (props: LauncherProps) => {
    return (
        <GlobalContextConsumer>
            {({ exampleImportType, useFunctionalReact, enableVue3, useVue3, useTypescript, set }) => {
                const innerProps = {
                    ...props,
                    exampleImportType,
                    useFunctionalReact,
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

    useFunctionalReact,
    enableVue3,
    useVue3,
    useTypescript,
    set,
}) => {
    const nodes = useExampleFileNodes();
    const exampleInfo = useMemo(
        () => buildExampleInfo(nodes, framework, options, useFunctionalReact, useVue3, useTypescript),
        [nodes, framework, options, useFunctionalReact, useVue3, useTypescript]
    );
    const isGenerated = isGeneratedExample(exampleInfo.type);

    return (
        <div className={styles['launcher']}>
            <div className={styles['launcher__heading']}>
                <h2>API Explorer</h2>
            </div>
            <div className={`anchor ${styles['launcher__options']}`}>
                {/* perversely we don't show the hook/class when the type is react as the example provided will be displayed "as is" */}
                {exampleInfo.framework === 'react' && exampleInfo.type !== 'react' && (
                    <ReactStyleSelector
                        useFunctionalReact={useFunctionalReact}
                        useTypescript={useTypescript}
                        onChange={(event) => {
                            switch (event.target.value) {
                                case 'classes':
                                    set({ useFunctionalReact: false, useTypescript: false });
                                    break;
                                case 'hooks':
                                    set({ useFunctionalReact: true, useTypescript: false });
                                    break;
                                case 'hooksTs':
                                    set({ useFunctionalReact: true, useTypescript: true });
                                    break;
                                default:
                                    set({ useFunctionalReact: true, useTypescript: true });
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
            <div className={styles['launcher__menu-items']}>
                <div
                    className={styles['launcher__menu-item']}
                    onClick={() => setFullScreenGraph(!fullScreenGraph)}
                    onKeyDown={(e) => doOnEnter(e, () => setFullScreenGraph(!fullScreenGraph))}
                    role="button"
                    tabIndex={0}
                >
                    <FontAwesomeIcon
                        icon={fullScreenGraph ? faCompress : faChartLine}
                        fixedWidth
                        title="Open chart preview fullscreen"
                    />
                </div>
                <div
                    className={styles['launcher__menu-item']}
                    onClick={() => setFullScreen(!fullScreen)}
                    onKeyDown={(e) => doOnEnter(e, () => setFullScreen(!fullScreen))}
                    role="button"
                    tabIndex={0}
                >
                    <FontAwesomeIcon
                        icon={fullScreen ? faCompress : faWindowRestore}
                        fixedWidth
                        title={fullScreen ? 'Exit fullscreen' : 'Open fullscreen'}
                    />
                </div>
                <div
                    className={styles['launcher__menu-item']}
                    onClick={() => openPlunker(exampleInfo)}
                    onKeyDown={(e) => doOnEnter(e, () => openPlunker(exampleInfo))}
                    role="button"
                    tabIndex={0}
                >
                    <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth title="Open in Plunker" />
                </div>
            </div>
        </div>
    );
};

const ReactStyleSelector = ({ useFunctionalReact, useTypescript, onChange }) => {
    return (
        <div className={styles['launcher__framework-style']}>
            {!isServerSideRendering() && (
                <select
                    className={styles['launcher__framework-style__select']}
                    style={{ width: 120 }}
                    value={useFunctionalReact ? (useTypescript ? 'hooksTs' : 'hooks') : 'classes'}
                    onChange={onChange}
                    onBlur={onChange}
                >
                    <option value="classes">Classes</option>
                    <option value="hooks">Hooks</option>
                    <option value="hooksTs">Hooks TS</option>
                </select>
            )}
        </div>
    );
};

const VueStyleSelector = ({ useVue3, onChange }) => {
    return (
        <div className={styles['launcher__framework-style']}>
            {!isServerSideRendering() && (
                <select
                    className={styles['launcher__framework-style__select']}
                    style={{ width: 120 }}
                    value={JSON.stringify(useVue3)}
                    onChange={onChange}
                    onBlur={onChange}
                >
                    <option value="false">Vue 2</option>
                    <option value="true">Vue 3</option>
                </select>
            )}
        </div>
    );
};

const TypescriptStyleSelector = ({ useTypescript, onChange }) => {
    return (
        <div className={styles['launcher__framework-style']}>
            {!isServerSideRendering() && (
                <select
                    className={styles['launcher__framework-style__select']}
                    style={{ width: 120 }}
                    value={JSON.stringify(useTypescript)}
                    onChange={onChange}
                    onBlur={onChange}
                >
                    <option value="false">Javascript</option>
                    <option value="true">Typescript</option>
                </select>
            )}
        </div>
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
    useFunctionalReact = false,
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
            mainFile = useFunctionalReact && useTypescript ? 'index.tsx' : 'index.jsx';
            break;
        default:
            console.warn(`AG Grid Docs - unable to determine internalFramework for: ${framework}`);
            framework = 'javascript';
    }

    return { framework, useFunctionalReact, useVue3, useTypescript, mainFile };
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
    useFunctionalReact = false,
    useVue3 = false,
    useTypescript = false
): ExampleInfo => {
    const { framework, mainFile } = determineFrameworks(providedFramework, useFunctionalReact, useVue3, useTypescript);
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
        useFunctionalReact,
        useVue3,
        useTypescript,
        exampleImportType
    );

    return mutateExampleInfo(exampleInfo, mainFile, options);
};

const isGeneratedExample = (type) => ['generated', 'mixed', 'typescript'].includes(type);
