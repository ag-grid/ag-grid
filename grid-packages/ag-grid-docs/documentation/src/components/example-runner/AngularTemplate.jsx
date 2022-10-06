import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';
import MetaData from './MetaData';

/**
 * This is the template for executing Angular examples in the example runner.
 */
const AngularTemplate = ({ isExecuting, modifiedTimeMs, library, boilerplatePath, appLocation, options, scriptFiles, styleFiles, type, importType }) =>
    <html lang="en">
        <head>
            <MetaData title="Angular example" modifiedTimeMs={modifiedTimeMs} isExecuting={isExecuting} options={options} />
            <ExampleStyle rootId="app" />
            {(type !== "generated" || library !== "grid") && <Styles files={styleFiles}/>}
            <Extras options={options} />
        </head>
        <body>
            <div id="app" dangerouslySetInnerHTML={{ __html: `<my-app>Loading Angular example&hellip;</my-app>` }}></div>

            <script dangerouslySetInnerHTML={{ __html: `document.write('<base href="' + document.location + '" />');` }}></script>
            <script src="https://cdn.jsdelivr.net/npm/core-js-bundle@3.6.5/minified.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/zone.js@0.11.2/dist/zone.min.js"></script>
            <Scripts files={scriptFiles} />
            <SystemJs
                library={library}
                boilerplatePath={boilerplatePath}
                appLocation={appLocation}
                startFile={boilerplatePath + 'main.ts'}
                framework={'angular'}
                importType={importType}
                options={options} />
        </body>
    </html>;

export default AngularTemplate;
