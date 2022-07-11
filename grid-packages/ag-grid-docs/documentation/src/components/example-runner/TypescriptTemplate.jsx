import React from 'react';
import ReactDOMServer from 'react-dom/server';
import isDevelopment from 'utils/is-development';
import ExampleStyle from './ExampleStyle';
import Extras from './Extras';
import { getCssFilePaths } from './helpers';
import MetaData from './MetaData';
import Scripts from './Scripts';
import Styles from './Styles';
import SystemJs from './SystemJs';

const getCacheBustingUrl = (url, timestamp) => `${url}?t=${timestamp}`;

/**
 * This is the template for executing Typescript examples in the example runner.
 */
const TypescriptTemplate = ({ isExecuting, modifiedTimeMs, library, boilerplatePath, appLocation, options, scriptFiles, styleFiles, indexFragment, importType }) => {

    return <html lang="en">
        <head>
            <MetaData title="Typescript example" modifiedTimeMs={modifiedTimeMs} isExecuting={isExecuting} options={options}/>
            <ExampleStyle />
            <TypescriptStyles library={library} importType={importType} files={isDevelopment() ? styleFiles.filter(file => !file.includes('style.css') && !file.includes('styles.css')).map(file => getCacheBustingUrl(file, modifiedTimeMs)) : styleFiles} />
            <Extras options={options} />
        </head>
        <TypescriptBody
            library={library}
            appLocation={appLocation}
            boilerplatePath={boilerplatePath}
            options={options}
            scriptFiles={isDevelopment() ? scriptFiles.map(file => getCacheBustingUrl(file, modifiedTimeMs)) : scriptFiles}
            indexFragment={indexFragment}
            importType={importType} />
        <Styles files={styleFiles.filter(file => file.includes('style.css') || file.includes('styles.css'))} />
    </html>;

}

const TypescriptBody = ({ library, boilerplatePath, appLocation, options, scriptFiles, indexFragment, importType }) => {

    const bodySuffix = ReactDOMServer.renderToStaticMarkup(
        <>
            <script dangerouslySetInnerHTML={{ __html: `var __basePath = '${appLocation}';` }}></script>
            <Scripts files={scriptFiles} />
            <SystemJs
                library={library}
                boilerplatePath={boilerplatePath}
                appLocation={appLocation}
                startFile={appLocation + 'main.ts'}
                framework={'typescript'}
                importType={importType}
                options={options} />
        </>
    );

    // Setting the HTML like this avoids a wrapping div around the fragment
    return <body dangerouslySetInnerHTML={{ __html: `${indexFragment}\n${bodySuffix}` }}></body>;
};

const TypescriptStyles = ({ library, files, importType }) => {
    if (!isDevelopment() || library !== 'grid') { return <Styles files={files} />; }

    const cssPaths = getCssFilePaths(importType);

    return <Styles files={[...cssPaths, ...files]} />;
};

export default TypescriptTemplate;
