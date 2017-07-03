function hypenateAndLowercase(property) {
    return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

class AgGrid extends HTMLElement {
    constructor() {
        super();

        this._attributes = {};

        this._propertyMap = agGrid.ComponentUtil.ALL_PROPERTIES
            .filter((property) => property !== 'gridOptions')
            .reduce((map, property) => {
                map[property.toLowerCase()] = property;
                map[hypenateAndLowercase(property)] = property;
                return map;
            }, {});
    }

    connectedCallback() {
        agGrid.ComponentUtil.ALL_PROPERTIES
            .forEach((key) => {
                Object.defineProperty(this, key, {
                    set: (v) => {
                        this.attributeChangedCallback(key.toLowerCase(),
                            undefined,
                            v);
                    },
                    enumerable: true,
                    configurable: true
                });
            });
    }

    set gridOptions(options) {
        let globalEventListener = this.globalEventListener.bind(this);
        this._gridOptions = agGrid.ComponentUtil.copyAttributesToGridOptions(options, this._attributes);

        // prevent instantiating multiple grids
        if (!this._initialised) {
            let gridParams = {
                globalEventListener: globalEventListener
            };

            this._agGrid = new agGrid.Grid(this, this._gridOptions, gridParams);

            this.api = options.api;
            this.columnApi = options.columnApi;

            this._initialised = true;
        }
    };

    static get observedAttributes() {
        // allow properties to be supplied either lowercased or hyphenated
        // this allows the user to either supply (for example) enableSorting or enabled-sorting

        // properties lowercased
        let lowerCasedPropertyNames = agGrid.ComponentUtil.ALL_PROPERTIES
            .filter((property) => property !== 'gridOptions')
            .map((property) => property.toLowerCase());
        // properties hyphenated
        let hyphenatedPropertyNames = agGrid.ComponentUtil.ALL_PROPERTIES
            .filter((property) => property !== 'gridOptions')
            .map((property) => hypenateAndLowercase(property));
        return lowerCasedPropertyNames.concat(hyphenatedPropertyNames);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        let gridPropertyName = this._propertyMap[name];

        // for properties set before gridOptions is called
        this._attributes[gridPropertyName] = newValue;

        if (this._initialised) {
            // for subsequent (post gridOptions) changes
            let changeObject = {};
            changeObject[gridPropertyName] = {currentValue: newValue};

            agGrid.ComponentUtil.processOnChange(changeObject, this._gridOptions, this.api, this.columnApi);
        }
    };

    globalEventListener(eventType, event) {
        let eventLowerCase = eventType.toLowerCase();
        let browserEvent = new Event(eventLowerCase);

        let browserEventNoType = browserEvent;
        browserEventNoType.agGridDetails = event;

        // for when defining events via myGrid.addEventListener('columnresized', function (event) {...
        this.dispatchEvent(browserEvent);

        // for when defining events via myGrid.oncolumnresized = function (event) {....
        let callbackMethod = 'on' + eventLowerCase;
        if (typeof this[callbackMethod] === 'function') {
            this[callbackMethod](browserEvent);
        }
    };

}

if (typeof document === 'undefined' || !document.registerElement) {
    console.error('ag-Grid: unable to find document.registerElement() function, unable to initialise ag-Grid as a Web Component');
}

customElements.define('ag-grid', AgGrid);
