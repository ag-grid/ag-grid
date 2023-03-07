import { Group } from '@tweenjs/tween.js';
import { GridOptions } from 'ag-grid-community';
import { Mouse } from '../lib/createMouse';
import { ScriptDebugger } from '../lib/createScriptDebugger';
import { Point } from '../lib/geometry';
import { removeFocus } from '../lib/scriptActions/removeFocus';
import { clearAllSingleCellSelections } from '../lib/scriptActions/singleCell';
import { createScriptRunner } from '../lib/scriptRunner';
import { EasingFunction } from '../lib/tween';
import { createRowGroupingScript } from '../scripts/createRowGroupingScript';

interface CreateRowGroupingScriptRunnerParams {
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

export function createRowGroupingScriptRunner({
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
}: CreateRowGroupingScriptRunnerParams) {
    const rowGroupingScript = createRowGroupingScript({
        containerEl,
        mouse,
        offScreenPos,
        tweenGroup,
        scriptDebugger,
    });

    return createScriptRunner({
        containerEl,
        mouse,
        script: rowGroupingScript,
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
        onPaused: () => {
            clearAllSingleCellSelections();
            mouse.hide();
        },
        onUnpaused: () => {
            removeFocus();
            mouse.show();
        },
        scriptDebugger,
        defaultEasing,
    });
}
