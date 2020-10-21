import React from 'react';
import Extras from './Extras';
import SystemJs from './SystemJs';

const VueTemplate = ({ appLocation, options }) => {
    const boilerplatePath = '/example-runner/grid-vue-boilerplate/';

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

            <Extras options={options} />
        </head>
        <body>
            <div id="app" style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: `<my-component>Loading Vue example&hellip;</my-component>` }}></div>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${appLocation}main.js').catch(function(err) { console.error(err); });` }}></script>
        </body>
    </html>;
};

export default VueTemplate;