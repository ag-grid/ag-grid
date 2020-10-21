import React from 'react';
import Extras from './Extras';
import SystemJs from './SystemJs';

const AngularTemplate = ({ appLocation, options }) => {
    const boilerplatePath = '/example-runner/grid-angular-boilerplate/';

    return <html lang="en">
        <head>
            <title>Angular 2 example</title>
            <script dangerouslySetInnerHTML={{ __html: `document.write('<base href="' + document.location + '" />');` }}></script>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <style media="only screen">
                {`html, body {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch;
                }

                html {
                    position: absolute;
                    top: 0;
                    left: 0;
                    padding: 0;
                    overflow: auto;
                }

                body {
                    padding: 1rem;
                    overflow: auto;
                }`}
            </style>

            <Extras options={options} />

            <script src="https://unpkg.com/core-js@2.6.5/client/shim.min.js"></script>
            <script src="https://unpkg.com/zone.js@0.8.17/dist/zone.js"></script>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${boilerplatePath}main.ts').catch(function(err) { console.error(err); });` }}></script>
        </head>
        <body dangerouslySetInnerHTML={{ __html: `<my-app>Loading Angular example&hellip;</my-app>` }}></body>
    </html>;
};

export default AngularTemplate;