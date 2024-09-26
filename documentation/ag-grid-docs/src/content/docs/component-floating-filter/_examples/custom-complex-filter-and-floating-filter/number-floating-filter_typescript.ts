import type { IFloatingFilterComp, IFloatingFilterParams } from 'ag-grid-community';

import type { CustomNumberFilter } from './custom-number-filter_typescript';

declare let $: any;

export interface CustomFloatingParams {
    maxValue: number;
}

export class NumberFloatingFilter implements IFloatingFilterComp {
    eGui!: HTMLDivElement;
    eSlider: any;
    currentValue!: number | null;

    init(params: IFloatingFilterParams<CustomNumberFilter> & CustomFloatingParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '<div style="width:75%; margin-left:10px" class="slider"></div>';
        this.eSlider = $(this.eGui.querySelector('div'));
        this.currentValue = 0;
        this.eSlider.slider({
            min: 0,
            max: params.maxValue,
            change: (e: any, ui: any) => {
                //Every time the value of the slider changes
                if (!e.originalEvent) {
                    //If this event its triggered from outside. ie setModel() on the parent Filter we
                    //would be in this area of the code and we need to prevent an infinite loop.
                    return;
                }
                this.currentValue = ui.value;
                params.parentFilterInstance((instance) => {
                    instance.myMethodForTakingValueFromFloatingFilter(this.buildModel());
                });
            },
        });
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
            //If there is no filtering set to the minimun
            this.eSlider.slider('option', 'value', 0);
            this.currentValue = null;
        } else {
            if (parentModel.filter !== this.currentValue) {
                this.eSlider.slider('option', 'value', parentModel);
            }
            this.currentValue = parentModel;
        }
        //Print a summary on the slider button
        this.eSlider.children('.ui-slider-handle').html(this.currentValue ? '>' + this.currentValue : '');
    }

    getGui() {
        return this.eGui;
    }

    buildModel() {
        if (this.currentValue === 0) return null;
        return this.currentValue;
    }
}
