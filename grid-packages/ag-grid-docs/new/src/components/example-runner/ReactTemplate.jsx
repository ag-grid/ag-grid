import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const ReactTemplate = ({ appLocation, options, scriptFiles, styleFiles }) => {
    const boilerplatePath = '/example-runner/grid-react-boilerplate/';

    return <html lang="en">
        <head>
            <title>React example</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <ExampleStyle rootId="root" />
            <Styles files={styleFiles} />
            <Extras options={options} />
            <Scripts files={scriptFiles} />
        </head>
        <body>
            <div id="root">Loading React example&hellip;</div>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${appLocation}index.jsx').catch(function(err) { console.error(err); });` }}></script>
        </body>
    </html>;
};

export default ReactTemplate;