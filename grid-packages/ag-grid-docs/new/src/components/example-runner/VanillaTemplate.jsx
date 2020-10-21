import React from 'react';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';

const VanillaTemplate = ({ appLocation, options, scriptFiles, styleFiles, indexFragment }) => {
    const agGridVersion = '24.1.0';
    const communityScriptPath = `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.js`;
    const enterpriseScriptPath = `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.min.js`;

    return <html lang="en">
        <head>
            <ExampleStyle />
            <Styles files={styleFiles} />
            <Extras options={options} />
        </head>
        <body>
            <div style={{ height: '100%', boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: indexFragment }}></div>

            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <script src={options.enterprise ? enterpriseScriptPath : communityScriptPath}></script>
            <Scripts files={scriptFiles} />
        </body>
    </html>;
};

export default VanillaTemplate;