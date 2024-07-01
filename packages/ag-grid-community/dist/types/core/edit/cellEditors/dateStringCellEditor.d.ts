import type { BeanCollection } from '../../context/context';
import type { AgInputDateField } from '../../widgets/agInputDateField';
import type { IDateStringCellEditorParams } from './iDateStringCellEditor';
import { SimpleCellEditor } from './simpleCellEditor';
export declare class DateStringCellEditor extends SimpleCellEditor<string, IDateStringCellEditorParams, AgInputDateField> {
    private dataTypeService?;
    wireBeans(beans: BeanCollection): void;
    constructor();
}
