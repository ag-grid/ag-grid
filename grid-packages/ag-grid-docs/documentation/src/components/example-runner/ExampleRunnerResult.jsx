import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './ExampleRunnerResult.module.scss';
import { getIndexHtmlUrl } from './helpers';
import { getIndexHtml } from './index-html-helper';
import isDevelopment from 'utils/is-development';

const ExampleRunnerResult = ({ isVisible, isActive = true, exampleInfo }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);
    const { pageName, name, internalFramework, importType } = exampleInfo;

    useEffect(() => {
        if (isVisible) {
            setShouldExecute(true);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) {
            setShouldExecute(false);
        }
    }, [exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    const iframeRef = React.createRef();

    useEffect(() => {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        if (isDevelopment()) {
            iframeDoc.open();
            iframeDoc.write(shouldExecute ? getIndexHtml(exampleInfo, true) : '');
            iframeDoc.close();
        } else {
            iframe.src = getIndexHtmlUrl(exampleInfo);
        }
    }, [shouldExecute, exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    return <iframe
        key={`${pageName}_${name}_${internalFramework}_${importType}`}
        ref={iframeRef}
        title={name}
        className={classnames(styles['example-runner-result'], { [styles['example-runner-result--hidden']]: !isActive })}></iframe>;
};

export default ExampleRunnerResult;