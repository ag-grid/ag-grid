/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { setDisplayed } from '../../../utils/dom';
/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export class DateCompWrapper {
    constructor(context, userComponentFactory, dateComponentParams, eParent) {
        this.alive = true;
        this.context = context;
        this.eParent = eParent;
        const compDetails = userComponentFactory.getDateCompDetails(dateComponentParams);
        const promise = compDetails.newAgStackInstance();
        promise.then(dateComp => {
            // because async, check the filter still exists after component comes back
            if (!this.alive) {
                context.destroyBean(dateComp);
                return;
            }
            this.dateComp = dateComp;
            if (!dateComp) {
                return;
            }
            eParent.appendChild(dateComp.getGui());
            if (dateComp.afterGuiAttached) {
                dateComp.afterGuiAttached();
            }
            if (this.tempValue) {
                dateComp.setDate(this.tempValue);
            }
            if (this.disabled != null) {
                this.setDateCompDisabled(this.disabled);
            }
        });
    }
    destroy() {
        this.alive = false;
        this.dateComp = this.context.destroyBean(this.dateComp);
    }
    getDate() {
        return this.dateComp ? this.dateComp.getDate() : this.tempValue;
    }
    setDate(value) {
        if (this.dateComp) {
            this.dateComp.setDate(value);
        }
        else {
            this.tempValue = value;
        }
    }
    setDisabled(disabled) {
        if (this.dateComp) {
            this.setDateCompDisabled(disabled);
        }
        else {
            this.disabled = disabled;
        }
    }
    setDisplayed(displayed) {
        setDisplayed(this.eParent, displayed);
    }
    setInputPlaceholder(placeholder) {
        if (this.dateComp && this.dateComp.setInputPlaceholder) {
            this.dateComp.setInputPlaceholder(placeholder);
        }
    }
    setInputAriaLabel(label) {
        if (this.dateComp && this.dateComp.setInputAriaLabel) {
            this.dateComp.setInputAriaLabel(label);
        }
    }
    afterGuiAttached(params) {
        if (this.dateComp && typeof this.dateComp.afterGuiAttached === 'function') {
            this.dateComp.afterGuiAttached(params);
        }
    }
    setDateCompDisabled(disabled) {
        if (this.dateComp == null) {
            return;
        }
        if (this.dateComp.setDisabled == null) {
            return;
        }
        this.dateComp.setDisabled(disabled);
    }
}
