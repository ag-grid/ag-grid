import React, { useEffect, useState } from 'react';
import fs from 'fs';
import classnames from 'classnames';
import isServerSideRendering from '../../utils/is-server-side-rendering';
import { getIndexHtml } from './index-html-helper';
import styles from './ExampleRunnerResult.module.scss';

const ExampleRunnerResult = ({ isVisible, isActive, exampleInfo }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const { pageName, name, appLocation, framework, internalFramework, type, library, importType } = exampleInfo;
    const indexHtml = getIndexHtml(exampleInfo, true);

    if (isServerSideRendering()) {
        // generate code for the website to read at runtime
        if (type === 'generated' || type === 'mixed') {
            const modulesLocation = appLocation; // because modules is the default

            fs.writeFileSync(`public${modulesLocation}index.html`, indexHtml);

            const packagesLocation = modulesLocation.replace('/modules/', '/packages/');

            fs.writeFileSync(`public${packagesLocation}index.html`, indexHtml);

            if (framework === 'react' && library === 'grid') {
                // need to ensure functional version is also generated
                fs.writeFileSync(`public${modulesLocation.replace('/react/', '/reactFunctional/')}index.html`, indexHtml);
                fs.writeFileSync(`public${packagesLocation.replace('/react/', '/reactFunctional/')}index.html`, indexHtml);
            }
        } else if (type === 'polymer') {
            fs.writeFileSync(`public${appLocation}index.html`, indexHtml);
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
    }, [indexHtml]); // eslint-disable-line react-hooks/exhaustive-deps

    const iframeRef = React.createRef();

    useEffect(() => {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        iframeDoc.open();
        iframeDoc.write(shouldExecute ? indexHtml : '');
        iframeDoc.close();
    }, [shouldExecute, indexHtml]); // eslint-disable-line react-hooks/exhaustive-deps

    return <iframe
        key={`${pageName}_${name}_${internalFramework}_${importType}`}
        ref={iframeRef}
        title={name}
        className={classnames(styles['example-runner-result'], { [styles['example-runner-result--hidden']]: !isActive })}></iframe>;
};

export default ExampleRunnerResult;