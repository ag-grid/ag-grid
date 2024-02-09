import { IDate, IDateParams } from "@ag-grid-community/core";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomDateProps, CustomDateCallbacks } from "./interfaces";

export class DateComponentWrapper extends CustomComponentWrapper<IDateParams, CustomDateProps, CustomDateCallbacks> implements IDate {
    private date: Date | null = null;
    private readonly onDateChange = (date: Date | null) => this.updateDate(date);

    public getDate(): Date | null {
        return this.date;
    }

    public setDate(date: Date | null): void {
        this.date = date;
        this.refreshProps();
    }

    public refresh(params: IDateParams): void {
        this.sourceParams = params;
        this.refreshProps();
    }

    protected getOptionalMethods(): string[] {
        return ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled'];
    }

    private updateDate(date: Date | null): void {
        this.setDate(date);
        this.sourceParams.onDateChanged();
    }

    protected getProps(): CustomDateProps {
        const props: CustomDateProps = {
            ...this.sourceParams,
            date: this.date,
            onDateChange: this.onDateChange,
            key: this.key
        } as any;
        // remove props in IDataParams but not BaseDateParams
        delete (props as any).onDateChanged;
        return props;
    }
}
