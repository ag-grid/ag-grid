import { DataTypeService } from "src/ts/columns/dataTypeService";
import { Autowired } from "../../context/context";
import { serialiseDate } from "../../utils/date";
import { AgInputDateField } from "../../widgets/agInputDateField";
import { CellEditorInput, ISimpleCellEditorParams, SimpleCellEditor } from "./simpleCellEditor";

export interface IDateStringCellEditorParams extends ISimpleCellEditorParams {
    min?: string | Date;
    max?: string | Date;
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

    public getValue(): string {
        return this.params.parseValue(this.formatDate(this.eInput.getDate()));
    }

    public getStartValue(): string | undefined {
        return serialiseDate(this.parseDate(this.params.value) ?? null, false) ?? undefined;
    }

    private parseDate(value: string | undefined): Date | undefined {
        return this.getDataTypeService().getDateParserFunction()(value);
    }

    private formatDate(value: Date | undefined): string | undefined {
        return this.getDataTypeService().getDateFormatterFunction()(value);
    }
}

export class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    constructor() {
        super(new DateStringCellEditorInput(() => this.dataTypeService));
    }
}
