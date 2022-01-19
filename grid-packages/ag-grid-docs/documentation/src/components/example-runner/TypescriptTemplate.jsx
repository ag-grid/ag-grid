import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import { localPrefix, agGridVersion, agGridEnterpriseVersion, agChartsVersion } from 'utils/consts';
import { getCssFilePaths, isUsingPublishedPackages } from './helpers';
import isDevelopment from 'utils/is-development';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';
import MetaData from './MetaData';

const getCacheBustingUrl = (url, timestamp) => `${url}?t=${timestamp}`;

/**
 * This is the template for executing Typescript examples in the example runner.
 */
const TypescriptTemplate = ({ isExecuting, modifiedTimeMs, library, boilerplatePath, appLocation, options, scriptFiles, styleFiles, indexFragment }) => {

    return <html lang="en">
        <head>
            <MetaData title="Typescript example" modifiedTimeMs={modifiedTimeMs} isExecuting={isExecuting} />
            <ExampleStyle rootId="app" />
            <TypescriptStyles library={library} files={isDevelopment() ? styleFiles.map(file => getCacheBustingUrl(file, modifiedTimeMs)) : styleFiles} />
            <Styles files={styleFiles} />
            <Extras options={options} />
        </head>
        <TypescriptBody
            library={library}
            appLocation={appLocation}
            boilerplatePath={boilerplatePath}
            options={options}
            scriptFiles={isDevelopment() ? scriptFiles.map(file => getCacheBustingUrl(file, modifiedTimeMs)) : scriptFiles}
            indexFragment={indexFragment} />
    </html>;

}

const TypescriptBody = ({ library, boilerplatePath, appLocation, options, scriptFiles, indexFragment }) => {
    let scriptPath;

    if (library === 'charts') {
        scriptPath = isUsingPublishedPackages() ?
            `https://unpkg.com/ag-charts-community@${agChartsVersion}/dist/ag-charts-community.min.js` :
            `${localPrefix}/ag-charts-community/dist/ag-charts-community.js`;
    } else {
        if (options.enterprise) {
            scriptPath = isUsingPublishedPackages() ?
                `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridEnterpriseVersion}/dist/ag-grid-enterprise.min.js` :
                `${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`;
        } else {
            scriptPath = isUsingPublishedPackages() ?
                `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.min.js` :
                `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.js`;
        }
    }

    const bodySuffix = ReactDOMServer.renderToStaticMarkup(
        <>
            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <script src={scriptPath}></script>
            <Scripts files={scriptFiles} />
            <SystemJs
                library={library}
                boilerplatePath={boilerplatePath}
                appLocation={appLocation}
                startFile={appLocation + 'main.ts'}
                options={options} />
        </>
    );

    // Setting the HTML like this avoids a wrapping div around the fragment
    return <body dangerouslySetInnerHTML={{ __html: `${indexFragment}\n${bodySuffix}` }}></body>;
};

const TypescriptStyles = ({ library, files }) => {
    if (!isDevelopment() || library !== 'grid') { return <Styles files={files} />; }

    const cssPaths = getCssFilePaths();

    return <Styles files={[...cssPaths, ...files]} />;
};

export default TypescriptTemplate;
