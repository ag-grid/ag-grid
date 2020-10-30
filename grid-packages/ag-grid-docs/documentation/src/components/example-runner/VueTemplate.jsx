import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const VueTemplate = ({ boilerplatePath, appLocation, options, scriptFiles, styleFiles }) =>
    <html lang="en">
        <head>
            <title>Vue example</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <ExampleStyle rootId="app" />
            <Styles files={styleFiles} />
            <Extras options={options} />
        </head>
        <body>
            <div id="app" dangerouslySetInnerHTML={{ __html: `<my-component>Loading Vue example&hellip;</my-component>` }}></div>

            <Scripts files={scriptFiles} />
            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} startFile={appLocation + 'main.js'} options={options} />
        </body>
    </html>;

export default VueTemplate;