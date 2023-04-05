import { GetElement } from '.';
import {
    AG_CHART_SERIES_GROUP_TITLE_SELECTOR,
    AG_CHART_TOOL_PANEL_BUTTON_SELECTOR,
    AG_CHART_TOOL_PANEL_TAB_SELECTOR,
    AG_GROUP_ITEM_SELECTOR,
    AG_GROUP_SELECTOR,
    AG_GROUP_TITLE_BAR_SELECTOR,
    AG_LABEL_SELECTOR,
    AG_PICKER_FIELD_SELECTOR,
    AG_PICKER_FIELD_WRAPPER_SELECTOR,
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

export interface AgElementByFindConfig {
    find: ({ getElement, params }: { getElement: GetElement; params: Record<string, any> }) => HTMLElement | undefined;
}

export type AgElementsConfig = AgElementBySelectorConfig | AgElementByInnerTextConfig | AgElementByFindConfig;

export interface AgElementsConfigItem {
    chartToolPanelButton: AgElementBySelectorConfig;

    chartToolPanelTab: AgElementByInnerTextConfig;
    chartToolPanelGroupTitle: AgElementByInnerTextConfig;
    chartToolPanelGroupItem: AgElementByInnerTextConfig;
    chartToolSeriesGroupTitle: AgElementByInnerTextConfig;
    chartToolPanelSelectListItem: AgElementByInnerTextConfig;

    chartToolPanelGroupItemInput: AgElementByFindConfig;
    chartSeriesButton: AgElementByFindConfig;
    chartToolPanelPickerField: AgElementByFindConfig;
    chartToolPanelSliderInput: AgElementByFindConfig;
}
export type AgElementName = keyof AgElementsConfigItem;

/**
 * Configuration object for how to get AG DOM elements
 */
export const agElementsConfig: AgElementsConfigItem = {
    // Find by selector
    chartToolPanelButton: {
        selector: AG_CHART_TOOL_PANEL_BUTTON_SELECTOR,
    },

    // Find by inner text
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
