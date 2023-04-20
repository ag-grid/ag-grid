// Remount component when Fast Refresh is triggered
// @refresh reset

import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedRowGrouping } from '../../../components/automated-examples/examples/row-grouping';
import { ROW_GROUPING_ID } from '../../../components/automated-examples/lib/constants';
import { OverlayButton } from '../../../components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '../../../components/automated-examples/ToggleAutomatedExampleButton';
import { UpdateSpeedSlider } from '../../../components/automated-examples/UpdateSpeedSlider';
import LogoMark from '../../../components/LogoMark';
import { hostPrefix, isProductionBuild, localPrefix } from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
import styles from './AutomatedRowGrouping.module.scss';
import FeaturesList from './FeaturesList';

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

function AutomatedRowGrouping({ automatedExampleManager, useStaticData, runOnce, visibilityThreshold }) {
    const exampleId = ROW_GROUPING_ID;
    const gridClassname = 'automated-row-grouping-grid';
    const gridRef = useRef(null);
    const exampleRef = useRef(null);
    const [scriptIsEnabled, setScriptIsEnabled] = useState(true);
    const [gridIsReady, setGridIsReady] = useState(false);
    const [gridIsHoveredOver, setGridIsHoveredOver] = useState(false);
    const [frequency, setFrequency] = useState(1);
    const debuggerManager = automatedExampleManager?.getDebuggerManager();

    const setAllScriptEnabledVars = (isEnabled) => {
        setScriptIsEnabled(isEnabled);
        automatedExampleManager.setEnabled({ id: exampleId, isEnabled });
    };
    const updateFrequency = useCallback((value) => {
        if (!exampleRef.current) {
            return;
        }
        exampleRef.current.setUpdateFrequency(value);
        setFrequency(value);
    }, []);

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (isIntersecting) {
                debuggerManager.log(`${exampleId} intersecting - start`);
                automatedExampleManager.start(exampleId);
            } else {
                debuggerManager.log(`${exampleId} not intersecting - inactive`);
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
            scriptDebuggerManager: debuggerManager,
            suppressUpdates: useStaticData,
            useStaticData,
            runOnce,
            additionalContextMenuItems: [
                {
                    name: 'Replay Demo',
                    action: () => {
                        setAllScriptEnabledVars(true);
                        automatedExampleManager.start(exampleId);
                    },
                    icon: `<img src="${hostPrefix}/images/homepage/replay-demo-icon.svg" />`,
                },
            ],
            onStateChange(state) {
                if (state === 'errored') {
                    setAllScriptEnabledVars(false);
                    automatedExampleManager.errored(exampleId);
                }
            },
            onGridReady() {
                setGridIsReady(true);
            },
            visibilityThreshold,
        };

        exampleRef.current = createAutomatedRowGrouping(params);
        automatedExampleManager.add({
            id: exampleId,
            automatedExample: exampleRef.current,
        });
    }, []);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="font-size-gargantuan">Feature Packed, Incredible Performance</h2>
                <p className="font-size-extra-large">
                    Millions of rows, thousands of updates per second? No problem!
                    <br />
                    Out of the box performance that can handle any data you can throw at it.
                </p>
            </header>

            <Helmet>{helmet.map((entry) => entry)}</Helmet>
            <div ref={gridRef} className="automated-row-grouping-grid ag-theme-alpine-dark">
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
                <div className={classNames(styles.exploreButtonOuter, 'font-size-extra-large')}>
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

                <UpdateSpeedSlider
                    min={0}
                    max={4}
                    step={0.1}
                    value={frequency}
                    disabled={!gridIsReady}
                    setValue={updateFrequency}
                />
            </footer>

            <FeaturesList />
        </>
    );
}

export default AutomatedRowGrouping;
