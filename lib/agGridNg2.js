// ag-grid-ng2 v3.3.1
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require('ag-grid/main');
var core_1 = require('angular2/core');
var AgGridNg2 = (function () {
    function AgGridNg2(elementDef) {
        var _this = this;
        this.elementDef = elementDef;
        // not intended for user to interact with. so putting _ in so if user gets reference
        // to this object, they kind'a know it's not part of the agreed interface
        this._initialised = false;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        main_1.ComponentUtil.EVENTS.forEach(function (eventName) {
            _this[eventName] = new core_1.EventEmitter();
        });
    }
    // this gets called after the directive is initialised
    AgGridNg2.prototype.ngOnInit = function () {
        this.gridOptions = main_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        var nativeElement = this.elementDef.nativeElement;
        var globalEventLister = this.globalEventListener.bind(this);
        new main_1.Grid(nativeElement, this.gridOptions, globalEventLister);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this._initialised = true;
    };
    AgGridNg2.prototype.ngOnChanges = function (changes) {
        if (this._initialised) {
            main_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api);
        }
    };
    AgGridNg2.prototype.ngOnDestroy = function () {
        if (this._initialised) {
            this.api.destroy();
        }
    };
    AgGridNg2.prototype.globalEventListener = function (eventType, event) {
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter) {
            emitter.emit(event);
        }
        else {
            console.log('ag-Grid-ng2: could not find EventEmitter: ' + eventType);
        }
    };
    AgGridNg2 = __decorate([
        core_1.Component({
            selector: 'ag-grid-ng2',
            outputs: main_1.ComponentUtil.EVENTS,
            inputs: main_1.ComponentUtil.ALL_PROPERTIES.concat(['gridOptions'])
        }),
        core_1.View({
            template: '',
            // tell angular we don't want view encapsulation, we don't want a shadow root
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], AgGridNg2);
    return AgGridNg2;
})();
exports.AgGridNg2 = AgGridNg2;
