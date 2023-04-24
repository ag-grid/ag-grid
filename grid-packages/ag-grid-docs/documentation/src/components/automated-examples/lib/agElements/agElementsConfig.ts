import { GetElement } from '.';
import {
    AG_CHART_SERIES_GROUP_TITLE_SELECTOR,
    AG_CHART_TOOL_PANEL_BUTTON_SELECTOR,
    AG_CHART_TOOL_PANEL_TAB_SELECTOR,
    AG_COLUMN_DROP_SELECTOR,
    AG_GROUP_CONTRACTED,
    AG_GROUP_EXPANDED,
    AG_GROUP_ITEM_SELECTOR,
    AG_GROUP_SELECTOR,
    AG_GROUP_TITLE_BAR_SELECTOR,
    AG_HEADER_CELL_SELECTOR,
    AG_HEADER_CELL_TEXT_SELECTOR,
    AG_LABEL_SELECTOR,
    AG_MENU_OPTION_TEXT_SELECTOR,
    AG_PICKER_FIELD_SELECTOR,
    AG_PICKER_FIELD_WRAPPER_SELECTOR,
    AG_POPUP_SELECTOR,
    AG_RANGE_FIELD_INOUT_SELECTOR,
    AG_SELECT_LIST_ITEM_SELECTOR,
    AG_SLIDER_SELECTOR,
} from '../constants';
import { findElementWithInnerText } from '../dom';

export interface AgElementBySelectorConfig {
    selector: string;
}

export interface AgElementByInnerTextConfig {
    innerTextSelector: string;
}

export interface AgElementByFindConfig<Params> {
    find: ({
        getElement,
        containerEl,
        params,
    }: {
        getElement: GetElement;
        containerEl: HTMLElement;
        params: Params;
    }) => HTMLElement | undefined;
}

export type AgElementsConfig = AgElementBySelectorConfig | AgElementByInnerTextConfig | AgElementByFindConfig<any>;

export interface AgElementsConfigItem {
    popup: AgElementBySelectorConfig;
    columnDropArea: AgElementBySelectorConfig;
    chartToolPanelButton: AgElementBySelectorConfig;

    contextMenuItem: AgElementByInnerTextConfig;
    chartToolPanelTab: AgElementByInnerTextConfig;
    chartToolPanelGroupTitle: AgElementByInnerTextConfig;
    chartToolPanelGroupItem: AgElementByInnerTextConfig;
    chartToolSeriesGroupTitle: AgElementByInnerTextConfig;
    chartToolPanelSelectListItem: AgElementByInnerTextConfig;

    cell: AgElementByFindConfig<{ colIndex: number; rowIndex: number }>;
    groupCellToggle: AgElementByFindConfig<{ colIndex: number; rowIndex: number }>;
    headerCell: AgElementByFindConfig<{ text: string }>;
    chartToolPanelGroupItemInput: AgElementByFindConfig<{
        groupTitle: string;
        itemTitle: string;
    }>;
    chartSeriesButton: AgElementByFindConfig<{
        groupTitle: string;
        seriesTitle: string;
    }>;
    chartToolPanelPickerField: AgElementByFindConfig<{
        groupTitle: string;
        selectLabel: string;
    }>;
    chartToolPanelSliderInput: AgElementByFindConfig<{
        groupTitle: string;
        sliderLabel: string;
    }>;
}
export type AgElementName = keyof AgElementsConfigItem;

/**
 * Configuration object for how to get AG DOM elements
 */
export const agElementsConfig: AgElementsConfigItem = {
    // Find by selector
    popup: {
        selector: AG_POPUP_SELECTOR,
    },
    columnDropArea: {
        selector: AG_COLUMN_DROP_SELECTOR,
    },
    chartToolPanelButton: {
        selector: AG_CHART_TOOL_PANEL_BUTTON_SELECTOR,
    },

    // Find by inner text
    contextMenuItem: {
        innerTextSelector: AG_MENU_OPTION_TEXT_SELECTOR,
    },
    chartToolPanelTab: {
        innerTextSelector: AG_CHART_TOOL_PANEL_TAB_SELECTOR,
    },
    chartToolPanelGroupTitle: {
        innerTextSelector: AG_GROUP_TITLE_BAR_SELECTOR,
    },
    chartToolPanelGroupItem: {
        innerTextSelector: AG_GROUP_ITEM_SELECTOR,
    },
    chartToolSeriesGroupTitle: {
        innerTextSelector: AG_CHART_SERIES_GROUP_TITLE_SELECTOR,
    },
    chartToolPanelSelectListItem: {
        innerTextSelector: AG_SELECT_LIST_ITEM_SELECTOR,
    },

    // Find by custom function
    cell: {
        find: ({ containerEl, params }) => {
            const { colIndex, rowIndex } = params;
            const rowEl = containerEl.querySelector(`div[row-index="${rowIndex}"]`);
            if (!rowEl) {
                return;
            }

            const cellEl = rowEl.children[colIndex] as HTMLElement;
            if (!cellEl) {
                return;
            }

            return cellEl;
        },
    },
    groupCellToggle: {
        find: ({ getElement, params }) => {
            const { colIndex, rowIndex } = params;
            const cellEl = getElement('cell', { colIndex, rowIndex })?.get();
            if (!cellEl) {
                return;
            }
            const contractedEl = cellEl.querySelector(`${AG_GROUP_CONTRACTED}:not(.ag-hidden)`);
            const expandedEl = cellEl.querySelector(`${AG_GROUP_EXPANDED}:not(.ag-hidden)`);
            const toggleEl = (contractedEl || expandedEl) as HTMLElement;

            return toggleEl;
        },
    },
    headerCell: {
        find: ({ containerEl, params }) => {
            const { text } = params;
            // Get inner text label element
            const headerTextElem = findElementWithInnerText({
                containerEl,
                selector: AG_HEADER_CELL_TEXT_SELECTOR,
                text,
            });

            // Get parent header cell element
            const parentHeader = headerTextElem?.closest(AG_HEADER_CELL_SELECTOR) as HTMLElement;
            return parentHeader;
        },
    },
    chartToolPanelGroupItemInput: {
        find: ({ getElement, params }) => {
            const { groupTitle, itemTitle } = params;
            const groupTitleEl = getElement('chartToolPanelGroupTitle', {
                text: groupTitle,
            })?.get();

            const groupEl = groupTitleEl?.closest(AG_GROUP_SELECTOR);
            if (!groupEl) {
                console.error(`No group title found: ${groupTitle}`);
                return;
            }

            const groupItemEl = getElement('chartToolPanelGroupItem', {
                containerEl: groupEl as HTMLElement,
                text: itemTitle,
            })?.get();

            return groupItemEl?.querySelector('input') || undefined;
        },
    },
    chartSeriesButton: {
        find: ({ getElement, params }) => {
            const { groupTitle, seriesTitle } = params;
            const groupTitleEl = getElement('chartToolSeriesGroupTitle', {
                text: groupTitle,
            })?.get();
            const groupEl = groupTitleEl?.closest(AG_GROUP_SELECTOR);
            if (!groupEl) {
                console.error(`No group title found: ${groupTitle}`);
                return;
            }

            const seriesImage = groupEl.querySelector(`canvas[title="${seriesTitle}"]`);
            return seriesImage?.parentElement || undefined;
        },
    },
    chartToolPanelPickerField: {
        find: ({ getElement, params }) => {
            const { groupTitle, selectLabel } = params;
            const groupTitleEl = getElement('chartToolPanelGroupTitle', {
                text: groupTitle,
            })?.get();
            const groupEl = groupTitleEl?.closest(AG_GROUP_SELECTOR) as HTMLElement;
            if (!groupEl) {
                console.error(`No group title found: ${groupTitle}`);
                return;
            }

            const labelEl = findElementWithInnerText({
                containerEl: groupEl,
                selector: AG_LABEL_SELECTOR,
                text: selectLabel,
            });
            if (!labelEl) {
                console.error(`No label title found: ${selectLabel}`);
                return;
            }
            const pickerFieldContainer = labelEl.closest(AG_PICKER_FIELD_SELECTOR);
            if (!pickerFieldContainer) {
                console.error(`No picker field container found: ${selectLabel}`);
                return;
            }

            const picker = pickerFieldContainer.querySelector(AG_PICKER_FIELD_WRAPPER_SELECTOR) as HTMLElement;

            return picker || undefined;
        },
    },
    chartToolPanelSliderInput: {
        find: ({ getElement, params }) => {
            const { groupTitle, sliderLabel } = params;
            const groupTitleEl = getElement('chartToolPanelGroupTitle', {
                text: groupTitle,
            })?.get();
            const groupEl = groupTitleEl?.closest(AG_GROUP_SELECTOR) as HTMLElement;
            if (!groupEl) {
                console.error(`No group title found: ${groupTitle}`);
                return;
            }

            const labelEl = findElementWithInnerText({
                containerEl: groupEl,
                selector: AG_LABEL_SELECTOR,
                text: sliderLabel,
            });
            if (!labelEl) {
                console.error(`No label title found: ${sliderLabel}`);
                return;
            }

            const sliderContainer = labelEl.closest(AG_SLIDER_SELECTOR);
            if (!sliderContainer) {
                console.error(`No slider found: ${sliderLabel}`);
                return;
            }

            return (sliderContainer.querySelector(AG_RANGE_FIELD_INOUT_SELECTOR) as HTMLElement) || undefined;
        },
    },
};
