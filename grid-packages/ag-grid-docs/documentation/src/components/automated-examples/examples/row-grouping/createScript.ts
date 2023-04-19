import { Group } from '@tweenjs/tween.js';
import { createAgElementFinder } from '../../lib/agElements';
import { Mouse } from '../../lib/createMouse';
import { getBottomMidPos, getOffset, getScrollOffset } from '../../lib/dom';
import { addPoints } from '../../lib/geometry';
import { clearAllRowHighlights } from '../../lib/scriptActions/clearAllRowHighlights';
import { createGroupColumnScriptActions } from '../../lib/scriptActions/createGroupColumnScriptActions';
import { moveTarget } from '../../lib/scriptActions/move';
import { ScriptDebugger } from '../../lib/scriptDebugger';
import { ScriptAction } from '../../lib/scriptRunner';

interface Params {
    containerEl: HTMLElement;
    mouse: Mouse;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
}

export const createScript = ({ containerEl, mouse, tweenGroup, scriptDebugger }: Params): ScriptAction[] => {
    const GROUP_1_HEADER_CELL_NAME = 'Category';
    const GROUP_1_COL_ID = 'category';
    const GROUP_1_GROUP_INDEX = 0;

    const GROUP_2_HEADER_CELL_NAME = 'Product';
    const GROUP_2_COL_ID = 'product';
    const GROUP_2_GROUP_INDEX = 1;

    const TARGET_GROUP_ROW_INDEX = 2;
    const TARGET_GROUP_CELL_KEY = 'Food & Drink';

    const TARGET_GROUP_ITEM_ROW_INDEX = 4;
    const TARGET_GROUP_ITEM_KEY = 'Matcha';

    const TARGET_GROUP_ITEM_CELL_COL_INDEX = 2;
    const TARGET_GROUP_ITEM_CELL_ROW_INDEX = TARGET_GROUP_ITEM_ROW_INDEX + 1;

    const agElementFinder = createAgElementFinder({ containerEl });
    const getOffscreenPos = () => getBottomMidPos(containerEl);

    return [
        {
            type: 'custom',
            action: () => {
                // Move mouse to starting position
                moveTarget({
                    target: mouse.getTarget(),
                    coords: getOffscreenPos(),
                    offset: addPoints(getOffset(containerEl), getScrollOffset(), {
                        x: 0,
                        y: -120,
                    }),
                    scriptDebugger,
                });

                mouse.show();
                clearAllRowHighlights();
            },
        },
        {
            type: 'agAction',
            actionType: 'reset',
            actionParams: {
                scrollRow: 0,
                scrollColumn: 0,
            },
        },
        ...createGroupColumnScriptActions({
            agElementFinder,
            mouse,
            headerCellName: GROUP_1_HEADER_CELL_NAME,
            tweenGroup,
            fallbackApplyColumnState: {
                state: [{ colId: GROUP_1_COL_ID, rowGroupIndex: GROUP_1_GROUP_INDEX }],
            },
        }),
        { type: 'wait', duration: 500 },
        {
            type: 'moveTo',
            toPos: () =>
                agElementFinder
                    .get('groupCellToggle', {
                        colIndex: 0,
                        rowIndex: TARGET_GROUP_ROW_INDEX,
                    })
                    ?.getPos(),
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
            agElementFinder,
            mouse,
            headerCellName: GROUP_2_HEADER_CELL_NAME,
            moveToDuration: 300,
            tweenGroup,
            fallbackApplyColumnState: {
                state: [
                    { colId: GROUP_1_COL_ID, rowGroupIndex: GROUP_1_GROUP_INDEX },
                    { colId: GROUP_2_COL_ID, rowGroupIndex: GROUP_2_GROUP_INDEX },
                ],
            },
        }),
        { type: 'wait', duration: 500 },

        // Open target group
        {
            type: 'moveTo',
            toPos: () =>
                agElementFinder
                    .get('groupCellToggle', {
                        colIndex: 0,
                        rowIndex: TARGET_GROUP_ROW_INDEX,
                    })
                    ?.getPos(),
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
            toPos: () =>
                agElementFinder
                    .get('groupCellToggle', {
                        colIndex: 0,
                        rowIndex: TARGET_GROUP_ITEM_ROW_INDEX,
                    })
                    ?.getPos(),
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
                    agElementFinder
                        .get('cell', {
                            colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                            rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                        })
                        ?.getPos(),
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
                    agElementFinder
                        .get('cell', {
                            colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                            rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                        })
                        ?.getPos(),
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
                    agElementFinder
                        .get('cell', {
                            colIndex: TARGET_GROUP_ITEM_CELL_COL_INDEX,
                            rowIndex: TARGET_GROUP_ITEM_CELL_ROW_INDEX,
                        })
                        ?.getPos(),
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
            toPos: () =>
                agElementFinder
                    .get('groupCellToggle', {
                        colIndex: 0,
                        rowIndex: TARGET_GROUP_ITEM_ROW_INDEX,
                    })
                    ?.getPos(),
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
            toPos: () =>
                agElementFinder
                    .get('groupCellToggle', {
                        colIndex: 0,
                        rowIndex: TARGET_GROUP_ROW_INDEX,
                    })
                    ?.getPos(),
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
                return addPoints(getOffscreenPos(), offset)!;
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
            actionParams: {
                scrollRow: 0,
                scrollColumn: 0,
            },
        },
        {
            type: 'custom',
            action: () => {
                scriptDebugger?.clear();
            },
        },
    ];
};
