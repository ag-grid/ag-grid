import { AutomatedExample } from '../types';
import { AUTOMATED_EXAMPLE_MANAGER_ID, INTEGRATED_CHARTS_ID, ROW_GROUPING_ID } from './constants';
import { createScriptDebuggerManager } from './scriptDebugger';

export type AutomatedExampleManager = ReturnType<typeof createAutomatedExampleManager>;

export type AutomatedExampleState = 'idle' | 'playingRowGrouping' | 'playingIntegratedCharts';

const logId = AUTOMATED_EXAMPLE_MANAGER_ID;

interface Params {
    debugCanvasClassname: string;
    debugPanelClassname: string;
}

export function createAutomatedExampleManager({ debugCanvasClassname, debugPanelClassname }: Params) {
    const exampleDebuggerManager = createScriptDebuggerManager({
        canvasClassname: debugCanvasClassname,
        panelClassname: debugPanelClassname,
    });
    const automatedExamples: Record<string, AutomatedExample> = {};
    const automatedExamplesEnabled: Record<string, boolean> = {};

    let automatedExampleState: AutomatedExampleState;

    const updateState = (state: AutomatedExampleState) => {
        exampleDebuggerManager.log(`${logId} state: ${state}`);
        automatedExampleState = state;
    };

    const add = ({
        id,
        automatedExample,
        isDisabled,
    }: {
        id: string;
        automatedExample: AutomatedExample;
        isDisabled?: boolean;
    }) => {
        automatedExamples[id] = automatedExample;
        automatedExamplesEnabled[id] = !isDisabled;
    };

    const start = (id: string) => {
        const automatedExample = automatedExamples[id];
        const isEnabled = automatedExamplesEnabled[id];

        if (!automatedExample) {
            console.error('Automated example not found:', id);
            return;
        } else if (!isEnabled) {
            return;
        }

        if (automatedExampleState === 'idle') {
            automatedExample.start();

            if (id === ROW_GROUPING_ID) {
                updateState('playingRowGrouping');
            } else if (id === INTEGRATED_CHARTS_ID) {
                updateState('playingIntegratedCharts');
            }
        } else if (automatedExampleState === 'playingRowGrouping') {
            if (id === ROW_GROUPING_ID) {
                // Started already, ignore
            } else if (id === INTEGRATED_CHARTS_ID) {
                automatedExamples[ROW_GROUPING_ID].stop();

                automatedExample.start();
                updateState('playingIntegratedCharts');
            }
        } else if (automatedExampleState === 'playingIntegratedCharts') {
            if (id === ROW_GROUPING_ID) {
                automatedExamples[INTEGRATED_CHARTS_ID].stop();

                automatedExample.start();
                updateState('playingRowGrouping');
            } else if (id === INTEGRATED_CHARTS_ID) {
                // Started already, ignore
            }
        }
    };

    const stop = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        automatedExample.stop();
        updateState('idle');
    };

    const inactive = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        if (automatedExampleState === 'idle') {
            // Nothing to do, it's already idle
        } else if (automatedExampleState === 'playingRowGrouping') {
            if (id === ROW_GROUPING_ID) {
                let state: AutomatedExampleState = 'idle';
                automatedExample.inactive();

                const otherKey = INTEGRATED_CHARTS_ID;
                const otherExample = automatedExamples[otherKey];
                if (otherExample) {
                    const otherExampleIsEnabled = automatedExamplesEnabled[otherKey];
                    const otherExampleIsInViewport = otherExample.isInViewport();

                    if (otherExampleIsEnabled && otherExampleIsInViewport) {
                        otherExample.start();
                        state = 'playingIntegratedCharts';
                    }
                }

                updateState(state);
            } else if (id === INTEGRATED_CHARTS_ID) {
                automatedExample.inactive();
                // State stays the same
            }
        } else if (automatedExampleState === 'playingIntegratedCharts') {
            if (id === ROW_GROUPING_ID) {
                automatedExample.inactive();
                // State stays the same
            } else if (id === INTEGRATED_CHARTS_ID) {
                let state: AutomatedExampleState = 'idle';
                automatedExample.inactive();

                const otherKey = ROW_GROUPING_ID;
                const otherExample = automatedExamples[otherKey];
                if (otherExample) {
                    const otherExampleIsEnabled = automatedExamplesEnabled[otherKey];
                    const otherExampleIsInViewport = otherExample.isInViewport();

                    if (otherExampleIsEnabled && otherExampleIsInViewport) {
                        otherExample.start();
                        state = 'playingRowGrouping';
                    }
                }
                updateState(state);
            }
        }
    };

    const errored = (id: string) => {
        const automatedExample = automatedExamples[id];

        if (!automatedExample) {
            return;
        }

        if (automatedExampleState === 'idle') {
            // Nothing to do, it's already idle
        } else if (automatedExampleState === 'playingRowGrouping') {
            if (id === ROW_GROUPING_ID) {
                updateState('idle');
            } else if (id === INTEGRATED_CHARTS_ID) {
                // State stays the same
            }
        } else if (automatedExampleState === 'playingIntegratedCharts') {
            if (id === ROW_GROUPING_ID) {
                // State stays the same
            } else if (id === INTEGRATED_CHARTS_ID) {
                updateState('idle');
            }
        }
    };

    const setEnabled = ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
        automatedExamplesEnabled[id] = isEnabled;
    };

    const getEnabled = (id: string) => automatedExamplesEnabled[id];

    const setDebugEnabled = (enabled: boolean) => {
        exampleDebuggerManager.setEnabled(enabled);
    };

    const setDebugInitialDraw = (shouldDraw: boolean) => {
        exampleDebuggerManager.setInitialDraw(shouldDraw);
    };

    const getDebuggerManager = () => {
        return exampleDebuggerManager;
    };

    updateState('idle');

    return {
        add,
        start,
        stop,
        inactive,
        errored,
        setEnabled,
        getEnabled,
        setDebugEnabled,
        setDebugInitialDraw,
        getDebuggerManager,
    };
}
