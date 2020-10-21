import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const AngularTemplate = ({ appLocation, options, scriptFiles, styleFiles }) => {
    const boilerplatePath = '/example-runner/grid-angular-boilerplate/';

    return <html lang="en">
        <head>
            <title>Angular 2 example</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <ExampleStyle />
            <Styles files={styleFiles} />
            <Extras options={options} />
            <Scripts files={scriptFiles} />

            <script dangerouslySetInnerHTML={{ __html: `document.write('<base href="' + document.location + '" />');` }}></script>
            <script src="https://unpkg.com/core-js@2.6.5/client/shim.min.js"></script>
            <script src="https://unpkg.com/zone.js@0.8.17/dist/zone.js"></script>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${boilerplatePath}main.ts').catch(function(err) { console.error(err); });` }}></script>
        </head>
        <body dangerouslySetInnerHTML={{ __html: `<my-app>Loading Angular example&hellip;</my-app>` }}></body>
    </html>;
};

export default AngularTemplate;