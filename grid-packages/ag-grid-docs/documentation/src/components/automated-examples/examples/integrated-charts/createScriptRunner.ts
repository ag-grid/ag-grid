import { Group } from '@tweenjs/tween.js';
import { GridOptions } from 'ag-grid-community';
import { Mouse } from '../../lib/createMouse';
import { ScriptDebugger } from '../../lib/scriptDebugger';
import { createScriptRunner as createScriptRunnerCore, RunScriptState } from '../../lib/scriptRunner';
import { EasingFunction } from '../../lib/tween';
import { createScript } from './createScript';

interface Params {
    id: string;
    mouse: Mouse;
    containerEl: HTMLElement;
    onStateChange?: (state: RunScriptState) => void;
    tweenGroup: Group;
    gridOptions: GridOptions;
    loop?: boolean;
    scriptDebugger?: ScriptDebugger;
    defaultEasing?: EasingFunction;
}

export function createScriptRunner({
    id,
    containerEl,
    mouse,
    onStateChange,
    tweenGroup,
    gridOptions,
    loop,
    scriptDebugger,
    defaultEasing,
}: Params) {
    const script = createScript({
        containerEl,
        mouse,
        tweenGroup,
        gridOptions,
        scriptDebugger,
    });

    const scriptRunner = createScriptRunnerCore({
        id,
        containerEl,
        mouse,
        script,
        gridOptions,
        loop,
        tweenGroup,
        onStateChange: (state) => {
            scriptDebugger?.log(`${id} state: ${state}`);

            if (state === 'stopping' || state === 'inactive' || state === 'errored') {
                mouse.hide();
            }

            onStateChange && onStateChange(state);
        },
        scriptDebugger,
        defaultEasing,
    });
    scriptDebugger?.setScriptRunner(scriptRunner);

    return scriptRunner;
}
