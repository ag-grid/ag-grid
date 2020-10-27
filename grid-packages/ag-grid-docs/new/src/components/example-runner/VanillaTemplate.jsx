import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import Scripts from './Scripts';
import Styles from './Styles';

const VanillaTemplate = ({ appLocation, options, scriptFiles, styleFiles, indexFragment }) =>
    <html lang="en">
        <head>
            <title>JavaScript example</title>
            <ExampleStyle />
            <Styles files={styleFiles} />
            <Extras options={options} />
        </head>
        <Body appLocation={appLocation} options={options} scriptFiles={scriptFiles} indexFragment={indexFragment} />
    </html>;

// we have to use this function to avoid a wrapping div around the fragment
const Body = ({ appLocation, options, scriptFiles, indexFragment }) => {
    const agGridVersion = '24.1.0';
    const communityScriptPath = `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.js`;
    const enterpriseScriptPath = `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.min.js`;

    const bodySuffix = ReactDOMServer.renderToStaticMarkup(
        <>
            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <script src={options.enterprise ? enterpriseScriptPath : communityScriptPath}></script>
            <Scripts files={scriptFiles} />
        </>
    );

    return <body dangerouslySetInnerHTML={{ __html: `${indexFragment}\n${bodySuffix}` }}></body>;
};

export default VanillaTemplate;