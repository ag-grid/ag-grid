import React, { useState } from 'react';
import { withPrefix } from 'gatsby';
import VisibilitySensor from 'react-visibility-sensor';
import { encodeQueryParams } from 'use-query-params';
import { stringify } from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faWindowRestore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from '../GlobalContext';
import ExampleRunnerResult from './ExampleRunnerResult';
import { useExampleFileNodes } from './use-example-file-nodes';
import { doOnEnter, getExampleInfo, isDevelopment, openPlunker } from './helpers';
import styles from './example-runner.module.scss';
import { ParameterConfig } from '../../pages/example-runner';

const getNewTabLink = exampleInfo => {
    if (isDevelopment()) {
        const {
            pageName,
            library,
            framework,
            useFunctionalReact,
            importType,
            name,
            title,
            type,
            options,
        } = exampleInfo;

        const queryParams = encodeQueryParams(
            ParameterConfig,
            {
                pageName,
                library,
                framework,
                useFunctionalReact,
                importType,
                name,
                title,
                type,
                options,
            });

        return `/example-runner/?${stringify(queryParams)}`;
    } else {
        return `${exampleInfo.appLocation}index.html`;
    }
};

const ExampleRunner = ({ pageName, framework, name, title, type, options = {}, library }) => {
    const [showCode, setShowCode] = useState(!!options.showCode);
    const nodes = useExampleFileNodes();

    return <GlobalContextConsumer>
        {({ exampleImportType, useFunctionalReact, set }) => {
            const exampleInfo = getExampleInfo(
                nodes, library, pageName, name, title, type, options, framework, exampleImportType, useFunctionalReact);

            const exampleStyle = {
                width: '100%',
                height: exampleInfo.options.exampleHeight || '500px',
            };

            const isGenerated = exampleInfo.type === 'generated' || exampleInfo.type === 'mixed';

            return <div className={styles.exampleRunner}>
                <div className={`form-inline ${styles.exampleRunner__header}`}>
                    <div className={styles.exampleRunner__title}>Example: {title}</div>
                    {library === 'grid' && exampleInfo.framework === 'react' &&
                        <ReactVersionSelector
                            useFunctionalReact={useFunctionalReact}
                            onChange={event => set({ useFunctionalReact: JSON.parse(event.target.value) })} />
                    }
                    {library === 'grid' && exampleInfo.framework !== 'javascript' && isGenerated &&
                        <ImportTypeSelector
                            importType={exampleImportType}
                            onChange={event => set({ exampleImportType: event.target.value })} />
                    }
                </div>
                <div className={styles.exampleRunner__body} style={exampleStyle}>
                    <div className={styles.exampleRunner__menu}>
                        <div
                            className={`${styles.exampleRunner__menuItem} ${showCode ? '' : styles.exampleRunner__menuItemSelected}`}
                            onClick={() => setShowCode(false)}
                            onKeyDown={e => doOnEnter(e, () => setShowCode(false))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faPlay} fixedWidth />
                        </div>
                        <div
                            className={`${styles.exampleRunner__menuItem} ${showCode ? styles.exampleRunner__menuItemSelected : ''}`}
                            onClick={() => setShowCode(true)}
                            onKeyDown={e => doOnEnter(e, () => setShowCode(true))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faCode} fixedWidth />
                        </div>
                        <div className={styles.exampleRunner__menuItem}>
                            <a href={withPrefix(getNewTabLink(exampleInfo))} target="_blank" rel="noreferrer">
                                <FontAwesomeIcon icon={faWindowRestore} fixedWidth />
                            </a>
                        </div>
                        {!options.noPlunker &&
                            <div
                                className={styles.exampleRunner__menuItem}
                                onClick={() => openPlunker(nodes, exampleInfo)}
                                onKeyDown={e => doOnEnter(e, () => openPlunker(nodes, exampleInfo))}
                                role="button"
                                tabIndex="0">
                                <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
                            </div>}
                    </div>
                    <div className={styles.exampleRunner__content}>
                        {!showCode &&
                            <VisibilitySensor partialVisibility={true}>
                                {({ isVisible }) =>
                                    <ExampleRunnerResult isVisible={isVisible} exampleInfo={exampleInfo} />
                                }
                            </VisibilitySensor>
                        }
                        {showCode && <CodeViewer exampleInfo={exampleInfo} />}
                    </div>
                </div>
            </div>;
        }}
    </GlobalContextConsumer>;
};

const ImportTypeSelector = ({ importType, onChange }) => {
    return <div className={`form-group ${styles.exampleRunner__importType}`}>
        <select className="form-control" style={{ width: 120 }} value={importType} onChange={onChange} onBlur={onChange}>
            {['packages', 'modules'].map(type =>
                <option key={type} value={type}>{type[0].toUpperCase()}{type.substring(1)}</option>
            )}
        </select>
    </div>;
};

const ReactVersionSelector = ({ useFunctionalReact, onChange }) => {
    return <div className={`form-group ${styles.reactVersionSelector}`}>
        <select className="form-control" style={{ width: 120 }} value={JSON.stringify(useFunctionalReact)} onChange={onChange} onBlur={onChange}>
            <option value="false">Classes</option>
            <option value="true">Hooks</option>
        </select>
    </div>;
};

export default ExampleRunner;