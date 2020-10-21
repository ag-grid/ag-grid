import React from 'react';
import { gridSystemJsCommunityMap, gridSystemJsEnterpriseMap, gridSystemJsMap } from './systemJsConfiguration';

const AngularTemplate = ({ isEnterprise = false, appLocation }) => {
    const boilerplatePath = '/example-runner/grid-angular-boilerplate/';
    const systemJsPath = `${boilerplatePath}systemjs.prod.config.js`;

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

            <script src="https://unpkg.com/core-js@2.6.5/client/shim.min.js"></script>
            <script src="https://unpkg.com/zone.js@0.8.17/dist/zone.js"></script>
            <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

            <script dangerouslySetInnerHTML={{
                __html: `var appLocation = '${appLocation}';
                var boilerplatePath = '${boilerplatePath}';
                var systemJsMap = ${JSON.stringify(gridSystemJsMap, null, 2)};
                var systemJsPaths = ${JSON.stringify(isEnterprise ? gridSystemJsEnterpriseMap : gridSystemJsCommunityMap, null, 2)};`
            }}>
            </script>

            <script src={systemJsPath}></script>

            <script dangerouslySetInnerHTML={{ __html: `System.import('${boilerplatePath}main.ts').catch(function(err) { console.error(err); });` }}></script>
        </head>
        <body dangerouslySetInnerHTML={{ __html: `<my-app>Loading Angular example&hellip;</my-app>` }}></body>
    </html>;
};

export default AngularTemplate;