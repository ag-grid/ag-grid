/**
 * These templates are used to generate the code to render the charts in the Standalone Charts API Explorer.
 */

import { deepClone, formatJson } from "./utils";

export const data = [
  {
    month: "Jan",
    revenue: 155,
    profit: 33,
  },
  {
    month: "Feb",
    revenue: 123,
    profit: 35.5,
  },
  {
    month: "Mar",
    revenue: 172.5,
    profit: 41,
  },
  {
    month: "Apr",
    revenue: 94,
    profit: 29,
  },
  {
    month: "May",
    revenue: 112.5,
    profit: 37,
  },
  {
    month: "Jun",
    revenue: 148,
    profit: 41.5,
  },
]

export const series = ["revenue", "profit"].map((yKey) => ({
  type: "column",
  xKey: "month",
  yKey,
  stacked: true,
}));

export const getTemplates = (framework, boilerplate, options) => {
  const formattedOptions = deepClone(options)
  formattedOptions.data = data

  if (!formattedOptions.series) {
    formattedOptions.series = series
  }

  const optionsJson = formatJson(formattedOptions)
  const boilerplateFiles = boilerplate[framework]

  switch (framework) {
    case "vanilla":
      return {
        ...boilerplateFiles,
        "main.js": `var options = ${optionsJson};

document.addEventListener('DOMContentLoaded', function () {
    options.container = document.querySelector('#myChart');

    agCharts.AgChart.create(options);
});`,
      }
    case "react":
      return {
        ...boilerplateFiles,
        "index.jsx": `import React, { Component } from "react";
import { createRoot } from "react-dom";
import { AgChartsReact } from "ag-charts-react";

class ChartExample extends Component {
    render() {
        const options = ${optionsJson};

        return <AgChartsReact options={options} />;
    }
}

const root = createRoot(document.getElementById('root'));
root.render(<ChartExample />);`,
      }
    case "angular":
      return {
        ...boilerplateFiles,
        "app/app.component.ts": `import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    options: any;

    constructor() {
        this.options = ${optionsJson};
    }
}`,
        "app/app.component.html": `<ag-charts-angular [options]="options"></ag-charts-angular>`,
        "app/app.module.ts": `import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AgChartsAngularModule } from 'ag-charts-angular';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AgChartsAngularModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}`,
      }
    case "vue":
      return {
        ...boilerplateFiles,
        "main.js": `import Vue from "vue";
import { AgChartsVue } from "ag-charts-vue";

const VueExample = {
    template: '<ag-charts-vue :options="options"></ag-charts-vue>',
    components: {
        "ag-charts-vue": AgChartsVue
    },
    data: function () {
        return {
            options: {}
        };
    },
    beforeMount() {
        this.options = ${optionsJson};
    },
};

new Vue({
    el: "#app",
    components: {
        "my-component": VueExample
    }
});`,
      }
    default:
      return {}
  }
}
