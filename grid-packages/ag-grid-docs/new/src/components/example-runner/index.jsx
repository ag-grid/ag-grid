import React, { useState } from 'react';
import { withPrefix } from 'gatsby';
import VisibilitySensor from "react-visibility-sensor";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faWindowRestore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from '../GlobalContext';
import ExampleRunnerResult from './ExampleRunnerResult';
import { useExampleFileNodes } from './use-example-file-nodes';
import { doOnEnter, getExampleInfo, openPlunker } from './helpers';
import { generateIndexHtml } from './index-html-generator';
import styles from './example-runner.module.scss';

const ExampleRunner = ({ pageName, framework, name, title, type, options = '{}' }) => {
    const [showCode, setShowCode] = useState(false);
    const nodes = useExampleFileNodes();

    return <GlobalContextConsumer>
        {({ exampleImportType, useFunctionalReact, set }) => {
            const exampleInfo =
                getExampleInfo(pageName, name, title, type, options, framework, exampleImportType, useFunctionalReact);

            let openTabLink = <a href={withPrefix(`${exampleInfo.appLocation}index.html`)} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faWindowRestore} fixedWidth />
            </a>;

            if (process.env.NODE_ENV === 'development') {
                // as the files will not have been generated in development, we generate the HTML for the new tab here
                const indexHtml = generateIndexHtml(nodes, exampleInfo, true);
                const openTab = () => {
                    const win = window.open(null, '_blank');
                    win.document.write(indexHtml);
                    win.document.close();
                };

                openTabLink = <div onClick={openTab} onKeyDown={e => doOnEnter(e, openTab)} role="button" tabIndex="0">
                    <FontAwesomeIcon icon={faWindowRestore} fixedWidth />
                </div>;
            }

            return <div className={styles.exampleRunner}>
                <div className={`form-inline ${styles.exampleRunner__header}`}>
                    <div className={styles.exampleRunner__title}>Example: {title}</div>
                    {framework === 'react' &&
                        <ReactVersionSelector
                            useFunctionalReact={useFunctionalReact}
                            onChange={event => set({ useFunctionalReact: JSON.parse(event.target.value) })} />
                    }
                    {framework !== 'javascript' &&
                        <ImportTypeSelector
                            importType={exampleImportType}
                            onChange={event => set({ exampleImportType: event.target.value })} />
                    }
                </div>
                <div className={styles.exampleRunner__body}>
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
                            {openTabLink}
                        </div>
                        <div
                            className={styles.exampleRunner__menuItem}
                            onClick={() => openPlunker(nodes, exampleInfo)}
                            onKeyDown={e => doOnEnter(e, () => openPlunker(nodes, exampleInfo))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
                        </div>
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