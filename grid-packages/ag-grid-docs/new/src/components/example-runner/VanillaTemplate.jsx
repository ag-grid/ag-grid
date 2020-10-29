import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import { localPrefix, agGridVersion } from './consts';
import { isDevelopment } from './helpers';
import Scripts from './Scripts';
import Styles from './Styles';

const VanillaTemplate = ({ appLocation, options, scriptFiles, styleFiles, indexFragment }) =>
    <html lang="en">
        <head>
            <title>JavaScript example</title>
            <ExampleStyle />
            <VanillaStyles files={styleFiles} />
            <Extras options={options} />
        </head>
        <VanillaBody appLocation={appLocation} options={options} scriptFiles={scriptFiles} indexFragment={indexFragment} />
    </html>;

// we have to use this function to avoid a wrapping div around the fragment
const VanillaBody = ({ appLocation, options, scriptFiles, indexFragment }) => {
    const communityScriptPath = isDevelopment() ?
        `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.js` :
        `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.js`;

    const enterpriseScriptPath = isDevelopment() ?
        `${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js` :
        `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.min.js`;

    const bodySuffix = ReactDOMServer.renderToStaticMarkup(
        <>
            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <script src={options.enterprise ? enterpriseScriptPath : communityScriptPath}></script>
            <Scripts files={scriptFiles} />
        </>
    );

    return <body dangerouslySetInnerHTML={{ __html: `${indexFragment}\n${bodySuffix}` }}></body>;
};

const VanillaStyles = ({ files }) => {
    if (!isDevelopment()) { return <Styles files={files} />; }

    const themeFiles = ['alpine-dark', 'alpine', 'balham-dark', 'balham', 'material', 'fresh', 'dark', 'blue', 'bootstrap'];

    const cssFiles = [
        'ag-grid.css',
        ...themeFiles.map(theme => `ag-theme-${theme}.css`)
    ];

    const cssPaths = cssFiles.map(file => `${localPrefix}/@ag-grid-community/all-modules/dist/styles/${file}`);

    return <Styles files={[...cssPaths, ...files]} />;
};

export default VanillaTemplate;