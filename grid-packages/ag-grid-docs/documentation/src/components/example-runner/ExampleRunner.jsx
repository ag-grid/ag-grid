import React, { useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import classnames from 'classnames';
import fs from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faExternalLinkAlt, faPlay, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
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

const saveGridIndexHtmlPermutations = (nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        // 2. Alternative imports version
        const alternativeImport = exampleImportType === 'packages' ? 'modules' : 'packages';
        const alternativeImportExampleInfo =
            getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, alternativeImport);

        writeIndexHtmlFile(alternativeImportExampleInfo);

        // 3. For React, the different styles
        if (framework === 'react') {
            const alternativeStyleModulesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, useTypescript, 'modules');

            writeIndexHtmlFile(alternativeStyleModulesExampleInfo);

            const alternativeStylePackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, useTypescript, 'packages');

            writeIndexHtmlFile(alternativeStylePackagesExampleInfo);
        }

        // 4. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3ModulesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, useTypescript, 'modules');

            writeIndexHtmlFile(vue3ModulesExampleInfo);

            const vue3PackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, useTypescript, 'packages');

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }
    } else if (type === 'multi' && framework === 'react') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, useVue3, useTypescript);

        writeIndexHtmlFile(functionalExampleInfo);
    } else if (type === 'multi' && framework === 'vue') {
        // Also generate the alternative React style
        const functionalExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, !useVue3, useTypescript);

        writeIndexHtmlFile(functionalExampleInfo);
    }
};

const saveChartIndexHtmlPermutations = (nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType) => {
    if (isGeneratedExample(type)) {
        // Need to generate the different permutations of index.html file:
        // 1. Default version (already saved)

        // 2. For Vue, also copy html file for Vue 3
        if (framework === 'vue') {
            const vue3PackagesExampleInfo =
                getExampleInfo(nodes, library, pageName, name, title, type, options, framework, !useFunctionalReact, true, useTypescript, 'packages');

            writeIndexHtmlFile(vue3PackagesExampleInfo);
        }
    } else if (type === 'multi' && framework === 'vue') {
        const vue3ExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, false, true, useTypescript);

        writeIndexHtmlFile(vue3ExampleInfo);
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
            saveGridIndexHtmlPermutations(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType);
        } else {
            saveChartIndexHtmlPermutations(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, useVue3, useTypescript, exampleImportType);
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
                {anchorIcon}&nbsp;Example: {title}
            </a>
            {/* perversely we don't show the hook/class when the type is react as the example provided will be displayed "as is" */}
            {library === 'grid' && exampleInfo.framework === 'react' && exampleInfo.type !== 'react' &&
                <ReactStyleSelector
                    useFunctionalReact={useFunctionalReact}
                    onChange={event => set({ useFunctionalReact: JSON.parse(event.target.value) })} />
            }
            {enableVue3 && exampleInfo.framework === 'vue' &&
                <VueStyleSelector
                    useVue3={useVue3}
                    onChange={event => set({ useVue3: JSON.parse(event.target.value) })} />
            }
            {library === 'grid' && exampleInfo.framework !== 'javascript' && isGenerated &&
                <ImportTypeSelector
                    importType={exampleImportType}
                    onChange={event => set({ exampleImportType: event.target.value })} />
            }
            {exampleInfo.framework === 'javascript' && (isGenerated || type === 'multi') &&
                (exampleInfo.internalFramework === 'vanilla' || exampleInfo.internalFramework === 'typescript') &&
                <TypscriptStyleSelector
                    useTypescript={useTypescript}
                    onChange={event => set({ useTypescript: JSON.parse(event.target.value) })} />
            }
        </div>
        <div className={styles['example-runner__body']} style={exampleStyle}>
            <div className={styles['example-runner__menu']}>
                <div
                    className={classnames(styles['example-runner__menu-item'], { [styles['example-runner__menu-item--selected']]: !showCode })}
                    onClick={() => setShowCode(false)}
                    onKeyDown={e => doOnEnter(e, () => setShowCode(false))}
                    role="button"
                    tabIndex="0">
                    <FontAwesomeIcon icon={faPlay} fixedWidth />
                </div>
                <div
                    className={classnames(styles['example-runner__menu-item'], { [styles['example-runner__menu-item--selected']]: showCode })}
                    onClick={() => setShowCode(true)}
                    onKeyDown={e => doOnEnter(e, () => setShowCode(true))}
                    role="button"
                    tabIndex="0">
                    <FontAwesomeIcon icon={faCode} fixedWidth />
                </div>
                <div className={styles['example-runner__menu-item']}>
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

const ImportTypeSelector = ({ importType, onChange }) => {
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

const ReactStyleSelector = ({ useFunctionalReact, onChange }) => {
    return <div className={styles['example-runner__react-style']}>
        {!isServerSideRendering() &&
            <select className={styles['example-runner__react-style__select']} style={{ width: 120 }} value={JSON.stringify(useFunctionalReact)}
                onChange={onChange} onBlur={onChange}>
                <option value="false">Classes</option>
                <option value="true">Hooks</option>
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
