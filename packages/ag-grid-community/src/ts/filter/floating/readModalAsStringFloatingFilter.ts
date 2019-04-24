import { AbstractTextfieldFloatingFilterComp } from "./abstractTextfieldFloatingFilter";
import { BaseFloatingFilterChange, IFloatingFilterParams } from "./floatingFilter";

export class ReadModelAsStringFloatingFilterComp extends AbstractTextfieldFloatingFilterComp<string, IFloatingFilterParams<string, BaseFloatingFilterChange<string>>> {
    init(params: IFloatingFilterParams<string, BaseFloatingFilterChange<string>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    onParentModelChanged(parentModel: any): void {
        this.eColumnFloatingFilter.value = this.asFloatingFilterText(this.currentParentModel());
    }

    asFloatingFilterText(parentModel: string): string {
        return parentModel;
    }

    parseAsText(model: string): string {
        return model;
    }

    asParentModel(): string {
        return null;
    }
}
