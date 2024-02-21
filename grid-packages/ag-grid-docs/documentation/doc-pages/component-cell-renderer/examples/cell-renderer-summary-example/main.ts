import { createGrid, ColDef, GridApi, GridOptions, ValueFormatterParams, ICellRendererComp, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/core';

// Grid API: Access to Grid API methods
let gridApi: GridApi;

class CompanyLogoRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        let companyLogo: HTMLImageElement = document.createElement('img');
        companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`
        companyLogo.setAttribute('style', 'display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1)');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center')
        this.eGui.appendChild(companyLogo)
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
    refresh(params: ICellRendererParams): boolean {
        return false
    }
}

class MissionResultRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        let icon: HTMLImageElement = document.createElement('img');
        icon.src = `https://www.ag-grid.com/example-assets/icons/${params.value ? 'tick-in-circle' : 'cross-in-circle'}.png`
        icon.setAttribute('style', 'width: auto; height: auto;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; justify-content: center; height: 100%; align-items: center')
        this.eGui.appendChild(icon)
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() { 
        return this.eGui;
    }

    // Required: Get the cell to refresh. 
    refresh(params: ICellRendererParams): boolean {
        return false
    }
}

class CustomButtonComponent {
    eGui!: HTMLDivElement;
    eButton: any;
    eventListener!: () => void;
  
    init() {
      this.eGui = document.createElement('div');
      let eButton = document.createElement('button');
      eButton.className = 'btn-simple';
      eButton.innerText = 'Launch!';
      this.eventListener = () => alert('Mission Launched');
      eButton.addEventListener('click', this.eventListener);
      this.eGui.appendChild(eButton);
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh() {
      return true;
    }
  
    destroy() {
      if (this.eButton) {
        this.eButton.removeEventListener('click', this.eventListener);
      }
    }
  }

function PriceRenderer(params: ICellRendererParams) {

    let priceMultiplier: number = 1;
    if (params.value > 5000000) {
      priceMultiplier = 2
    }
    if (params.value > 10000000) {
      priceMultiplier = 3
    }
    if (params.value > 25000000) {
      priceMultiplier = 4
    }
    if (params.value > 20000000) {
      priceMultiplier = 5
    }
  
    const priceSpan = document.createElement('span')
    priceSpan.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center')
      for (let i = 0; i < priceMultiplier; i++) {
    const priceElement = document.createElement('img')
    priceElement.src = `https://www.ag-grid.com/example-assets/pound.png`
    priceElement.setAttribute('style', 'display: block; width: 15px; height: auto; max-height: 50%;');
      priceSpan.appendChild(priceElement)
    }
    return priceSpan
    
}

function CompanyRenderer(params: ICellRendererParams) {
  let value = params.value;
  if (params.value === 'Astra') {
    value = 'Astra_(American_spaceflight_company)'
  }
  const link = `<a href="https://en.wikipedia.org/wiki/${value}" target="_blank">${params.value}</a>`
  return link
  
}

// Row Data Interface
interface IRow {
  company: string;
  location: string;
  price: number;
  successful: boolean;
}

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [] as IRow[],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
          {
            field: "company",
            valueGetter: (params: ValueGetterParams) => {
              return params.data.company;
          },
            cellRenderer: CompanyRenderer
          },
          {
            headerName: "Logo",
            valueGetter: (params: ValueGetterParams) => {
                return params.data.company;
            },
            cellRenderer: CompanyLogoRenderer 
          },
          {
            headerName: "Mission Cost",
            valueGetter: (params: ValueGetterParams) => {
                return params.data.price;
            },
            cellRenderer: PriceRenderer,
          },
          {
            field: "successful",
            headerName: "Success",
            cellRenderer: MissionResultRenderer 
          },
          {
            field: "button",
            headerName: "Button",
            cellRenderer: CustomButtonComponent,
          },
    ] as ColDef[],
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://www.ag-grid.com/example-assets/small-space-mission-data.json')
    .then(response => response.json())
    .then((data: any) => gridApi.setGridOption('rowData', data))