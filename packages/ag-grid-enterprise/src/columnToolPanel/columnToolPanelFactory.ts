import type { BeanName, Component, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { ColumnToolPanelEditParams } from './columnToolPanelEdits';
import { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { PivotModePanel } from './pivotModePanel';

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
        params?: ColumnToolPanelEditParams
    ): RowGroupDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new RowGroupDropZonePanel(false, params));
    }

    public createValuesPanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params?: ColumnToolPanelEditParams
    ): ValuesDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new ValuesDropZonePanel(false, params));
    }

    public createPivotPanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params?: ColumnToolPanelEditParams
    ): PivotDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new PivotDropZonePanel(false, params));
    }

    public createPivotModePanel(
        parent: Component,
        destroyFuncs: (() => void)[],
        params: ColumnToolPanelEditParams,
        prepend?: boolean
    ): PivotModePanel {
        return this.createPanel(parent, destroyFuncs, new PivotModePanel(params), prepend);
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
