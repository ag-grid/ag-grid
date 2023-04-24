import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';
import MetaData from './MetaData';

/**
 * This is the template for executing Vue 3 examples in the example runner.
 */
const VueTemplate = ({isExecuting, modifiedTimeMs, library, boilerplatePath, appLocation, options, scriptFiles, styleFiles, type, importType}) => (
    <html lang="en">
    <head>
        <MetaData title="Vue 3 example" modifiedTimeMs={modifiedTimeMs} isExecuting={isExecuting} options={options}/>
        <ExampleStyle rootId="app"/>
        {(type !== "generated" || library !== "grid") && <Styles files={styleFiles}/>}
        <Extras options={options}/>
    </head>
    <body>
    <div id="app" dangerouslySetInnerHTML={{__html: `<my-component>Loading Vue 3 example&hellip;</my-component>`}}></div>

    <Scripts files={scriptFiles}/>
    <SystemJs
        library={library}
        boilerplatePath={boilerplatePath}
        appLocation={appLocation}
        startFile={appLocation + 'main.js'}
        framework={'vue3'}
        importType={importType}
        options={options}/>
    </body>
    </html>
);


export default VueTemplate;
