// Remount component when Fast Refresh is triggered
// @refresh reset

import classNames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedIntegratedCharts } from '../../../components/automated-examples/examples/integrated-charts';
import { Icon } from '../../../components/Icon';
import LogoMark from '../../../components/LogoMark';
import { hostPrefix, isProductionBuild, localPrefix } from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
import styles from './AutomatedIntegratedCharts.module.scss';

const SCRIPT_ID = 'integrated-charts';

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

function AutomatedIntegratedCharts({
    automatedExampleManager,
    scriptDebuggerManager,
    useStaticData,
    runOnce,
    visibilityThreshold,
}) {
    const gridClassname = 'automated-integrated-charts-grid';
    const gridRef = useRef(null);
    // NOTE: Needs to be a ref instead of useState, as it is passed into a plain JavaScript context
    const scriptEnabled = useRef(true);
    const [gridIsReady, setGridIsReady] = useState(false);

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (isIntersecting) {
                if (scriptEnabled.current) {
                    automatedExampleManager.start(SCRIPT_ID);
                }
            } else {
                automatedExampleManager.inactive(SCRIPT_ID);
            }
        },
        threshold: visibilityThreshold,
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
            visibilityThreshold,
        };

        automatedExampleManager.add({
            id: SCRIPT_ID,
            automatedExample: createAutomatedIntegratedCharts(params),
        });
    }, []);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="font-size-gigantic">Fully Integrated Charting</h2>
                <p>
                    With a complete suite of integrated charting tools your users can visualise their data any way they
                    choose.
                </p>
                <p>
                    Intuitive cell selection and simple right-click context menus let users export & chart exactly the
                    data they need. With dazzling themes, dozens of chart types, and a multitude of settings AG Grid
                    charts make data beautiful.
                </p>
            </header>

            <Helmet>
                {helmet.map((entry) => entry)}
                <style>{mouseStyles}</style>
            </Helmet>
            <div ref={gridRef} className="automated-integrated-charts-grid ag-theme-alpine">
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>

            <footer className={styles.sectionFooter}>
                <button className={styles.exploreExampleButton}>
                    Explore this example <Icon name="centerToFit" />
                </button>
                <a
                    className={classNames('font-size-large', styles.getStartedLink)}
                    href={withPrefix('/documentation/')}
                >
                    Get Started with AG Grid <Icon name="chevronRight" />
                </a>
            </footer>
        </>
    );
}

export default AutomatedIntegratedCharts;
