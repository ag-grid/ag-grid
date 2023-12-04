import { AgPromise, BaseDate, BaseDateParams, IDate, IDateParams } from "ag-grid-community";
import CustomWrapperComp from "../../reactUi/customComp/customWrapperComp";
import { CustomComponent,  useGridCustomComponent } from "./customComponent";

export function useGridDate(methods: DateMethods): void {
    return useGridCustomComponent(methods);
}

export interface DateMethods extends BaseDate {}

export interface CustomDateParams<TData = any, TContext = any> extends BaseDateParams<TData, TContext> {
    date: Date | null,
    onDateChange: (date: Date | null) => void,
}

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
        const { api, columnApi, context, filterParams } = this.dateParams;
        return {
            api,
            columnApi,
            context,
            filterParams,
            date: this.date,
            onDateChange: (date: Date | null) => this.updateDate(date),
            key: this.key
        } as any;
    }
}
