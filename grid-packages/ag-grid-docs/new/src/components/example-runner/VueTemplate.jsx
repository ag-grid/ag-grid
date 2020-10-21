import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const VueTemplate = ({ appLocation, options, scriptFiles, styleFiles }) => {
    const boilerplatePath = '/example-runner/grid-vue-boilerplate/';

    return <html lang="en">
        <head>
            <title>Vue example</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <ExampleStyle />
            <Styles files={styleFiles} />
            <Extras options={options} />
            <Scripts files={scriptFiles} />
        </head>
        <body>
            <div id="app" style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: `<my-component>Loading Vue example&hellip;</my-component>` }}></div>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${appLocation}main.js').catch(function(err) { console.error(err); });` }}></script>
        </body>
    </html>;
};

export default VueTemplate;