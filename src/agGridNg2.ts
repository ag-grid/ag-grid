import {Grid, GridOptions, GridApi, ColumnController, ColumnApi, ComponentUtil, Events} from 'ag-grid/main';
import {Component, View, EventEmitter, ViewEncapsulation, ElementRef} from 'angular2/core';

@Component({
    selector: 'ag-grid-ng2',
    outputs: ComponentUtil.EVENTS,
    inputs: ComponentUtil.ALL_PROPERTIES.concat(['gridOptions'])
})
@View({
    template: '',
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridNg2 {

    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _initialised = false;

    private gridOptions: GridOptions;

    private api: GridApi;
    private columnApi: ColumnApi;

    constructor(private elementDef: ElementRef) {
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ComponentUtil.EVENTS.forEach( (eventName) => {
            (<any>this)[eventName] = new EventEmitter();
        });
    }

    // this gets called after the directive is initialised
    public ngOnInit(): void {
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        var nativeElement = this.elementDef.nativeElement;
        var globalEventLister = this.globalEventListener.bind(this);
        new Grid(nativeElement, this.gridOptions, globalEventLister);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;

        this._initialised = true;
    }

    public ngOnChanges(changes: any): void {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api);
        }
    }

    public ngOnDestroy(): void {
        if (this._initialised) {
            this.api.destroy();
        }
    }

    private globalEventListener(eventType: string, event: any): void {
        // generically look up the eventType
        var emitter = <EventEmitter<any>> (<any>this)[eventType];
        if (emitter) {
            emitter.emit(event);
        } else {
            console.log('ag-Grid-ng2: could not find EventEmitter: ' + eventType);
        }
    }
}
