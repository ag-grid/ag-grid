import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model"
import { ModuleRegistry } from "@ag-grid-community/core"
import "@ag-grid-community/styles/ag-grid.css"
import "@ag-grid-community/styles/ag-theme-quartz.css"
import { AgGridVue } from "@ag-grid-community/vue"
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel"
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping"
import { SetFilterModule } from "@ag-grid-enterprise/set-filter"
import Vue from "vue"
import "./styles.css"

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, SetFilterModule, FiltersToolPanelModule]);

const VueExample = {
  template: `
        <div style="height: 100%">
            <div class="test-container">
                <div class="test-header">
                    <input type="text" id="filter-text-box" style="width: 100px;" v-on:input="onQuickFilterChanged()" placeholder="Filter...">
                    <span style="padding-left: 20px;">
                        <b>Period:</b>
                        <button v-on:click="onChangeMonth(-1)"><i class="fa fa-chevron-left"></i></button>
                        <button v-on:click="onChangeMonth(1)"><i class="fa fa-chevron-right"></i></button>
                        <span id="monthName" style="width: 100px; display: inline-block;">Year to Jan</span>
                    </span>
                    <span style="padding-left: 20px;">
                        <b>Legend:</b>&nbsp;&nbsp;
                        <div class="cell-bud legend-box"></div> Actual&nbsp;&nbsp;
                        <div class="cell-act legend-box"></div> Budget
                    </span>
                </div>
                <ag-grid-vue
                
                style="width: 100%; height: 100%;"
                :class="themeClass"
                :columnDefs="columnDefs"
                :suppressMovableColumns="true"
                @grid-ready="onGridReady"
                :context="context"
                :defaultColDef="defaultColDef"
                :autoGroupColumnDef="autoGroupColumnDef"
                :rowSelection="rowSelection"
                :groupSelectsChildren="true"
                :rowData="rowData"></ag-grid-vue></div>
        </div>
    `,
  components: {
    "ag-grid-vue": AgGridVue,
  },
  data: function () {
    return {
      columnDefs: [
        { field: "country", rowGroup: true, hide: true },
        {
          headerName: "Monthly Data",
          children: [
            {
              field: "jan",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              field: "feb",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              field: "mar",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              field: "apr",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              field: "may",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              field: "jun",
              cellRenderer: accountingCellRenderer,
              cellClass: "cell-figure",
              valueGetter: monthValueGetter,
              cellClassRules: monthCellClassRules,
              aggFunc: "sum",
            },
            {
              headerName: "YTD",
              cellClass: "cell-figure",
              cellRenderer: accountingCellRenderer,
              valueGetter: yearToDateValueGetter,
              aggFunc: "sum",
            },
          ],
        },
      ],
      gridApi: null,
      themeClass:
        /** DARK MODE START **/ document.documentElement.dataset.defaultTheme ||
        "ag-theme-quartz" /** DARK MODE END **/,
      defaultColDef: {
        flex: 1,
        minWidth: 120,
      },
      context: null,
      autoGroupColumnDef: null,
      rowSelection: null,
      rowData: null,
    }
  },
  created() {
    this.context = {
      month: 0,
      months: [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ],
    }
    this.autoGroupColumnDef = {
      headerName: "Location",
      field: "city",
      minWidth: 260,
      cellRenderer: "agGroupCellRenderer",
      cellRendererParams: {
        checkbox: true,
      },
    }
    this.rowSelection = "multiple"
  },
  methods: {
    onChangeMonth(i) {
      var newMonth = (this.context.month += i)
      if (newMonth < -1) {
        newMonth = -1
      }
      if (newMonth > 5) {
        newMonth = 5
      }
      // Mutate the context object in place
      this.context.month = newMonth
      document.querySelector("#monthName").textContent = monthNames[newMonth + 1]
      this.gridApi.refreshClientSideRowModel("aggregate")
      this.gridApi.refreshCells()
    },
    onQuickFilterChanged() {
      this.gridApi.setGridOption(
        "quickFilterText",
        document.getElementById("filter-text-box").value
      )
    },
    onGridReady(params) {
      this.gridApi = params.api

      const updateData = data => {
        this.rowData = data
      }

      fetch("https://www.ag-grid.com/example-assets/monthly-sales.json")
        .then(resp => resp.json())
        .then(data => updateData(data))
    },
  },
}

var monthValueGetter =
  '(ctx.month < ctx.months.indexOf(colDef.field)) ? data[colDef.field + "_bud"] : data[colDef.field + "_act"]'

var monthCellClassRules = {
  "cell-act": "ctx.month < ctx.months.indexOf(colDef.field)",
  "cell-bud": "ctx.month >= ctx.months.indexOf(colDef.field)",
  "cell-negative": "x < 0",
}

var yearToDateValueGetter =
  'var total = 0; ctx.months.forEach( function(monthName, monthIndex) { if (monthIndex<=ctx.month) { total += data[monthName + "_act"]; } }); return total; '

var accountingCellRenderer = function (params) {
  if (params.value == null) {
    return ""
  } else if (params.value >= 0) {
    return params.value.toLocaleString()
  } else {
    return "(" + Math.abs(params.value).toLocaleString() + ")"
  }
}

var monthNames = [
  "Budget Only",
  "Year to Jan",
  "Year to Feb",
  "Year to Mar",
  "Year to Apr",
  "Year to May",
  "Year to Jun",
  "Year to Jul",
  "Year to Aug",
  "Year to Sep",
  "Year to Oct",
  "Year to Nov",
  "Full Year",
]

new Vue({
  el: "#app",
  components: {
    "my-component": VueExample,
  },
})
