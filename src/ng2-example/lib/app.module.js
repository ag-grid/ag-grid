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
var platform_browser_1 = require('@angular/platform-browser');
var main_1 = require('ag-grid-ng2/main');
var app_component_1 = require("./app.component");
var rich_grid_component_1 = require("./rich-grid.component");
var from_component_component_1 = require("./from-component.component");
var from_template_component_1 = require("./from-template.component");
var from_rich_component_1 = require("./from-rich.component");
var ratio_module_1 = require("./ratio.module");
var clickable_module_1 = require("./clickable.module");
var editor_component_component_1 = require("./editor-component.component");
var floating_row_renderer_component_1 = require("./floating-row-renderer.component");
var full_width_renderer_component_1 = require("./full-width-renderer.component");
var group_row_renderer_component_1 = require("./group-row-renderer.component");
var filter_component_component_1 = require("./filter-component.component");
var rich_grid_declarative_component_1 = require("./rich-grid-declarative.component");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                main_1.AgGridModule.withNg2ComponentSupport(),
                ratio_module_1.RatioModule,
                clickable_module_1.ClickableModule
            ],
            declarations: [
                app_component_1.AppComponent,
                rich_grid_component_1.RichGridComponent,
                from_component_component_1.FromComponentComponent,
                from_template_component_1.FromTemplateComponent,
                from_rich_component_1.FromRichComponent,
                editor_component_component_1.EditorComponent,
                floating_row_renderer_component_1.WithFloatingRowComponent,
                full_width_renderer_component_1.WithFullWidthComponent,
                group_row_renderer_component_1.WithGroupRowComponent,
                filter_component_component_1.FilterComponentComponent,
                rich_grid_declarative_component_1.RichGridDeclarativeComponent
            ],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map