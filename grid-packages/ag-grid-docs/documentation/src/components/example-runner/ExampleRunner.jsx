import React, { useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import classnames from 'classnames';
import fs from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faExternalLinkAlt, faPlay, faQuestionCircle, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from 'components/GlobalContext';
import ExampleRunnerResult from './ExampleRunnerResult';
import { useExampleFileNodes } from './use-example-file-nodes';
import { getExampleInfo, getIndexHtmlUrl, openPlunker } from './helpers';
import { doOnEnter } from 'components/key-handlers';
import isServerSideRendering from 'utils/is-server-side-rendering';
import { getIndexHtml } from './index-html-helper';
import anchorIcon from 'images/anchor';
import styles from './ExampleRunner.module.scss';
import DocumentationLink from 'components/DocumentationLink';

/**
 * The example runner is used for displaying examples in the documentation, showing the example executing
 * along with a view of the example code. Users are also able to open the example in a new window, or create
 * a Plunker based on the example code.
 */
export const ExampleRunner = props => {
    return <GlobalContextConsumer>
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

            return <ExampleRunnerInner {...innerProps} />;
        }}
    </GlobalContextConsumer>;
};

const saveGridIndexHtmlPermutations = (nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, exampleImportType) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        // 2. Alternative imports version
        const alternativeImport = exampleImportType === 'packages' ? 'modules' : 'packages';
        const alternativeImportExampleInfo =
            getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, false, alternativeImport);

        writeIndexHtmlFile(alternativeImportExampleInfo);

        // 2.5 For Typescript, the different styles
        if (framework === 'javascript') {
            const typescriptModulesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, true, 'modules');

            writeIndexHtmlFile(typescriptModulesExampleInfo);

            const typescriptPackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, true, 'packages');

            writeIndexHtmlFile(typescriptPackagesExampleInfo);
        }


        // 3. For React, the different styles
        if (framework === 'react') {
            const alternativeStyleModulesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, false, 'modules');
            writeIndexHtmlFile(alternativeStyleModulesExampleInfo);

            const alternativeStylePackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, false, 'packages');
            writeIndexHtmlFile(alternativeStylePackagesExampleInfo);

            // Add the typescript versions for functional
            if (useFunctionalReact) {
                const reactTsStyleModules = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, true, 'modules');
                writeIndexHtmlFile(reactTsStyleModules);

                const reactTsStylePackages = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, true, 'packages');
                writeIndexHtmlFile(reactTsStylePackages);
            }
        }

        // 4. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3ModulesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, false, 'modules');

            writeIndexHtmlFile(vue3ModulesExampleInfo);

            const vue3PackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, false, 'packages');

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }
    } else if (type === 'multi' && framework === 'javascript') {
        // Also generate the Typescript style
        const typescriptExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, true);

        writeIndexHtmlFile(typescriptExampleInfo);
    } else if (type === 'multi' && framework === 'react') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, false);
        writeIndexHtmlFile(functionalExampleInfo);

        // Add the typescript versions for functional
        if (useFunctionalReact) {
            const reactTsStyle = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, true);
            writeIndexHtmlFile(reactTsStyle);
        }
    } else if (type === 'multi' && framework === 'vue') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, !useVue3, false);

        writeIndexHtmlFile(functionalExampleInfo);
    }
};

const saveChartIndexHtmlPermutations = (nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, exampleImportType) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        if (framework === 'javascript') {
            const typescriptPackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, true, 'packages');

            writeIndexHtmlFile(typescriptPackagesExampleInfo);
        }

        // 2. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3PackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, false, 'packages');

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }

        // 3. For React, the different styles
        if (framework === 'react') {

            const alternativeStylePackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, false, 'packages');
            writeIndexHtmlFile(alternativeStylePackagesExampleInfo);

            // Add the typescript versions for functional
            if (useFunctionalReact) {
                const reactTsStylePackages = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, true, 'packages');
                writeIndexHtmlFile(reactTsStylePackages);
            }
        }

    } else if (type === 'multi' && framework === 'vue') {
        const vue3ExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, false, true, false);

        writeIndexHtmlFile(vue3ExampleInfo);
    } else if (type === 'multi' && framework === 'javascript') {
        const typescriptExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, true);

        writeIndexHtmlFile(typescriptExampleInfo);
    }
};

const ExampleRunnerInner = ({ pageName, framework, name, title, type, options, library, exampleImportType, useFunctionalReact, enableVue3, useVue3, useTypescript, set }) => {
    const nodes = useExampleFileNodes();
    const [showCode, setShowCode] = useState(!!(options && options.showCode));
    const exampleInfo = useMemo(
        () => getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType),
        [nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType]
    );

    /*
     * During server side rendering, we generate the relevant index.html(s) for each example, so that in production
     * every example uses the pre-generated index.html, which can also be opened if the user wants to open the example
     * in a new window.
     */
    if (isServerSideRendering()) {
        writeIndexHtmlFile(exampleInfo);

        if (library === 'grid') {
            // grid examples can have multiple permutations
            saveGridIndexHtmlPermutations(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, exampleImportType);
        } else {
            saveChartIndexHtmlPermutations(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, exampleImportType);
        }
    }

    const exampleStyle = {
        width: '100%',
        height: exampleInfo.options.exampleHeight || '500px',
    };

    const isGenerated = isGeneratedExample(type);
    const linkId = `example-${name}`;

    return <div className={styles['example-runner']}>
        <div className={`form-inline ${styles['example-runner__header']}`}>
            <a id={linkId} href={`#${linkId}`} className={`anchor ${styles['example-runner__title']}`}>
                {anchorIcon}Example: {title}
            </a>
            <div></div>
            <div className={`anchor ${styles['example-runner__options']}`}>
                {/* perversely we don't show the hook/class when the type is react as the example provided will be displayed "as is" */}
                {exampleInfo.framework === 'react' && exampleInfo.type !== 'react' &&
                    <ReactStyleSelector
                        useFunctionalReact={useFunctionalReact}
                        useTypescript={useTypescript}
                        onChange={event => {
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
                        }} />
                }
                {enableVue3 && exampleInfo.framework === 'vue' &&
                    <VueStyleSelector
                        useVue3={useVue3}
                        onChange={event => set({ useVue3: JSON.parse(event.target.value) })} />
                }
                {(exampleInfo.framework === 'javascript') && (isGenerated || type === 'multi') &&
                    (exampleInfo.internalFramework === 'vanilla' || exampleInfo.internalFramework === 'typescript') &&
                    <TypscriptStyleSelector
                        useTypescript={useTypescript}
                        onChange={event => set({ useTypescript: JSON.parse(event.target.value) })} />
                }
                {library === 'grid' && (exampleInfo.framework !== 'javascript' || exampleInfo.internalFramework === 'typescript') && isGenerated &&
                    <ImportTypeSelector
                        framework={exampleInfo.framework}
                        importType={exampleImportType}
                        onChange={event => set({ exampleImportType: event.target.value })} />
                }
            </div>
            {library === 'grid' && (exampleInfo.framework !== 'javascript' || exampleInfo.internalFramework === 'typescript') && isGenerated &&
                <DocumentationLink framework={framework} target="_blank" href={`/packages-modules`} role="tooltip" title={exampleImportType === 'packages'
                ? "Example is using AG Grid packages where all the grid features are included by default. Click for more info."
                : "Example is using AG Grid modules to minimise application bundle size and only includes the modules required to demonstrate the given feature. Click for more info."}>
                <FontAwesomeIcon style={{ marginLeft: '5px' }} icon={faQuestionCircle} inverse />
                </DocumentationLink>
            }
        </div>
        <div className={styles['example-runner__body']} style={exampleStyle}>
            <div className={styles['example-runner__menu']}>
                <div
                    className={classnames(styles['example-runner__menu-item'], { [styles['example-runner__menu-item--selected']]: !showCode })}
                    onClick={() => setShowCode(false)}
                    onKeyDown={e => doOnEnter(e, () => setShowCode(false))}
                    role="button"
                    title='Run example'
                    tabIndex="0">
                    <FontAwesomeIcon icon={faPlay} fixedWidth />
                </div>
                <div
                    className={classnames(styles['example-runner__menu-item'], { [styles['example-runner__menu-item--selected']]: showCode })}
                    onClick={() => setShowCode(true)}
                    onKeyDown={e => doOnEnter(e, () => setShowCode(true))}
                    role="button"
                    title='View Example Source Code'
                    tabIndex="0">
                    <FontAwesomeIcon icon={faCode} fixedWidth />
                </div>
                <div className={styles['example-runner__menu-item']} title='Open example in new tab'>
                    <a href={getIndexHtmlUrl(exampleInfo)} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faWindowRestore} fixedWidth />
                    </a>
                </div>
                {!exampleInfo.options.noPlunker &&
                    <div
                        className={styles['example-runner__menu-item']}
                        onClick={() => openPlunker(exampleInfo)}
                        onKeyDown={e => doOnEnter(e, () => openPlunker(exampleInfo))}
                        role="button"
                    title='Open example in Plunker'
                        tabIndex="0">
                        <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
                    </div>}
            </div>
            <div className={styles['example-runner__content']}>
                <VisibilitySensor partialVisibility={true}>
                    {({ isVisible }) =>
                        <ExampleRunnerResult resultFrameIsVisible={!showCode} isOnScreen={isVisible} exampleInfo={exampleInfo} />
                    }
                </VisibilitySensor>
                <CodeViewer isActive={showCode} exampleInfo={exampleInfo} />
            </div>
        </div>
    </div>;
};

const ImportTypeSelector = ({ importType, onChange, framework }) => {
    return <div className={styles['example-runner__import-type']}>
        {!isServerSideRendering() &&
            <select className={styles['example-runner__import-type__select']} style={{ width: 120 }} value={importType} onChange={onChange}
                onBlur={onChange}>
                {['packages', 'modules'].map(type =>
                    <option key={type} value={type}>{type[0].toUpperCase()}{type.substring(1)}</option>
                )}
            </select>}
    </div>;
};

const ReactStyleSelector = ({ useFunctionalReact, useTypescript, onChange }) => {
    return <div className={styles['example-runner__react-style']}>
        {!isServerSideRendering() &&
            <select className={styles['example-runner__react-style__select']} style={{ width: 120 }} value={useFunctionalReact ? (useTypescript ? 'hooksTs' : 'hooks') : 'classes'}
                onChange={onChange} onBlur={onChange}>
                <option value="classes">Classes</option>
                <option value="hooks">Hooks</option>
                <option value="hooksTs">Hooks TS</option>
            </select>}
    </div>;
};

const VueStyleSelector = ({ useVue3, onChange }) => {
    return <div className={styles['example-runner__react-style']}>
        {!isServerSideRendering() &&
            <select className={styles['example-runner__react-style__select']} style={{ width: 120 }} value={JSON.stringify(useVue3)} onChange={onChange}
                onBlur={onChange}>
                <option value="false">Vue 2</option>
                <option value="true">Vue 3</option>
            </select>}
    </div>;
};

const TypscriptStyleSelector = ({ useTypescript, onChange }) => {
    return <div className={styles['example-runner__react-style']}>
        {!isServerSideRendering() &&
            <select className={styles['example-runner__react-style__select']} style={{ width: 120 }} value={JSON.stringify(useTypescript)} onChange={onChange}
                onBlur={onChange}>
                <option value="false">Javascript</option>
                <option value="true">Typescript</option>
            </select>}
    </div>;
};

const isGeneratedExample = type => ['generated', 'mixed', 'typescript'].includes(type);

const writeIndexHtmlFile = exampleInfo => {
    const { appLocation, type } = exampleInfo;
    const indexHtml = getIndexHtml(exampleInfo, true);

    fs.writeFileSync(`public${appLocation}index.html`, indexHtml);

    const templateIndexHtmlPath = `public${appLocation}../../index.html`;

    if (isGeneratedExample(type) && fs.existsSync(templateIndexHtmlPath)) {
        // don't publish the template index.html
        fs.rmSync(templateIndexHtmlPath);
    }
};

export default ExampleRunner;
