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

const ExampleRunnerResult = ({ pageName, name, framework, importType = 'modules', useFunctionalReact = false, isVisible }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const data = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "examples" }, relativePath: { regex: "/.*\/examples\/.*/" } }) {
            edges {
                node {
                    publicURL
                    relativePath
                    base
                    childHtmlRehype {
                        html
                    }
                }
            }
        }
    }
    `);

    const internalFramework = getInternalFramework(framework, useFunctionalReact);
    const sourceRootFolder = getSourcePath(pageName, name, internalFramework, importType);
    const appLocation = getAppLocation(pageName, name, internalFramework, importType);

    let element;

    switch (framework) {
        case 'javascript': {
            const indexFile = data.allFile.edges
                .filter(edge => edge.node.relativePath === `${sourceRootFolder}index.html`)[0];

            const scriptFiles = data.allFile.edges
                .filter(edge => edge.node.relativePath.startsWith(sourceRootFolder) && edge.node.base.endsWith('.js'))
                .map(edge => edge.node.publicURL);

            element = <VanillaTemplate indexFragment={indexFile.node.childHtmlRehype.html} scriptFiles={scriptFiles} />;

            break;
        }

        case 'angular': {
            element = <AngularTemplate appLocation={appLocation} />;
            break;
        }

        case 'react': {
            element = <ReactTemplate appLocation={appLocation} />;
            break;
        }

        case 'vue': {
            element = <VueTemplate appLocation={appLocation} />;
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