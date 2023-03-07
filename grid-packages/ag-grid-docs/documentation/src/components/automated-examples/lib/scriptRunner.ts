import { Group } from '@tweenjs/tween.js';
import { ColumnState, GridOptions } from 'ag-grid-community';
import { Mouse } from './createMouse';
import { createRowExpandedState, RowExpandedState } from './createRowExpandedState';
import { ScriptDebugger } from './createScriptDebugger';
import { Point } from './geometry';
import { PathItem } from './pathRecorder';
import { AGCreatorAction, createAGActionCreator } from './scriptActions/createAGActionCreator';
import { createMoveMouse } from './scriptActions/createMoveMouse';
import { playPath } from './scriptActions/playPath';
import { removeFocus } from './scriptActions/removeFocus';
import { clearAllSingleCellSelections } from './scriptActions/singleCell';
import { waitFor } from './scriptActions/waitFor';
import { EasingFunction } from './tween';

export interface PathAction {
    type: 'path';
    path: PathItem<any>[];
}

export interface MoveToAction {
    type: 'moveTo';
    toPos: Point | (() => Point | undefined);
    speed?: number;
    duration?: number;
    easing?: EasingFunction;
}

export interface WaitAction {
    type: 'wait';
    duration: number;
}

export interface ClickAction {
    type: 'click';
}

export interface MouseDownAction {
    type: 'mouseDown';
}

export interface MouseUpAction {
    type: 'mouseUp';
}

export interface RemoveFocusAction {
    type: 'removeFocus';
}

export interface CustomAction {
    type: 'custom';
    action: () => Promise<void> | void;
}

export type AGAction = AGCreatorAction & {
    type: 'agAction';
};

export interface ScriptRunner {
    currentState: () => RunScriptState;
    play: (params?: { loop?: boolean }) => void;
    pause: () => void;
    stop: () => void;
    inactive: () => void;
}

export type ScriptAction =
    | PathAction
    | MoveToAction
    | WaitAction
    | RemoveFocusAction
    | ClickAction
    | MouseDownAction
    | MouseUpAction
    | CustomAction
    | AGAction;

interface PausedState {
    scriptIndex: number;
    columnState: ColumnState[];
    rowExpandedState: RowExpandedState;
}
export interface CreateScriptActionParams {
    mouse: Mouse;
    containerEl?: HTMLElement;
    action: ScriptAction;
    gridOptions: GridOptions;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
    defaultEasing?: EasingFunction;
}

export interface CreateScriptRunnerParams {
    mouse: Mouse;
    containerEl?: HTMLElement;
    script: ScriptAction[];
    gridOptions: GridOptions;
    tweenGroup: Group;
    loop?: boolean;
    loopOnError?: boolean;
    onStateChange?: (state: RunScriptState) => void;
    onPaused?: () => void;
    onUnpaused?: () => void;
    scriptDebugger?: ScriptDebugger;
    /**
     * Default easing function used for move actions
     *
     * @see https://createjs.com/docs/tweenjs/classes/Ease.html
     */
    defaultEasing?: EasingFunction;
}

interface CreateActionSequenceRunnerParams {
    actionSequence: ReturnType<typeof createScriptActionSequence>;
    onPreAction?: (params: { action; index: number }) => { shouldCancel: boolean } | undefined;
    onError?: (params: { error: Error; action; index: number }) => void;
}

interface CreateScriptActionSequenceParams {
    script: ScriptAction[];
    containerEl?: HTMLElement;
    mouse: Mouse;
    gridOptions: GridOptions;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
    defaultEasing?: EasingFunction;
}

export type RunScriptState = 'inactive' | 'stopped' | 'stopping' | 'pausing' | 'paused' | 'playing';

function createScriptAction({
    containerEl,
    mouse,
    action,
    tweenGroup,
    gridOptions,
    scriptDebugger,
    defaultEasing,
}: CreateScriptActionParams) {
    const { type } = action;
    const agActionCreator = createAGActionCreator({ containerEl, gridOptions });

    if (type === 'path') {
        const scriptAction = action as PathAction;
        return playPath({ target: mouse.getTarget(), path: scriptAction.path });
    } else if (type === 'custom') {
        const scriptAction = action as CustomAction;
        return scriptAction.action();
    } else if (type === 'click') {
        return mouse.click();
    } else if (type === 'mouseDown') {
        return mouse.mouseDown();
    } else if (type === 'mouseUp') {
        return mouse.mouseUp();
    } else if (type === 'removeFocus') {
        return removeFocus();
    } else if (type === 'wait') {
        const scriptAction = action as WaitAction;
        return waitFor(scriptAction.duration);
    } else if (type === 'moveTo') {
        const scriptAction = action as MoveToAction;
        const toPos = scriptAction.toPos instanceof Function ? scriptAction.toPos() : scriptAction.toPos;

        if (!toPos) {
            console.error(`No 'toPos' in 'moveTo' action`, scriptAction);
            return;
        }

        return createMoveMouse({
            mouse,
            toPos,
            speed: scriptAction.speed,
            duration: scriptAction.duration,
            scriptDebugger,
            tweenGroup,
            easing: scriptAction.easing || defaultEasing,
        });
    } else if (type === 'agAction') {
        const scriptAction = action as AGAction;
        const params = {
            actionType: scriptAction.actionType,
            // @ts-ignore
            actionParams: scriptAction.actionParams,
        };

        return agActionCreator(params);
    } else {
        throw new Error(`Unknown script action: ${JSON.stringify(action)}`);
    }
}

function createScriptActionSequence({
    script,
    containerEl,
    mouse,
    gridOptions,
    tweenGroup,
    scriptDebugger,
    defaultEasing,
}: CreateScriptActionSequenceParams) {
    return script.map((scriptAction) => {
        return () => {
            try {
                const result = createScriptAction({
                    containerEl,
                    mouse,
                    action: scriptAction,
                    gridOptions,
                    tweenGroup,
                    scriptDebugger,
                    defaultEasing,
                });

                return result;
            } catch (error) {
                console.error('Script action error', {
                    scriptAction: JSON.stringify(scriptAction, function replacer(key, value) {
                        if (typeof value === 'function') {
                            return value.toString().replaceAll(/\s/gm, '').replace('function', '');
                        }
                        return value;
                    }),
                    error,
                });
                throw error;
            }
        };
    });
}

function createActionSequenceRunner({ actionSequence, onPreAction, onError }: CreateActionSequenceRunnerParams) {
    return new Promise((resolve, reject) => {
        actionSequence
            .reduce((p, action, index) => {
                return p
                    .then(async () => {
                        const preActionResult = onPreAction && (await onPreAction({ action, index }));

                        if (!preActionResult?.shouldCancel) {
                            return action();
                        }
                    })
                    .catch((error) => {
                        onError && onError({ error, index, action });
                    });
            }, Promise.resolve())
            .then(resolve)
            .catch(reject);
    });
}

export function createScriptRunner({
    containerEl,
    mouse,
    script,
    gridOptions,
    loop,
    loopOnError,
    tweenGroup,
    onStateChange,
    onPaused,
    onUnpaused,
    scriptDebugger,
    defaultEasing,
}: CreateScriptRunnerParams): ScriptRunner {
    let runScriptState: RunScriptState;
    let loopScript = loop;
    let pausedState: PausedState | undefined;
    const rowExpandedState = createRowExpandedState(gridOptions);

    const setPausedState = (scriptIndex: number) => {
        onPaused && onPaused();
        pausedState = {
            scriptIndex,
            columnState: gridOptions.columnApi?.getColumnState()!,
            rowExpandedState: rowExpandedState.get(),
        };
    };

    function tweenUpdate() {
        if (runScriptState !== 'playing') {
            return;
        }
        requestAnimationFrame(tweenUpdate);
        tweenGroup.update();
    }

    const playAgain = () => {
        let pausedScriptIndex;
        if (pausedState) {
            onUnpaused && onUnpaused();
            gridOptions.columnApi?.applyColumnState({
                state: pausedState.columnState,
                applyOrder: true,
            });
            rowExpandedState.restore(pausedState.rowExpandedState);
            pausedScriptIndex = pausedState.scriptIndex;
            resetPausedState();
        }

        startActionSequence(pausedScriptIndex);
    };

    const resetPausedState = () => {
        pausedState = undefined;
    };

    const actionSequence = createScriptActionSequence({
        script,
        containerEl,
        mouse,
        gridOptions,
        tweenGroup,
        scriptDebugger,
        defaultEasing,
    });

    const startActionSequence = (startIndex: number = 0) => {
        updateState('playing');
        tweenUpdate();
        const sequence = createActionSequenceRunner({
            actionSequence: actionSequence.slice(startIndex),
            onPreAction({ index }) {
                if (runScriptState === 'stopping') {
                    updateState('stopped');
                    return { shouldCancel: true };
                } else if (runScriptState === 'pausing') {
                    setPausedState(index);
                    updateState('paused');
                    return { shouldCancel: true };
                } else if (
                    runScriptState === 'stopped' ||
                    runScriptState === 'paused' ||
                    runScriptState === 'inactive'
                ) {
                    return { shouldCancel: true };
                }
            },
            onError({ error, index }) {
                console.error('Action error (stopping)', {
                    index,
                    error,
                });

                // Error in action, stop the script
                updateState('stopping');
            },
        });

        sequence
            .then(() => {
                if (loopScript && runScriptState === 'playing') {
                    updateState('stopped');
                    startActionSequence();
                } else if (runScriptState === 'pausing') {
                    updateState('paused');
                } else if (runScriptState === 'paused' || runScriptState === 'inactive') {
                    // Do nothing
                } else {
                    updateState('stopped');
                    if (loopScript && loopOnError) {
                        startActionSequence();
                    }
                }
            })
            .catch((error) => {
                console.error('Action sequence error', error);
                stop();
            });
    };

    const cleanUp = () => {
        resetPausedState();
        tweenGroup.removeAll();
        clearAllSingleCellSelections();
    };

    const stop: ScriptRunner['stop'] = () => {
        // Initiate stop
        updateState('stopping');
        cleanUp();
    };

    const inactive: ScriptRunner['inactive'] = () => {
        updateState('inactive');
        cleanUp();
    };

    const play: ScriptRunner['play'] = ({ loop } = {}) => {
        loopScript = loop === undefined ? loopScript : Boolean(loop);

        playAgain();
    };
    const pause: ScriptRunner['pause'] = () => {
        if (runScriptState === 'playing') {
            updateState('pausing');
        }
    };
    const currentState: ScriptRunner['currentState'] = (): RunScriptState => {
        return runScriptState;
    };

    const updateState = (state: RunScriptState) => {
        scriptDebugger?.updateState({
            state,
            pauseIndex: pausedState?.scriptIndex,
        });
        runScriptState = state;
        onStateChange && onStateChange(state);
    };

    // Initial playState
    updateState('inactive');

    return {
        currentState,
        play,
        pause,
        stop,
        inactive,
    };
}
