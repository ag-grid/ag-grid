import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    GridOptionsService,
    GridOptionsWithDefaults,
    IMenuActionParams,
} from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { AgMenuItemRenderer } from '../agStack/agMenuItemRenderer';

export class MenuItemRenderer extends AgMenuItemRenderer<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    IMenuActionParams
> {
    constructor() {
        super({ warnNoIcon: () => _warn(227) });
    }
}
