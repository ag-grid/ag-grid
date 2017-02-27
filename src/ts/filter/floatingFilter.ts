import {Component} from "../widgets/component";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {FilterManager} from "./filterManager";
import {Column} from "../entities/column";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {SerializedTextFilter} from "./textFilter";
import {SerializedDateFilter} from "./dateFilter";
import {SerializedNumberFilter} from "./numberFilter";
import {IComponent} from "../interfaces/iComponent";
import {RefSelector} from "../widgets/componentAnnotations";

export interface IFloatingFilterParams<M> {
    column:Column;
    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M;
}

export interface IFloatingFilter<M, P extends IFloatingFilterParams<M>>{
    onParentModelChanged(parentModel:M):void;

}

export interface IFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends IFloatingFilter<M, P>, IComponent<P> {}


export abstract class BaseFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends Component implements IFloatingFilterComp<M, P> {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;
    @Autowired('filterManager') private filterManager: FilterManager;

    column: Column;
    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M;

    init (params:P):void{
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel
        this.column = params.column;
        this.setTemplate(`<div class="ag-header-cell">${this.bodyGui()}</div>`);
        this.setupWidth();
        this.addFeature(this.context, new SetLeftFeature(this.column, this.getGui()));
    }

    abstract onParentModelChanged(parentModel:M):void;
    abstract bodyGui ():string;


    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }
}


export abstract class FloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends BaseFloatingFilterComp <M, P> {
    @RefSelector('eColumnFloatingFilter')
    eColumnFloatingFilter: HTMLInputElement;

    bodyGui(): string {
        return `<input  ref="eColumnFloatingFilter" class="ag-floating-filter-input">`;

    }


    init (params:P):void{
        super.init(params);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'input', this.syncUpWithParentFilter.bind(this));
    }

    abstract asParentModel ():M;
    abstract asFloatingFilterText (parentModel:M):string;

    onParentModelChanged(parentModel:M):void{
        this.eColumnFloatingFilter.value = parentModel ? this.asFloatingFilterText (parentModel) : '';
    }

    syncUpWithParentFilter ():void{
        this.onFloatingFilterChanged(this.asParentModel());
    }
}

export class TextFloatingFilterComp extends FloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter>>{
    asFloatingFilterText(parentModel: SerializedTextFilter): string {
        return parentModel.filter;
    }

    asParentModel(): SerializedTextFilter {
        let currentParentModel = this.currentParentModel();
        return {
            type: !currentParentModel ? 'contains': currentParentModel.type,
            filter: this.eColumnFloatingFilter.value
        }
    }
}

export class SetFloatingFilterComp extends FloatingFilterComp<string[], IFloatingFilterParams<string[]>>{
    asFloatingFilterText(parentModel: string[]): string {
        return parentModel.join(",");
    }
    asParentModel(): string[] {
        if (this.eColumnFloatingFilter.value == '') return null;
        return this.eColumnFloatingFilter.value.split(",")
    }
}

export class DateFloatingFilterComp extends FloatingFilterComp<SerializedDateFilter, IFloatingFilterParams<SerializedDateFilter>>{
    asFloatingFilterText(parentModel: SerializedDateFilter): string {
        return parentModel.dateFrom;
    }

    asParentModel(): SerializedDateFilter {
        let currentParentModel = this.currentParentModel();
        return {
            type: !currentParentModel ? 'equals' : currentParentModel.type,
            dateFrom: this.eColumnFloatingFilter.value,
            dateTo: !currentParentModel ? '': currentParentModel.dateTo
        };
    }
}

export class NumberFloatingFilterComp extends FloatingFilterComp<SerializedNumberFilter, IFloatingFilterParams<SerializedNumberFilter>>{
    asFloatingFilterText(parentModel: SerializedNumberFilter): string {
        return parentModel.filter + '';
    }

    asParentModel(): SerializedNumberFilter {
        let currentParentModel = this.currentParentModel();
        return {
            type: !currentParentModel ? 'equals' : currentParentModel.type,
            filter: this.eColumnFloatingFilter.value !== '' ? Number(this.eColumnFloatingFilter.value) : null,
            filterTo: !currentParentModel ? null: currentParentModel.filterTo
        };
    }
}

export class EmptyFloatingFilterComp extends BaseFloatingFilterComp<any, any>{
    onParentModelChanged(parentModel: any): void {

    }

    bodyGui(): string{
        return '';
    }
}