import React, { useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useStaticQuery, graphql } from 'gatsby';
import fs from 'fs';
import './example-runner-result.scss';
import { getSourcePath } from './helpers';

const ExampleRunnerResult = ({ pageName, name, framework, importType = 'modules', useFunctionalReact = false }) => {
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

    const sourceRootFolder = getSourcePath(pageName, name, framework, importType, useFunctionalReact);

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

        default: element =
            <html lang="en">
                <body>
                    <div>{name} -- {framework}</div>
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
        // TODO: make this only happen when it scrolls into view
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(generated);
        iframeDoc.close();
    }, []);

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

const VanillaTemplate = ({ indexFragment, scriptFiles }) => {
    return <html lang="en">
        <head>
            <script dangerouslySetInnerHTML={{ __html: "var __basePath = '/';" }}></script>
            <style media="only screen">
                {`html, body {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch;
                }

                html {
                    position: absolute;
                    top: 0;
                    left: 0;
                    padding: 0;
                    overflow: auto;
                }

                body {
                    padding: 1rem;
                    overflow: auto;
                }`}
            </style>
            <script src="https://unpkg.com/@ag-grid-community/all-modules@24.1.0/dist/ag-grid-community.min.js"></script>
        </head>

        <body>
            <div style={{ height: '100%', boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: indexFragment }}></div>
            {scriptFiles.map(script => <script key={script} src={script}></script>)}
        </body>
    </html >;
};

export default ExampleRunnerResult;