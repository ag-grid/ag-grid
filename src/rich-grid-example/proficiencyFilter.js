const FILTER_TITLE =
    '<div style="text-align: center; background: lightgray; width: 100%; display: block; border-bottom: 1px solid grey;">' +
    '<b>TITLE_NAME</b>' +
    '</div>';

const PROFICIENCY_TEMPLATE =
    '<label style="padding-left: 4px;">' +
    '<input type="radio" name="RANDOM"/>' +
    'PROFICIENCY_NAME' +
    '</label>';

const PROFICIENCY_NONE = 'none';
const PROFICIENCY_ABOVE40 = 'above40';
const PROFICIENCY_ABOVE60 = 'above60';
const PROFICIENCY_ABOVE80 = 'above80';

const PROFICIENCY_NAMES = ['No Filter', 'Above 40%', 'Above 60%', 'Above 80%'];
const PROFICIENCY_VALUES = [PROFICIENCY_NONE, PROFICIENCY_ABOVE40, PROFICIENCY_ABOVE60, PROFICIENCY_ABOVE80];

export class ProficiencyFilter {
    init(params) {
        this.filterChangedCallback = params.filterChangedCallback;
        this.selected = PROFICIENCY_NONE;
        this.valueGetter = params.valueGetter;
    }

    getGui() {
        let eGui = document.createElement('div');
        let eInstructions = document.createElement('div');
        eInstructions.innerHTML = FILTER_TITLE.replace('TITLE_NAME', 'Custom Proficiency Filter');
        eGui.appendChild(eInstructions);

        let random = '' + Math.random();

        let that = this;
        PROFICIENCY_NAMES.forEach(function (name, index) {
            let eFilter = document.createElement('div');
            let html = PROFICIENCY_TEMPLATE.replace('PROFICIENCY_NAME', name).replace('RANDOM', random);
            eFilter.innerHTML = html;
            let eRadio = eFilter.querySelector('input');
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

    doesFilterPass(params) {

        let value = this.valueGetter(params);
        let valueAsNumber = parseFloat(value);

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

    isFilterActive() {
        return this.selected !== PROFICIENCY_NONE;
    }

    getModel() {
        return undefined;
    }

    setModel(model) {
    }
}
