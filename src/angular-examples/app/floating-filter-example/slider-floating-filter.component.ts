import {Component} from "@angular/core";
import {ViewChild} from "@angular/core";
import {IFloatingFilter} from "ag-grid/main";
import {SerializedNumberFilter} from "ag-grid/main";
import {IFloatingFilterParams} from "ag-grid/main";
import {AgFrameworkComponent} from "ag-grid-angular/main";
import * as $ from "jquery";
import * as slider from "jquery-ui";


export interface SliderFloatingFilterChange {
    model:SerializedNumberFilter
}

export interface SliderFloatingFilterParams extends IFloatingFilterParams<SerializedNumberFilter, SliderFloatingFilterChange> {
    maxValue: number
}

@Component({
    templateUrl: './slider-floating-filter.component.html'
})
export class SliderFloatingFilter implements IFloatingFilter <SerializedNumberFilter, SliderFloatingFilterChange, SliderFloatingFilterParams>, AgFrameworkComponent<SliderFloatingFilterParams> {
    private params: SliderFloatingFilterParams;
    private currentValue: number;
    //Dealing with AOT wiring Jquery differently this will contain the usual $ jquery function
    _$:(from:any)=>any;
    //Dealing with AOT wiring Jquery differently this will contain the usual $ jquery function
    _slider:(from:any, into:any)=>any;

    @ViewChild('slider') eSlider;

    constructor() {
        //https://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
        function isFunction(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }

        function extractJQueryFn (from):()=>any {
            if (isFunction(from)){
                return from;
            } else if (isFunction(from.default)){
                return from.default
            } else {
                throw Error ("Can't find jquery!")
            }

        }

        //Dealing with AOT wiring Jquery differently this will contain the usual $ jquery function
        this._$ = extractJQueryFn($);
        this._slider = extractJQueryFn(slider);
    }

    agInit(params: SliderFloatingFilterParams): void {
        this.params = params;
    }

    afterGuiAttached(): void {
        var that:SliderFloatingFilter = this;
        this.eSlider = this._$(this.eSlider.nativeElement);
        this._slider({
            min: 0,
            max: this.params.maxValue,
            change: (e, ui) => {
                //Every time the value of the slider changes
                if (!e.originalEvent) {
                    //If this event its triggered from outside. ie setModel() on the parent Filter we
                    //would be in this area of the code and we need to prevent an infinite loop:
                    //onParentModelChanged => onFloatingFilterChanged => onParentModelChanged => onFloatingFilterChanged ...
                    return;
                }
                that.currentValue = ui.value;
                let change:SliderFloatingFilterChange = {
                    model: that.buildModel()
                }
                that.params.onFloatingFilterChanged(change)
            }
        }, this.eSlider);
    }

    onParentModelChanged(parentModel: SerializedNumberFilter): void {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
            //If there is no filtering set to the minimun
            this.eSlider.slider("option", "value", 0);
            this.currentValue = null;
        } else {
            if (parentModel.filter !== this.currentValue) {
                this.eSlider.slider("option", "value", parentModel);
            }
            this.currentValue = parentModel.filter;
        }
        //Print a summary on the slider button
        this.eSlider.children(".ui-slider-handle").html(this.currentValue ? '>' + this.currentValue : '');
    }

    buildModel():SerializedNumberFilter {
        if (this.currentValue === 0) return null;
        return {
            filterType: 'number',
            type: 'greaterThan',
            filter: this.currentValue,
            filterTo: null
        };
    }

}