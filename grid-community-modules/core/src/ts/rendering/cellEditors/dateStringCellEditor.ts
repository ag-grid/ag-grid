import { ICellEditorParams } from "../../interfaces/iCellEditor";
import { DataTypeService } from "../../columns/dataTypeService";
import { Autowired } from "../../context/context";
import { serialiseDate } from "../../utils/date";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { CellEditorInput, SimpleCellEditor } from "./simpleCellEditor";
import { exists } from "../../utils/generic";

export interface IDateStringCellEditorParams<TData = any, TContext = any> extends ICellEditorParams<TData, string, TContext> {
    /** Min allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    min?: string | Date;
    /** Max allowed value. Either `Date` object or string in format `'yyyy-mm-dd'`. */
    max?: string | Date;
    /**
     * Size of the value change when stepping up/down, starting from `min` or the initial value if provided.
     * Step is also the difference between valid values.
     * If the user-provided value isn't a multiple of the step value from the starting value, it will be considered invalid.
     * Defaults to any value allowed.
     */
    step?: number;
}

class DateStringCellEditorInput implements CellEditorInput<string, IDateStringCellEditorParams, AgInputDateField> {
    private eInput: AgInputDateField;
    private params: IDateStringCellEditorParams;

    constructor(private getDataTypeService: () => DataTypeService) {}

    public getTemplate() {
        return /* html */`<ag-input-date-field class="ag-cell-editor" ref="eInput"></ag-input-date-field>`;
    }

    public init(eInput: AgInputDateField, params: IDateStringCellEditorParams): void {
        this.eInput = eInput;
        this.params = params;
        if (params.min != null) {
            eInput.setMin(params.min);
        }
        if (params.max != null) {
            eInput.setMax(params.max);
        }
        if (params.step != null) {
            eInput.setStep(params.step);
        }
    }

    public getValue(): string | null | undefined {
        const value = this.formatDate(this.eInput.getDate());
        if (!exists(value) && !exists(this.params.value)) {
            return this.params.value;
        }
        return this.params.parseValue(value ?? '');
    }

    public getStartValue(): string | null | undefined {
        return serialiseDate(this.parseDate(this.params.value ?? undefined) ?? null, false);
    }

    private parseDate(value: string | undefined): Date | undefined {
        return this.getDataTypeService().getDateParserFunction(this.params.column)(value);
    }

    private formatDate(value: Date | undefined): string | undefined {
        return this.getDataTypeService().getDateFormatterFunction(this.params.column)(value);
    }
}

export class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    constructor() {
        super(new DateStringCellEditorInput(() => this.dataTypeService));
    }
}
