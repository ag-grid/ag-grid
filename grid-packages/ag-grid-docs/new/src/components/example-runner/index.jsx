import './example-runner.scss';
import React, { useState } from 'react';
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from '../GlobalContext';
import ExampleRunnerResult from './ExampleRunnerResult';
import VisibilitySensor from "react-visibility-sensor";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCode, faWindowRestore, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const ExampleRunner = ({ pageName, framework, name, title, type, options = '{}' }) => {
    const [showCode, setShowCode] = useState(false);
    const parsedOptions = JSON.parse(options);

    return <GlobalContextConsumer>
        {({ exampleImportType, useFunctionalReact, set }) => {
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
                            onClick={() => setShowCode(false)}>
                            <FontAwesomeIcon icon={faPlay} fixedWidth />
                        </div>
                        <div
                            className={`example-runner__menu-item ${showCode ? 'example-runner__menu-item--selected' : ''}`}
                            onClick={() => setShowCode(true)}>
                            <FontAwesomeIcon icon={faCode} fixedWidth />
                        </div>
                        <div className='example-runner__menu-item'>
                            <FontAwesomeIcon icon={faWindowRestore} fixedWidth />
                        </div>
                        <div className='example-runner__menu-item'>
                            <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
                        </div>
                    </div>
                    <div className="example-runner__content">
                        {!showCode &&
                            <VisibilitySensor partialVisibility={true}>
                                {({ isVisible }) =>
                                    <ExampleRunnerResult
                                        isVisible={isVisible}
                                        pageName={pageName}
                                        framework={framework}
                                        name={name}
                                        importType={exampleImportType}
                                        options={parsedOptions}
                                    />
                                }
                            </VisibilitySensor>
                        }
                        {showCode && <CodeViewer
                            pageName={pageName}
                            framework={framework}
                            name={name}
                            importType={exampleImportType}
                            useFunctionalReact={useFunctionalReact} />}
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