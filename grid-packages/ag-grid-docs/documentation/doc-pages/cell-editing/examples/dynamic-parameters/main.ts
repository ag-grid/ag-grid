import { CellValueChangedEvent, GridOptions, ICellEditorParams } from '@ag-grid-community/core'
declare var GenderCellRenderer: any;

const cellCellEditorParams = (params: ICellEditorParams) => {
  const selectedCountry = params.data.country
  const allowedCities = countyToCityMap(selectedCountry)

  return {
    values: allowedCities,
    formatValue: (value: any) => `${value} (${selectedCountry})`,
  }
}

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'name' },
    {
      field: 'gender',
      cellRenderer: 'genderCellRenderer',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        values: ['Male', 'Female'],
        cellRenderer: 'genderCellRenderer',
      },
    },
    {
      field: 'country',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: {
        cellHeight: 50,
        values: ['Ireland', 'USA'],
      },
    },
    {
      field: 'city',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: cellCellEditorParams,
    },
    { field: 'address', cellEditor: 'agLargeTextCellEditor', minWidth: 550 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 130,
    editable: true,
    resizable: true,
  },
  components: {
    genderCellRenderer: GenderCellRenderer,
  },
  rowData: getData(),
  onCellValueChanged: onCellValueChanged,
}

function countyToCityMap(match: string): string[] {
  const map: { [key: string]: string[] } = {
    Ireland: ['Dublin', 'Cork', 'Galway'],
    USA: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  }

  return map[match]
}

function onCellValueChanged(params: CellValueChangedEvent) {
  const colId = params.column.getId()

  if (colId === 'country') {
    const selectedCountry = params.data.country
    const selectedCity = params.data.city
    const allowedCities = countyToCityMap(selectedCountry)
    const cityMismatch = allowedCities.indexOf(selectedCity) < 0

    if (cityMismatch) {
      params.node.setDataValue('city', null)
    }
  }
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
