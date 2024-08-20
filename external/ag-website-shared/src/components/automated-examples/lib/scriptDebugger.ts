import { AUTOMATED_EXAMPLE_MANAGER_ID, INTEGRATED_CHARTS_ID, ROW_GROUPING_ID } from './constants';
import { type AutomatedExampleState } from './createAutomatedExampleManager';
import { createPen } from './createPen';
import { type Point } from './geometry';
import { getStyledConsoleMessageConfig } from './getStyledConsoleMessageConfig';
import { type RunScriptState, type ScriptRunner } from './scriptRunner';

interface CreateScriptDebuggerParams {
    id: string;
    containerEl: HTMLElement;
    initialDraw: boolean;
    debugPanel: DebugPanel;
    canvasClassname: string;
    getLogLevel: () => LogLevel;
}

export type ScriptDebugger = ReturnType<typeof createScriptDebugger>;
export type ScriptDebuggerManager = ReturnType<typeof createScriptDebuggerManager>;
type DebugPanel = ReturnType<typeof createDebugPanel>;

export const LOG_LEVELS = {
    info: 0,
    log: 1,
    error: 2,
};
export type LogLevel = keyof typeof LOG_LEVELS;

const STATE_CLASSNAME = 'state';
const STEP_CLASSNAME = 'step';
const PAUSED_STATE_CLASSNAME = 'paused-state';
const MOUSE_POSITION_CLASSNAME = 'mouse-position';
const MANAGER_STATE_CLASSNAME = 'manager-state';
const DISABLED_CLASSNAME = 'disabled';
const getCheckboxTemplate = (isChecked?: boolean) => `
    <label class="draw-checkbox">
        <input type="checkbox" ${isChecked ? 'checked' : ''} /> Draw
    </label>
`;

const DEFAULT_DRAW_COLOR = 'rgba(255,0,0,0.5)'; // red

const isValidLogLevel = (logLevel: LogLevel, comparisonLogLevel: LogLevel) => {
    return LOG_LEVELS[logLevel] >= LOG_LEVELS[comparisonLogLevel];
};

const log = (...args: any[]) => {
    const [prefix] = args || [];

    if (prefix.startsWith && prefix.startsWith(INTEGRATED_CHARTS_ID)) {
        const messageConfig = getStyledConsoleMessageConfig(...args);
        // eslint-disable-next-line no-console
        console.log(messageConfig, 'color: #222;background: #eee', ...args);
    } else if (prefix.startsWith && prefix.startsWith(ROW_GROUPING_ID)) {
        const messageConfig = getStyledConsoleMessageConfig(...args);
        // eslint-disable-next-line no-console
        console.log(messageConfig, 'color: #eee; background: #000', ...args);
    } else if (prefix.startsWith && prefix.startsWith(AUTOMATED_EXAMPLE_MANAGER_ID)) {
        const messageConfig = getStyledConsoleMessageConfig(...args);
        // eslint-disable-next-line no-console
        console.log(messageConfig, 'color: #222; background: #80bdff', ...args);
    } else {
        // eslint-disable-next-line no-console
        console.log(...args);
    }
};

const errorLog = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
};

/**
 * Create pen to draw on the canvas, for debugging
 */
function createDebugPen({ containerEl, classname }: { containerEl: HTMLElement; classname: string }) {
    const debugCanvas = document.createElement('canvas');
    debugCanvas.classList.add(classname);

    containerEl.appendChild(debugCanvas);

    return createPen({
        canvas: debugCanvas,
        width: containerEl.clientWidth,
        height: containerEl.clientHeight,
    });
}

function createDebugPanelSection({
    id,
    onDrawChange,
    getScriptRunner,
    initialDrawChecked,
}: {
    id: string;
    onDrawChange: (checked: boolean) => void;
    getScriptRunner: () => ScriptRunner;
    initialDrawChecked?: boolean;
}) {
    const existingSection = document.querySelectorAll(`[data-section-id="${id}"]`);
    if (existingSection) {
        existingSection.forEach((element) => {
            element.remove();
        });
    }

    const stateEl = document.createElement('div');
    stateEl.classList.add(STATE_CLASSNAME);

    const stepEl = document.createElement('div');
    stepEl.classList.add(STEP_CLASSNAME);

    const pausedStateEl = document.createElement('div');
    pausedStateEl.classList.add(PAUSED_STATE_CLASSNAME);

    // Controls
    const controlsEl = document.createElement('div');
    controlsEl.classList.add('controls');

    const drawCheckboxEl = document.createElement('div');
    drawCheckboxEl.innerHTML = getCheckboxTemplate(initialDrawChecked).trim();
    drawCheckboxEl.querySelector('input')?.addEventListener('change', function () {
        onDrawChange(this.checked);
    });

    const runnerButtonEl = document.createElement('button');
    runnerButtonEl.classList.add('button-secondary', 'font-size-small');
    runnerButtonEl.innerHTML = 'Stop';
    runnerButtonEl.onclick = () => {
        const scriptRunner = getScriptRunner();
        if (scriptRunner.currentState() === 'playing') {
            scriptRunner?.stop();
        } else if (scriptRunner.currentState() === 'stopping' || scriptRunner.currentState() === 'stopped') {
            scriptRunner?.play();
        }
    };

    controlsEl.appendChild(drawCheckboxEl);
    controlsEl.appendChild(runnerButtonEl);

    const sectionEl = document.createElement('section');
    sectionEl.dataset.sectionId = id;
    const heading = document.createElement('h2');
    heading.innerHTML = id;
    sectionEl.appendChild(heading);
    sectionEl.appendChild(stateEl);
    sectionEl.appendChild(stepEl);
    sectionEl.appendChild(pausedStateEl);
    sectionEl.appendChild(controlsEl);

    const updateStateText = (state: string) => {
        stateEl.innerHTML = state;
    };
    const updateStepText = ({ step, numSteps, stepName }: { step: number; numSteps: number; stepName?: string }) => {
        stepEl.innerHTML = `<span class='index'>${step}/${numSteps}</span>${stepName ? ` ${stepName}` : ''}`;
    };
    const updatePausedStateText = (pausedState?: string) => {
        pausedStateEl.innerHTML = pausedState ? pausedState : '';
    };
    const updateButton = (state: RunScriptState) => {
        if (state === 'stopping' || state === 'stopped' || state === 'errored') {
            runnerButtonEl.innerHTML = 'Play';
            runnerButtonEl.disabled = false;
        } else if (state === 'playing') {
            runnerButtonEl.innerHTML = 'Stop';
            runnerButtonEl.disabled = false;
        } else if (state === 'inactive') {
            runnerButtonEl.disabled = true;
            runnerButtonEl.innerHTML = 'Stop';
        }
    };
    const updateIsEnabled = (isEnabled: boolean) => {
        if (isEnabled) {
            sectionEl.classList.remove(DISABLED_CLASSNAME);
        } else {
            sectionEl.classList.add(DISABLED_CLASSNAME);
        }
    };

    return {
        sectionEl,
        updateStateText,
        updateStepText,
        updatePausedStateText,
        updateButton,
        updateIsEnabled,
    };
}

function createDebugPanel(classname: string) {
    let debugPanelEl = document.querySelector(`.${classname}`);
    if (debugPanelEl) {
        debugPanelEl.remove();
    }

    debugPanelEl = document.createElement('div');
    debugPanelEl.classList.add(classname);

    document.body.appendChild(debugPanelEl);

    const mousePositionEl = document.createElement('div');
    mousePositionEl.classList.add(MOUSE_POSITION_CLASSNAME);
    document.addEventListener('mousemove', (event) => {
        const pos = {
            x: event.clientX,
            y: event.clientY,
        };
        mousePositionEl.innerHTML = `${pos.x}, ${pos.y}`;
    });

    const managerStateEl = document.createElement('div');
    managerStateEl.classList.add(MANAGER_STATE_CLASSNAME);
    const updateManagerStateText = (state: string) => {
        managerStateEl.innerHTML = state;
    };

    debugPanelEl.appendChild(mousePositionEl);
    debugPanelEl.appendChild(managerStateEl);

    return {
        debugPanelEl,
        updateManagerStateText,
        addSection: ({
            id,
            initialDraw,
            getScriptRunner,
            onDrawChange,
        }: {
            id: string;
            initialDraw: boolean;
            getScriptRunner: () => ScriptRunner;
            onDrawChange: (checked: boolean) => void;
        }) => {
            const { sectionEl, updateStateText, updateStepText, updatePausedStateText, updateButton, updateIsEnabled } =
                createDebugPanelSection({
                    id,
                    onDrawChange,
                    getScriptRunner,
                    initialDrawChecked: initialDraw,
                });
            debugPanelEl?.appendChild(sectionEl);

            return {
                updateStateText,
                updateStepText,
                updatePausedStateText,
                updateButton,
                updateIsEnabled,
            };
        },
    };
}

function createScriptDebugger({
    id,
    containerEl,
    initialDraw,
    debugPanel,
    canvasClassname,
    getLogLevel,
}: CreateScriptDebuggerParams) {
    let shouldDraw = initialDraw;
    let scriptRunner;
    const debugPen = createDebugPen({ containerEl, classname: canvasClassname });

    const getScriptRunner = () => {
        return scriptRunner;
    };

    const { updateStateText, updateStepText, updatePausedStateText, updateButton, updateIsEnabled } =
        debugPanel.addSection({
            id,
            initialDraw,
            getScriptRunner,
            onDrawChange: (checked) => {
                shouldDraw = checked;
            },
        });

    const updateState = ({ state, pauseIndex }) => {
        updateStateText(state);
        updatePausedStateText(pauseIndex);
        updateButton(state);
    };

    const updateStep = ({ step, numSteps, stepName }) => {
        updateStepText({ step, numSteps, stepName });
    };

    const drawPoint = ({ x, y }: Point, color?: string, radius: number = 5) => {
        if (!shouldDraw) {
            return;
        }
        debugPen?.drawPoint({ x, y }, radius, color ?? DEFAULT_DRAW_COLOR);
    };

    const clear = () => {
        debugPen?.clear();
    };

    const setScriptRunner = (runner: ScriptRunner) => {
        scriptRunner = runner;
    };

    return {
        infoLog: (...args) => {
            if (!isValidLogLevel('info', getLogLevel())) {
                return;
            }
            log(...args);
        },
        log: (...args) => {
            if (!isValidLogLevel('log', getLogLevel())) {
                return;
            }
            log(...args);
        },
        errorLog: (...args) => {
            if (!isValidLogLevel('error', getLogLevel())) {
                return;
            }
            errorLog(...args);
        },

        clear,
        drawPoint,
        updateStep,
        updateState,
        updateIsEnabled: (isEnabled: boolean) => {
            updateIsEnabled(isEnabled);
        },
        setScriptRunner,
    };
}

export function createScriptDebuggerManager({
    canvasClassname,
    panelClassname,
}: {
    canvasClassname: string;
    panelClassname: string;
}) {
    let debugPanel; // Create debug panel lazily
    let debugLogLevel: LogLevel = 'log';
    let isEnabled = false;
    let initialDraw = false;

    const getLogLevel = () => {
        return debugLogLevel;
    };

    const ensureDebugPanel = () => {
        if (!debugPanel) {
            debugPanel = createDebugPanel(panelClassname);
        }
    };

    return {
        infoLog: (...args) => {
            if (!isValidLogLevel('info', debugLogLevel)) {
                return;
            }
            if (!isEnabled) {
                return;
            }
            log(...args);
        },
        log: (...args) => {
            if (!isValidLogLevel('log', debugLogLevel)) {
                return;
            }
            if (!isEnabled) {
                return;
            }
            log(...args);
        },
        errorLog: (...args) => {
            if (!isValidLogLevel('error', debugLogLevel)) {
                return;
            }
            if (!isEnabled) {
                return;
            }
            errorLog(...args);
        },
        setEnabled: (enabled: boolean) => {
            isEnabled = enabled;
        },
        setDebugLogLevel: (logLevel?: LogLevel) => {
            if (logLevel && Object.keys(LOG_LEVELS).includes(logLevel)) {
                debugLogLevel = logLevel;
            }
        },
        setInitialDraw: (draw: boolean) => {
            initialDraw = draw;
        },
        add: ({ id, containerEl }: { id: string; containerEl: HTMLElement }): ScriptDebugger | undefined => {
            if (!isEnabled) {
                return;
            }

            ensureDebugPanel();

            const scriptDebugger = createScriptDebugger({
                id,
                containerEl,
                debugPanel,
                initialDraw,
                canvasClassname,
                getLogLevel,
            });

            return scriptDebugger;
        },
        updateManagerState: (state: AutomatedExampleState) => {
            if (!isEnabled) {
                return;
            }

            ensureDebugPanel();

            debugPanel.updateManagerStateText(state);
        },
    };
}
