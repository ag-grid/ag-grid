import { Group } from '@tweenjs/tween.js';
import { getCellPos, getGroupCellTogglePos } from '../lib/agQuery';
import { Mouse } from '../lib/createMouse';
import { ScriptDebugger } from '../lib/createScriptDebugger';
import { getOffset } from '../lib/dom';
import { addPoints, Point } from '../lib/geometry';
import { clearAllRowHighlights } from '../lib/scriptActions/clearAllRowHighlights';
import { createGroupColumnScriptActions } from '../lib/scriptActions/createGroupColumnScriptActions';
import { moveTarget } from '../lib/scriptActions/move';
import { ScriptAction } from '../lib/scriptRunner';

interface CreateRowGroupingScriptParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    offScreenPos: Point;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
}

export const createRowGroupingScript = ({
    containerEl,
    mouse,
    offScreenPos,
    tweenGroup,
    scriptDebugger,
}: CreateRowGroupingScriptParams): ScriptAction[] => {
    const TARGET_GROUP_ROW_INDEX = 2;
    const TARGET_GROUP_CELL_KEY = 'Gold and Silver';

    const TARGET_GROUP_ITEM_ROW_INDEX = 4;
    const TARGET_GROUP_ITEM_KEY = 'GL-62489';

    const TARGET_GROUP_ITEM_CELL_COL_INDEX = 2;
    const TARGET_GROUP_ITEM_CELL_ROW_INDEX = TARGET_GROUP_ITEM_ROW_INDEX + 1;

    return [
        {
            type: 'custom',
            action: () => {
                // Move mouse to starting position
                moveTarget({ target: mouse.getTarget(), coords: offScreenPos, scriptDebugger });

                mouse.show();
                clearAllRowHighlights();
            },
        },
        {
            type: 'agAction',
            actionType: 'reset',
        },
        ...createGroupColumnScriptActions({
            containerEl,
            mouse,
            headerCellName: 'Product',
            tweenGroup,
            fallbackApplyColumnState: {
                state: [{ colId: 'product', rowGroupIndex: 0 }],
            },
        }),
        { type: 'wait', duration: 500 },
        {
            type: 'moveTo',
            toPos: () => getGroupCellTogglePos({ containerEl, colIndex: 0, rowIndex: TARGET_GROUP_ROW_INDEX }),
        },
        { type: 'wait', duration: 500 },
        { type: 'click' },
        {
            type: 'agAction',
            actionType: 'selectSingleCell',
            actionParams: {
                colIndex: 0,
                rowIndex: TARGET_GROUP_ROW_INDEX,
            },
        },
        {
            type: 'agAction',
            actionType: 'toggleGroupCell',
            actionParams: {
                key: TARGET_GROUP_CELL_KEY,
                expand: true,
            },
        },
        { type: 'wait', duration: 500 },

        ...createGroupColumnScriptActions({
            containerEl,
            mouse,
            headerCellName: 'Book',
            moveToDuration: 300,
            tweenGroup,
            fallbackApplyColumnState: {
                state: [
                    { colId: 'product', rowGroupIndex: 0 },
                    { colId: 'book', rowGroupIndex: 1 },
                ],
            },
        }),
        { type: 'wait', duration: 500 },

        // Open target group
        {
            type: 'moveTo',
            toPos: () => getGroupCellTogglePos({ containerEl, colIndex: 0, rowIndex: TARGET_GROUP_ROW_INDEX }),
        },
        { type: 'wait', duration: 500 },
        { type: 'click' },
        {
            type: 'agAction',
            actionType: 'selectSingleCell',
            actionParams: {
                colIndex: 0,
                rowIndex: TARGET_GROUP_ROW_INDEX,
            },
        },
        {
            type: 'agAction',
            actionType: 'toggleGroupCell',
            actionParams: {
                key: TARGET_GROUP_CELL_KEY,
                expand: true,
            },
        },
        { type: 'wait', duration: 500 },

        // Open target group item
        {
            type: 'moveTo',
            toPos: () => getGroupCellTogglePos({ containerEl, colIndex: 0, rowIndex: TARGET_GROUP_ITEM_ROW_INDEX }),
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'clearAllSingleCellSelections',
        },
        { type: 'click' },
        {
            type: 'agAction',
            actionType: 'selectSingleCell',
            actionParams: {
                colIndex: 0,
                rowIndex: TARGET_GROUP_ITEM_ROW_INDEX,
            },
        },
        {
            type: 'agAction',
            actionType: 'toggleGroupCell',
            actionParams: {
                key: TARGET_GROUP_ITEM_KEY,
                expand: true,
            },
        },
        { type: 'wait', duration: 500 },

        // Jiggle around a cell item
        {
            type: 'moveTo',
            toPos: () => {
                return addPoints(
                    getCellPos({
                        containerEl,
                        colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                        rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                    }),
                    {
                        x: -40,
                        y: 10,
                    }
                );
            },
        },
        { type: 'wait', duration: 200 },
        {
            type: 'moveTo',
            toPos: () =>
                addPoints(
                    getCellPos({
                        containerEl,
                        colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                        rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                    }),
                    {
                        x: 0,
                        y: 10,
                    }
                ),
            duration: 200,
        },
        { type: 'wait', duration: 200 },
        {
            type: 'moveTo',
            toPos: () =>
                addPoints(
                    getCellPos({
                        containerEl,
                        colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                        rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                    }),
                    {
                        x: -40,
                        y: 10,
                    }
                ),
            duration: 200,
        },
        { type: 'wait', duration: 300 },

        // Close target group item
        {
            type: 'moveTo',
            toPos: () => getGroupCellTogglePos({ containerEl, colIndex: 0, rowIndex: TARGET_GROUP_ITEM_ROW_INDEX }),
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'clearAllSingleCellSelections',
        },
        { type: 'click' },
        {
            type: 'agAction',
            actionType: 'selectSingleCell',
            actionParams: {
                colIndex: 0,
                rowIndex: TARGET_GROUP_ITEM_ROW_INDEX,
            },
        },
        {
            type: 'agAction',
            actionType: 'toggleGroupCell',
            actionParams: {
                key: TARGET_GROUP_ITEM_KEY,
                expand: false,
                skipParents: true,
            },
        },
        { type: 'wait', duration: 500 },

        // Close target group
        {
            type: 'moveTo',
            toPos: () => getGroupCellTogglePos({ containerEl, colIndex: 0, rowIndex: TARGET_GROUP_ROW_INDEX }),
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'clearAllSingleCellSelections',
        },
        { type: 'click' },
        {
            type: 'agAction',
            actionType: 'selectSingleCell',
            actionParams: {
                colIndex: 0,
                rowIndex: TARGET_GROUP_ROW_INDEX,
            },
        },
        {
            type: 'agAction',
            actionType: 'toggleGroupCell',
            actionParams: {
                key: TARGET_GROUP_CELL_KEY,
                expand: false,
            },
        },
        { type: 'wait', duration: 1000 },

        // Move off screen
        {
            type: 'moveTo',
            toPos: () => {
                const offset = containerEl ? getOffset(containerEl) : undefined;
                return addPoints(offScreenPos, offset)!;
            },
            speed: 2,
        },
        {
            type: 'custom',
            action: () => {
                mouse.hide();
            },
        },
        {
            type: 'agAction',
            actionType: 'clearAllSingleCellSelections',
        },
        { type: 'wait', duration: 3000 },
        {
            type: 'agAction',
            actionType: 'reset',
        },
        {
            type: 'custom',
            action: () => {
                scriptDebugger?.clear();
            },
        },
    ];
};
