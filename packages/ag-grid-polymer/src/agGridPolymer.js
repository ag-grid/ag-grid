import { PolymerElement } from "../../@polymer/polymer/polymer-element.js";
import PolymerComponentFactory from "./PolymerComponentFactory.js";
import PolymerFrameworkComponentWrapper from "./PolymerFrameworkComponentWrapper.js";
import PolymerFrameworkFactory from "./PolymerFrameworkFactory.js";

export default class AgGridPolymer extends PolymerElement {
    static get properties() {
        const properties = {};

        this.addProperties(properties, agGrid.ComponentUtil.BOOLEAN_PROPERTIES, Boolean);
        this.addProperties(properties, agGrid.ComponentUtil.STRING_PROPERTIES, String);
        this.addProperties(properties, agGrid.ComponentUtil.OBJECT_PROPERTIES, Object);
        this.addProperties(properties, agGrid.ComponentUtil.ARRAY_PROPERTIES, Array);
        this.addProperties(properties, agGrid.ComponentUtil.FUNCTION_PROPERTIES, Object);

        return properties;
    }

    static addProperties(target, properties, type) {
        properties
            .forEach((key) => {
                target[key.toLowerCase()] = type;
                target[key] = type;
            });
    }

    constructor() {
        super();

        this._gridOptions = {};
        this._attributes = {};
        this.defaultPopupParentSet = false;

        this._propertyMap = this.createPropertyMap();


        agGrid.ComponentUtil.ALL_PROPERTIES.forEach((property) => {
            let observerName = property + 'PropertyChanged';
            this[observerName] = (newVal) => {
                this._gridPropertyChanged(property, newVal);
            };
            this._createPropertyObserver(property, observerName);

            let propertyToLowerCase = property.toLowerCase();
            observerName = propertyToLowerCase + 'PropertyChanged';
            this[observerName] = (newVal) => {
                this._gridPropertyChanged(propertyToLowerCase, newVal);
            };
            this._createPropertyObserver(propertyToLowerCase, observerName);
        });
    }

    createPropertyMap() {
        return agGrid.ComponentUtil.ALL_PROPERTIES.concat(agGrid.ComponentUtil.getEventCallbacks())
            .reduce((map, property) => {
                map[property.toLowerCase()] = property;
                map[this.hypenateAndLowercase(property)] = property;
                return map;
            }, {});
    }

    ready() {
        // if providing properties via the element (as opposed to via gridOptions etc), then the order can be such
        // that the grid is initialised and then updated for each property
        // waiting for the next tick ensure all the properties will be set _first_ after which the grid will be initialised
        // this makes for a much smoother initial render
        if (Object.keys(this._attributes).length === 0 && Object.keys(this._gridOptions).length === 0) {
            setTimeout(() => {
                this.initialiseGrid();
            }, 0)
        } else {
            this.initialiseGrid();
        }
    }

    set gridOptions(options) {
        if (!this._initialised) {
            this._gridOptions = options;
            this.initialiseGrid();
        }
    };

    initialiseGrid() {
        // prevent instantiating multiple grids
        if (!this._initialised) {
            let globalEventListener = this.globalEventListener.bind(this);

            if (this.gridoptions) {
                this._gridOptions = this.gridoptions;
            }
            // read un-bound properties directly off the element
            this._gridOptions = agGrid.ComponentUtil.copyAttributesToGridOptions(this._gridOptions, this);

            // ready bound properties off of the mapped attributes property
            this._gridOptions = agGrid.ComponentUtil.copyAttributesToGridOptions(this._gridOptions, this._attributes);

            let gridParams = {
                globalEventListener: globalEventListener,
                frameworkFactory: new PolymerFrameworkFactory(
                    new agGrid.BaseFrameworkFactory(),
                    new PolymerComponentFactory()
                ),
                seedBeanInstances: {
                    frameworkComponentWrapper: new PolymerFrameworkComponentWrapper()
                }
            };

            this._agGrid = new agGrid.Grid(this, this._gridOptions, gridParams);

            this.api = this._gridOptions.api;
            this.columnApi = this._gridOptions.columnApi;

            this._initialised = true;
        }
    }

    _gridPropertyChanged(name, newValue) {
        let gridPropertyName = this._propertyMap[name] || name;

        // for properties set before gridOptions is called
        this._attributes[gridPropertyName] = newValue;

        if (this._initialised) {
            // for subsequent (post gridOptions) changes
            let changeObject = {};
            changeObject[gridPropertyName] = {currentValue: newValue};

            agGrid.ComponentUtil.processOnChange(changeObject, this._gridOptions, this.api, this.columnApi);
        }
    }

    globalEventListener(eventType, event) {
        let eventLowerCase = eventType.toLowerCase();
        let browserEvent = new Event(eventLowerCase);

        let browserEventNoType = browserEvent;
        browserEventNoType.agGridDetails = event;

        if (eventLowerCase === 'gridready') {
            this.setDefaultPopupParent();
        }

        // for when defining events via myGrid.addEventListener('columnresized', function (event) {...
        this.dispatchEvent(browserEvent);

        // for when defining events via myGrid.oncolumnresized = function (event) {....
        let callbackMethod = 'on' + eventLowerCase;
        if (typeof this[callbackMethod] === 'function') {
            this[callbackMethod](browserEvent);
        }
    };

    setDefaultPopupParent() {
        if (!this.defaultPopupParentSet &&
            this.api &&
            !this._gridOptions.popupParent) {
            this.defaultPopupParentSet = true;

            this.api.setPopupParent(this.querySelector('.ag-root'));
        }
    }

    hypenateAndLowercase(property) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}

customElements.define('ag-grid-polymer', AgGridPolymer);
