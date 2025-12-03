import type {
    AgEventTypeParams,
    AgGridCommon,
    GridOptionsService,
    GridOptionsWithDefaults,
    IMenuActionParams,
    _AgComponentSelectorType,
    _BeanCollection,
} from 'ag-grid-community';
import { _warn } from 'ag-grid-community';

import { AgMenuItemRenderer } from '../agStack/agMenuItemRenderer';

export class MenuItemRenderer extends AgMenuItemRenderer<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType,
    IMenuActionParams
> {
    constructor() {
        super({ warnNoIcon: () => _warn(227) });
    }
}
