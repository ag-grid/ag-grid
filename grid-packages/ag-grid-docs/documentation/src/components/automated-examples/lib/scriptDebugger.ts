import { createPen } from './createPen';
import { Point } from './geometry';
import { RunScriptState, ScriptRunner } from './scriptRunner';

interface CreateScriptDebuggerParams {
    id: string;
    containerEl: HTMLElement;
    initialDraw: boolean;
    debugPanel: DebugPanel;
    canvasClassname: string;
}

export type ScriptDebugger = ReturnType<typeof createScriptDebugger>;
export type ScriptDebuggerManager = ReturnType<typeof createScriptDebuggerManager>;
type DebugPanel = ReturnType<typeof createDebugPanel>;

const STATE_CLASSNAME = 'state';
const PAUSED_STATE_CLASSNAME = 'paused-state';
const MOUSE_POSITION_CLASSNAME = 'mouse-position';
const getCheckboxTemplate = (isChecked?: boolean) => `
    <label class="draw-checkbox">
        <input type="checkbox" ${isChecked ? 'checked' : ''} /> Draw
    </label>
`;

const DEFAULT_DRAW_COLOR = 'rgba(255,0,0,0.5)'; // red

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
    const stateEl = document.createElement('div');
    stateEl.classList.add(STATE_CLASSNAME);

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
    const heading = document.createElement('h2');
    heading.innerHTML = id;
    sectionEl.appendChild(heading);
    sectionEl.appendChild(stateEl);
    sectionEl.appendChild(pausedStateEl);
    sectionEl.appendChild(controlsEl);

    const updateStateText = (state: string) => {
        stateEl.innerHTML = state;
    };
    const updatePausedStateText = (pausedState?: string) => {
        pausedStateEl.innerHTML = pausedState ? pausedState : '';
    };
    const updateButton = (state: RunScriptState) => {
        if (state === 'stopping' || state === 'stopped') {
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

    return {
        sectionEl,
        updateStateText,
        updatePausedStateText,
        updateButton,
    };
}

function createDebugPanel(classname: string) {
    let debugPanelEl = document.querySelector(`.${classname}`);
    if (debugPanelEl) {
        debugPanelEl.remove();
    }

    debugPanelEl = document.createElement('div');
    debugPanelEl.classList.add(classname);
    // Add .ag-styles, until it is on the entire site
    debugPanelEl.classList.add('ag-styles');

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

    debugPanelEl.appendChild(mousePositionEl);

    return {
        debugPanelEl,
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
            const { sectionEl, updateStateText, updatePausedStateText, updateButton } = createDebugPanelSection({
                id,
                onDrawChange,
                getScriptRunner,
                initialDrawChecked: initialDraw,
            });
            debugPanelEl?.appendChild(sectionEl);

            return {
                updateStateText,
                updatePausedStateText,
                updateButton,
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
}: CreateScriptDebuggerParams) {
    let shouldDraw = initialDraw;
    let scriptRunner;
    const debugPen = createDebugPen({ containerEl, classname: canvasClassname });

    const getScriptRunner = () => {
        return scriptRunner;
    };

    const { updateStateText, updatePausedStateText, updateButton } = debugPanel.addSection({
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

    return { clear, drawPoint, updateState, setScriptRunner };
}

export function createScriptDebuggerManager({
    canvasClassname,
    panelClassname,
}: {
    canvasClassname: string;
    panelClassname: string;
}) {
    let debugPanel; // Create debug panel lazily
    let isEnabled = false;
    let initialDraw = false;

    return {
        setEnabled: (enabled: boolean) => {
            isEnabled = enabled;
        },
        setInitialDraw: (draw: boolean) => {
            initialDraw = draw;
        },
        add: ({ id, containerEl }: { id: string; containerEl: HTMLElement }) => {
            if (!isEnabled) {
                return;
            }

            if (!debugPanel) {
                debugPanel = createDebugPanel(panelClassname);
            }

            const scriptDebugger = createScriptDebugger({
                id,
                containerEl,
                debugPanel,
                initialDraw,
                canvasClassname,
            });

            return scriptDebugger;
        },
    };
}
