import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import { localPrefix, agGridVersion, agGridEnterpriseVersion, agChartsVersion } from 'utils/consts';
import { getCssFilePaths, isUsingPublishedPackages } from './helpers';
import isDevelopment from 'utils/is-development';
import Scripts from './Scripts';
import Styles from './Styles';
import MetaData from './MetaData';

const getCacheBustingUrl = (url, timestamp) => `${url}?t=${timestamp}`;

/**
 * This is the template for executing vanilla JavaScript examples in the example runner.
 */
const VanillaTemplate = ({ isExecuting, modifiedTimeMs, library, appLocation, options, scriptFiles, styleFiles, indexFragment, importType }) =>
    <html lang="en">
        <head>
            <MetaData title="JavaScript example" modifiedTimeMs={modifiedTimeMs} isExecuting={isExecuting} options={options}/>
            <ExampleStyle />
            <VanillaStyles library={library} importType={importType} files={isDevelopment() ? styleFiles.filter(file => !file.includes('style.css') && !file.includes('styles.css')).map(file => getCacheBustingUrl(file, modifiedTimeMs)) : styleFiles} />
            <Extras options={options} />
        </head>
        <VanillaBody
            library={library}
            appLocation={appLocation}
            options={options}
            scriptFiles={isDevelopment() ? scriptFiles.map(file => getCacheBustingUrl(file, modifiedTimeMs)) : scriptFiles}
            indexFragment={indexFragment} />
        <Styles files={styleFiles.filter(file => file.includes('style.css') || file.includes('styles.css'))} />
    </html>;

const VanillaBody = ({ library, appLocation, options, scriptFiles, indexFragment }) => {
    let scriptPath;

    if (library === 'charts') {
        scriptPath = isUsingPublishedPackages()
            ? `https://cdn.jsdelivr.net/npm/ag-charts-community@${agChartsVersion}/dist/ag-charts-community.min.js`
            : isDevelopment()
                ? `${localPrefix}/ag-charts-community/dist/ag-charts-community.js`
                : `${localPrefix}/ag-charts-community/dist/ag-charts-community.min.js`;
    } else {
        if (options.enterprise) {
            scriptPath = isUsingPublishedPackages()
                ? `https://cdn.jsdelivr.net/npm/ag-grid-enterprise@${agGridEnterpriseVersion}/dist/ag-grid-enterprise.min.js`
                : isDevelopment()
                    ? `${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`
                    : `${localPrefix}/ag-grid-enterprise/dist/ag-grid-enterprise.min.js`;
        } else {
            scriptPath = isUsingPublishedPackages()
                ? `https://cdn.jsdelivr.net/npm/ag-grid-community@${agGridVersion}/dist/ag-grid-community.min.js`
                : isDevelopment()
                    ? `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.js`
                    : `${localPrefix}/ag-grid-community/dist/ag-grid-community.min.js`;
        }
    }

    const bodySuffix = ReactDOMServer.renderToStaticMarkup(
        <>
            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <script src={scriptPath}></script>
            <Scripts files={scriptFiles} />
        </>
    );

    // Setting the HTML like this avoids a wrapping div around the fragment
    return <body dangerouslySetInnerHTML={{ __html: `${indexFragment}\n${bodySuffix}` }}></body>;
};

const VanillaStyles = ({ library, files, importType }) => {
    if (!isDevelopment() || library !== 'grid') { return <Styles files={files} />; }

    const cssPaths = getCssFilePaths(importType);

    return <Styles files={[...cssPaths, ...files]} />;
};

export default VanillaTemplate;
