import { OverlayButton } from '@ag-website-shared/components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '@ag-website-shared/components/automated-examples/ToggleAutomatedExampleButton';
import { createAutomatedIntegratedCharts } from '@ag-website-shared/components/automated-examples/examples/integrated-charts';
import { INTEGRATED_CHARTS_ID } from '@ag-website-shared/components/automated-examples/lib/constants';
import LogoMark from '@components/logo/LogoMark';
import { trackHomepageExampleIntegratedCharts, trackOnceHomepageExampleIntegratedCharts } from '@utils/analytics';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { useIntersectionObserver } from '@utils/hooks/useIntersectionObserver';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import automatedExamplesVars from './AutomatedExamplesVars.module.scss';
import styles from './AutomatedIntegratedCharts.module.scss';
import { isMobile } from './lib/isMobile';

const AUTOMATED_EXAMPLE_MOBILE_SCALE = parseFloat(automatedExamplesVars['mobile-grid-scale']);

export function AutomatedIntegratedCharts({ automatedExampleManager, useStaticData, runOnce, visibilityThreshold }) {
    const exampleId = INTEGRATED_CHARTS_ID;
    const gridClassname = 'automated-integrated-charts-grid';
    const gridRef = useRef(null);
    const overlayRef = useRef(null);
    const [scriptIsEnabled, setScriptIsEnabled] = useState(true);
    const [gridIsReady, setGridIsReady] = useState(false);
    const [automatedExample, setAutomatedExample] = useState();
    const [gridIsHoveredOver, setGridIsHoveredOver] = useState(false);
    const [darkMode] = useDarkmode();
    const debuggerManager = automatedExampleManager?.getDebuggerManager();

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
        const params = {
            gridClassname,
            darkMode,
            getOverlay: () => {
                return overlayRef.current;
            },
            getContainerScale: () => {
                return isMobile() ? AUTOMATED_EXAMPLE_MOBILE_SCALE : 1;
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
                    icon: `<img class="context-replay-icon" src="${urlWithBaseUrl('/images/automated-examples/replay-demo-icon-dark.svg')}" />`,
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
    }, [darkMode]);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="text-3xl">Fully Integrated Charting</h2>
                <p className="text-xl">
                    With a complete suite of integrated charting tools, your users can visualise their data any way they
                    choose.
                </p>
            </header>
            <div
                ref={gridRef}
                className={classNames('automated-integrated-charts-grid', {
                    'ag-theme-quartz': !darkMode,
                    'ag-theme-quartz-dark': darkMode,
                })}
                onClick={gridInteraction}
            >
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
