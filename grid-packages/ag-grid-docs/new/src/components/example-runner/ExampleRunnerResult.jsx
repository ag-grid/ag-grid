import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useStaticQuery, graphql } from 'gatsby';
import fs from 'fs';
import './example-runner-result.scss';
import { getAppLocation, getInternalFramework, getSourcePath } from './helpers';
import VanillaTemplate from './VanillaTemplate';
import AngularTemplate from './AngularTemplate';
import ReactTemplate from './ReactTemplate';
import VueTemplate from './VueTemplate';

const ExampleRunnerResult = ({ isVisible, pageName, name, framework, importType = 'modules', useFunctionalReact = false, options = {} }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const files = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "examples" }, relativePath: { regex: "/.*\/examples\/.*/" } }) {
            nodes {
                publicURL
                relativePath
                base
                childHtmlRehype {
                    html
                }
            }
        }
    }
    `).allFile.nodes;

    const internalFramework = getInternalFramework(framework, useFunctionalReact);
    const sourceRootFolder = getSourcePath(pageName, name, internalFramework, importType);

    const getExampleFile = name => files.filter(file => file.relativePath === sourceRootFolder + name)[0];

    const getExampleFileUrls = (extension, exclude) => files
        .filter(file => file.relativePath.startsWith(sourceRootFolder) && file.base.endsWith(`.${extension}`) && (!exclude || file.base !== exclude))
        .map(file => file.publicURL);

    const appLocation = getAppLocation(pageName, name, internalFramework, importType);
    const scriptFiles = getExampleFileUrls('js', 'main.js');
    const styleFiles = getExampleFileUrls('css');

    let element;

    switch (framework) {
        case 'javascript':
            element = <VanillaTemplate
                appLocation={appLocation}
                options={options}
                indexFragment={getExampleFile('index.html').childHtmlRehype.html}
                scriptFiles={[...scriptFiles, getExampleFile('main.js').publicURL]}
                styleFiles={styleFiles} />;

            break;

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
                appLocation={appLocation}
                options={options}
                scriptFiles={scriptFiles}
                styleFiles={styleFiles} />;
            break;
        }

        default: element =
            <html lang="en">
                <body>
                    <div>An unknown framework "{framework}" was requested.</div>
                </body>
            </html>;
            break;
    }

    const rootFolder = `public/example-runner/${pageName}/${name}/${framework}`;
    const generated = '<!DOCTYPE html>\n' + format(ReactDOMServer.renderToStaticMarkup(element));
    const iframeRef = React.createRef();

    if (typeof window === 'undefined') {
        // generate code for the website to read at runtime
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder, { recursive: true });
        }

        fs.writeFileSync(`${rootFolder}/index.html`, generated);
    }

    useEffect(() => {
        if (isVisible) {
            setShouldExecute(true);
        }
    }, [isVisible]);

    useEffect(() => {
        if (shouldExecute) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            iframeDoc.open();
            iframeDoc.write(generated);
            iframeDoc.close();
        }
    }, [shouldExecute]);

    return <iframe ref={iframeRef} title={name} className="example-runner-result"></iframe>;
};

const format = (html) => {
    var tab = '\t';
    var result = '';
    var indent = '';

    html.split(/>\s*</).forEach(function(element) {
        if (element.match(/^\/\w/)) {
            indent = indent.substring(tab.length);
        }

        result += indent + '<' + element + '>\r\n';

        if (element.match(/^<?\w[^>]*[^/]$/)) {
            indent += tab;
        }
    });

    return result.substring(1, result.length - 3);
};

export default ExampleRunnerResult;