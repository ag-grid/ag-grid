import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from '@angular/common/http';

// ag-grid
import {AgGridModule} from "ag-grid-angular/main";
// application
import {AppComponent} from "./app.component";
// rich grid
import {RichGridComponent} from "./rich-grid-example/rich-grid.component";
// declarative
import {RichGridDeclarativeComponent} from "./rich-grid-declarative-example/rich-grid-declarative.component";
// rich grid and rich grid declarative
import {DateComponent} from "./date-component/date.component";
import {HeaderComponent} from "./header-component/header.component";
import {HeaderGroupComponent} from "./header-group-component/header-group.component";
// from component
import {DynamicComponent} from "./dynamic-component-example/dynamic.component";
import {SquareComponent} from "./dynamic-component-example/square.component";
import {ParamsComponent} from "./dynamic-component-example/params.component";
import {CubeComponent} from "./dynamic-component-example/cube.component";
import {CurrencyComponent} from "./dynamic-component-example/currency.component";
import {ChildMessageComponent} from "./dynamic-component-example/child-message.component";
// from rich component
import {RichComponent} from "./rich-dynamic-component-example/rich.component";
import {ClickableModule} from "./rich-dynamic-component-example/clickable.module";
import {RatioModule} from "./rich-dynamic-component-example/ratio.module";
import {RatioParentComponent} from "./rich-dynamic-component-example/ratio.parent.component";
import {ClickableParentComponent} from "./rich-dynamic-component-example/clickable.parent.component";
// editor
import {EditorComponent} from "./editor-component-example/editor.component";
import {NumericEditorComponent} from "./editor-component-example/numeric-editor.component";
import {MoodEditorComponent} from "./editor-component-example/mood-editor.component";
import {MoodRendererComponent} from "./editor-component-example/mood-renderer.component";
// Pinned Row
import {PinnedRowComponent} from "./pinned-row-example/pinned-row-renderer.component";
import {StyledComponent} from "./pinned-row-example/styled-renderer.component";
// full width
import {FullWidthComponent} from "./full-width-example/full-width-renderer.component";
import {NameAndAgeRendererComponent} from "./full-width-example/name-age-renderer.component";
// grouped inner
import {MedalRendererComponent} from "./grouped-row-inner-renderer-example/medal-renderer.component";
import {GroupRowComponent} from "./grouped-row-inner-renderer-example/group-row-renderer.component";
// filter
import {FilterComponentComponent} from "./filter-component-example/filter.component";
import {PartialMatchFilterComponent} from "./filter-component-example/partial-match-filter.component";
// master detail
import {MasterComponent} from "./master-detail-example/masterdetail-master.component";
import {DetailPanelComponent} from "./master-detail-example/detail-panel.component";
// floating filter
import {FloatingFilterComponent} from "./floating-filter-example/floating-filter.component";
import {SliderFloatingFilter} from "./floating-filter-example/slider-floating-filter.component";
// rxjs
import {RxJsComponentByRow} from "./rxjs-component-example/rxjs-by-row.component";
import {RxJsComponentByFullSet} from "./rxjs-component-example/rxjs-by-bulk.component";
// infinite pagination
import {InfinitePaginationComponent} from "./infinite-pagination/infinite-pagination.component";
// grouped rows: inner renderer
import {GroupedDataGrid, CustomGroupRenderer} from "./grouped-data-example/grouped.data.grid";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AgGridModule.withComponents(
            [
                SquareComponent,
                CubeComponent,
                ParamsComponent,
                CurrencyComponent,
                ChildMessageComponent,
                RatioParentComponent,
                ClickableParentComponent,
                NumericEditorComponent,
                MoodEditorComponent,
                MoodRendererComponent,
                StyledComponent,
                NameAndAgeRendererComponent,
                MedalRendererComponent,
                PartialMatchFilterComponent,
                DetailPanelComponent,
                DateComponent,
                HeaderComponent,
                HeaderGroupComponent,
                FloatingFilterComponent,
                SliderFloatingFilter,
                GroupedDataGrid,
                CustomGroupRenderer
            ]),
        RatioModule,
        ClickableModule
    ],
    declarations: [
        AppComponent,
        RichGridComponent,
        DateComponent,
        HeaderComponent,
        HeaderGroupComponent,
        RichGridDeclarativeComponent,
        DynamicComponent,
        SquareComponent,
        CubeComponent,
        ParamsComponent,
        CurrencyComponent,
        ChildMessageComponent,
        RichComponent,
        EditorComponent,
        NumericEditorComponent,
        MoodEditorComponent,
        MoodRendererComponent,
        PinnedRowComponent,
        StyledComponent,
        FullWidthComponent,
        NameAndAgeRendererComponent,
        GroupRowComponent,
        MedalRendererComponent,
        FilterComponentComponent,
        PartialMatchFilterComponent,
        MasterComponent,
        DetailPanelComponent,
        FloatingFilterComponent,
        SliderFloatingFilter,
        InfinitePaginationComponent,
        RxJsComponentByRow,
        RxJsComponentByFullSet,
        GroupedDataGrid,
        CustomGroupRenderer
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
