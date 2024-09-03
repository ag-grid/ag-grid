import type { Group } from '@tweenjs/tween.js';

import type { ApplyColumnStateParams } from 'ag-grid-community';

import type { AgElementFinder } from '../agElements';
import type { Mouse } from '../createMouse';
import type { ScriptAction } from '../scriptRunner';
import type { EasingFunction } from '../tween';

interface CreateGroupColumnScriptActionsParams {
    agElementFinder: AgElementFinder;
    mouse: Mouse;
    headerCellName: string;
    moveToDuration?: number;
    dragDuration?: number;
    easing?: EasingFunction;
    tweenGroup: Group;
    /**
     * Fallback `gridApi.applyColumnState` command in case drag and drop fails
     */
    fallbackApplyColumnState: ApplyColumnStateParams;
}

export function createGroupColumnScriptActions({
    agElementFinder,
    mouse,
    headerCellName,
    moveToDuration,
    dragDuration = 500,
    easing,
    fallbackApplyColumnState,
    tweenGroup,
}: CreateGroupColumnScriptActionsParams): ScriptAction[] {
    return [
        {
            type: 'moveTo',
            toPos: () =>
                agElementFinder
                    .get('headerCell', {
                        text: headerCellName,
                    })
                    ?.getPos(),
            duration: moveToDuration,
            easing,
        },
        { type: 'wait', duration: 200 },
        {
            type: 'agAction',
            actionType: 'clearAllSingleCellSelections',
        },
        {
            type: 'mouseDown',
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'dragColumnToRowGroupPanel',
            actionParams: {
                mouse,
                headerCellName,
                duration: dragDuration,
                easing,
                tweenGroup,
            },
        },
        {
            type: 'agAction',
            actionType: 'applyColumnState',
            actionParams: fallbackApplyColumnState,
        },
        {
            type: 'mouseUp',
        },
    ];
}
