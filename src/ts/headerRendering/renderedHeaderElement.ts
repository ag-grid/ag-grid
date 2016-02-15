import _ from '../utils';
import Column from "../entities/column";
import GridOptionsWrapper from "../gridOptionsWrapper";
import {AbstractColDef} from "../entities/colDef";

export default class RenderedHeaderElement {

    private gridOptionsWrapper: GridOptionsWrapper;

    constructor(gridOptionsWrapper: GridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
    }

    // methods implemented by the base classes
    public destroy(): void {}
    public refreshFilterIcon(): void {}
    public refreshSortIcon(): void {}
    public onIndividualColumnResized(column: Column): void {}
    public getGui(): HTMLElement { return null; }

    protected getGridOptionsWrapper(): GridOptionsWrapper {
        return this.gridOptionsWrapper;
    }

    protected addHeaderClassesFromCollDef(abstractColDef: AbstractColDef, eHeaderCell: HTMLElement) {
        if (abstractColDef && abstractColDef.headerClass) {
            var classToUse: string | string[];
            if (typeof abstractColDef.headerClass === 'function') {
                var params = {
                    // bad naming, as colDef here can be a group or a column,
                    // however most people won't appreciate the difference,
                    // so keeping it as colDef to avoid confusion.
                    colDef: abstractColDef,
                    context: this.gridOptionsWrapper.getContext(),
                    api: this.gridOptionsWrapper.getApi()
                };
                var headerClassFunc = <(params: any) => string | string[]> abstractColDef.headerClass;
                classToUse = headerClassFunc(params);
            } else {
                classToUse = <string | string[]> abstractColDef.headerClass;
            }

            if (typeof classToUse === 'string') {
                _.addCssClass(eHeaderCell, classToUse);
            } else if (Array.isArray(classToUse)) {
                classToUse.forEach((cssClassItem: any): void => {
                    _.addCssClass(eHeaderCell, cssClassItem);
                });
            }
        }
    }

}
