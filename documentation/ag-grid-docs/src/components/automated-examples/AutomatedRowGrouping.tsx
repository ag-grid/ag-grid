import { OverlayButton } from '@components/automated-examples/OverlayButton';
import { ToggleAutomatedExampleButton } from '@components/automated-examples/ToggleAutomatedExampleButton';
import { UpdateSpeedSlider } from '@components/automated-examples/UpdateSpeedSlider';
import { createAutomatedRowGrouping } from '@components/automated-examples/examples/row-grouping';
import { ROW_GROUPING_ID } from '@components/automated-examples/lib/constants';
import LogoMark from '@components/logo/LogoMark';
import breakpoints from '@design-system/breakpoint.module.scss';
import automatedExamplesVars from '@legacy-design-system/modules/AutomatedExamplesVars.module.scss';
import styles from '@legacy-design-system/modules/AutomatedRowGrouping.module.scss';
import { trackHomepageExampleRowGrouping, trackOnceHomepageExampleRowGrouping } from '@utils/analytics';
import { useIntersectionObserver } from '@utils/hooks/useIntersectionObserver';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { AutomatedExampleManager } from './lib/createAutomatedExampleManager';

const AUTOMATED_EXAMPLE_MEDIUM_WIDTH = parseInt(breakpoints['automated-row-grouping-medium'], 10);
const AUTOMATED_EXAMPLE_MOBILE_SCALE = parseFloat(automatedExamplesVars['mobile-grid-scale']);

interface Props {
    automatedExampleManager: AutomatedExampleManager;
    useStaticData: boolean;
    runOnce: boolean;
    visibilityThreshold: number;
    darkMode: boolean;
}

export function AutomatedRowGrouping({
    automatedExampleManager,
    useStaticData,
    runOnce,
    visibilityThreshold,
    darkMode,
}: Props) {
    const exampleId = ROW_GROUPING_ID;
    const gridClassname = 'automated-row-grouping-grid';
    const gridRef = useRef(null);
    const exampleRef = useRef(null);
    const overlayRef = useRef(null);
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

        trackOnceHomepageExampleRowGrouping({
            type: 'updatedFrequency',
        });
    }, []);
    const gridInteraction = useCallback(() => {
        if (!scriptIsEnabled) {
            trackOnceHomepageExampleRowGrouping({
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

                trackOnceHomepageExampleRowGrouping({
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
                    icon: `<img src="${urlWithBaseUrl('/images/automated-examples/replay-demo-icon.svg')}" />`,
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

    useEffect(() => {
        if (!exampleRef.current) {
            return;
        }
        exampleRef.current.updateDarkMode(darkMode);
    }, [darkMode]);

    return (
        <>
            <header className={styles.sectionHeader}>
                <h2 className="text-3xl">Feature Packed, Incredible Performance</h2>
                <p className="text-xl">
                    Millions of rows, thousands of updates per second? No problem!
                    <br />
                    Out of the box performance that can handle any data you can throw at it.
                </p>
            </header>

            <div
                ref={gridRef}
                className={classNames('automated-row-grouping-grid', {
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
                        setAllScriptEnabledVars(false);
                        automatedExampleManager.stop(exampleId);

                        trackHomepageExampleRowGrouping({
                            type: 'controlGridClick',
                            clickType: 'overlay',
                        });
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

                            trackHomepageExampleRowGrouping({
                                type: 'controlGridClick',
                                clickType: 'button',
                                value: scriptIsEnabled ? 'stop' : 'start',
                            });
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
        </>
    );
}
