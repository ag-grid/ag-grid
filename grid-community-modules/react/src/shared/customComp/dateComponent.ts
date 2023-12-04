import { AgPromise, IDate, IDateParams } from "@ag-grid-community/core";
import CustomWrapperComp from "../../reactUi/customComp/customWrapperComp";
import { CustomComponent } from "./customComponent";
import { CustomDateParams, DateMethods } from "./interfaces";

export class DateComponent extends CustomComponent<CustomDateParams, DateMethods> implements IDate {
    private date: Date | null = null;
    private dateParams!: IDateParams;

    public init(params: IDateParams): AgPromise<void> {
        this.dateParams = params;
        this.wrapperComponent = CustomWrapperComp;
        return super.init(this.createProps());
    }

    public getDate(): Date | null {
        return this.date;
    }

    public setDate(date: Date | null): void {
        this.date = date;
        this.refreshProps(this.createProps());
    }

    public onParamsUpdated(params: IDateParams): void {
        this.dateParams = params;
        this.refreshProps(this.createProps());
    }

    protected getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled'];
    }

    private updateDate(date: Date | null): void {
        this.setDate(date);
        this.dateParams.onDateChanged();
    }

    private createProps(): CustomDateParams {
        const props: CustomDateParams = {
            ...this.dateParams,
            date: this.date,
            onDateChange: (date: Date | null) => this.updateDate(date),
            key: this.key
        } as any;
        // remove props in IDataParams but not BaseDateParams
        delete (props as any).onDateChanged;
        return props;
    }
}
