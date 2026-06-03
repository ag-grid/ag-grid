import type { TabGuardCtrlParams } from 'ag-stack';
import { AgTabGuardCtrl, AgTabGuardFeature } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { Component } from './component';
import { STOP_PROPAGATION_CALLBACKS } from './managedFocusFeature';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class TabGuardCtrl extends AgTabGuardCtrl<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {
    constructor(params: TabGuardCtrlParams) {
        super(params, STOP_PROPAGATION_CALLBACKS);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class TabGuardFeature extends AgTabGuardFeature<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {
    constructor(comp: Component<any>) {
        super(comp, STOP_PROPAGATION_CALLBACKS);
    }
}
