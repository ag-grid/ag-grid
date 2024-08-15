import { isMobile } from '@components/automated-examples/lib/isMobile';
import { mouseClick } from '@components/automated-examples/lib/scriptActions/mouseClick';
import { waitFor } from '@components/automated-examples/lib/scriptActions/waitFor';
import type { Group } from '@tweenjs/tween.js';

import type { GridApi } from 'ag-grid-community';

import { type AgElement, createAgElementFinder } from '../../lib/agElements';
import { type Mouse } from '../../lib/createMouse';
import { getBottomMidPos, getOffset, getScrollOffset } from '../../lib/dom';
import { type Point, addPoints, scalePoint } from '../../lib/geometry';
import { clearAllRowHighlights } from '../../lib/scriptActions/clearAllRowHighlights';
import { dragRange } from '../../lib/scriptActions/dragRange';
import { moveTarget, moveTo } from '../../lib/scriptActions/move';
import { type ScriptDebugger } from '../../lib/scriptDebugger';
import { type ScriptAction } from '../../lib/scriptRunner';

interface Params {
    containerEl: HTMLElement;
    /**
     * Whether the container element is scaled or not, and by how much
     */
    getContainerScale?: () => number;
    mouse: Mouse;
    getOverlay: () => HTMLElement;
    tweenGroup: Group;
    gridApi: GridApi;
    scriptDebugger?: ScriptDebugger;
}

function getLegendOffset({
    chartsCanvas,
    offsetX,
    offsetY,
}: {
    chartsCanvas: AgElement;
    offsetX: number;
    offsetY: number;
}) {
    const { clientHeight } = chartsCanvas.get() as HTMLElement;
    const { x, y } = chartsCanvas.getPos() as Point;

    return { x: x + offsetX, y: Math.round(clientHeight / 2 + y) + offsetY };
}

export const createScript = ({
    containerEl,
    getContainerScale = () => 1,
    mouse,
    getOverlay,
    tweenGroup,
    gridApi,
    scriptDebugger,
}: Params): ScriptAction[] => {
    const START_CELL_COL_INDEX = 0;
    const START_CELL_ROW_INDEX = 0;
    const END_CELL_COL_INDEX = 4; // Till `Mar` column
    const END_CELL_ROW_INDEX = 9;

    const agElementFinder = createAgElementFinder({ containerEl });
    const getOffscreenPos = () => getBottomMidPos(containerEl);

    return [
        {
            type: 'custom',
            action: () => {
                // Move mouse to starting position
                moveTarget({
                    target: mouse.getTarget(),
                    coords: scalePoint(getOffscreenPos(), getContainerScale()),
                    offset: addPoints(
                        getOffset(containerEl),
                        getScrollOffset(),
                        scalePoint(
                            {
                                x: 0,
                                y: -120,
                            },
                            getContainerScale()
                        )
                    ),
                    scriptDebugger,
                });

                mouse.show();
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

        { type: 'wait', duration: 700 },

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
        {
            type: 'custom',
            action: () => {
                clearAllRowHighlights();
            },
        },

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
                    duration: 400,
                });
            },
        },
        { type: 'mouseUp' },
        { type: 'wait', duration: 600 },

        {
            type: 'agAction',
            actionType: 'clickOnContextMenuItem',
            actionParams: {
                mouse,
                rightClickOnCell: {
                    colIndex: END_CELL_COL_INDEX,
                    rowIndex: END_CELL_ROW_INDEX,
                },
                menuItemPath: ['Chart Range', 'Bar', 'Stacked'],
                tweenGroup,
                scriptDebugger,
                speed: 0.5,
            },
        },
        {
            name: 'Create range chart',
            type: 'custom',
            action: () => {
                const chartModels = gridApi.getChartModels() || [];

                if (chartModels.length) {
                    return; // Chart created, no need for fallback
                }

                const allColumns = gridApi.getColumns() || [];
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

                gridApi.createRangeChart({
                    chartType: 'stackedBar',
                    cellRange: {
                        rowStartIndex: START_CELL_ROW_INDEX,
                        rowEndIndex: END_CELL_ROW_INDEX,
                        columnStart,
                        columnEnd,
                    },
                });
            },
        },

        // Wait for chart toolbar pop up to show
        { type: 'wait', duration: 1000 },

        // Change category to `Country`
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelPickerField',
                targetParams: {
                    groupTitle: 'Categories',
                    // NOTE: Categories label is hidden
                    selectLabel: '',
                    index: 0,
                },
            },
        },
        { type: 'wait', duration: 400 },
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelSelectListItem',
                targetParams: {
                    text: 'Country',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Toggle `Aggregate`
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelToggle',
                targetParams: {
                    groupTitle: 'Categories',
                    toggleLabel: 'Aggregate',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Select `Average` aggregate
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelPickerField',
                targetParams: {
                    groupTitle: 'Categories',
                    // NOTE: Categories label is hidden
                    selectLabel: '',
                    index: 1,
                },
            },
        },
        { type: 'wait', duration: 400 },
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelSelectListItem',
                targetParams: {
                    text: 'Average',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Toggle `Switch Category / Series`
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelToggle',
                targetParams: {
                    groupTitle: 'Series',
                    toggleLabel: 'Switch Category / Series',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Click on `Customize` tab
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelTab',
                targetParams: {
                    text: 'Customize',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Open `Titles` group
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelGroupTitle',
                targetParams: {
                    text: 'Titles',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Toggle `Chart Title`
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelToggle',
                targetParams: {
                    groupTitle: 'Titles',
                    toggleLabel: 'Chart Title',
                },
            },
        },
        { type: 'wait', duration: 600 },

        // Change title to `Average Monthly Earning`
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelTextInput',
                targetParams: {
                    groupTitle: 'Titles',
                    inputLabel: 'Title',
                    index: 0,
                },
            },
        },
        { type: 'wait', duration: 600 },
        {
            type: 'agAction',
            actionType: 'typeInTextInput',
            actionParams: {
                text: 'Average Monthly Earning',
                groupTitle: 'Titles',
                inputLabel: 'Title',
                index: 0,
            },
        },
        { type: 'wait', duration: 1000 },

        // Move to canvas legend
        {
            type: 'custom',
            action: async () => {
                const chartsCanvas = agElementFinder.get('chartsCanvas')!;
                const chartsCanvasEl = chartsCanvas?.get();
                if (!chartsCanvasEl) {
                    throw new Error('No charts canvas found');
                }

                const speed = 1;
                // Offset coordinates for different legend positions
                // NOTE: Get these dynamically, so that they are the most up to date when
                // the action is run

                const getOffsetCoords1 = () => {
                    const desktopCoords = {
                        offsetX: -25,
                        offsetY: isMobile() ? -103 : -23,
                    };
                    const coords = getLegendOffset({
                        chartsCanvas,
                        ...desktopCoords,
                    });

                    return coords;
                };

                const getOffsetCoords2 = () => {
                    const desktopCoords = {
                        offsetX: -25,
                        offsetY: isMobile() ? -118 : -43,
                    };
                    const coords = getLegendOffset({
                        chartsCanvas,
                        ...desktopCoords,
                    });

                    return coords;
                };

                // Select offset1 legend
                await moveTo({
                    mouse,
                    getOverlay,
                    toPos: getOffsetCoords1(),
                    speed,
                    tweenGroup,
                    scriptDebugger,
                });
                await waitFor(100);
                await mouseClick({
                    mouse,
                    element: chartsCanvasEl,
                    coords: getOffsetCoords1(),
                    withClick: true,
                    scriptDebugger,
                });
                await waitFor(600);

                // Select offset2 legend
                await moveTo({
                    mouse,
                    getOverlay,
                    toPos: getOffsetCoords2(),
                    speed,
                    tweenGroup,
                    scriptDebugger,
                });
                await waitFor(100);
                await mouseClick({
                    mouse,
                    element: chartsCanvasEl,
                    coords: getOffsetCoords2(),
                    withClick: true,
                    scriptDebugger,
                });
                await waitFor(600);
            },
        },
        { type: 'wait', duration: 1000 },

        // Close chart tool panel
        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartMenuToolPanelCloseButton',
            },
        },
        { type: 'wait', duration: 500 },

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
