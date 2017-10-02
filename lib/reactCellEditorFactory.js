// ag-grid-react v13.3.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var agReactComponent_1 = require("./agReactComponent");
function reactCellEditorFactory(reactComponent, parentComponent) {
    var ReactCellEditor = (function (_super) {
        __extends(ReactCellEditor, _super);
        function ReactCellEditor() {
            return _super.call(this, reactComponent, parentComponent) || this;
        }
        ReactCellEditor.prototype.getValue = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.getValue) {
                return componentRef.getValue();
            }
            else {
                console.log("ag-Grid: React cellEditor is missing the mandatory method getValue() method");
                return null;
            }
        };
        ReactCellEditor.prototype.afterGuiAttached = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.afterGuiAttached) {
                componentRef.afterGuiAttached();
            }
        };
        ReactCellEditor.prototype.isPopup = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isPopup) {
                return componentRef.isPopup();
            }
            else {
                return false;
            }
        };
        ReactCellEditor.prototype.isCancelBeforeStart = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelBeforeStart) {
                return componentRef.isCancelBeforeStart();
            }
            else {
                return false;
            }
        };
        ReactCellEditor.prototype.isCancelAfterEnd = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.isCancelAfterEnd) {
                return componentRef.isCancelAfterEnd();
            }
            else {
                return false;
            }
        };
        ReactCellEditor.prototype.focusIn = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusIn) {
                componentRef.focusIn();
            }
        };
        ReactCellEditor.prototype.focusOut = function () {
            var componentRef = this.getFrameworkComponentInstance();
            if (componentRef.focusOut) {
                componentRef.focusOut();
            }
        };
        return ReactCellEditor;
    }(agReactComponent_1.AgReactComponent));
    return ReactCellEditor;
}
exports.reactCellEditorFactory = reactCellEditorFactory;
