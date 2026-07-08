import type {
    INewFiltersToolPanel,
    IToolPanelComp,
    IToolPanelNewFiltersCompParams,
    IToolPanelParams,
    NewFiltersToolPanelState,
} from 'ag-grid-community';
import { Component, _createElement } from 'ag-grid-community';

import type { FilterPanelRefreshParams } from './filterPanel';
import { FilterPanel } from './filterPanel';
import newFiltersToolPanelCSS from './newFiltersToolPanel.css';

interface ToolPanelNewFiltersCompParams<TData = any, TContext = any>
    extends IToolPanelParams<TData, TContext, NewFiltersToolPanelState>, IToolPanelNewFiltersCompParams {}

export class WrapperToolPanel extends Component implements INewFiltersToolPanel, IToolPanelComp {
    private filterPanel?: FilterPanel;

    constructor() {
        super();
        this.registerCSS(newFiltersToolPanelCSS);
    }

    public init(params: ToolPanelNewFiltersCompParams): void {
        if (!this.gos.get('enableFilterHandlers')) {
            this.beans.log.warn(282);
            this.setTemplateFromElement(_createElement({ tag: 'div', cls: 'ag-filter-panel' }));
            return;
        }
        const filterPanelSvc = this.beans.filterPanelSvc!;
        filterPanelSvc.isActive = true;
        this.addDestroyFunc(() => {
            filterPanelSvc.isActive = false;
        });
        this.updateParams(params, params.initialState);
        const filterPanel = this.createManagedBean(new FilterPanel());
        this.filterPanel = filterPanel;
        const refresh = (event?: FilterPanelRefreshParams) => {
            filterPanel.refresh(event);
            params.onStateUpdated();
        };
        refresh();
        this.addManagedListeners(filterPanelSvc, {
            filterPanelStatesChanged: refresh,
            filterPanelStateChanged: refresh,
        });
    }

    public override getGui(): HTMLElement {
        return this.filterPanel?.getGui() ?? super.getGui();
    }

    public refresh(params: ToolPanelNewFiltersCompParams): boolean | void {
        this.updateParams(params, params.initialState);
        return true;
    }

    private updateParams(params: ToolPanelNewFiltersCompParams, initialState?: NewFiltersToolPanelState): void {
        this.beans.filterPanelSvc?.updateParams(params, initialState);
    }

    public getState(): NewFiltersToolPanelState {
        return this.beans.filterPanelSvc?.getGridState() ?? {};
    }
}
