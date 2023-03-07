import { createDrawer } from './createDrawer';
import { Point } from './geometry';

interface CreateScriptDebuggerParams {
    containerEl: HTMLElement;
    canvasClassname: string;
    panelClassname: string;
}

export type ScriptDebugger = ReturnType<typeof createScriptDebugger>;

const STATE_CLASSNAME = 'state';
const PAUSED_STATE_CLASSNAME = 'paused-state';
const DRAW_PATH_CHECKBOX_TEMPLATE = `
    <label class="draw-checkbox">
        <input type="checkbox" /> Draw
    </label>
`;

const DEFAULT_DRAW_COLOR = 'rgba(255,0,0,0.5)'; // red

/**
 * Debug canvas for position debugging
 */
function createDebugDrawer({ containerEl, classname }: { containerEl: HTMLElement; classname: string }) {
    const debugCanvas = document.createElement('canvas');
    debugCanvas.classList.add(classname);

    containerEl.appendChild(debugCanvas);

    return createDrawer({
        canvas: debugCanvas,
        width: containerEl.clientWidth,
        height: containerEl.clientHeight,
    });
}

function createDebugPanel({
    classname,
    onDrawChange,
}: {
    classname: string;
    onDrawChange: (checked: boolean) => void;
}) {
    let debugPanelEl = document.querySelector(`.${classname}`);
    if (debugPanelEl) {
        debugPanelEl.remove();
    }

    debugPanelEl = document.createElement('div');
    debugPanelEl.classList.add(classname);
    // Add .ag-styles, until it is on the entire site
    debugPanelEl.classList.add('ag-styles');

    document.body.appendChild(debugPanelEl);

    const stateEl = document.createElement('div');
    stateEl.classList.add(STATE_CLASSNAME);

    const pausedStateEl = document.createElement('div');
    pausedStateEl.classList.add(PAUSED_STATE_CLASSNAME);

    const drawCheckboxEl = document.createElement('div');
    drawCheckboxEl.innerHTML = DRAW_PATH_CHECKBOX_TEMPLATE.trim();
    drawCheckboxEl.querySelector('input')?.addEventListener('change', function () {
        onDrawChange(this.checked);
    });

    debugPanelEl.appendChild(stateEl);
    debugPanelEl.appendChild(pausedStateEl);
    debugPanelEl.appendChild(drawCheckboxEl);

    return {
        debugPanelEl,
        stateEl: debugPanelEl.querySelector(`.${STATE_CLASSNAME}`)!,
        pausedStateEl: debugPanelEl.querySelector(`.${PAUSED_STATE_CLASSNAME}`)!,
    };
}

export function createScriptDebugger({ containerEl, canvasClassname, panelClassname }: CreateScriptDebuggerParams) {
    let shouldDraw = false;
    const debugPanel = createDebugPanel({
        classname: panelClassname,
        onDrawChange: (checked) => {
            shouldDraw = checked;
        },
    });
    const debugDrawer = createDebugDrawer({ containerEl, classname: canvasClassname });

    const updateState = ({ state, pauseIndex }) => {
        debugPanel.stateEl.innerHTML = state;
        debugPanel.pausedStateEl.innerHTML = pauseIndex ? pauseIndex : '';
    };

    const drawPoint = ({ x, y }: Point, color?: string, radius: number = 5) => {
        if (!shouldDraw) {
            return;
        }
        debugDrawer?.drawPoint({ x, y }, radius, color ?? DEFAULT_DRAW_COLOR);
    };

    const clear = () => {
        debugDrawer?.clear();
    };

    return { clear, drawPoint, updateState };
}
