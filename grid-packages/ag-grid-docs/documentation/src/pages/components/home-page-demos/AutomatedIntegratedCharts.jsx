// Remount component when Fast Refresh is triggered
// @refresh reset

import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedIntegratedCharts } from '../../../components/automated-examples/integrated-charts';
import { Splash } from '../../../components/automated-examples/Splash';
import { Icon } from '../../../components/Icon';
import LogoMark from '../../../components/LogoMark';
import { hostPrefix, isProductionBuild, localPrefix } from '../../../utils/consts';
import styles from './AutomatedIntegratedCharts.module.scss';

const helmet = [];
if (!isProductionBuild()) {
    helmet.push(
        <link
            key="hero-grid-theme"
            rel="stylesheet"
            href={`${localPrefix}/@ag-grid-community/styles/ag-theme-alpine.css`}
            crossOrigin="anonymous"
            type="text/css"
        />
    );
    helmet.push(
        <script
            key="enterprise-lib"
            src={`${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.js`}
            type="text/javascript"
        />
    );
} else {
    helmet.push(
        <script
            key="enterprise-lib"
            src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise/dist/ag-grid-enterprise.min.js"
            type="text/javascript"
        />
    );
}

const mouseStyles = `
    .automated-integrated-charts-grid .ag-root-wrapper,
    .automated-integrated-charts-grid .ag-root-wrapper * {
        cursor: url(${hostPrefix}/images/cursor/automated-example-cursor.svg) 22 21, pointer !important;
    }
`;

function AutomatedIntegratedCharts({ scriptDebuggerManager, useStaticData, runOnce }) {
    const gridClassname = 'automated-integrated-charts-grid';
    const automatedScript = useRef(null);
    // NOTE: Needs to be a ref instead of useState, as it is passed into a plain JavaScript context
    const scriptEnabled = useRef(true);
    const [gridIsReady, setGridIsReady] = useState(false);

    const onSplashHide = useCallback(() => {
        if (!automatedScript.current) {
            return true;
        }

        scriptEnabled.current = false;
        automatedScript.current.stop();
    }, [scriptEnabled.current, automatedScript.current]);

    const onSplashShow = useCallback(() => {
        scriptEnabled.current = true;
        automatedScript.current.start();
    }, [scriptEnabled.current, automatedScript.current]);

    const scriptIsEnabled = () => {
        return scriptEnabled.current;
    };

    useEffect(() => {
        let params = {
            gridClassname,
            mouseMaskClassname: styles.mouseMask,
            scriptIsEnabled,
            scriptDebuggerManager,
            suppressUpdates: useStaticData,
            useStaticData,
            runOnce,
            onGridReady() {
                setGridIsReady(true);
            },
        };

        automatedScript.current = createAutomatedIntegratedCharts(params);
    }, []);

    return (
        <>
            <Helmet>
                {helmet.map((entry) => entry)}
                <style>{mouseStyles}</style>
            </Helmet>
            <div
                style={{ height: '100%', width: '100%' }}
                className="automated-integrated-charts-grid ag-theme-alpine-dark"
            >
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>
            <Splash
                width="30%"
                contentOffset="20%"
                hideOverlayClickTarget
                onSplashHide={onSplashHide}
                onSplashShow={onSplashShow}
                renderContent={({ hideSplash, setClickTargetHover }) => {
                    return (
                        <div className={classnames(styles.contents, 'font-size-large')}>
                            <div className={styles.contentsInner}>
                                <h2 className="font-size-massive">Integrated Charts</h2>
                                <p>
                                    Visualise and analyse your data seemlessly.
                                    <br />
                                    Create charts directly inside the grid with an intuitive UI and comprehensive API.
                                </p>
                                <button
                                    className={styles.exploreExampleButton}
                                    onClick={hideSplash}
                                    onPointerEnter={() => {
                                        setClickTargetHover(true);
                                    }}
                                    onPointerOut={() => {
                                        setClickTargetHover(false);
                                    }}
                                >
                                    Explore this example <Icon name="centerToFit" />
                                </button>
                                <a className={styles.getStartedLink} href={withPrefix('/documentation/')}>
                                    Get Started with AG Grid <Icon name="chevronRight" />
                                </a>
                            </div>
                        </div>
                    );
                }}
            />
        </>
    );
}

export default AutomatedIntegratedCharts;
