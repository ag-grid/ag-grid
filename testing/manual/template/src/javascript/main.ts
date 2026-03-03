import { createGrid } from 'ag-grid-community';

import { gridOptions } from '../config';

const gridDiv = document.querySelector<HTMLElement>('#grid')!;
createGrid(gridDiv, gridOptions);
