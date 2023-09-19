import { Grid, ColDef, GridOptions, IAggFuncParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'country', rowGroup: true, hide: true },
  { field: 'year', rowGroup: true, hide: true },
  {
    headerName: 'avg(age)',
    field: 'age',
    aggFunc: avgAggFunction,
    enableValue: true,
    minWidth: 200,
  },
];

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    headerName: 'Athlete',
    field: 'athlete',
    minWidth: 250,
  },
  suppressAggFuncInHeader: true,
};

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function avgAggFunction(params: IAggFuncParams) {
  // the average will be the sum / count
  let sum = 0;
  let count = 0;

  params.values.forEach((value) => {
    const groupNode =
      value !== null && value !== undefined && typeof value === 'object';
    if (groupNode) {
      // we are aggregating groups, so we take the
      // aggregated values to calculated a weighted average
      sum += value.avg * value.count;
      count += value.count;
    } else {
      // skip values that are not numbers (ie skip empty values)
      if (typeof value === 'number') {
        sum += value;
        count++;
      }
    }
  });

  // avoid divide by zero error
  let avg = null;
  if (count !== 0) {
    avg = sum / count;
  }

  // the result will be an object. when this cell is rendered, only the avg is shown.
  // however when this cell is part of another aggregation, the count is also needed
  // to create a weighted average for the next level.
  const result = {
    count: count,
    avg: avg,
    value: avg,
  };

  return result;
}

// setup the grid after the page has finished loading
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
new Grid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then((response) => response.json())
  .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data));