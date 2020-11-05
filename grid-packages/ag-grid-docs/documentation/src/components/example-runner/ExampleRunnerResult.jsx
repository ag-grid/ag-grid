import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { useExampleFileNodes } from './use-example-file-nodes';
import { generateIndexHtml } from './index-html-generator';
import styles from './example-runner-result.module.scss';

const ExampleRunnerResult = ({ isVisible, exampleInfo }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const nodes = useExampleFileNodes();
    const { name, appLocation: modulesLocation, framework, type } = exampleInfo;
    const generated = generateIndexHtml(nodes, exampleInfo, true);

    if (typeof window === 'undefined' && (type === 'generated' || type === 'mixed')) {
        // generate code for the website to read at runtime
        fs.writeFileSync(`public${modulesLocation}index.html`, generated);

        const packagesLocation = modulesLocation.replace('/modules/', '/packages/');

        fs.writeFileSync(`public${packagesLocation}index.html`, generated);

        if (framework === 'react') {
            // need to ensure functional version is also generated
            fs.writeFileSync(`public${modulesLocation.replace('/react/', '/reactFunctional/')}index.html`, generated);
            fs.writeFileSync(`public${packagesLocation.replace('/react/', '/reactFunctional/')}index.html`, generated);
        }
    }

    useEffect(() => {
        if (isVisible) {
            setShouldExecute(true);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) {
            setShouldExecute(false);
        }
    }, [generated]); // eslint-disable-line react-hooks/exhaustive-deps

    const iframeRef = React.createRef();

    useEffect(() => {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(shouldExecute ? generated : '');
        iframeDoc.close();
    }, [shouldExecute, generated]); // eslint-disable-line react-hooks/exhaustive-deps

    return <iframe ref={iframeRef} title={name} className={styles.exampleRunnerResult}></iframe>;
};

export default ExampleRunnerResult;