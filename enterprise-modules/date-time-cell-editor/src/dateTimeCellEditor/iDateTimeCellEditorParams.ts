import { ICellEditorParams } from '@ag-grid-community/core';
import { IDateTimeListModel, IDateTimeListModelOptions } from '../dateTimeList/dateTimeListModel';

export interface IDateTimeCellEditorParams extends ICellEditorParams {
    // TODO implement this. Detect based on presence of `getPage` function
    listModel: IDateTimeListModel | IDateTimeListModelOptions;
}
