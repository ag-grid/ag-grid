import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import isDevelopment from 'utils/is-development';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const ReactTemplate = ({ modifiedTimeMs, library, boilerplatePath, appLocation, options, scriptFiles, styleFiles }) =>
    <html lang="en">
        <head>
            <title>React example{isDevelopment() ? ` (${modifiedTimeMs})` : ''}</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <ExampleStyle rootId="root" />
            <Styles files={styleFiles} />
            <Extras options={options} />
        </head>
        <body>
            <div id="root">Loading React example&hellip;</div>

            <Scripts files={scriptFiles} />
            <SystemJs
                library={library}
                boilerplatePath={boilerplatePath}
                appLocation={appLocation}
                startFile={appLocation + 'index.jsx'}
                options={options} />
        </body>
    </html>;

export default ReactTemplate;