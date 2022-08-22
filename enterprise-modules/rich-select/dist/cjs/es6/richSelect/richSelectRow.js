"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class RichSelectRow extends core_1.Component {
    constructor(params) {
        super(/* html */ `<div class="ag-rich-select-row" role="presentation"></div>`);
        this.params = params;
    }
    setState(value, valueFormatted, selected) {
        const rendererSuccessful = this.populateWithRenderer(value, valueFormatted);
        if (!rendererSuccessful) {
            this.populateWithoutRenderer(value, valueFormatted);
        }
        this.updateSelected(selected);
    }
    updateSelected(selected) {
        this.addOrRemoveCssClass('ag-rich-select-row-selected', selected);
    }
    populateWithoutRenderer(value, valueFormatted) {
        const valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        const valueToRender = valueFormattedExits ? valueFormatted : value;
        if (core_1._.exists(valueToRender) && valueToRender !== '') {
            // not using innerHTML to prevent injection of HTML
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
            this.getGui().textContent = valueToRender.toString();
        }
        else {
            // putting in blank, so if missing, at least the user can click on it
            this.getGui().innerHTML = '&nbsp;';
        }
    }
    populateWithRenderer(value, valueFormatted) {
        // bad coder here - we are not populating all values of the cellRendererParams
        const params = {
            value: value,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi()
        };
        const compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        const cellRendererPromise = compDetails ? compDetails.newAgStackInstance() : undefined;
        if (cellRendererPromise != null) {
            core_1._.bindCellRendererToHtmlElement(cellRendererPromise, this.getGui());
        }
        else {
            this.getGui().innerText = params.valueFormatted != null ? params.valueFormatted : params.value;
        }
        if (cellRendererPromise) {
            cellRendererPromise.then(childComponent => {
                this.addDestroyFunc(() => {
                    this.getContext().destroyBean(childComponent);
                });
            });
            return true;
        }
        return false;
    }
}
__decorate([
    core_1.Autowired('userComponentFactory')
], RichSelectRow.prototype, "userComponentFactory", void 0);
exports.RichSelectRow = RichSelectRow;
