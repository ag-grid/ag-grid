// Remount component when Fast Refresh is triggered
// @refresh reset

import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedRowGrouping } from '../../../components/automated-examples/examples/row-grouping';
import { Splash } from '../../../components/automated-examples/Splash';
import { Icon } from '../../../components/Icon';
import LogoMark from '../../../components/LogoMark';
import { hostPrefix, isProductionBuild, localPrefix } from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
import styles from './AutomatedRowGrouping.module.scss';

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
    .automated-row-grouping-grid .ag-root-wrapper,
    .automated-row-grouping-grid .ag-root-wrapper * {
        cursor: url(${hostPrefix}/images/cursor/automated-example-cursor.svg) 22 21, pointer !important;
    }
`;

function AutomatedRowGrouping({ scriptDebuggerManager, useStaticData, runOnce }) {
    const gridClassname = 'automated-row-grouping-grid';
    const gridRef = useRef(null);
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

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (!automatedScript.current) {
                return;
            }
            if (isIntersecting) {
                if (automatedScript.current.currentState() !== 'playing' && scriptEnabled.current) {
                    automatedScript.current.start();
                }
                return;
            }
            automatedScript.current.inactive();
        },
    });

    useEffect(() => {
        let params = {
            gridClassname,
            mouseMaskClassname: styles.mouseMask,
            scriptDebuggerManager,
            suppressUpdates: useStaticData,
            useStaticData,
            runOnce,
            onGridReady() {
                setGridIsReady(true);
            },
        };

        automatedScript.current = createAutomatedRowGrouping(params);
    }, []);

    return (
        <>
            <Helmet>
                {helmet.map((entry) => entry)}
                <style>{mouseStyles}</style>
            </Helmet>
            <div
                ref={gridRef}
                style={{ height: '100%', width: '100%' }}
                className="automated-row-grouping-grid ag-theme-alpine-dark"
            >
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>
            <Splash
                onSplashHide={onSplashHide}
                onSplashShow={onSplashShow}
                renderContent={({ hideSplash, setClickTargetHover }) => {
                    return (
                        <div className={classnames(styles.contents, 'font-size-large')}>
                            <div className={styles.contentsInner}>
                                <h2 className="font-size-massive">
                                    Feature Packed,
                                    <br />
                                    Incredible Performance
                                </h2>
                                <p>
                                    All the features your users expect and more. Out of the box performance that can
                                    handle any data you can throw&nbsp;at&nbsp;it.
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

export default AutomatedRowGrouping;
