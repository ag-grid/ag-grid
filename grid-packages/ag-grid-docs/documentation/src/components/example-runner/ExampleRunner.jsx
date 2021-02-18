import React, { useMemo, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import classnames from 'classnames';
import fs from 'fs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faWindowRestore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
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

const isGeneratedExample = type => ['generated', 'mixed'].includes(type);

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

const ExampleRunnerInner = ({ pageName, framework, name, title, type, options, library, exampleImportType, useFunctionalReact, set }) => {
    const nodes = useExampleFileNodes();
    const [showCode, setShowCode] = useState(!!(options && options.showCode));
    const exampleInfo = useMemo(
        () => getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, exampleImportType),
        [nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, exampleImportType]
    );

    if (isServerSideRendering()) {
        writeIndexHtmlFile(exampleInfo);

        if (isGeneratedExample(type)) {
            // Need to generate the different permutations of index file:
            // 1. Modules version - this is saved already as it is the default

            // 2. Packages version
            const packagesExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, useFunctionalReact, 'packages');

            writeIndexHtmlFile(packagesExampleInfo);

            // 3. For React, the functional versions (because classic is the default)
            if (framework === 'react' && library === 'grid') {
                const functionalModulesExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, true, 'modules');

                writeIndexHtmlFile(functionalModulesExampleInfo);

                const functionalPackagesExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, true, 'packages');

                writeIndexHtmlFile(functionalPackagesExampleInfo);
            }
        } else if (type === 'multi' && framework === 'react') {
            // Also generate the functional React version
            const functionalExampleInfo = getExampleInfo(nodes, library, pageName, name, title, type, options, framework, true);

            writeIndexHtmlFile(functionalExampleInfo);
        }
    }

    const exampleStyle = {
        width: '100%',
        height: exampleInfo.options.exampleHeight || '500px',
    };

    const isGenerated = exampleInfo.type === 'generated' || exampleInfo.type === 'mixed';
    const linkId = `example-${name}`;

    return <div className={styles['example-runner']}>
        <div className={`form-inline ${styles['example-runner__header']}`}>
            <a id={linkId} href={`#${linkId}`} className={`anchor ${styles['example-runner__title']}`}>
                {anchorIcon}&nbsp;Example: {title}
            </a>
            {library === 'grid' && exampleInfo.framework === 'react' &&
                <ReactStyleSelector
                    useFunctionalReact={useFunctionalReact}
                    onChange={event => set({ useFunctionalReact: JSON.parse(event.target.value) })} />
            }
            {library === 'grid' && exampleInfo.framework !== 'javascript' && isGenerated &&
                <ImportTypeSelector
                    importType={exampleImportType}
                    onChange={event => set({ exampleImportType: event.target.value })} />
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

export const ExampleRunner = props => {
    return <GlobalContextConsumer>
        {({ exampleImportType, useFunctionalReact, set }) => {
            const innerProps = {
                ...props,
                exampleImportType,
                useFunctionalReact,
                set,
            };

            return <ExampleRunnerInner {...innerProps} />;
        }}
    </GlobalContextConsumer>;
};

const ImportTypeSelector = ({ importType, onChange }) => {
    return <div className={styles['example-runner__import-type']}>
        {!isServerSideRendering() && <select className={styles['example-runner__import-type__select']} style={{ width: 120 }} value={importType} onChange={onChange} onBlur={onChange}>
            {['packages', 'modules'].map(type =>
                <option key={type} value={type}>{type[0].toUpperCase()}{type.substring(1)}</option>
            )}
        </select>}
    </div >;
};

const ReactStyleSelector = ({ useFunctionalReact, onChange }) => {
    return <div className={styles['example-runner__react-style']}>
        {!isServerSideRendering() && <select className={styles['example-runner__react-style__select']} style={{ width: 120 }} value={JSON.stringify(useFunctionalReact)} onChange={onChange} onBlur={onChange}>
            <option value="false">Classes</option>
            <option value="true">Hooks</option>
        </select>}
    </div>;
};

export default ExampleRunner;
