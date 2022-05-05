import {COUNTRY_CODES} from "./consts"

export class CountryFloatingFilterComponent {
    init(params) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.style.overflow = 'hidden';
        this.eGui.style.position = 'absolute';
        this.eGui.style.left = '0';
        this.eGui.style.right = '0';
        this.eGui.style.top = '50%';
        this.eGui.style.height = '16px';
        this.eGui.style.marginTop = '-8px';
    }

    getGui() {
        return this.eGui;
    }

    onParentModelChanged(dataModel) {
        var model, flagsHtml, printDotDotDot, toPrint;
        // add in child, one for each flat
        if (dataModel) {
            model = dataModel.values;
            flagsHtml = [];
            printDotDotDot = false;

            if (model.length > 4) {
                toPrint = model.slice(0, 4);
                printDotDotDot = true;
            } else {
                toPrint = model;
            }

            toPrint.forEach(function(country) {
                flagsHtml.push(`<img class="flag" style="border: 0px; width: 15px; height: 10px; margin-left: 2px" src="https://flags.fmcdn.net/data/flags/mini/${COUNTRY_CODES[country]}.png">`);
            });

            this.eGui.innerHTML = '(' + model.length + ') ' + flagsHtml.join('');
            if (printDotDotDot) {
                this.eGui.innerHTML = this.eGui.innerHTML + '...';
            }
        } else {
            this.eGui.innerHTML = '';
        }
    }
}

