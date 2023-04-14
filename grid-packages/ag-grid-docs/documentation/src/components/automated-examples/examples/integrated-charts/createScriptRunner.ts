import { Group } from '@tweenjs/tween.js';
import { GridOptions } from 'ag-grid-community';
import { Mouse } from '../../lib/createMouse';
import { Point } from '../../lib/geometry';
import { ScriptDebugger } from '../../lib/scriptDebugger';
import { createScriptRunner as createScriptRunnerCore } from '../../lib/scriptRunner';
import { EasingFunction } from '../../lib/tween';
import { createScript } from './createScript';

interface Params {
    mouse: Mouse;
    containerEl?: HTMLElement;
    offScreenPos: Point;
    onPlaying?: () => void;
    onInactive?: () => void;
    tweenGroup: Group;
    gridOptions: GridOptions;
    loop?: boolean;
    scriptDebugger?: ScriptDebugger;
    defaultEasing?: EasingFunction;
}

export function createScriptRunner({
    containerEl,
    mouse,
    offScreenPos,
    onPlaying,
    onInactive,
    tweenGroup,
    gridOptions,
    loop,
    scriptDebugger,
    defaultEasing,
}: Params) {
    const script = createScript({
        containerEl,
        mouse,
        offScreenPos,
        tweenGroup,
        scriptDebugger,
    });

    const scriptRunner = createScriptRunnerCore({
        containerEl,
        mouse,
        script,
        gridOptions,
        loop,
        tweenGroup,
        onStateChange: (state) => {
            if (state === 'playing') {
                onPlaying && onPlaying();
            } else if (state === 'stopping') {
                mouse.hide();
            } else if (state === 'inactive') {
                mouse.hide();
                onInactive && onInactive();
            }
        },
        scriptDebugger,
        defaultEasing,
    });
    scriptDebugger?.setScriptRunner(scriptRunner);

    return scriptRunner;
}
