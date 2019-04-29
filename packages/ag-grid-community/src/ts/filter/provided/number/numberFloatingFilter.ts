import { NumberFilterModel } from "./numberFilter";
import { _ } from "../../../utils";
import { BaseFloatingFilterChange, IFloatingFilterParams } from "../../floating/floatingFilter";
import { AbstractTextfieldFloatingFilterComp } from "../../floating/abstractTextfieldFloatingFilter";

export class NumberFloatingFilterComp extends AbstractTextfieldFloatingFilterComp<NumberFilterModel, IFloatingFilterParams> {

    asFloatingFilterText(toParse: NumberFilterModel): string {
        const currentParentModel = this.currentParentModel();
        if (toParse == null && currentParentModel == null) { return ''; }
        if (toParse == null && currentParentModel != null && currentParentModel.type !== 'inRange') {
            this.eColumnFloatingFilter.disabled = false;
            return '';
        }

        if (currentParentModel != null && currentParentModel.type === 'inRange') {
            this.eColumnFloatingFilter.disabled = true;
            return this.parseAsText(currentParentModel);
        }

        this.eColumnFloatingFilter.disabled = false;
        return this.parseAsText(toParse);

    }

    parseAsText(model: NumberFilterModel): string {
        const number: number = this.asNumber(model.filter);

        if (model.type && model.type === 'inRange') {
            const numberTo: number = this.asNumber(model.filterTo);
            return (number ? number + '' : '') +
                '-' +
                (numberTo ? numberTo + '' : '');
        }

        return number != null ? number + '' : '';
    }

    asParentModel(): NumberFilterModel {
        const filterValueNumber = this.asNumber(this.eColumnFloatingFilter.value);

        return {
            type: null,
            filter: filterValueNumber,
            filterTo: null,
            filterType: 'number'
        };
    }

    private asNumber(value: any): number {
        if (value == null) { return null; }
        if (value === '') { return null; }

        const asNumber = Number(value);
        const invalidNumber = !_.isNumeric(asNumber);
        return invalidNumber ? null : asNumber;
    }
}
