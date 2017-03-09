import {IFilter,IFilterParams} from "ag-grid/main";

var FILTER_TITLE =
    '<div style="text-align: center; background: lightgray; width: 100%; display: block; border-bottom: 1px solid grey;">' +
    '<b>TITLE_NAME</b>' +
    '</div>';

var PROFICIENCY_TEMPLATE =
    '<label style="padding-left: 4px;">' +
    '<input type="radio" name="RANDOM"/>' +
    'PROFICIENCY_NAME' +
    '</label>';

var PROFICIENCY_NONE = 'none';
var PROFICIENCY_ABOVE40 = 'above40';
var PROFICIENCY_ABOVE60 = 'above60';
var PROFICIENCY_ABOVE80 = 'above80';

var PROFICIENCY_NAMES = ['No Filter', 'Above 40%', 'Above 60%', 'Above 80%'];
var PROFICIENCY_VALUES = [PROFICIENCY_NONE, PROFICIENCY_ABOVE40, PROFICIENCY_ABOVE60, PROFICIENCY_ABOVE80];

export default class ProficiencyFilter implements IFilter {
    private filterChangedCallback:Function;
    private selected:string;
    private valueGetter:Function;

    public init(params: IFilterParams) : void {
        this.filterChangedCallback = params.filterChangedCallback;
        this.selected = PROFICIENCY_NONE;
        this.valueGetter = params.valueGetter;
    }

    public getGui() {
        var eGui = document.createElement('div');
        var eInstructions = document.createElement('div');
        eInstructions.innerHTML = FILTER_TITLE.replace('TITLE_NAME', 'Custom Proficiency Filter');
        eGui.appendChild(eInstructions);

        var random = '' + Math.random();

        var that = this;
        PROFICIENCY_NAMES.forEach(function (name, index) {
            var eFilter = document.createElement('div');
            var html = PROFICIENCY_TEMPLATE.replace('PROFICIENCY_NAME', name).replace('RANDOM', random);
            eFilter.innerHTML = html;
            var eRadio = <HTMLInputElement> eFilter.querySelector('input');
            if (index === 0) {
                eRadio.checked = true;
            }
            eGui.appendChild(eFilter);

            eRadio.addEventListener('click', function () {
                that.selected = PROFICIENCY_VALUES[index];
                that.filterChangedCallback();
            });
        });

        return eGui;
    }

    public doesFilterPass(params) {

        var value = this.valueGetter(params);
        var valueAsNumber = parseFloat(value);

        switch (this.selected) {
            case PROFICIENCY_ABOVE40 :
                return valueAsNumber >= 40;
            case PROFICIENCY_ABOVE60 :
                return valueAsNumber >= 60;
            case PROFICIENCY_ABOVE80 :
                return valueAsNumber >= 80;
            default :
                return true;
        }

    }

    public isFilterActive() {
        return this.selected !== PROFICIENCY_NONE;
    }

    public getModel():any {
        return undefined;
    }

    public setModel(model:any):void {
    }
}
