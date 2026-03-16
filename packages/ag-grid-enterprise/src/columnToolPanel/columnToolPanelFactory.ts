import type { BeanName, Component, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { PivotModePanel } from './pivotModePanel';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

export class ColumnToolPanelFactory extends BeanStub implements NamedBean {
    beanName: BeanName = 'colToolPanelFactory';

    public setPanelVisible<C extends RowGroupDropZonePanel | ValuesDropZonePanel | PivotDropZonePanel | PivotModePanel>(
        existingPanel: C | undefined,
        visible: boolean,
        createFunc: () => C
    ): C | undefined {
        if (existingPanel) {
            existingPanel.setDisplayed(visible);
        } else if (visible) {
            existingPanel = createFunc();
        }
        return existingPanel;
    }

    public createRowGroupPanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params?: ColumnStateUpdateParams
    ): RowGroupDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new RowGroupDropZonePanel(false, params));
    }

    public createValuesPanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params?: ColumnStateUpdateParams
    ): ValuesDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new ValuesDropZonePanel(false, params));
    }

    public createPivotPanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params?: ColumnStateUpdateParams
    ): PivotDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new PivotDropZonePanel(false, params));
    }

    public createPivotModePanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params: ColumnStateUpdateParams,
        onPivotModeValueChanged?: () => void,
        prepend?: boolean
    ): PivotModePanel {
        return this.createPanel(parent, destroyFuncs, new PivotModePanel(params, onPivotModeValueChanged), prepend);
    }

    private createPanel<C extends RowGroupDropZonePanel | ValuesDropZonePanel | PivotDropZonePanel | PivotModePanel>(
        parent: Component,
        destroyFuncs: (() => void)[],
        panel: C,
        prepend?: boolean
    ): C {
        panel = parent.createBean(panel);
        destroyFuncs.push(() => parent.destroyBean(panel));
        if (prepend) {
            parent.prependChild(panel);
        } else {
            parent.appendChild(panel);
        }
        return panel;
    }
}
