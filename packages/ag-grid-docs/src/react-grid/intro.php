<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">index.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<snippet>
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [{
        headerName: "Make", field: "make"
      }, {
        headerName: "Model", field: "model"
      }, {
        headerName: "Price", field: "price"
      }],
      rowData: [{
        make: "Toyota", model: "Celica", price: 35000
      }, {
        make: "Ford", model: "Mondeo", price: 32000
      }, {
        make: "Porsche", model: "Boxter", price: 72000
      }]
    }
  }

  render() {
    return (
      &lt;div
        className="ag-theme-balham"
        style={ {
          height: '200px',
          width: '600px'
         } }
      &gt;

      &lt;AgGridReact
          columnDefs={this.state.columnDefs}
          rowData={this.state.rowData}&gt;
        &lt;/AgGridReact&gt;
      &lt;/div&gt;

    );
  }
}

render(&lt;App /&gt;, document.getElementById('root'));
</snippet>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
<snippet>
&lt;div id="root"&gt;&lt;/div&gt;
</snippet>  
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-grid-react-hello-world" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>