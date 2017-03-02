import {Component} from "../widgets/component";
import {Autowired, Context} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ColumnController} from "../columnController/columnController";
import {FilterManager} from "./filterManager";
import {Column} from "../entities/column";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";
import {SerializedTextFilter} from "./textFilter";
import {SerializedDateFilter, DateFilter} from "./dateFilter";
import {SerializedNumberFilter} from "./numberFilter";
import {IComponent} from "../interfaces/iComponent";
import {RefSelector} from "../widgets/componentAnnotations";
import {_} from "../utils";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {IDateComp, IDateParams} from "../rendering/dateComponent";
import {ComponentProvider} from "../componentProvider";

export interface IFloatingFilterParams<M> {
    column:Column;
    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M
}

export interface IFloatingFilter<M, P extends IFloatingFilterParams<M>>{
    onParentModelChanged(parentModel:M):void;
}

export interface IFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends IFloatingFilter<M, P>, IComponent<P> {}


export abstract class BaseFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends Component implements IFloatingFilterComp<M, P> {
    @RefSelector('eButtonShowMainFilter')
    eButtonShowMainFilter: HTMLInputElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('context') private context: Context;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;

    column: Column;
    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M;

    init (params:P):void{
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        this.column = params.column;

        let body:HTMLElement = _.loadTemplate(`<div class="ag-floating-filter-body"></div>`);
        this.enrichBody(body);

        let base:HTMLElement = _.loadTemplate(`<div class="ag-header-cell"></div>`);
        base.appendChild(body);
        base.appendChild(_.loadTemplate(`<div class="ag-floating-filter-button">
                <button ref="eButtonShowMainFilter">...</button>            
        </div>`));

        this.setTemplateFromElement(base);
        this.setupWidth();
        this.addFeature(this.context, new SetLeftFeature(this.column, this.getGui()));

        this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    }

    abstract onParentModelChanged(parentModel:M):void;
    abstract enrichBody(from:HTMLElement):void;


    private showParentFilter(){
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter);
    }

    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }
}


export abstract class HtmlTemplateFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends BaseFloatingFilterComp <M, P> {
    abstract bodyGui(): string

    enrichBody(from:HTMLElement):void{
        from.innerHTML = this.bodyGui();
    }
}

export abstract class InnerHtmlElementFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends BaseFloatingFilterComp <M, P> {
    abstract bodyGui(): HTMLElement

    enrichBody (from:HTMLElement):void{
        from.appendChild(this.bodyGui());
    }
}

export abstract class InputTextFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends HtmlTemplateFloatingFilterComp <M, P> {
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
        this.eColumnFloatingFilter.value = this.asFloatingFilterText (parentModel);
    }

    syncUpWithParentFilter ():void{
        this.onFloatingFilterChanged(this.asParentModel());
    }
}

export class TextFloatingFilterComp extends InputTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter>>{
    asFloatingFilterText(parentModel: SerializedTextFilter): string {
        if (!parentModel) return '';
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

export class DateFloatingFilterComp extends InnerHtmlElementFloatingFilterComp<SerializedDateFilter, IFloatingFilterParams<SerializedDateFilter>>{
    @Autowired('componentProvider')
    private componentProvider:ComponentProvider;
    private dateComponent:IDateComp;

    init (params:IFloatingFilterParams<SerializedDateFilter>){
        let dateComponentParams: IDateParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };
        this.dateComponent = this.componentProvider.newDateComponent(dateComponentParams)
        super.init(params);

    }

    private onDateChanged(): void {
        let parentModel:SerializedDateFilter = this.currentParentModel();
        let rawDate:Date = this.dateComponent.getDate();
        if (!rawDate || typeof rawDate.getMonth !== 'function'){
            this.onFloatingFilterChanged(null);
            return;
        }

        let date:string = _.serializeDateToYyyyMmDd(DateFilter.removeTimezone(rawDate), "-");
        let type:string = 'equals';
        let dateTo:string = null;
        if (parentModel){
            type= parentModel.type;
            dateTo = parentModel.dateTo;
        }
        this.onFloatingFilterChanged({
            type: type,
            dateFrom: date,
            dateTo: dateTo
        });
    }

    bodyGui(): HTMLElement {
        return this.dateComponent.getGui();
    }

    onParentModelChanged(parentModel: SerializedDateFilter): void {
        if (!parentModel || !parentModel.dateFrom){
            this.dateComponent.setDate(null);
            return;
        }
        this.dateComponent.setDate(_.parseYyyyMmDdToDate(parentModel.dateFrom, '-'));
    }
}

export class NumberFloatingFilterComp extends InputTextFloatingFilterComp<SerializedNumberFilter, IFloatingFilterParams<SerializedNumberFilter>>{
    asFloatingFilterText(parentModel: SerializedNumberFilter): string {
        if (!parentModel) return '';
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

export class SetFloatingFilterComp extends InputTextFloatingFilterComp<string[], IFloatingFilterParams<string[]>>{
    init (params:IFloatingFilterParams<string[]>):void{
        super.init(params);
        this.eColumnFloatingFilter.readOnly = true;
    }

    asFloatingFilterText(parentModel: string[]): string {
        if (!parentModel) return '';

        let arrayToDisplay = parentModel.length > 10? parentModel.slice(0, 10).concat(['...']) : parentModel;
        return `(${parentModel.length}) ${arrayToDisplay.join(",")}`;
    }

    asParentModel(): string[] {
        return this.eColumnFloatingFilter.value ?
            this.eColumnFloatingFilter.value.split(","):
            []
    }
}

export class EmptyFloatingFilterComp extends InputTextFloatingFilterComp<any, any>{
    init (params:IFloatingFilterParams<string[]>):void{
        super.init(params);
        this.eColumnFloatingFilter.style.visibility = 'hidden';
        this.eButtonShowMainFilter.style.visibility = 'hidden';
    }

    asFloatingFilterText(parentModel: any): string {
        return '';
    }

    asParentModel(): any {
        return null;
    }
}