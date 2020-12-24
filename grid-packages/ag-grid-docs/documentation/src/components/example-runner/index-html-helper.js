import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {withPrefix} from 'gatsby';
import VanillaTemplate from './VanillaTemplate';
import AngularTemplate from './AngularTemplate';
import ReactTemplate from './ReactTemplate';
import VueTemplate from './VueTemplate';
import PolymerTemplate from './PolymerTemplate';

export const getIndexHtml = (nodes, exampleInfo, isExecuting = false) => {
    const {sourcePath, options, library} = exampleInfo;
    let {boilerplatePath, appLocation, framework} = exampleInfo;

    const getFileUrl = file => isExecuting ?
        file.publicURL : file.relativePath.replace(sourcePath, '').replace(boilerplatePath, '');

    const getExampleFileUrls = (extension, exclude = () => false) => nodes
        .filter(file => file.relativePath.startsWith(sourcePath) &&
            file.base.endsWith(`.${extension}`) &&
            !exclude(file)
        )
        .map(file => getFileUrl(file))
        .sort();

    const scriptFiles = getExampleFileUrls('js', (file) => file.base === 'main.js' || file.base.endsWith('Vue.js'));
    const styleFiles = getExampleFileUrls('css');

    if (isExecuting) {
        appLocation = withPrefix(appLocation);
        boilerplatePath = withPrefix(boilerplatePath);
    } else {
        appLocation = './';
        boilerplatePath = '';
    }

    let element;

    if (exampleInfo.type === 'polymer') {
        element = <PolymerTemplate appLocation={appLocation} options={options}/>;
    } else {
        switch (framework) {
            case 'javascript': {
                const indexHtml = exampleInfo.getFile('index.html');

                if (!indexHtml) {
                    throw new Error(`Could not find index.html for "${exampleInfo.name}" example`);
                }

                element = <VanillaTemplate
                    library={library}
                    appLocation={appLocation}
                    options={options}
                    indexFragment={indexHtml.childHtmlRehype.html}
                    scriptFiles={[...scriptFiles, getFileUrl(exampleInfo.getFile('main.js'))]}
                    styleFiles={styleFiles}/>;

                break;
            }

            case 'angular':
            case 'react':
            case 'vue': {
                const frameworkTemplates = {
                    angular: AngularTemplate,
                    react: ReactTemplate,
                    vue: VueTemplate
                };

                const FrameworkTemplate = frameworkTemplates[framework];


                element = <FrameworkTemplate
                    library={library}
                    boilerplatePath={boilerplatePath}
                    appLocation={appLocation}
                    options={options}
                    scriptFiles={scriptFiles}
                    styleFiles={styleFiles}/>;

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
    }

    return '<!DOCTYPE html>\n' + format(ReactDOMServer.renderToStaticMarkup(element));
};

const format = (html) => {
    var tab = '\t';
    var result = '';
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
