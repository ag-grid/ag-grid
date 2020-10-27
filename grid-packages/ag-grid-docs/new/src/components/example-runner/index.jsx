import './example-runner.scss';
import React, { useState } from 'react';
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from '../GlobalContext';
import ExampleRunnerResult from './ExampleRunnerResult';
import VisibilitySensor from "react-visibility-sensor";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faWindowRestore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useExampleFileNodes } from './use-example-file-nodes';
import { doOnEnter, getExampleInfo, openPlunker } from './helpers';
import { generateIndexHtml } from './index-html-generator';
import { withPrefix } from 'gatsby';

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

            return <div className="example-runner">
                <div className="example-runner__header">
                    <div className="example-runner__title">Example: {title}</div>
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
                <div className="example-runner__body">
                    <div className="example-runner__menu">
                        <div
                            className={`example-runner__menu-item ${!showCode ? 'example-runner__menu-item--selected' : ''}`}
                            onClick={() => setShowCode(false)}
                            onKeyDown={e => doOnEnter(e, () => setShowCode(false))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faPlay} fixedWidth />
                        </div>
                        <div
                            className={`example-runner__menu-item ${showCode ? 'example-runner__menu-item--selected' : ''}`}
                            onClick={() => setShowCode(true)}
                            onKeyDown={e => doOnEnter(e, () => setShowCode(true))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faCode} fixedWidth />
                        </div>
                        <div className='example-runner__menu-item'>
                            {openTabLink}
                        </div>
                        <div
                            className='example-runner__menu-item'
                            onClick={() => openPlunker(nodes, exampleInfo)}
                            onKeyDown={e => doOnEnter(e, () => openPlunker(nodes, exampleInfo))}
                            role="button"
                            tabIndex="0">
                            <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
                        </div>
                    </div>
                    <div className="example-runner__content">
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
    return <div className="example-runner__import-type">
        <select value={importType} onChange={onChange} onBlur={onChange}>
            {['packages', 'modules'].map(type =>
                <option key={type} value={type}>{type[0].toUpperCase()}{type.substring(1)}</option>
            )}
        </select>
    </div>;
};

const ReactVersionSelector = ({ useFunctionalReact, onChange }) => {
    return <div className="react-version-selector">
        <select value={JSON.stringify(useFunctionalReact)} onChange={onChange} onBlur={onChange}>
            <option value="false">Classes</option>
            <option value="true">Hooks</option>
        </select>
    </div>;
};

export default ExampleRunner;