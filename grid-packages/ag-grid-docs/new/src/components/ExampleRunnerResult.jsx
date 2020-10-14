import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import './example-runner-result.scss';

const ExampleRunnerResult = ({ pageName, framework, name }) => {
    const rootFolder = `public/example-runner/${pageName}/${name}/${framework}`;
    const element =
        <html lang="en">
            <body>
                <div>{name} -- {framework}</div>
            </body>
        </html>;

    const generated = '<!DOCTYPE html>\n' + format(ReactDOMServer.renderToStaticMarkup(element));

    if (typeof window === 'undefined') {
        // generate code for the website to read at runtime
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder, { recursive: true });
        }

        fs.writeFileSync(`${rootFolder}/index.html`, generated);
    }

    return <iframe title={name} className="example-runner-result" src={`javascript: '${generated}'`}></iframe>;
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