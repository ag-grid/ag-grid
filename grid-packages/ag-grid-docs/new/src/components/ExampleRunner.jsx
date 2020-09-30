import React from "react";
import CodeViewer from './CodeViewer';
import GlobalContextConsumer from './GlobalContext';
import './example-runner.css';

export default ({ framework, name, title, type, options = '{}' }) => {
    //const parsedOptions = JSON.parse(options);

    return <GlobalContextConsumer>
        {({ exampleImportType, useFunctionalReact, set }) => {
            return <div className="example-runner">
                <div className="example-runner__header">
                    <div className="example-runner__title">Example: {title}</div>
                    {framework !== 'javascript' &&
                        <ImportTypeSelector importType={exampleImportType} onChange={event => set({ exampleImportType: event.target.value })} />
                    }
                </div>
                <CodeViewer framework={framework} name={name} importType={exampleImportType} useFunctionalReact={useFunctionalReact} />
            </div >;
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