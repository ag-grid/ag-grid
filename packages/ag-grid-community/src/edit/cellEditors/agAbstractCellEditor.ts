import { AgPopupComponent } from 'ag-stack';

import type { AgAbstractField } from '../../agWidgets/agAbstractField';
import type { BeanCollection } from '../../context/context';
import type { AgEventTypeParams } from '../../events';
import type { GridOptionsWithDefaults } from '../../gridOptionsDefault';
import type { GridOptionsService } from '../../gridOptionsService';
import type { AgBaseCellEditor, ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { AgGridCommon } from '../../interfaces/iCommon';
import type { AgComponentSelectorType } from '../../widgets/component';

export abstract class AgAbstractCellEditor<P extends ICellEditorParams, TValue, TEditorValue = TValue>
    extends AgPopupComponent<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        AgComponentSelectorType
    >
    implements ICellEditorComp, AgBaseCellEditor<TValue>
{
    protected abstract eEditor: AgAbstractField<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        AgComponentSelectorType,
        TEditorValue,
        any,
        any
    >;
    protected params: P;

    protected abstract initialiseEditor(params: P): void;

    public abstract getValidationElement(tooltip: boolean): HTMLElement | HTMLInputElement;
    public abstract getValue(): TValue | null | undefined;
    public abstract getValidationErrors(): string[] | null;

    public errorMessages: string[] | null = null;

    public init(params: P) {
        this.params = params;
        this.initialiseEditor(params);
        this.eEditor.onValueChange(() => params.validate());
    }

    public abstract agSetEditValue(value: TValue | null | undefined): void;

    public override destroy(): void {
        this.eEditor.destroy();
        this.errorMessages = null;
        super.destroy();
    }
}
