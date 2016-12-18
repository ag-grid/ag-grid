"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2ComponentFactory = (function (_super) {
    __extends(Ng2ComponentFactory, _super);
    function Ng2ComponentFactory(_componentFactoryResolver) {
        _super.call(this);
        this._componentFactoryResolver = _componentFactoryResolver;
        this._factoryCache = {};
    }
    Ng2ComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef) {
        return this.adaptComponentToRenderer(componentType, viewContainerRef, this.getHashForComponentType(componentType));
    };
    Ng2ComponentFactory.prototype.getHashForComponentType = function (componentType) {
        return this.hashCode(componentType.toString());
    };
    // taken from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    Ng2ComponentFactory.prototype.hashCode = function (value) {
        var hash = 0, i, chr, len;
        if (value.length === 0)
            return hash.toString();
        for (i = 0, len = value.length; i < len; i++) {
            chr = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };
    ;
    Ng2ComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef) {
        return this.adaptComponentToEditor(componentType, viewContainerRef, this.getHashForComponentType(componentType));
    };
    Ng2ComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        return this.adaptComponentToFilter(componentType, viewContainerRef, this.getHashForComponentType(componentType));
    };
    Ng2ComponentFactory.prototype.adaptComponentToRenderer = function (componentType, viewContainerRef, name) {
        var that = this;
        var CellRenderer = (function (_super) {
            __extends(CellRenderer, _super);
            function CellRenderer() {
                _super.apply(this, arguments);
            }
            CellRenderer.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            CellRenderer.prototype.refresh = function (params) {
                this._params = params;
                if (this._agAwareComponent.refresh) {
                    this._agAwareComponent.refresh(params);
                }
                else {
                    throw new main_1.MethodNotImplementedException();
                }
            };
            CellRenderer.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, name);
            };
            return CellRenderer;
        }(BaseGuiComponent));
        return CellRenderer;
    };
    Ng2ComponentFactory.prototype.adaptComponentToEditor = function (componentType, viewContainerRef, name) {
        var that = this;
        var CellEditor = (function (_super) {
            __extends(CellEditor, _super);
            function CellEditor() {
                _super.apply(this, arguments);
            }
            CellEditor.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
            };
            CellEditor.prototype.getValue = function () {
                return this._agAwareComponent.getValue();
            };
            CellEditor.prototype.isPopup = function () {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            };
            CellEditor.prototype.isCancelBeforeStart = function () {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            };
            CellEditor.prototype.isCancelAfterEnd = function () {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
            };
            CellEditor.prototype.focusIn = function () {
                if (this._agAwareComponent.focusIn) {
                    this._agAwareComponent.focusIn();
                }
            };
            CellEditor.prototype.focusOut = function () {
                if (this._agAwareComponent.focusOut) {
                    this._agAwareComponent.focusOut();
                }
            };
            CellEditor.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, name);
            };
            return CellEditor;
        }(BaseGuiComponent));
        return CellEditor;
    };
    Ng2ComponentFactory.prototype.adaptComponentToFilter = function (componentType, viewContainerRef, name) {
        var that = this;
        var Filter = (function (_super) {
            __extends(Filter, _super);
            function Filter() {
                _super.apply(this, arguments);
            }
            Filter.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            Filter.prototype.isFilterActive = function () {
                return this._agAwareComponent.isFilterActive();
            };
            Filter.prototype.doesFilterPass = function (params) {
                return this._agAwareComponent.doesFilterPass(params);
            };
            Filter.prototype.getModel = function () {
                return this._agAwareComponent.getModel();
            };
            Filter.prototype.setModel = function (model) {
                this._agAwareComponent.setModel(model);
            };
            Filter.prototype.afterGuiAttached = function (params) {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            };
            Filter.prototype.getFrameworkComponentInstance = function () {
                return this._frameworkComponentInstance;
            };
            Filter.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, name);
            };
            return Filter;
        }(BaseGuiComponent));
        return Filter;
    };
    Ng2ComponentFactory.prototype.createComponent = function (componentType, viewContainerRef, name) {
        var factory = this._factoryCache[name];
        if (!factory) {
            factory = this._componentFactoryResolver.resolveComponentFactory(componentType);
            this._factoryCache[name] = factory;
        }
        return viewContainerRef.createComponent(factory);
    };
    Ng2ComponentFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    Ng2ComponentFactory.ctorParameters = function () { return [
        { type: core_1.ComponentFactoryResolver, },
    ]; };
    return Ng2ComponentFactory;
}(baseComponentFactory_1.BaseComponentFactory));
exports.Ng2ComponentFactory = Ng2ComponentFactory;
var BaseGuiComponent = (function () {
    function BaseGuiComponent() {
    }
    BaseGuiComponent.prototype.init = function (params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        this._agAwareComponent.agInit(this._params);
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._eGui;
    };
    BaseGuiComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
//# sourceMappingURL=ng2ComponentFactory.js.map