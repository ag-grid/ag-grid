// Remount component when Fast Refresh is triggered
// @refresh reset

import classNames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedIntegratedCharts } from '../../../components/automated-examples/examples/integrated-charts';
import { INTEGRATED_CHARTS_ID } from '../../../components/automated-examples/lib/constants';
import { OverlayButton } from '../../../components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '../../../components/automated-examples/ToggleAutomatedExampleButton';
import { Icon } from '../../../components/Icon';
import LogoMark from '../../../components/LogoMark';
import { isProductionBuild, localPrefix } from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
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

function AutomatedIntegratedCharts({
    automatedExampleManager,
    scriptDebuggerManager,
    useStaticData,
    runOnce,
    visibilityThreshold,
}) {
    const exampleId = INTEGRATED_CHARTS_ID;
    const gridClassname = 'automated-integrated-charts-grid';
    const gridRef = useRef(null);
    const [scriptIsEnabled, setScriptIsEnabled] = useState(true);
    const [gridIsReady, setGridIsReady] = useState(false);
    const [gridIsHoveredOver, setGridIsHoveredOver] = useState(false);

    const setAllScriptEnabledVars = (isEnabled) => {
        setScriptIsEnabled(isEnabled);
        automatedExampleManager.setEnabled({ id: exampleId, isEnabled });
    };

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (isIntersecting) {
                automatedExampleManager.start(exampleId);
            } else {
                automatedExampleManager.inactive(exampleId);
            }
        },
        threshold: visibilityThreshold,
        isDisabled: !gridIsReady,
    });

    useEffect(() => {
        let params = {
            gridClassname,
            mouseMaskClassname: styles.mouseMask,
            scriptDebuggerManager,
            suppressUpdates: useStaticData,
            useStaticData,
            runOnce,
            onStateChange(state) {
                // Catch errors, and allow the user to use the grid
                if (state === 'stopping') {
                    setAllScriptEnabledVars(false);
                }
            },
            onGridReady() {
                setGridIsReady(true);
            },
            visibilityThreshold,
        };

        automatedExampleManager.add({
            id: exampleId,
            automatedExample: createAutomatedIntegratedCharts(params),
        });
    }, []);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="font-size-gargantuan">Fully Integrated Charting</h2>
                <p className="font-size-large">
                    With a complete suite of integrated charting tools your users can visualise their data any way they
                    choose.
                </p>
                <p className="font-size-large">
                    Intuitive cell selection and simple right-click context menus let users export & chart exactly the
                    data they need. With dazzling themes, dozens of chart types, and a multitude of settings AG Grid
                    charts make data beautiful.
                </p>
            </header>

            <Helmet>{helmet.map((entry) => entry)}</Helmet>
            <div ref={gridRef} className="automated-integrated-charts-grid ag-theme-alpine">
                <OverlayButton
                    ariaLabel="Give me control"
                    isHidden={!scriptIsEnabled}
                    onPointerEnter={() => setGridIsHoveredOver(true)}
                    onPointerOut={() => setGridIsHoveredOver(false)}
                    onClick={() => {
                        setAllScriptEnabledVars(false);
                        automatedExampleManager.stop(exampleId);
                    }}
                />
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>

            <footer className={styles.sectionFooter}>
                <div className={classNames(styles.exploreButtonOuter, 'font-size-large')}>
                    <span className="text-secondary">Live example:</span>
                    <ToggleAutomatedExampleButton
                        onClick={() => {
                            if (scriptIsEnabled) {
                                setAllScriptEnabledVars(false);
                                automatedExampleManager.stop(exampleId);
                            } else {
                                setAllScriptEnabledVars(true);
                                automatedExampleManager.start(exampleId);
                            }
                        }}
                        isHoveredOver={gridIsHoveredOver}
                        scriptIsActive={scriptIsEnabled}
                    ></ToggleAutomatedExampleButton>
                </div>
                <div className="font-size-large">
                    <a
                        className={classNames('font-size-large', styles.getStartedLink)}
                        href={withPrefix('/documentation/')}
                    >
                        Get Started with AG Grid <Icon name="chevronRight" />
                    </a>
                </div>
            </footer>
        </>
    );
}

export default AutomatedIntegratedCharts;
