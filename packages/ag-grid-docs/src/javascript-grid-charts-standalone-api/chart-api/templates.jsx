export const data = [{
  month: 'Jan',
  revenue: 155000,
  profit: 33000
}, {
  month: 'Feb',
  revenue: 123000,
  profit: 35500
}, {
  month: 'Mar',
  revenue: 172500,
  profit: 41000
}, {
  month: 'Apr',
  revenue: 185000,
  profit: 50000
}];

export const series = [{
  type: 'column',
  xKey: 'month',
  yKeys: ['revenue', 'profit'],
}];

export const getTemplates = (framework, options) => {
  switch (framework) {
    case 'vanilla':
      return {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <style media="only screen">
      html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }
      html {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0;
        overflow: auto;
      }
      body {
        padding: 1rem;
        overflow: auto;
      }
    </style>
    <script src='//localhost:8080/dev/ag-charts-community/dist/ag-charts-community.js'></script>
  </head>

  <body>
    <div id="myChart"></div>

    <script src="main.js"></script>
  </body>
</html>`,
        'main.js': `var data = ${JSON.stringify(data, null, 2)};

var options = ${JSON.stringify(options, null, 2)};

options.data = data;${options.series ? '' : `\noptions.series = ${JSON.stringify(series, null, 2)};`}

document.addEventListener('DOMContentLoaded', function() {
    options.container = document.querySelector('#myChart');

    agCharts.AgChart.create(options);
});`
      };
    case 'react':
      return {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>React example</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style media="only screen">
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }
      html {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0;
        overflow: auto;
      }
      body {
        padding: 1rem;
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <div id="root">Loading React example&hellip;</div>

    <script>
      var appLocation = '';
      var boilerplatePath = '';
      var systemJsMap = {
    "ag-charts-community": "//localhost:8080/dev/ag-charts-community",
    "ag-charts-react": "//localhost:8080/dev/ag-charts-react"
};
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="systemjs.config.js"></script>

    <script>
      System.import('index.jsx').catch(function(err) { console.error(err); });
    </script>
  </body>
</html>`,
        'index.jsx': `"use strict";

import React, { Component } from "react";
import { render } from "react-dom";
import { AgChartsReact } from "ag-charts-react";

const data = ${JSON.stringify(data, null, 2)};

class ChartExample extends Component {
  render() {
    const options = ${JSON.stringify(options, null, 2)};

    options.data = data;${options.series ? '' : `\n    options.series = ${JSON.stringify(series, null, 2)};`}

    return <AgChartsReact options={options} />;
  }
}

render(<ChartExample />, document.querySelector("#root"));`,
        "systemjs.config.js": `(function(global) {
  // simplified version of Object.assign for es3
  function assign() {
      var result = {};
      for (var i = 0, len = arguments.length; i < len; i++) {
          var arg = arguments[i];
          for (var prop in arg) {
              result[prop] = arg[prop];
          }
      }
      return result;
  }

  System.config({
      transpiler: 'plugin-babel',
      defaultExtension: 'js',
      paths: {
          'npm:': 'https://unpkg.com/'
      },
      map: assign(
          {
              // css plugin
              'css': 'npm:systemjs-plugin-css/css.js',

              // babel transpiler
              'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
              'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

              // react
              react: 'npm:react@16.12.0',
              'react-dom': 'npm:react-dom@16.12.0',
              'react-dom-factories': 'npm:react-dom-factories',
              redux: 'npm:redux@3.6.0',
              'react-redux': 'npm:react-redux@5.0.6',
              'prop-types': 'npm:prop-types',

              app: appLocation + 'app'
          },
          systemJsMap
      ), // systemJsMap comes from index.html

      packages: {
          react: {
              main: './umd/react.production.min.js'
          },
          'react-dom': {
              main: './umd/react-dom.production.min.js'
          },
          'prop-types': {
              main: './prop-types.min.js',
              defaultExtension: 'js'
          },
          redux: {
              main: './dist/redux.min.js',
              defaultExtension: 'js'
          },
          'react-redux': {
              main: './dist/react-redux.min.js',
              defaultExtension: 'js'
          },
          app: {
              defaultExtension: 'jsx'
          },
          'ag-charts-react': {
              main: './main.js',
              defaultExtension: 'js'
          },
          'ag-charts-community': {
              main: './dist/cjs/main.js',
              defaultExtension: 'js'
          },
      },
      meta: {
          '*.jsx': {
              babelOptions: {
                  react: true
              }
          },
          '*.css': {loader: 'css'}
      }
  });
})(this);`
      };
    default:
      return {};
  }
};
