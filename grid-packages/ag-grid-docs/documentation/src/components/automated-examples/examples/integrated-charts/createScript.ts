import { Group } from '@tweenjs/tween.js';
import { GridOptions } from 'ag-grid-community';
import { createAgElementFinder } from '../../lib/agElements';
import { Mouse } from '../../lib/createMouse';
import { getBottomMidPos, getOffset } from '../../lib/dom';
import { addPoints } from '../../lib/geometry';
import { clearAllRowHighlights } from '../../lib/scriptActions/clearAllRowHighlights';
import { dragRange } from '../../lib/scriptActions/dragRange';
import { moveTarget } from '../../lib/scriptActions/move';
import { ScriptDebugger } from '../../lib/scriptDebugger';
import { ScriptAction } from '../../lib/scriptRunner';

interface Params {
    containerEl: HTMLElement;
    mouse: Mouse;
    tweenGroup: Group;
    gridOptions: GridOptions;
    scriptDebugger?: ScriptDebugger;
}

export const createScript = ({
    containerEl,
    mouse,
    tweenGroup,
    gridOptions,
    scriptDebugger,
}: Params): ScriptAction[] => {
    const START_CELL_COL_INDEX = 0;
    const START_CELL_ROW_INDEX = 0;
    const END_CELL_COL_INDEX = 2;
    const END_CELL_ROW_INDEX = 3;

    const agElementFinder = createAgElementFinder({ containerEl });
    const getOffscreenPos = () => getBottomMidPos(containerEl);

    return [
        {
            type: 'custom',
            action: () => {
                // Move mouse to starting position
                moveTarget({ target: mouse.getTarget(), coords: getOffscreenPos(), scriptDebugger });

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

        // Wait for data to load
        { type: 'wait', duration: 1000 },

        // Select start cell
        {
            type: 'moveTo',
            toPos: () =>
                agElementFinder
                    .get('cell', {
                        colIndex: START_CELL_COL_INDEX,
                        rowIndex: START_CELL_ROW_INDEX,
                    })
                    ?.getPos(),
            speed: 2,
        },
        { type: 'mouseDown' },

        // Range selection
        {
            type: 'custom',
            action() {
                return dragRange({
                    agElementFinder,
                    mouse,
                    startCol: START_CELL_COL_INDEX,
                    startRow: START_CELL_ROW_INDEX,
                    endCol: END_CELL_COL_INDEX,
                    endRow: END_CELL_ROW_INDEX,
                    tweenGroup,
                    scriptDebugger,
                    duration: 200,
                });
            },
        },
        { type: 'mouseUp' },
        { type: 'wait', duration: 100 },

        {
            type: 'agAction',
            actionType: 'clickOnContextMenuItem',
            actionParams: {
                mouse,
                cellColIndex: END_CELL_COL_INDEX,
                cellRowIndex: END_CELL_ROW_INDEX,
                menuItemPath: ['Chart Range', 'Column', 'Stacked'],
                tweenGroup,
                scriptDebugger,
                speed: 0.5,
            },
        },
        {
            name: 'Create range chart',
            type: 'custom',
            action: () => {
                const chartModels = gridOptions.api?.getChartModels() || [];

                if (chartModels.length) {
                    return; // Chart created, no need for fallback
                }

                const allColumns = gridOptions.columnApi?.getColumns() || [];
                const colStartIndex = START_CELL_COL_INDEX;
                const colEndIndex = END_CELL_COL_INDEX;
                const columnStart = allColumns[colStartIndex];
                const columnEnd = allColumns[colEndIndex];

                if (!columnStart) {
                    scriptDebugger?.errorLog('Column start not found for index', colStartIndex);
                    return;
                }
                if (!columnEnd) {
                    scriptDebugger?.errorLog('Column end not found for index', colEndIndex);
                    return;
                }

                scriptDebugger?.log('Context menu chart creation failed, creating chart using grid API');

                gridOptions?.api?.createRangeChart({
                    chartType: 'stackedColumn',
                    cellRange: {
                        rowStartIndex: START_CELL_ROW_INDEX,
                        rowEndIndex: END_CELL_ROW_INDEX,
                        columnStart,
                        columnEnd,
                    },
                });
            },
        },

        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelButton',
            },
        },
        // Wait for chart tool panel button to finish coming out
        { type: 'wait', duration: 500 },

        // Click on data tab
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelTab',
                targetParams: {
                    text: 'Data',
                },
            },
        },
        { type: 'wait', duration: 300 },

        // Click on data input items
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelGroupItemInput',
                targetParams: {
                    groupTitle: 'Series',
                    itemTitle: 'Apr',
                },
            },
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelGroupItemInput',
                targetParams: {
                    groupTitle: 'Series',
                    itemTitle: 'May',
                },
            },
        },
        { type: 'wait', duration: 500 },
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelGroupItemInput',
                targetParams: {
                    groupTitle: 'Series',
                    itemTitle: 'Feb',
                },
            },
        },
        { type: 'wait', duration: 500 },

        // Click on settings tab
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelTab',
                targetParams: {
                    text: 'Settings',
                },
            },
        },
        { type: 'wait', duration: 300 },

        // Select Pie
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartSeriesButton',
                targetParams: {
                    groupTitle: 'Pie',
                    seriesTitle: 'Pie',
                },
            },
        },
        { type: 'wait', duration: 700 },

        // Select Bar Stacked
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartSeriesButton',
                targetParams: {
                    groupTitle: 'Bar',
                    seriesTitle: 'Stacked',
                },
            },
        },
        { type: 'wait', duration: 500 },

        // Click on format tab
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelTab',
                targetParams: {
                    text: 'Format',
                },
            },
        },
        { type: 'wait', duration: 300 },

        // Open Legend group
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelGroupTitle',
                targetParams: {
                    text: 'Legend',
                },
            },
        },
        { type: 'wait', duration: 300 },

        // Change Legend position
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelPickerField',
                targetParams: {
                    groupTitle: 'Legend',
                    selectLabel: 'Position',
                },
            },
        },
        { type: 'wait', duration: 300 },
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelSelectListItem',
                targetParams: {
                    text: 'Bottom',
                },
            },
        },
        { type: 'wait', duration: 300 },

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
