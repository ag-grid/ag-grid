// Remount component when Fast Refresh is triggered
// @refresh reset

import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createAutomatedIntegratedCharts } from '../../../components/automated-examples/examples/integrated-charts';
import { INTEGRATED_CHARTS_ID } from '../../../components/automated-examples/lib/constants';
import automatedExamplesVars from '../../../components/automated-examples/lib/vars.module.scss';
import { OverlayButton } from '../../../components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '../../../components/automated-examples/ToggleAutomatedExampleButton';
import { useGlobalContext } from '../../../components/GlobalContext';
import LogoMark from '../../../components/LogoMark';
import breakpoints from '../../../design-system/breakpoint.module.scss';
import {
    trackHomepageExampleIntegratedCharts,
    trackOnceHomepageExampleIntegratedCharts,
} from '../../../utils/analytics';
import {
    agGridEnterpriseVersion,
    hostPrefix,
    integratedChartsUsesChartsEnterprise,
    isProductionBuild,
    localPrefix
} from '../../../utils/consts';
import { useIntersectionObserver } from '../../../utils/use-intersection-observer';
import styles from './AutomatedIntegratedCharts.module.scss';

const AUTOMATED_EXAMPLE_MEDIUM_WIDTH = parseInt(breakpoints['automated-row-grouping-medium'], 10);
const AUTOMATED_EXAMPLE_MOBILE_SCALE = parseFloat(automatedExamplesVars['mobile-grid-scale']);

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
            src={`https://cdn.jsdelivr.net/npm/ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise@${agGridEnterpriseVersion}/dist/ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise.min.js`}
            type="text/javascript"
        />
    );
}

function AutomatedIntegratedCharts({ automatedExampleManager, useStaticData, runOnce, visibilityThreshold }) {
    const exampleId = INTEGRATED_CHARTS_ID;
    const gridClassname = 'automated-integrated-charts-grid';
    const gridRef = useRef(null);
    const overlayRef = useRef(null);
    const [scriptIsEnabled, setScriptIsEnabled] = useState(true);
    const [gridIsReady, setGridIsReady] = useState(false);
    const [automatedExample, setAutomatedExample] = useState();
    const [gridIsHoveredOver, setGridIsHoveredOver] = useState(false);
    const { darkMode } = useGlobalContext();
    const debuggerManager = automatedExampleManager?.getDebuggerManager();
    const isMobile = () => window.innerWidth <= AUTOMATED_EXAMPLE_MEDIUM_WIDTH;

    const setAllScriptEnabledVars = (isEnabled) => {
        setScriptIsEnabled(isEnabled);
        automatedExampleManager.setEnabled({ id: exampleId, isEnabled });
    };
    const gridInteraction = useCallback(() => {
        if (!scriptIsEnabled) {
            trackOnceHomepageExampleIntegratedCharts({
                type: 'interactedWithGrid',
            });
        }
    }, [scriptIsEnabled]);

    useIntersectionObserver({
        elementRef: gridRef,
        onChange: ({ isIntersecting }) => {
            if (isIntersecting) {
                debuggerManager.log(`${exampleId} intersecting - start`);
                automatedExampleManager.start(exampleId);

                trackOnceHomepageExampleIntegratedCharts({
                    type: 'hasStarted',
                });
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
            darkMode,
            getOverlay: () => {
                return overlayRef.current;
            },
            getContainerScale: () => {
                const isMobileWidth = window.innerWidth <= AUTOMATED_EXAMPLE_MEDIUM_WIDTH;
                return isMobileWidth ? AUTOMATED_EXAMPLE_MOBILE_SCALE : 1;
            },
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
                    icon: `<img src="${hostPrefix}/images/automated-examples/replay-demo-icon-dark.svg" />`,
                },
            ],
            onStateChange(state) {
                if (state === 'errored' && !isMobile()) {
                    setAllScriptEnabledVars(false);
                    automatedExampleManager.errored(exampleId);
                }
            },
            onGridReady() {
                setGridIsReady(true);
            },
            visibilityThreshold,
        };

        const automatedExample = createAutomatedIntegratedCharts(params);
        automatedExampleManager.add({
            id: exampleId,
            automatedExample,
        });

        setAutomatedExample(automatedExample);
    }, []);

    useEffect(() => {
        if (!automatedExample) {
            return;
        }
        automatedExample.updateDarkMode(darkMode);
    }, [darkMode])

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="text-3xl">Fully Integrated Charting</h2>
                <p className="text-xl">
                    With a complete suite of integrated charting tools, your users can visualise their data any way they
                    choose.
                </p>
            </header>

            <Helmet>{helmet.map((entry) => entry)}</Helmet>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div ref={gridRef} className={classNames("automated-integrated-charts-grid", {
                "ag-theme-quartz": !darkMode,
                "ag-theme-quartz-dark": darkMode,
            })} onClick={gridInteraction}>
                <OverlayButton
                    ref={overlayRef}
                    ariaLabel="Give me control"
                    isHidden={!scriptIsEnabled}
                    onPointerEnter={() => setGridIsHoveredOver(true)}
                    onPointerOut={() => setGridIsHoveredOver(false)}
                    onClick={() => {
                        if (!isMobile()) {
                            setAllScriptEnabledVars(false);
                            automatedExampleManager.stop(exampleId);

                            trackHomepageExampleIntegratedCharts({
                                type: 'controlGridClick',
                                clickType: 'overlay',
                            });
                        }
                    }}
                />
                {!gridIsReady && !useStaticData && <LogoMark isSpinning />}
            </div>

            <footer className={styles.sectionFooter}>
                <div className={classNames(styles.exploreButtonOuter, 'text-xl')}>
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

                            trackHomepageExampleIntegratedCharts({
                                type: 'controlGridClick',
                                clickType: 'button',
                                value: scriptIsEnabled ? 'stop' : 'start',
                            });
                        }}
                        isHoveredOver={gridIsHoveredOver}
                        scriptIsActive={scriptIsEnabled}
                    ></ToggleAutomatedExampleButton>
                </div>
            </footer>
        </>
    );
}

export default AutomatedIntegratedCharts;
