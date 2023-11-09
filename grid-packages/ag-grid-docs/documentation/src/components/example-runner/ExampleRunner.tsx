import classnames from 'classnames';
import GlobalContextConsumer from 'components/GlobalContext';
import { Icon } from 'components/Icon';
import fs from 'fs';
import React, { useEffect, useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import isServerSideRendering from 'utils/is-server-side-rendering';
import { OpenInCTA } from '../OpenInCTA';
import CodeViewer from './CodeViewer';
import styles from './ExampleRunner.module.scss';
import ExampleRunnerResult from './ExampleRunnerResult';
import { getExampleInfo, getIndexHtmlUrl, openPlunker, openCodeSandbox } from './helpers';
import { getIndexHtml } from './index-html-helper';
import { trackExampleRunnerEvent } from './track-example-runner-event';
import { useExampleFileNodes } from './use-example-file-nodes';

/**
 * The example runner is used for displaying examples in the documentation, showing the example executing
 * along with a view of the example code. Users are also able to open the example in a new window, or create
 * a Plunker based on the example code.
 */
export const ExampleRunner = (props) => {
    return (
        <GlobalContextConsumer>
            {({ exampleImportType, enableVue3, useVue3, useTypescript, darkMode }) => {
                const innerProps = {
                    ...props,
                    // Allow overriding of the global context values per example
                    exampleImportType: props.exampleImportType ?? exampleImportType,
                    useVue3: enableVue3 ? useVue3 : false,
                    useTypescript: props.useTypescript ?? useTypescript,
                    darkMode
                };

                return <ExampleRunnerInner {...innerProps} />;
            }}
        </GlobalContextConsumer>
    );
};

const saveGridIndexHtmlPermutations = (
    nodes,
    library,
    pageName,
    name,
    title,
    type,
    options,
    framework,
    useVue3,
    exampleImportType
) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        // 2. Alternative imports version
        const alternativeImport = exampleImportType === 'packages' ? 'modules' : 'packages';
        const alternativeImportExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            useVue3,
            false,
            alternativeImport
        );

        writeIndexHtmlFile(alternativeImportExampleInfo);

        // 2.5 For Typescript, the different styles
        if (framework === 'javascript') {
            const typescriptModulesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                true,
                'modules'
            );

            writeIndexHtmlFile(typescriptModulesExampleInfo);

            const typescriptPackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                true,
                'packages'
            );

            writeIndexHtmlFile(typescriptPackagesExampleInfo);
        }

        // 3. For React, the different styles
        if (framework === 'react') {
            const alternativeStyleModulesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                false,
                'modules'
            );
            writeIndexHtmlFile(alternativeStyleModulesExampleInfo);

            const alternativeStylePackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                false,
                'packages'
            );
            writeIndexHtmlFile(alternativeStylePackagesExampleInfo);

            // Add the typescript versions for functional
                const reactTsStyleModules = getExampleInfo(
                    nodes,
                    library,
                    pageName,
                    name,
                    title,
                    type,
                    options,
                    framework,
                    useVue3,
                    true,
                    'modules'
                );
                writeIndexHtmlFile(reactTsStyleModules);

                const reactTsStylePackages = getExampleInfo(
                    nodes,
                    library,
                    pageName,
                    name,
                    title,
                    type,
                    options,
                    framework,
                    useVue3,
                    true,
                    'packages'
                );
                writeIndexHtmlFile(reactTsStylePackages);
        }

        // 4. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3ModulesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                true,
                false,
                'modules'
            );

            writeIndexHtmlFile(vue3ModulesExampleInfo);

            const vue3PackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                true,
                false,
                'packages'
            );

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }
    } else if (type === 'multi' && framework === 'javascript') {
        // Also generate the Typescript style
        const typescriptExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            useVue3,
            true
        );

        writeIndexHtmlFile(typescriptExampleInfo);
    } else if (type === 'multi' && framework === 'react') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            useVue3,
            false
        );
        writeIndexHtmlFile(functionalExampleInfo);

        // Add the typescript versions for functional
            const reactTsStyle = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                true
            );
            writeIndexHtmlFile(reactTsStyle);
    } else if (type === 'multi' && framework === 'vue') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            !useVue3,
            false
        );

        writeIndexHtmlFile(functionalExampleInfo);
    }
};

const saveChartIndexHtmlPermutations = (
    nodes,
    library,
    pageName,
    name,
    title,
    type,
    options,
    framework,
    useVue3
) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        if (framework === 'javascript') {
            const typescriptPackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                true,
                true,
                'packages'
            );

            writeIndexHtmlFile(typescriptPackagesExampleInfo);
        }

        // 2. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3PackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                true,
                false,
                'packages'
            );

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }

        // 3. For React, the different styles
        if (framework === 'react') {
            const alternativeStylePackagesExampleInfo = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                false,
                'packages'
            );
            writeIndexHtmlFile(alternativeStylePackagesExampleInfo);

            // Add the typescript versions for functional

                const reactTsStylePackages = getExampleInfo(
                    nodes,
                    library,
                    pageName,
                    name,
                    title,
                    type,
                    options,
                    framework,
                    useVue3,
                    true,
                    'packages'
                );
                writeIndexHtmlFile(reactTsStylePackages);
        }
    } else if (type === 'multi' && framework === 'vue') {
        const vue3ExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            false,
            true,
            false
        );

        writeIndexHtmlFile(vue3ExampleInfo);
    } else if (type === 'multi' && framework === 'javascript') {
        const typescriptExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            true,
            true
        );

        writeIndexHtmlFile(typescriptExampleInfo);
    } else if (type === 'multi' && framework === 'react') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            useVue3,
            false
        );
        writeIndexHtmlFile(functionalExampleInfo);

        // Add the typescript versions for functional
            const reactTsStyle = getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                true
            );
            writeIndexHtmlFile(reactTsStyle);
    }
};

const ExampleRunnerInner = ({
    pageName,
    framework,
    name,
    title,
    type,
    options,
    library,
    exampleImportType,
    useVue3,
    useTypescript,
    darkMode
}) => {
    const nodes = useExampleFileNodes();
    const [showCode, setShowCode] = useState(!!(options && options.showCode));
    const exampleInfo = useMemo(
        () =>
            getExampleInfo(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                useTypescript,
                exampleImportType
            ),
        [
            nodes,
            library,
            pageName,
            name,
            title,
            type,
            options,
            framework,
            useVue3,
            useTypescript,
            exampleImportType,
        ]
    );

    const [hasWindow, setHasWindow] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true);
        }
    }, []);

    /*
     * During server side rendering, we generate the relevant index.html(s) for each example, so that in production
     * every example uses the pre-generated index.html, which can also be opened if the user wants to open the example
     * in a new window.
     */
    if (isServerSideRendering()) {
        writeIndexHtmlFile(exampleInfo);

        if (library === 'grid') {
            // grid examples can have multiple permutations
            saveGridIndexHtmlPermutations(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3,
                exampleImportType
            );
        } else {
            saveChartIndexHtmlPermutations(
                nodes,
                library,
                pageName,
                name,
                title,
                type,
                options,
                framework,
                useVue3
            );
        }
    }

    const exampleHeight = exampleInfo.options.exampleHeight || 500;

    exampleInfo.linkId = `example-${name}`;

    return (
        <div id={exampleInfo.linkId} className={styles.exampleOuter} style={{ minHeight: `${exampleHeight + 48}px` }}>
            {hasWindow && (
                <div className={styles.tabsContainer}>
                    <div
                        className={styles.content}
                        role="tabpanel"
                        aria-labelledby={`${showCode ? 'Preview' : 'Code'} tab`}
                        style={{ height: exampleHeight, width: '100%' }}
                    >
                        <VisibilitySensor partialVisibility={true}>
                            {({ isVisible }) => {
                                if (isVisible) {
                                    trackExampleRunnerEvent({ type: 'isVisible', exampleInfo, trackOnce: true });
                                }

                                return (
                                    <ExampleRunnerResult
                                        resultFrameIsVisible={!showCode}
                                        isOnScreen={isVisible}
                                        exampleInfo={exampleInfo}
                                        darkMode={darkMode}
                                    />
                                );
                            }}
                        </VisibilitySensor>
                        <CodeViewer isActive={showCode} exampleInfo={exampleInfo} />
                    </div>

                    <footer className={styles.footer}>
                        <button
                            className={classnames(styles.previewCodeToggle, 'button-secondary')}
                            onClick={(e) => {
                                setShowCode(!showCode);
                            }}
                        >
                            {showCode && (
                                <span>
                                    <Icon name="eye" /> Preview
                                </span>
                            )}
                            {!showCode && (
                                <span>
                                    <Icon name="code" /> Code
                                </span>
                            )}
                        </button>

                        <ul className={classnames('list-style-none', styles.externalLinks)}>
                            <li>
                                <OpenInCTA type="newTab" href={getIndexHtmlUrl(exampleInfo)} />
                            </li>
                            {!exampleInfo.options.noCodeSandbox && (
                                <li>
                                    <OpenInCTA type="codesandbox" onClick={() => openCodeSandbox(exampleInfo)} />
                                </li>
                            )}
                            {!exampleInfo.options.noPlunker && (
                                <li>
                                    <OpenInCTA type="plunker" onClick={() => openPlunker(exampleInfo)} />
                                </li>
                            )}
                        </ul>
                    </footer>
                </div>
            )}
        </div>
    );
};

const isGeneratedExample = (type) => ['generated', 'mixed', 'typescript'].includes(type);

const writeIndexHtmlFile = (exampleInfo) => {
    const { appLocation, type } = exampleInfo;
    const { plunkerIndexHtml, codesandboxIndexHtml } = getIndexHtml(exampleInfo, true);

    fs.writeFileSync(`public${appLocation}index.html`, plunkerIndexHtml);

    const templateIndexHtmlPath = `public${appLocation}../../index.html`;

    if (isGeneratedExample(type) && fs.existsSync(templateIndexHtmlPath)) {
        // don't publish the template index.html
        fs.rmSync(templateIndexHtmlPath);
    }
};

export default ExampleRunner;
