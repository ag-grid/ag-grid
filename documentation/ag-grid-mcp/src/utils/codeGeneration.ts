import { Framework, ColumnDefinition, GridConfig } from '../types/index.js';

export class CodeGenerationService {
  static generateGridConfig(config: GridConfig): string {
    const { framework, features = [], theme = 'ag-theme-quartz', enterpriseFeatures = false } = config;

    switch (framework) {
      case 'react':
        return this.generateReactGridConfig(config);
      case 'angular':
        return this.generateAngularGridConfig(config);
      case 'vue':
        return this.generateVueGridConfig(config);
      case 'vanilla':
        return this.generateVanillaGridConfig(config);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  static generateColumnDefinitions(columns: ColumnDefinition[], framework: Framework): string {
    const colDefs = columns.map(col => this.formatColumnDefinition(col)).join(',\n  ');
    
    switch (framework) {
      case 'react':
        return `const columnDefs = [\n  ${colDefs}\n];`;
      case 'angular':
        return `columnDefs = [\n  ${colDefs}\n];`;
      case 'vue':
        return `const columnDefs = ref([\n  ${colDefs}\n]);`;
      case 'vanilla':
        return `const columnDefs = [\n  ${colDefs}\n];`;
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  private static generateReactGridConfig(config: GridConfig): string {
    const { theme = 'ag-theme-quartz', enterpriseFeatures = false } = config;
    const imports = enterpriseFeatures 
      ? `import { AgGridReact } from 'ag-grid-react';\nimport 'ag-grid-enterprise';`
      : `import { AgGridReact } from 'ag-grid-react';`;

    return `${imports}
import '${theme}.css';
import 'ag-grid-community/styles/ag-grid.css';

function MyGrid() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  return (
    <div className="${theme}" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true
        }}
        animateRows={true}
        rowSelection="multiple"
      />
    </div>
  );
}`;
  }

  private static generateAngularGridConfig(config: GridConfig): string {
    const { theme = 'ag-theme-quartz', enterpriseFeatures = false } = config;
    const imports = enterpriseFeatures 
      ? `import { AgGridAngular } from 'ag-grid-angular';\nimport 'ag-grid-enterprise';`
      : `import { AgGridAngular } from 'ag-grid-angular';`;

    return `${imports}
import '${theme}.css';
import 'ag-grid-community/styles/ag-grid.css';

@Component({
  selector: 'app-my-grid',
  template: \`
    <ag-grid-angular
      class="${theme}"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [animateRows]="true"
      [rowSelection]="'multiple'"
      style="height: 400px; width: 100%;">
    </ag-grid-angular>
  \`
})
export class MyGridComponent {
  rowData: any[] = [];
  columnDefs: any[] = [];
  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };
}`;
  }

  private static generateVueGridConfig(config: GridConfig): string {
    const { theme = 'ag-theme-quartz', enterpriseFeatures = false } = config;
    const imports = enterpriseFeatures 
      ? `import { AgGridVue } from 'ag-grid-vue3';\nimport 'ag-grid-enterprise';`
      : `import { AgGridVue } from 'ag-grid-vue3';`;

    return `<template>
  <div class="${theme}" style="height: 400px; width: 100%">
    <ag-grid-vue
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      :rowSelection="'multiple'"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
${imports}
import '${theme}.css';
import 'ag-grid-community/styles/ag-grid.css';

const rowData = ref([]);
const columnDefs = ref([]);
const defaultColDef = ref({
  sortable: true,
  filter: true,
  resizable: true
});
</script>`;
  }

  private static generateVanillaGridConfig(config: GridConfig): string {
    const { theme = 'ag-theme-quartz', enterpriseFeatures = false } = config;
    const imports = enterpriseFeatures 
      ? `import { createGrid } from 'ag-grid-enterprise';`
      : `import { createGrid } from 'ag-grid-community';`;

    return `${imports}
import '${theme}.css';
import 'ag-grid-community/styles/ag-grid.css';

const gridOptions = {
  rowData: [],
  columnDefs: [],
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true
  },
  animateRows: true,
  rowSelection: 'multiple'
};

const gridDiv = document.querySelector('#myGrid');
const gridApi = createGrid(gridDiv, gridOptions);`;
  }

  private static formatColumnDefinition(col: ColumnDefinition): string {
    const props = [];
    
    props.push(`field: '${col.field}'`);
    
    if (col.headerName) {
      props.push(`headerName: '${col.headerName}'`);
    }
    
    if (col.width) {
      props.push(`width: ${col.width}`);
    }
    
    if (col.type) {
      props.push(`type: '${col.type}'`);
    }
    
    if (col.sortable !== undefined) {
      props.push(`sortable: ${col.sortable}`);
    }
    
    if (col.filter !== undefined) {
      if (typeof col.filter === 'boolean') {
        props.push(`filter: ${col.filter}`);
      } else {
        props.push(`filter: '${col.filter}'`);
      }
    }
    
    if (col.editable !== undefined) {
      props.push(`editable: ${col.editable}`);
    }
    
    if (col.cellRenderer) {
      props.push(`cellRenderer: '${col.cellRenderer}'`);
    }
    
    if (col.valueFormatter) {
      props.push(`valueFormatter: ${col.valueFormatter}`);
    }
    
    if (col.valueParser) {
      props.push(`valueParser: ${col.valueParser}`);
    }

    return `{ ${props.join(', ')} }`;
  }

  static generateFeatureImplementation(feature: string, framework: Framework): string {
    const implementations = {
      'row-selection': this.generateRowSelectionCode(framework),
      'sorting': this.generateSortingCode(framework),
      'filtering': this.generateFilteringCode(framework),
      'pagination': this.generatePaginationCode(framework),
      'editing': this.generateEditingCode(framework),
      'master-detail': this.generateMasterDetailCode(framework),
      'tree-data': this.generateTreeDataCode(framework),
      'pivoting': this.generatePivotingCode(framework),
      'grouping': this.generateGroupingCode(framework),
      'charts': this.generateChartsCode(framework)
    };

    return implementations[feature as keyof typeof implementations] || `// Feature '${feature}' implementation not available`;
  }

  private static generateRowSelectionCode(framework: Framework): string {
    const configs = {
      react: `rowSelection: 'multiple',
onSelectionChanged: (event) => {
  console.log('Selected rows:', event.api.getSelectedRows());
}`,
      angular: `rowSelection: 'multiple',
onSelectionChanged: (event) => {
  console.log('Selected rows:', event.api.getSelectedRows());
}`,
      vue: `rowSelection: 'multiple',
onSelectionChanged: (event) => {
  console.log('Selected rows:', event.api.getSelectedRows());
}`,
      vanilla: `rowSelection: 'multiple',
onSelectionChanged: (event) => {
  console.log('Selected rows:', event.api.getSelectedRows());
}`
    };

    return configs[framework];
  }

  private static generateSortingCode(framework: Framework): string {
    return `defaultColDef: {
  sortable: true
},
// Custom sorting
columnDefs: [
  {
    field: 'name',
    sortable: true,
    sort: 'asc'
  }
]`;
  }

  private static generateFilteringCode(framework: Framework): string {
    return `defaultColDef: {
  filter: true
},
// Custom filters
columnDefs: [
  {
    field: 'age',
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply', 'reset']
    }
  }
]`;
  }

  private static generatePaginationCode(framework: Framework): string {
    return `pagination: true,
paginationPageSize: 20,
paginationPageSizeSelector: [10, 20, 50, 100]`;
  }

  private static generateEditingCode(framework: Framework): string {
    return `defaultColDef: {
  editable: true
},
// Custom editing
columnDefs: [
  {
    field: 'name',
    editable: true,
    cellEditor: 'agTextCellEditor'
  }
]`;
  }

  private static generateMasterDetailCode(framework: Framework): string {
    return `// Master-Detail requires AG Grid Enterprise
masterDetail: true,
detailCellRendererParams: {
  detailGridOptions: {
    columnDefs: [
      { field: 'detailField' }
    ]
  },
  getDetailRowData: (params) => {
    params.successCallback(params.data.details);
  }
}`;
  }

  private static generateTreeDataCode(framework: Framework): string {
    return `// Tree Data
treeData: true,
getDataPath: (data) => data.path,
autoGroupColumnDef: {
  headerName: 'Group',
  cellRendererParams: {
    suppressCount: true
  }
}`;
  }

  private static generatePivotingCode(framework: Framework): string {
    return `// Pivoting requires AG Grid Enterprise
pivotMode: true,
columnDefs: [
  { field: 'country', pivot: true },
  { field: 'sport', rowGroup: true },
  { field: 'gold', aggFunc: 'sum' }
]`;
  }

  private static generateGroupingCode(framework: Framework): string {
    return `// Row Grouping
columnDefs: [
  { field: 'country', rowGroup: true },
  { field: 'sport', rowGroup: true },
  { field: 'gold', aggFunc: 'sum' }
],
autoGroupColumnDef: {
  headerName: 'Group',
  field: 'athlete',
  cellRenderer: 'agGroupCellRenderer'
}`;
  }

  private static generateChartsCode(framework: Framework): string {
    return `// Charts requires AG Grid Enterprise
enableCharts: true,
chartThemes: ['ag-default', 'ag-material', 'ag-pastel'],
popupParent: document.body`;
  }
}