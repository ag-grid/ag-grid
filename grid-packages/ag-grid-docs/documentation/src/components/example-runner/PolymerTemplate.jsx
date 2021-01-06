import React from 'react';
import { localPrefix, agGridVersion } from './consts';
import ExampleStyle from './ExampleStyle';
import { isUsingPublishedPackages } from './helpers';

const PolymerTemplate = ({ appLocation, options }) => {
    const communityScriptPath = isUsingPublishedPackages() ?
        `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.noStyle.js` :
        `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.js`;

    const enterpriseScriptPath = isUsingPublishedPackages() ?
        `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.min.noStyle.js` :
        `${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`;

    return <html lang="en">
        <head>
            <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.5.0/webcomponents-loader.js"></script>
            <script src={options.enterprise ? enterpriseScriptPath : communityScriptPath}></script>
            <script type="module" src={`${appLocation}main.js`}></script>
            <ExampleStyle />
        </head>
        <body dangerouslySetInnerHTML={{ __html: '<ag-grid-polymer-example>Loading...</ag-grid-polymer-example>' }}></body>
    </html>;
};

export default PolymerTemplate;