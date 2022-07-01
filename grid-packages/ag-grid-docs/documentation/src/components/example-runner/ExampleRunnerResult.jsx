import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './ExampleRunnerResult.module.scss';
import { getIndexHtmlUrl } from './helpers';
import { getIndexHtml } from './index-html-helper';
import isDevelopment from 'utils/is-development';

/**
 * This executes the given example in an iframe.
 */
const ExampleRunnerResult = ({ isOnScreen = true, resultFrameIsVisible = true, exampleInfo }) => {
    const [isExecuting, setExecuting] = useState(isOnScreen && resultFrameIsVisible);
    const { pageName, name, internalFramework, importType, type } = exampleInfo;

    useEffect(() => {
        // trigger the example to execute when it is on screen and the result pane is visible
        if (isOnScreen && resultFrameIsVisible && !isExecuting) {
            setExecuting(true);
        }
    }, [isOnScreen, resultFrameIsVisible]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // if the example info changes (e.g. if modules and switched to packages) and the example is off screen,
        // stop it executing
        if (!isOnScreen && isExecuting) {
            setExecuting(false);
        }
    }, [exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    const iframeRef = React.createRef();

    useEffect(() => {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        if (isDevelopment()) {
            // in development mode we generate the index HTML on the fly and inject it into the iframe
            iframeDoc.open();
            iframeDoc.write(isExecuting ? getIndexHtml(exampleInfo, true) : '');
            iframeDoc.close();
        } else {
            iframe.src = isExecuting ? getIndexHtmlUrl(exampleInfo) : '';
        }
    }, [isExecuting, exampleInfo]); // eslint-disable-line react-hooks/exhaustive-deps

    return <iframe
        key={`${pageName}_${name}_${internalFramework}_${importType}`}
        ref={iframeRef}
        title={name}
        className={classnames(styles['example-runner-result'], { [styles['example-runner-result--hidden']]: !resultFrameIsVisible })} />;
};

export default ExampleRunnerResult;
