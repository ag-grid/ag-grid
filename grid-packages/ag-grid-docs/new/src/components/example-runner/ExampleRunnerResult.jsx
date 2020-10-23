import './example-runner-result.scss';
import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { useExampleFileNodes } from './use-example-file-nodes';
import { generateIndexHtml } from './index-html-generator';

const ExampleRunnerResult = ({ isVisible, exampleInfo }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const nodes = useExampleFileNodes();
    const { pageName, name, framework } = exampleInfo;
    const generated = generateIndexHtml(nodes, exampleInfo, true);
    const rootFolder = `public/example-runner/${pageName}/${name}/${framework}`;

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

    const iframeRef = React.createRef();

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

export default ExampleRunnerResult;