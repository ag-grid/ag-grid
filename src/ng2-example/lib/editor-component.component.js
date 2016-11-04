"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var MoodEditorComponent = (function () {
    function MoodEditorComponent() {
        this.happy = false;
    }
    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    MoodEditorComponent.prototype.ngAfterViewInit = function () {
        this.container.element.nativeElement.focus();
    };
    MoodEditorComponent.prototype.agInit = function (params) {
        this.params = params;
        this.setHappy(params.value === "Happy");
    };
    MoodEditorComponent.prototype.getValue = function () {
        return this.happy ? "Happy" : "Sad";
    };
    MoodEditorComponent.prototype.isPopup = function () {
        return true;
    };
    MoodEditorComponent.prototype.setHappy = function (happy) {
        this.happy = happy;
    };
    MoodEditorComponent.prototype.toggleMood = function () {
        this.setHappy(!this.happy);
    };
    MoodEditorComponent.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        if (key == 37 ||
            key == 39) {
            this.toggleMood();
            event.stopPropagation();
        }
    };
    __decorate([
        core_1.ViewChild('container', { read: core_1.ViewContainerRef }), 
        __metadata('design:type', Object)
    ], MoodEditorComponent.prototype, "container", void 0);
    MoodEditorComponent = __decorate([
        core_1.Component({
            selector: 'editor-cell',
            template: "\n        <div #container class=\"mood\" tabindex=\"0\" (keydown)=\"onKeyDown($event)\">\n            <img src=\"../images/smiley.png\" (click)=\"setHappy(true)\" [ngClass]=\"{'selected' : happy, 'default' : !happy}\">\n            <img src=\"../images/smiley-sad.png\" (click)=\"setHappy(false)\" [ngClass]=\"{'selected' : !happy, 'default' : happy}\">\n        </div>\n    ",
            styles: ["\n        .mood {\n            border-radius: 15px;\n            border: 1px solid grey;\n            background: #e6e6e6;\n            padding: 15px;\n            text-align:center;\n            display:inline-block;\n            outline:none\n        }\n\n        .default {\n            padding-left:10px;\n            padding-right:10px;\n            border: 1px solid transparent;\n            padding: 4px;\n        }\n\n        .selected {\n            padding-left:10px;\n            padding-right:10px;\n            border: 1px solid lightgreen;\n            padding: 4px;\n        }\n    "]
        }), 
        __metadata('design:paramtypes', [])
    ], MoodEditorComponent);
    return MoodEditorComponent;
}());
var MoodRendererComponent = (function () {
    function MoodRendererComponent() {
    }
    MoodRendererComponent.prototype.agInit = function (params) {
        this.params = params;
        this.setMood(params);
    };
    MoodRendererComponent.prototype.refresh = function (params) {
        this.params = params;
        this.setMood(params);
    };
    MoodRendererComponent.prototype.setMood = function (params) {
        this.mood = params.value;
        this.imgForMood = this.mood === 'Happy' ? '../images/smiley.png' : '../images/smiley-sad.png';
    };
    ;
    MoodRendererComponent = __decorate([
        core_1.Component({
            selector: 'mood-cell',
            template: "<img width=\"20px\" [src]=\"imgForMood\" />"
        }), 
        __metadata('design:paramtypes', [])
    ], MoodRendererComponent);
    return MoodRendererComponent;
}());
var NumericEditorComponent = (function () {
    function NumericEditorComponent() {
        this.cancelBeforeStart = false;
    }
    NumericEditorComponent.prototype.agInit = function (params) {
        this.params = params;
        this.value = this.params.value;
        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    };
    NumericEditorComponent.prototype.getValue = function () {
        return this.value;
    };
    NumericEditorComponent.prototype.isCancelBeforeStart = function () {
        return this.cancelBeforeStart;
    };
    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    NumericEditorComponent.prototype.isCancelAfterEnd = function () {
        return this.value > 1000000;
    };
    ;
    NumericEditorComponent.prototype.onKeyDown = function (event) {
        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault)
                event.preventDefault();
        }
    };
    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    NumericEditorComponent.prototype.ngAfterViewInit = function () {
        this.input.element.nativeElement.focus();
    };
    NumericEditorComponent.prototype.getCharCodeFromEvent = function (event) {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    };
    NumericEditorComponent.prototype.isCharNumeric = function (charStr) {
        return !!/\d/.test(charStr);
    };
    NumericEditorComponent.prototype.isKeyPressedNumeric = function (event) {
        var charCode = this.getCharCodeFromEvent(event);
        var charStr = String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    };
    __decorate([
        core_1.ViewChild('input', { read: core_1.ViewContainerRef }), 
        __metadata('design:type', Object)
    ], NumericEditorComponent.prototype, "input", void 0);
    NumericEditorComponent = __decorate([
        core_1.Component({
            selector: 'numeric-cell',
            template: "<input #input (keydown)=\"onKeyDown($event)\" [(ngModel)]=\"value\">"
        }), 
        __metadata('design:paramtypes', [])
    ], NumericEditorComponent);
    return NumericEditorComponent;
}());
var EditorComponent = (function () {
    function EditorComponent() {
        this.gridOptions = {};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }
    EditorComponent.prototype.createColumnDefs = function () {
        return [
            { headerName: "Name", field: "name", width: 198 },
            {
                headerName: "Mood",
                field: "mood",
                cellRendererFramework: {
                    component: MoodRendererComponent
                },
                cellEditorFramework: {
                    component: MoodEditorComponent,
                    moduleImports: [common_1.CommonModule]
                },
                editable: true,
                width: 150
            },
            {
                headerName: "Numeric",
                field: "number",
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [forms_1.FormsModule]
                },
                editable: true,
                width: 150
            }
        ];
    };
    EditorComponent.prototype.createRowData = function () {
        return [
            { name: "Bob", happy: "Happy", number: 10 },
            { name: "Harry", happy: "Sad", number: 3 },
            { name: "Sally", happy: "Happy", number: 20 },
            { name: "Mary", mood: "Sad", number: 5 },
            { name: "John", mood: "Happy", number: 15 },
        ];
    };
    EditorComponent = __decorate([
        core_1.Component({
            selector: 'ag-editor-component',
            templateUrl: 'app/editor-component.component.html'
        }), 
        __metadata('design:paramtypes', [])
    ], EditorComponent);
    return EditorComponent;
}());
exports.EditorComponent = EditorComponent;
//# sourceMappingURL=editor-component.component.js.map