import type { AgColumn, BeanName, Component, IAggFunc, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

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

    public createRowGroupPanel(parent: Component, destroyFuncs: (() => void)[]): RowGroupDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new RowGroupDropZonePanel(false));
    }

    /** Create a row-group panel wired to deferred mode handlers instead of immediate grid mutation. */
    public createRowGroupPanelWithUpdateHandler(
        parent: Component,
        destroyFuncs: (() => void)[],
        onUpdateItems: (columns: AgColumn[]) => boolean,
        getExistingItems: () => AgColumn[]
    ): RowGroupDropZonePanel {
        return this.createPanel(
            parent,
            destroyFuncs,
            new RowGroupDropZonePanel(false, onUpdateItems, getExistingItems)
        );
    }

    public createValuesPanel(parent: Component, destroyFuncs: (() => void)[]): ValuesDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new ValuesDropZonePanel(false));
    }

    /** Create a values panel that reads/writes staged deferred value state and aggregation functions. */
    public createValuesPanelWithUpdateHandler(
        parent: Component,
        destroyFuncs: (() => void)[],
        onUpdateItems: (columns: AgColumn[]) => boolean,
        getExistingItems: () => AgColumn[],
        onAggregationFunctionChange: (column: AgColumn, aggFunc: string) => boolean,
        getPendingAggregationFunction: (column: AgColumn) => string | IAggFunc | null | undefined
    ): ValuesDropZonePanel {
        return this.createPanel(
            parent,
            destroyFuncs,
            new ValuesDropZonePanel(
                false,
                onUpdateItems,
                getExistingItems,
                onAggregationFunctionChange,
                getPendingAggregationFunction
            )
        );
    }

    public createPivotPanel(parent: Component, destroyFuncs: (() => void)[]): PivotDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new PivotDropZonePanel(false));
    }

    /** Create a pivot panel wired to deferred mode handlers so pending pivot order is preserved. */
    public createPivotPanelWithUpdateHandler(
        parent: Component,
        destroyFuncs: (() => void)[],
        onUpdateItems: (columns: AgColumn[]) => boolean,
        getExistingItems: () => AgColumn[]
    ): PivotDropZonePanel {
        return this.createPanel(parent, destroyFuncs, new PivotDropZonePanel(false, onUpdateItems, getExistingItems));
    }

    public createPivotModePanel(parent: Component, destroyFuncs: (() => void)[], prepend?: boolean): PivotModePanel {
        return this.createPanel(parent, destroyFuncs, new PivotModePanel(), prepend);
    }

    /** Create a pivot mode panel that stages pivot mode changes until deferred apply confirms them. */
    public createPivotModePanelWithToggleHandler(
        parent: Component,
        destroyFuncs: (() => void)[],
        onTogglePivotMode: (newValue: boolean) => boolean,
        getPivotMode: () => boolean,
        prepend?: boolean
    ): PivotModePanel {
        return this.createPanel(parent, destroyFuncs, new PivotModePanel(onTogglePivotMode, getPivotMode), prepend);
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
