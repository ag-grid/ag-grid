import {autoinject, customElement} from 'aurelia-framework'

import RefData from '../../data/refData';
import SkillFilter from '../../filters/skillFilter';
import ProficiencyFilter from '../../filters/proficiencyFilter';

import {GridOptions, GridApi, ColumnApi} from 'ag-grid';
// only import this if you are using the ag-Grid-Enterprise
import 'ag-grid-enterprise/main';

@autoinject()
@customElement('rich-grid-declarative')
export class RichGridDeclarative {

  private gridOptions: GridOptions;
  private showGrid: boolean;
  private rowData: any[];
  private rowCount: string;
  private api: GridApi;
  private columnApi: ColumnApi;

  constructor() {
    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.createRowData();
    this.showGrid = true;

    this.gridOptions.onGridReady = () => {
      this.api = this.gridOptions.api;
      this.columnApi = this.gridOptions.columnApi;
    }

  }

  private createRowData() {
    var rowData: any[] = [];

    for (var i = 0; i < 10000; i++) {
      var countryData = RefData.countries[i % RefData.countries.length];
      rowData.push({
        name: RefData.firstNames[i % RefData.firstNames.length] + ' ' + RefData.lastNames[i % RefData.lastNames.length],
        skills: {
          android: Math.random() < 0.4,
          html5: Math.random() < 0.4,
          mac: Math.random() < 0.4,
          windows: Math.random() < 0.4,
          css: Math.random() < 0.4
        },
        address: RefData.addresses[i % RefData.addresses.length],
        years: Math.round(Math.random() * 100),
        proficiency: Math.round(Math.random() * 100),
        country: countryData.country,
        continent: countryData.continent,
        language: countryData.language,
        mobile: this.createRandomPhoneNumber(),
        landline: this.createRandomPhoneNumber()
      });
    }

    this.rowData = rowData;
  }

  private calculateRowCount() {
    if (this.gridOptions.api && this.rowData) {
      var model = this.gridOptions.api.getModel();
      var totalRows = this.rowData.length;
      var processedRows = model.getRowCount();
      this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    }
  }

  private onModelUpdated() {
    console.log('onModelUpdated');
    this.calculateRowCount();
  }

  private onReady() {
    console.log('onReady');
    this.calculateRowCount();
  }

  private onCellClicked($event) {
    console.log('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  private onCellValueChanged($event) {
    console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
  }

  private onCellDoubleClicked($event) {
    console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  private onCellContextMenu($event) {
    console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  private onCellFocused($event) {
    console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.column ? $event.column.colId : '' + ')');
  }

  private onRowSelected($event) {
    // taking out, as when we 'select all', it prints to much to the console!!
    // console.log('onRowSelected: ' + $event.node.data.name);
  }

  private onSelectionChanged() {
    console.log('selectionChanged');
  }

  private onBeforeFilterChanged() {
    console.log('beforeFilterChanged');
  }

  private onAfterFilterChanged() {
    console.log('afterFilterChanged');
  }

  private onFilterModified() {
    console.log('onFilterModified');
  }

  private onBeforeSortChanged() {
    console.log('onBeforeSortChanged');
  }

  private onAfterSortChanged() {
    console.log('onAfterSortChanged');
  }

  private onVirtualRowRemoved($event) {
    // because this event gets fired LOTS of times, we don't print it to the
    // console. if you want to see it, just uncomment out this line
    // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
  }

  private onRowClicked($event) {
    console.log('onRowClicked: ' + $event.node.data.name);
  }

  private onQuickFilterChanged($event) {
    this.gridOptions.api.setQuickFilter($event.target.value);
  }

  // here we use one generic event to handle all the column type events.
  // the method just prints the event name
  private onColumnEvent($event) {
    console.log('onColumnEvent: ' + $event);
  }


  private countryCellRenderer(params) {
    var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='images/flags/" + RefData.COUNTRY_CODES[params.value] + ".png'>";
    return flag + " " + params.value;
  }

  private skillsCellRenderer(params) {
    var data = params.data;
    var skills = [];
    RefData.IT_SKILLS.forEach(function (skill) {
      if (data && data.skills && data.skills[skill]) {
        skills.push('<img src="images/skills/' + skill + '.png" width="16px" title="' + skill + '" />');
      }
    });
    return skills.join(' ');
  }

  private percentCellRenderer(params) {
    var value = params.value;

    var eDivPercentBar = document.createElement('div');
    eDivPercentBar.className = 'div-percent-bar';
    eDivPercentBar.style.width = value + '%';
    if (value < 20) {
      eDivPercentBar.style.backgroundColor = 'red';
    } else if (value < 60) {
      eDivPercentBar.style.backgroundColor = '#ff9900';
    } else {
      eDivPercentBar.style.backgroundColor = '#00A000';
    }

    var eValue = document.createElement('div');
    eValue.className = 'div-percent-value';
    eValue.innerHTML = value + '%';

    var eOuterDiv = document.createElement('div');
    eOuterDiv.className = 'div-outer-div';
    eOuterDiv.appendChild(eValue);
    eOuterDiv.appendChild(eDivPercentBar);

    return eOuterDiv;
  }

  private getSkillFilter(): any {
    return SkillFilter;
  }

  private getProficiencyFilter(): any {
    return ProficiencyFilter;
  }

  private getCountryFilterParams(): any {
    return {
      cellRenderer: this.countryCellRenderer,
      cellHeight: 20
    }
  }

  private createRandomPhoneNumber() {
    var result = '+';
    for (var i = 0; i < 12; i++) {
      result += Math.round(Math.random() * 10);
      if (i === 2 || i === 5 || i === 8) {
        result += ' ';
      }
    }
    return result;
  }
}

