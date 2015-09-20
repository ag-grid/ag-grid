/// <reference path='componentUtil.ts'/>

module awk.grid {
   if ((<any>document).registerElement) {

        // i don't think this type of extension is pssible in TypeScript, so back to
        // plain Javascript ot create this object
        var AgileGridProto = Object.create(HTMLElement.prototype);

       AgileGridProto.setGridOptions = function(options: any) {

           //this.initGridOptions();
           this._agGrid = new awk.grid.Grid(this, options, this.genericEventListener.bind(this));
           this.api = options.api;
           this.columnApi = options.columnApi;
           this.columnApi.addChangeListener(this.columnEventListener.bind(this));
           //this._initialised = true;
       };

       AgileGridProto.createdCallback = function(params: any) {
           for (var i = 0; i<this.attributes.length; i++) {
               var attribute = this.attributes[i];
               var name = toCamelCase(attribute.nodeName);
               var value = attribute.nodeValue;
               if (ComponentUtil.ALL_PROPERTIES.indexOf(name)>=0) {
                   this[name] = value;
               }
           }
        };

        AgileGridProto.attachedCallback = function(params: any) {};

        AgileGridProto.detachedCallback = function(params: any) {};

        AgileGridProto.attributeChangedCallback = function(attributeName: string) {
            var propertyName = toCamelCase(attributeName);
            var value = this.attributes[attributeName];
        };

        AgileGridProto.columnEventListener = function(gridEvent: ColumnChangeEvent): void {
            var eventLowerCase = gridEvent.getType().toLowerCase();
            var browserEvent = new Event(eventLowerCase);

            var browserEventNoType = <any> browserEvent;
            browserEventNoType.column = gridEvent.getColumn();
            browserEventNoType.columnGroup = gridEvent.getColumnGroup();
            browserEventNoType.fromIndex = gridEvent.getFromIndex();
            browserEventNoType.toIndex = gridEvent.getToIndex();
            browserEventNoType.pinnedColumnCount = gridEvent.getPinnedColumnCount();

            this.dispatchEvent(browserEvent);

            var callbackMethod = 'on' + eventLowerCase;
            if (typeof this[callbackMethod] === 'function') {
                this[callbackMethod](browserEvent);
            }
        };

        AgileGridProto.genericEventListener = function(eventName: string, event: any): void {
            //var emitter: any;
            //switch (eventName) {
            //    case Constants.EVENT_MODEL_UPDATED: emitter = this.modelUpdated; break;
            //    case Constants.EVENT_CELL_CLICKED: emitter = this.cellClicked; break;
            //    case Constants.EVENT_CELL_DOUBLE_CLICKED: emitter = this.cellDoubleClicked; break;
            //    case Constants.EVENT_CELL_CONTEXT_MENU: emitter = this.cellContextMenu; break;
            //    case Constants.EVENT_CELL_VALUE_CHANGED: emitter = this.cellValueChanged; break;
            //    case Constants.EVENT_CELL_FOCUSED: emitter = this.cellFocused; break;
            //    case Constants.EVENT_ROW_SELECTED: emitter = this.rowSelected; break;
            //    case Constants.EVENT_SELECTION_CHANGED: emitter = this.selectionChanged; break;
            //    case Constants.EVENT_BEFORE_FILTER_CHANGED: emitter = this.beforeFilterChanged; break;
            //    case Constants.EVENT_AFTER_FILTER_CHANGED: emitter = this.afterFilterChanged; break;
            //    case Constants.EVENT_AFTER_SORT_CHANGED: emitter = this.afterSortChanged; break;
            //    case Constants.EVENT_BEFORE_SORT_CHANGED: emitter = this.beforeSortChanged; break;
            //    case Constants.EVENT_FILTER_MODIFIED: emitter = this.filterModified; break;
            //    case Constants.EVENT_VIRTUAL_ROW_REMOVED: emitter = this.virtualRowRemoved; break;
            //    case Constants.EVENT_ROW_CLICKED: emitter = this.rowClicked; break;
            //    case Constants.EVENT_READY: emitter = this.ready; break;
            //default:
            //    console.log('ag-Grid: AgGridDirective - unknown event type: ' + eventName);
            //    return;
            //}
            //
            //// not all the grid events have data, but angular 2 requires some object to be the
            //// event, so put in an empty object if missing the event.
            //if (event===null || event===undefined) {
            //    event = {};
            //}
            //
            //emitter.next(event);
        };

        // finally, register
        (<any>document).registerElement('ag-grid', {prototype: AgileGridProto});
    }

    function toCamelCase(myString: string): string {
        if (typeof myString === 'string') {
            var result = myString.replace(/-([a-z])/g, function (g) {
                return g[1].toUpperCase();
            });
            return result;
        } else {
            return myString;
        }
    }
}
