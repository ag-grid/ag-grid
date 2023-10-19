import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { withPrefix } from 'gatsby';
import VanillaTemplate from './VanillaTemplate';
import AngularTemplate from './AngularTemplate';
import ReactTemplate from './ReactTemplate';
import CRAReactTemplate from './CRAReactTemplate';
import TypescriptTemplate from './TypescriptTemplate';
import VueTemplate from './VueTemplate';
import Vue3Template from './Vue3Template';
import { getEntryFile } from './helpers';

/**
 * This generates the HTML to execute an example.
 */
export const getIndexHtml = (exampleInfo, isExecuting = false) => {
    const { sourcePath, options, library, importType, type } = exampleInfo;
    let { boilerplatePath, appLocation, framework, internalFramework } = exampleInfo;

    const getFileUrl = file =>
        isExecuting ? file.publicURL : file.relativePath.replace(sourcePath, '').replace(boilerplatePath, '');

    const getExampleFileUrls = (extension, exclude = () => false) =>
        exampleInfo.getFiles(extension, exclude).map(file => getFileUrl(file)).sort();

    const scriptFiles = getExampleFileUrls('js', file => file.base === 'main.js' || file.base.endsWith('Vue.js'));
    const styleFiles = getExampleFileUrls('css');

    if (isExecuting) {
        appLocation = withPrefix(appLocation);
        boilerplatePath = withPrefix(boilerplatePath);
    } else {
        appLocation = './';
        boilerplatePath = '';
    }

    const modifiedTimeFile = exampleInfo.getFile(getEntryFile(framework, internalFramework));
    const modifiedTimeMs = modifiedTimeFile ? modifiedTimeFile.mtimeMs : new Date().getTime();

    let element, csbElement;

    const templateProps = {
        isExecuting,
        modifiedTimeMs,
        library,
        appLocation,
        options,
        styleFiles,
        importType,
        internalFramework,
        type
    };

    switch (framework) {
        case 'javascript': {
            const indexHtml = exampleInfo.getFile('index.html');

            if (!indexHtml) {
                console.error(`Could not find index.html for "${exampleInfo.name}" example - is example generation skipping packages?`);
                return;
            }

            if (internalFramework === 'typescript') {
                element = <TypescriptTemplate
                    boilerplatePath={boilerplatePath}
                    scriptFiles={scriptFiles}
                    indexFragment={indexHtml.childHtmlRehype.html}
                    {...templateProps} />;
            } else {
                element = <VanillaTemplate
                    indexFragment={indexHtml.childHtmlRehype.html}
                    scriptFiles={[...scriptFiles, getFileUrl(exampleInfo.getFile('main.js'))]}
                    {...templateProps} />;
            }

            break;
        }

        case 'angular':
            element = <AngularTemplate
                boilerplatePath={boilerplatePath}
                scriptFiles={scriptFiles}
                {...templateProps} />;

            break;
        case 'react': {
            element = <ReactTemplate
                boilerplatePath={boilerplatePath}
                scriptFiles={scriptFiles}
                {...templateProps} />;

            csbElement = <CRAReactTemplate
                boilerplatePath={boilerplatePath}
                scriptFiles={scriptFiles}
                {...templateProps} />;

            break;
        }
        case 'vue': {
            const frameworkTemplates = {
                vue: VueTemplate,
                vue3: Vue3Template
            };

            const FrameworkTemplate = frameworkTemplates[internalFramework];

            element = <FrameworkTemplate
                boilerplatePath={boilerplatePath}
                scriptFiles={scriptFiles}
                {...templateProps} />;

            break;
        }

        default:
            element =
                <html lang="en">
                    <body>
                        <div>An unknown framework "{framework}" was requested.</div>
                    </body>
                </html>;
            break;
    }

    const plunkerIndexHtml = `<!DOCTYPE html>${format(ReactDOMServer.renderToStaticMarkup(element))}`;
    return {
        plunkerIndexHtml,
        codeSandBoxIndexHtml: csbElement ? `<!DOCTYPE html>${format(ReactDOMServer.renderToStaticMarkup(csbElement))}` : plunkerIndexHtml
    };
};

const format = (html) => {
    var tab = '\t';
    var result   = '';
    var indent = '';

    html.split(/>\s*</).forEach(element => {
        if (element.match(/^\/\w/)) {
            indent = indent.substring(tab.length);
        }

        result += `${indent}<${element}>\r\n`;

        if (element.match(/^<?\w[^>]*[^/]$/)) {
            indent += tab;
        }
    });

    return result.substring(1, result.length - 3);
};
