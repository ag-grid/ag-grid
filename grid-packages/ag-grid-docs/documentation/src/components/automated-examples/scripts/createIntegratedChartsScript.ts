import { Group } from '@tweenjs/tween.js';
import { createAgElementFinder } from '../lib/agElements';
import { getCellPos } from '../lib/agQuery';
import { Mouse } from '../lib/createMouse';
import { getOffset } from '../lib/dom';
import { addPoints, Point } from '../lib/geometry';
import { clearAllRowHighlights } from '../lib/scriptActions/clearAllRowHighlights';
import { dragRange } from '../lib/scriptActions/dragRange';
import { moveTarget } from '../lib/scriptActions/move';
import { updateRangeInputValue } from '../lib/scriptActions/updateRangeInputValue';
import { ScriptDebugger } from '../lib/scriptDebugger';
import { ScriptAction } from '../lib/scriptRunner';

interface CreateIntegratedChartsScriptParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    offScreenPos: Point;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
}

export const createIntegratedChartsScript = ({
    containerEl,
    mouse,
    offScreenPos,
    tweenGroup,
    scriptDebugger,
}: CreateIntegratedChartsScriptParams): ScriptAction[] => {
    const START_CELL_COL_INDEX = 0;
    const START_CELL_ROW_INDEX = 0;
    const END_CELL_COL_INDEX = 2;
    const END_CELL_ROW_INDEX = 3;

    const agElementFinder = createAgElementFinder({ containerEl });

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

        // Wait for data to load
        { type: 'wait', duration: 1000 },

        // Select start cell
        {
            type: 'moveTo',
            toPos: () => getCellPos({ containerEl, colIndex: START_CELL_COL_INDEX, rowIndex: START_CELL_ROW_INDEX }),
            speed: 2,
        },
        { type: 'mouseDown' },

        // Range selection
        {
            type: 'custom',
            action() {
                return dragRange({
                    containerEl,
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
                speed: 2,
            },
        },
        { type: 'wait', duration: 200 },

        {
            type: 'agAction',
            actionType: 'moveToElementAndClick',
            actionParams: {
                target: 'chartToolPanelButton',
            },
        },
        { type: 'wait', duration: 300 },

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

        // Change marker size
        {
            type: 'moveTo',
            toPos: () => {
                const sliderValue = 35;
                // To account for the size of the input control
                const sliderControlXOffset = -10;
                const slider = agElementFinder.get('chartToolPanelSliderInput', {
                    groupTitle: 'Legend',
                    sliderLabel: 'Marker Size',
                });
                if (!slider) {
                    console.error('Marker Size slider not found');
                    return;
                }
                const sliderEl = slider?.get() as HTMLInputElement;
                const sliderWidth = sliderEl?.clientWidth;
                const sliderRange = parseInt(sliderEl.max) - (parseInt(sliderEl.min) || 0);
                const sliderValueXOffset = sliderValue * (sliderWidth / sliderRange);
                const sliderRect = sliderEl.getBoundingClientRect();

                return {
                    x: sliderRect.x + sliderValueXOffset + sliderControlXOffset,
                    y: sliderRect.y + sliderRect.height / 2,
                };
            },
        },
        { type: 'click' },
        { type: 'wait', duration: 300 },
        {
            type: 'custom',
            action: () => {
                const slider = agElementFinder
                    .get('chartToolPanelSliderInput', {
                        groupTitle: 'Legend',
                        sliderLabel: 'Marker Size',
                    })
                    ?.get() as HTMLInputElement;

                updateRangeInputValue({ element: slider, value: 35 });
            },
        },
        { type: 'wait', duration: 500 },

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
