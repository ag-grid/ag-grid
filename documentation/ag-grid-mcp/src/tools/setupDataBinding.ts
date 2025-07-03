import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SetupDataBindingSchema } from '../utils/validation.js';
import { Framework } from '../types/index.js';

export const setupDataBindingTool: Tool = {
  name: 'setup-data-binding',
  description: 'Generate data binding code snippets for connecting data sources to AG-Grid',
  inputSchema: {
    type: 'object',
    properties: {
      framework: {
        type: 'string',
        enum: ['react', 'angular', 'vue', 'vanilla'],
        description: 'The framework to generate code for'
      },
      dataSource: {
        type: 'string',
        enum: ['static', 'api', 'websocket', 'server-side'],
        description: 'Type of data source'
      },
      apiEndpoint: {
        type: 'string',
        description: 'API endpoint URL (required for api and websocket sources)'
      },
      version: {
        type: 'string',
        description: 'AG-Grid version (optional)',
        pattern: '^\\d+\\.\\d+\\.\\d+(-\\w+)?$'
      }
    },
    required: ['framework', 'dataSource']
  }
};

export async function handleSetupDataBinding(args: any): Promise<string> {
  const validatedArgs = SetupDataBindingSchema.parse(args);
  
  try {
    const code = generateDataBindingCode(validatedArgs.framework, validatedArgs.dataSource, validatedArgs.apiEndpoint);
    const explanation = getDataSourceExplanation(validatedArgs.dataSource);
    const considerations = getConsiderations(validatedArgs.framework, validatedArgs.dataSource);
    
    return `## Data Binding for ${validatedArgs.framework.charAt(0).toUpperCase() + validatedArgs.framework.slice(1)} - ${validatedArgs.dataSource.charAt(0).toUpperCase() + validatedArgs.dataSource.slice(1)} Data

### ${explanation}

### Implementation
\`\`\`${validatedArgs.framework === 'vanilla' ? 'javascript' : 'typescript'}
${code}
\`\`\`

### Key Considerations
${considerations}

### Best Practices
${getBestPractices(validatedArgs.dataSource)}

### Documentation
- [Data Binding](https://www.ag-grid.com/documentation/data-binding/)
- [Row Data](https://www.ag-grid.com/documentation/row-data/)
- [${validatedArgs.dataSource === 'server-side' ? 'Server-Side Row Model' : 'Client-Side Row Model'}](https://www.ag-grid.com/documentation/${validatedArgs.dataSource === 'server-side' ? 'server-side-model' : 'client-side-model'}/)`;
  } catch (error) {
    throw new Error(`Failed to setup data binding: ${error}`);
  }
}

function generateDataBindingCode(framework: Framework, dataSource: string, apiEndpoint?: string): string {
  switch (dataSource) {
    case 'static':
      return generateStaticDataCode(framework);
    case 'api':
      return generateApiDataCode(framework, apiEndpoint);
    case 'websocket':
      return generateWebSocketDataCode(framework, apiEndpoint);
    case 'server-side':
      return generateServerSideDataCode(framework, apiEndpoint);
    default:
      throw new Error(`Unsupported data source: ${dataSource}`);
  }
}

function generateStaticDataCode(framework: Framework): string {
  const staticData = `[
  { id: 1, name: 'John Doe', age: 30, department: 'Engineering' },
  { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing' },
  { id: 3, name: 'Bob Johnson', age: 35, department: 'Sales' }
]`;

  switch (framework) {
    case 'react':
      return `import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

function MyGrid() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ]);

  useEffect(() => {
    // Load static data
    const data = ${staticData};
    setRowData(data);
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        animateRows={true}
      />
    </div>
  );
}`;

    case 'angular':
      return `import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-grid',
  template: \`
    <ag-grid-angular
      class="ag-theme-quartz"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [animateRows]="true"
      style="height: 400px; width: 100%;">
    </ag-grid-angular>
  \`
})
export class MyGridComponent implements OnInit {
  rowData: any[] = [];
  columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  ngOnInit() {
    // Load static data
    this.rowData = ${staticData};
  }
}`;

    case 'vue':
      return `<template>
  <div class="ag-theme-quartz" style="height: 400px; width: 100%">
    <ag-grid-vue
      :rowData="rowData"
      :columnDefs="columnDefs"
      :animateRows="true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

const rowData = ref([]);
const columnDefs = ref([
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
]);

onMounted(() => {
  // Load static data
  rowData.value = ${staticData};
});
</script>`;

    case 'vanilla':
      return `import { createGrid } from 'ag-grid-community';

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
];

const rowData = ${staticData};

const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  animateRows: true
};

const gridDiv = document.querySelector('#myGrid');
const gridApi = createGrid(gridDiv, gridOptions);`;

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

function generateApiDataCode(framework: Framework, apiEndpoint?: string): string {
  const endpoint = apiEndpoint || 'https://api.example.com/data';
  
  switch (framework) {
    case 'react':
      return `import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

function MyGrid() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('${endpoint}');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setRowData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        animateRows={true}
        onGridReady={(params) => {
          // Grid is ready
          console.log('Grid ready with', rowData.length, 'rows');
        }}
      />
    </div>
  );
}`;

    case 'angular':
      return `import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-grid',
  template: \`
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">Error: {{ error }}</div>
    <ag-grid-angular
      *ngIf="!loading && !error"
      class="ag-theme-quartz"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [animateRows]="true"
      (gridReady)="onGridReady($event)"
      style="height: 400px; width: 100%;">
    </ag-grid-angular>
  \`
})
export class MyGridComponent implements OnInit {
  rowData: any[] = [];
  loading = true;
  error: string | null = null;

  columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http.get<any[]>('${endpoint}').subscribe({
      next: (data) => {
        this.rowData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onGridReady(params: any) {
    console.log('Grid ready with', this.rowData.length, 'rows');
  }
}`;

    case 'vue':
      return `<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    <div v-if="!loading && !error" class="ag-theme-quartz" style="height: 400px; width: 100%">
      <ag-grid-vue
        :rowData="rowData"
        :columnDefs="columnDefs"
        :animateRows="true"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

const rowData = ref([]);
const loading = ref(true);
const error = ref(null);

const columnDefs = ref([
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
]);

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await fetch('${endpoint}');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    rowData.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const onGridReady = (params) => {
  console.log('Grid ready with', rowData.value.length, 'rows');
};
</script>`;

    case 'vanilla':
      return `import { createGrid } from 'ag-grid-community';

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
];

const gridOptions = {
  columnDefs: columnDefs,
  rowData: [],
  animateRows: true,
  onGridReady: (params) => {
    fetchData(params.api);
  }
};

const gridDiv = document.querySelector('#myGrid');
const gridApi = createGrid(gridDiv, gridOptions);

async function fetchData(gridApi) {
  try {
    const response = await fetch('${endpoint}');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    gridApi.setGridOption('rowData', data);
    console.log('Data loaded:', data.length, 'rows');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`;

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

function generateWebSocketDataCode(framework: Framework, apiEndpoint?: string): string {
  const endpoint = apiEndpoint || 'ws://localhost:8080/data';
  
  switch (framework) {
    case 'react':
      return `import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';

function MyGrid() {
  const [rowData, setRowData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const gridRef = useRef(null);
  const wsRef = useRef(null);

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('${endpoint}');
    
    wsRef.current.onopen = () => {
      setConnectionStatus('Connected');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketData(data);
    };
    
    wsRef.current.onclose = () => {
      setConnectionStatus('Disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };
  };

  const handleWebSocketData = (data) => {
    if (data.type === 'full-refresh') {
      setRowData(data.rows);
    } else if (data.type === 'update') {
      setRowData(prev => {
        const newData = [...prev];
        const index = newData.findIndex(row => row.id === data.row.id);
        if (index >= 0) {
          newData[index] = data.row;
        } else {
          newData.push(data.row);
        }
        return newData;
      });
    }
  };

  return (
    <div>
      <div>Status: {connectionStatus}</div>
      <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          animateRows={true}
        />
      </div>
    </div>
  );
}`;

    case 'angular':
      return `import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-my-grid',
  template: \`
    <div>Status: {{ connectionStatus }}</div>
    <ag-grid-angular
      class="ag-theme-quartz"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [animateRows]="true"
      style="height: 400px; width: 100%;">
    </ag-grid-angular>
  \`
})
export class MyGridComponent implements OnInit, OnDestroy {
  rowData: any[] = [];
  connectionStatus = 'Disconnected';
  private ws: WebSocket | null = null;

  columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  ngOnInit() {
    this.connectWebSocket();
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  connectWebSocket() {
    this.ws = new WebSocket('${endpoint}');
    
    this.ws.onopen = () => {
      this.connectionStatus = 'Connected';
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketData(data);
    };
    
    this.ws.onclose = () => {
      this.connectionStatus = 'Disconnected';
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus = 'Error';
    };
  }

  handleWebSocketData(data: any) {
    if (data.type === 'full-refresh') {
      this.rowData = data.rows;
    } else if (data.type === 'update') {
      const index = this.rowData.findIndex(row => row.id === data.row.id);
      if (index >= 0) {
        this.rowData[index] = data.row;
        this.rowData = [...this.rowData]; // Trigger change detection
      } else {
        this.rowData = [...this.rowData, data.row];
      }
    }
  }
}`;

    case 'vue':
      return `<template>
  <div>
    <div>Status: {{ connectionStatus }}</div>
    <div class="ag-theme-quartz" style="height: 400px; width: 100%">
      <ag-grid-vue
        :rowData="rowData"
        :columnDefs="columnDefs"
        :animateRows="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

const rowData = ref([]);
const connectionStatus = ref('Disconnected');
let ws = null;

const columnDefs = ref([
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
]);

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

const connectWebSocket = () => {
  ws = new WebSocket('${endpoint}');
  
  ws.onopen = () => {
    connectionStatus.value = 'Connected';
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketData(data);
  };
  
  ws.onclose = () => {
    connectionStatus.value = 'Disconnected';
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    connectionStatus.value = 'Error';
  };
};

const handleWebSocketData = (data) => {
  if (data.type === 'full-refresh') {
    rowData.value = data.rows;
  } else if (data.type === 'update') {
    const index = rowData.value.findIndex(row => row.id === data.row.id);
    if (index >= 0) {
      rowData.value[index] = data.row;
    } else {
      rowData.value.push(data.row);
    }
  }
};
</script>`;

    case 'vanilla':
      return `import { createGrid } from 'ag-grid-community';

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
];

let gridApi;
let ws;
let connectionStatus = 'Disconnected';

const gridOptions = {
  columnDefs: columnDefs,
  rowData: [],
  animateRows: true,
  onGridReady: (params) => {
    gridApi = params.api;
    connectWebSocket();
  }
};

const gridDiv = document.querySelector('#myGrid');
const statusDiv = document.querySelector('#status');
createGrid(gridDiv, gridOptions);

function connectWebSocket() {
  ws = new WebSocket('${endpoint}');
  
  ws.onopen = () => {
    updateStatus('Connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketData(data);
  };
  
  ws.onclose = () => {
    updateStatus('Disconnected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Error');
  };
}

function handleWebSocketData(data) {
  if (data.type === 'full-refresh') {
    gridApi.setGridOption('rowData', data.rows);
  } else if (data.type === 'update') {
    const currentData = [];
    gridApi.forEachNode(node => currentData.push(node.data));
    const index = currentData.findIndex(row => row.id === data.row.id);
    if (index >= 0) {
      const rowNode = gridApi.getRowNode(index);
      rowNode.setData(data.row);
    } else {
      gridApi.applyTransaction({ add: [data.row] });
    }
  }
}

function updateStatus(status) {
  connectionStatus = status;
  if (statusDiv) {
    statusDiv.textContent = 'Status: ' + status;
  }
}`;

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

function generateServerSideDataCode(framework: Framework, apiEndpoint?: string): string {
  const endpoint = apiEndpoint || 'https://api.example.com/data';
  
  switch (framework) {
    case 'react':
      return `import React, { useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise'; // Required for server-side row model

function MyGrid() {
  const [columnDefs] = useState([
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ]);

  const datasource = {
    getRows: async (params) => {
      try {
        const response = await fetch('${endpoint}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel
          })
        });
        
        const data = await response.json();
        params.successCallback(data.rows, data.lastRow);
      } catch (error) {
        console.error('Error fetching data:', error);
        params.failCallback();
      }
    }
  };

  const onGridReady = useCallback((params) => {
    params.api.setGridOption('serverSideDatasource', datasource);
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowModelType="serverSide"
        onGridReady={onGridReady}
        animateRows={true}
        serverSideStoreType="partial"
        cacheBlockSize={100}
        maxBlocksInCache={10}
      />
    </div>
  );
}`;

    case 'angular':
      return `import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'ag-grid-enterprise'; // Required for server-side row model

@Component({
  selector: 'app-my-grid',
  template: \`
    <ag-grid-angular
      class="ag-theme-quartz"
      [columnDefs]="columnDefs"
      [rowModelType]="'serverSide'"
      [serverSideStoreType]="'partial'"
      [cacheBlockSize]="100"
      [maxBlocksInCache]="10"
      [animateRows]="true"
      (gridReady)="onGridReady($event)"
      style="height: 400px; width: 100%;">
    </ag-grid-angular>
  \`
})
export class MyGridComponent {
  columnDefs = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 90 },
    { field: 'department', headerName: 'Department', width: 150 }
  ];

  constructor(private http: HttpClient) {}

  onGridReady(params: any) {
    const datasource = {
      getRows: (params: any) => {
        this.http.post<any>('${endpoint}', {
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel,
          filterModel: params.filterModel
        }).subscribe({
          next: (data) => {
            params.successCallback(data.rows, data.lastRow);
          },
          error: (error) => {
            console.error('Error fetching data:', error);
            params.failCallback();
          }
        });
      }
    };

    params.api.setGridOption('serverSideDatasource', datasource);
  }
}`;

    case 'vue':
      return `<template>
  <div class="ag-theme-quartz" style="height: 400px; width: 100%">
    <ag-grid-vue
      :columnDefs="columnDefs"
      :rowModelType="'serverSide'"
      :serverSideStoreType="'partial'"
      :cacheBlockSize="100"
      :maxBlocksInCache="10"
      :animateRows="true"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-enterprise'; // Required for server-side row model

const columnDefs = ref([
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
]);

const onGridReady = (params) => {
  const datasource = {
    getRows: async (params) => {
      try {
        const response = await fetch('${endpoint}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel,
            filterModel: params.filterModel
          })
        });
        
        const data = await response.json();
        params.successCallback(data.rows, data.lastRow);
      } catch (error) {
        console.error('Error fetching data:', error);
        params.failCallback();
      }
    }
  };

  params.api.setGridOption('serverSideDatasource', datasource);
};
</script>`;

    case 'vanilla':
      return `import { createGrid } from 'ag-grid-enterprise'; // Required for server-side row model

const columnDefs = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'age', headerName: 'Age', width: 90 },
  { field: 'department', headerName: 'Department', width: 150 }
];

const datasource = {
  getRows: async (params) => {
    try {
      const response = await fetch('${endpoint}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startRow: params.startRow,
          endRow: params.endRow,
          sortModel: params.sortModel,
          filterModel: params.filterModel
        })
      });
      
      const data = await response.json();
      params.successCallback(data.rows, data.lastRow);
    } catch (error) {
      console.error('Error fetching data:', error);
      params.failCallback();
    }
  }
};

const gridOptions = {
  columnDefs: columnDefs,
  rowModelType: 'serverSide',
  serverSideStoreType: 'partial',
  cacheBlockSize: 100,
  maxBlocksInCache: 10,
  animateRows: true,
  onGridReady: (params) => {
    params.api.setGridOption('serverSideDatasource', datasource);
  }
};

const gridDiv = document.querySelector('#myGrid');
createGrid(gridDiv, gridOptions);`;

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

function getDataSourceExplanation(dataSource: string): string {
  switch (dataSource) {
    case 'static':
      return 'Static Data Source - Data is defined directly in the component and loaded once';
    case 'api':
      return 'API Data Source - Data is fetched from a REST API endpoint';
    case 'websocket':
      return 'WebSocket Data Source - Real-time data updates via WebSocket connection';
    case 'server-side':
      return 'Server-Side Data Source - Data is loaded on-demand with server-side sorting, filtering, and pagination';
    default:
      return 'Unknown data source';
  }
}

function getConsiderations(framework: Framework, dataSource: string): string {
  const considerations = [];
  
  // Framework-specific considerations
  if (framework === 'react') {
    considerations.push('- Use useState and useEffect hooks for state management');
    considerations.push('- Consider using useCallback for event handlers to prevent unnecessary re-renders');
  } else if (framework === 'angular') {
    considerations.push('- Use Angular services for data management');
    considerations.push('- Implement proper error handling with HttpClient');
  } else if (framework === 'vue') {
    considerations.push('- Use Vue 3 composition API with ref and reactive');
    considerations.push('- Handle component lifecycle properly with onMounted/onUnmounted');
  } else if (framework === 'vanilla') {
    considerations.push('- Ensure proper DOM element selection');
    considerations.push('- Handle cleanup and event listeners properly');
  }
  
  // Data source specific considerations
  if (dataSource === 'api') {
    considerations.push('- Implement proper error handling for network failures');
    considerations.push('- Consider adding retry logic for failed requests');
    considerations.push('- Add loading states for better user experience');
  } else if (dataSource === 'websocket') {
    considerations.push('- Handle WebSocket connection states (connecting, open, closing, closed)');
    considerations.push('- Implement reconnection logic for dropped connections');
    considerations.push('- Consider message queuing for offline scenarios');
  } else if (dataSource === 'server-side') {
    considerations.push('- Requires AG Grid Enterprise license');
    considerations.push('- Server must support pagination, sorting, and filtering');
    considerations.push('- Consider implementing caching strategies');
  }
  
  return considerations.join('\n');
}

function getBestPractices(dataSource: string): string {
  const practices = [];
  
  practices.push('- Always handle errors gracefully with user-friendly messages');
  practices.push('- Implement loading states to improve perceived performance');
  practices.push('- Use proper TypeScript types for better code quality');
  
  if (dataSource === 'api') {
    practices.push('- Cache API responses when appropriate');
    practices.push('- Implement debouncing for user-triggered data fetches');
    practices.push('- Use proper HTTP status code handling');
  } else if (dataSource === 'websocket') {
    practices.push('- Implement heartbeat/ping-pong for connection health');
    practices.push('- Use connection pooling for multiple WebSocket connections');
    practices.push('- Consider using a WebSocket library like Socket.IO for additional features');
  } else if (dataSource === 'server-side') {
    practices.push('- Optimize server queries with proper indexing');
    practices.push('- Implement request debouncing to reduce server load');
    practices.push('- Consider using virtual scrolling for large datasets');
  }
  
  return practices.map(practice => practice).join('\n');
}