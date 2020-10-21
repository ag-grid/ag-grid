import React from 'react';
import Extras from './Extras';
import SystemJs from './SystemJs';

const ReactTemplate = ({ appLocation, options }) => {
    const boilerplatePath = '/example-runner/grid-react-boilerplate/';

    return <html lang="en">
        <head>
            <title>React example</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <style media="only screen">
                {`html, body, #root {
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
            <div id="root">Loading React example&hellip;</div>

            <SystemJs boilerplatePath={boilerplatePath} appLocation={appLocation} options={options} />

            <script dangerouslySetInnerHTML={{ __html: `System.import('${appLocation}index.jsx').catch(function(err) { console.error(err); });` }}></script>
        </body>
    </html>;
};

export default ReactTemplate;