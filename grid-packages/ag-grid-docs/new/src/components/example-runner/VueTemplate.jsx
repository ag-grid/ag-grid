import React from 'react';
import { gridSystemJsCommunityMap, gridSystemJsEnterpriseMap, gridSystemJsMap } from './systemJsConfiguration';

const VueTemplate = ({ isEnterprise = false, appLocation }) => {
    const boilerplatePath = '/example-runner/grid-vue-boilerplate/';
    const systemJsPath = `${boilerplatePath}systemjs.prod.config.js`;

    return <html lang="en">
        <head>
            <title>Vue example</title>
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

        </head>
        <body>
            <div id="app" style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: `<my-component>Loading Vue example&hellip;</my-component>` }}></div>

            <script dangerouslySetInnerHTML={{
                __html: `var appLocation = '${appLocation}';
                var boilerplatePath = '${boilerplatePath}';
                var systemJsMap = ${JSON.stringify(gridSystemJsMap, null, 2)};
                var systemJsPaths = ${JSON.stringify(isEnterprise ? gridSystemJsEnterpriseMap : gridSystemJsCommunityMap, null, 2)};`
            }}></script>

            <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
            <script src={systemJsPath}></script>

            <script dangerouslySetInnerHTML={{ __html: `System.import('${appLocation}main.js').catch(function(err) { console.error(err); });` }}></script>
        </body>
    </html>;
};

export default VueTemplate;