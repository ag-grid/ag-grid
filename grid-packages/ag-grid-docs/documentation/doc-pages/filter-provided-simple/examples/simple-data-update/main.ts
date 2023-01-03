import { Grid, GridOptions, IDateFilterParams } from '@ag-grid-community/core'

var filterParams: IDateFilterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    var dateAsString = cellValue
    if (dateAsString == null) return -1
    var dateParts = dateAsString.split('/')
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    )

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
    return 0;
  },
  browserDatePicker: true,
}

var fetchedData: any[];

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 100 },
    {
      field: 'date',
      filter: 'agDateColumnFilter',
      filterParams: filterParams,
    },
    { field: 'total', filter: false },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
  },
}

function jumbleData() {
  if (fetchedData) {
    const ages = fetchedData.map(d => d.age);
    // Force reload by mutating fetched data - jumble the ages.
    const jumbledData = fetchedData.map(d => {
      const randomAgeIndex = Math.round(Math.random() * (ages.length - 1));
      return { ...d, age: ages.splice(randomAgeIndex, 1)[0] };
    });

    gridOptions.api!.setRowData(jumbledData);
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      fetchedData = data.slice(0, 9);
      gridOptions.api!.setRowData(fetchedData);
    });
});
