import {Autowired} from "../context/context";
import {SerializedTextFilter} from "./textFilter";
import {SerializedDateFilter, DateFilter} from "./dateFilter";
import {SerializedNumberFilter} from "./numberFilter";
import {IComponent} from "../interfaces/iComponent";
import {RefSelector} from "../widgets/componentAnnotations";
import {_} from "../utils";
import {IDateComp, IDateParams} from "../rendering/dateComponent";
import {ComponentProvider} from "../componentProvider";
import {Component} from "../widgets/component";

export interface IFloatingFilterParams<M> {
    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M
}

export interface IFloatingFilter<M, P extends IFloatingFilterParams<M>>{
    onParentModelChanged(parentModel:M):void;
}

export interface IFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends IFloatingFilter<M, P>, IComponent<P> {}


export abstract class InputTextFloatingFilterComp<M, P extends IFloatingFilterParams<M>> extends Component implements IFloatingFilter <M, P>{
    @RefSelector('eColumnFloatingFilter')
    eColumnFloatingFilter: HTMLInputElement;

    onFloatingFilterChanged:(change:M)=>void;
    currentParentModel:()=>M;

    constructor(){
        super(`<div><input  ref="eColumnFloatingFilter" class="ag-floating-filter-input"></div>`)
    }

    init (params:P):void{
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
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

export class DateFloatingFilterComp extends Component implements IFloatingFilter <SerializedDateFilter, IFloatingFilterParams<SerializedDateFilter>>{
    @Autowired('componentProvider')
    private componentProvider:ComponentProvider;
    private dateComponent:IDateComp;

    onFloatingFilterChanged:(change:SerializedDateFilter)=>void;
    currentParentModel:()=>SerializedDateFilter;

    init (params:IFloatingFilterParams<SerializedDateFilter>){
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        let dateComponentParams: IDateParams = {
            onDateChanged: this.onDateChanged.bind(this)
        };
        this.dateComponent = this.componentProvider.newDateComponent(dateComponentParams);
        let body: HTMLElement = _.loadTemplate(`<div></div>`);
        body.appendChild(this.dateComponent.getGui());
        this.setTemplateFromElement(body);

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
        return _.isNumeric(parentModel.filter)? String(parentModel.filter) : '';
    }

    asParentModel(): SerializedNumberFilter {
        let currentParentModel = this.currentParentModel();
        let filterValue = this.currentFilterValue();
        return {
            type: !currentParentModel ? 'equals' : currentParentModel.type,
            filter: filterValue,
            filterTo: !currentParentModel ? null: currentParentModel.filterTo
        };
    }

    private currentFilterValue() {
        let rawValue: string = this.eColumnFloatingFilter.value;
        let invalidNumber = rawValue === '' || (!_.isNumeric(rawValue));
        return invalidNumber ? null : Number(rawValue);
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

export class ReadModelAsStringFloatingFilterComp extends InputTextFloatingFilterComp<string, IFloatingFilterParams<string>>{
    init (params:IFloatingFilterParams<string>):void{
        super.init(params);
        this.eColumnFloatingFilter.readOnly = true;
    }

    onParentModelChanged(parentModel:any):void{
        this.eColumnFloatingFilter.value = this.asFloatingFilterText (this.currentParentModel());
    }

    asFloatingFilterText(parentModel: string): string {
        return parentModel;
    }

    asParentModel(): string {
        return null;
    }
}