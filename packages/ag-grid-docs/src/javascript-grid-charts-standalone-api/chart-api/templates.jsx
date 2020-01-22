import { formatJson, deepClone } from "./utils.jsx";

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
  const formattedOptions = deepClone(options);
  formattedOptions.data = data;

  if (!formattedOptions.series) {
    formattedOptions.series = series;
  }

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
        'main.js': `var options = ${formatJson(formattedOptions)};

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
      var systemJsPaths = {
        "ag-charts-community": "//localhost:8080/dev/ag-charts-community/dist/ag-charts-community.cjs.js"
      };
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="systemjs.config.js"></script>

    <script>
      System.import('index.jsx').catch(function(err) { console.error(err); });
    </script>
  </body>
</html>`,
        'index.jsx': `import React, { Component } from "react";
import { render } from "react-dom";
import { AgChartsReact } from "ag-charts-react";

class ChartExample extends Component {
  render() {
    const options = ${formatJson(formattedOptions)};

    return <AgChartsReact options={options} />;
  }
}

render(<ChartExample />, document.querySelector("#root"));`,
        'systemjs.config.js': `(function(global) {
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
    case 'angular':
      return {
        'app/app.component.ts': `import { Component } from '@angular/core';
import { AgChartOptions } from 'ag-charts-angular';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    options: AgChartOptions;

    constructor() {
      this.options = ${formatJson(formattedOptions)};
    }
}`,
        'app/app.component.html': `<ag-charts-angular [options]="options"></ag-charts-angular>`,
        'app/app.module.ts': `import { BrowserModule } from '@angular/platform-browser';
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
export class AppModule {
}`,
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Angular 2 example</title>
    <script>document.write('<base href="' + document.location + '" />');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

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

    <!-- Polyfills -->
    <script src="https://unpkg.com/core-js@2.6.5/client/shim.min.js"></script>
    <script src="https://unpkg.com/zone.js@0.8.17/dist/zone.js"></script>
    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

    <script>
        var appLocation = '';
        var boilerplatePath = '';
        var systemJsMap = {
            "ag-charts-community": "//localhost:8080/dev/ag-charts-community",
            "ag-charts-angular": "//localhost:8080/dev/ag-charts-angular",
        };
        var systemJsPaths = {
            "ag-charts-community": "//localhost:8080/dev/ag-charts-community/dist/ag-charts-community.cjs.js"
        };
    </script>

    <script src="systemjs.config.js"></script>

    <script>
      System.import('main.ts').catch(function(err) { console.error(err); });
    </script>
  </head>
  <body>
    <my-app>Loading Angular example&hellip;</my-app>
  </body>
</html>`,
        'main.ts': `// Angular entry point file
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from 'app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);`,
        'systemjs-angular-loader.js': `/**
* WEB ANGULAR VERSION
* (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
* System configuration for Angular samples
* Adjust as necessary for your application needs.
*/
var templateUrlRegex = /templateUrl\\s*:(\\s*['"\`](.*?)['"\`]\\s*)/gm;
var stylesRegex = /styleUrls *:(\\s*\\[[^\\]]*?\\])/g;
var stringRegex = /(['\`"])((?:[^\\\\]\\\\\\1|.)*?)\\1/g;

module.exports.translate = function(load){
  if (load.source.indexOf('moduleId') != -1) return load;

  var url = document.createElement('a');
  url.href = load.address;

  var basePathParts = url.pathname.split('/');

  basePathParts.pop();
  var basePath = basePathParts.join('/');

  var baseHref = document.createElement('a');
  baseHref.href = this.baseURL;
  baseHref = baseHref.pathname;

  if (!baseHref.startsWith('/base/')) { // it is not karma
    basePath = basePath.replace(baseHref, '');
  }

  load.source = load.source
    .replace(templateUrlRegex, function(match, quote, url){
      var resolvedUrl = url;

      if (url.startsWith('.')) {
        resolvedUrl = basePath + url.substr(1);
      }

      return 'templateUrl: "' + resolvedUrl + '"';
    })
    .replace(stylesRegex, function(match, relativeUrls) {
      var urls = [];

      while ((match = stringRegex.exec(relativeUrls)) !== null) {
        if (match[2].startsWith('.')) {
          urls.push('"' + basePath + match[2].substr(1) + '"');
        } else {
          urls.push('"' + match[2] + '"');
        }
      }

      return "styleUrls: [" + urls.join(', ') + "]";
    });

  return load;
};`,
        'systemjs.config.js': `/**
* WEB ANGULAR VERSION
* (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
* System configuration for Angular samples
* Adjust as necessary for your application needs.
*/
(function (global) {
  var ANGULAR_VERSION = "5.1.3";
  var ANGULAR_CDK_VERSION = "5.2.5";
  var ANGULAR_MATERIAL_VERSION = "5.2.5";

  System.config({
      // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
      transpiler: "ts",
      typescriptOptions: {
          // Copy of compiler options in standard tsconfig.json
          target: "es5",
          module: "system", //gets rid of console warning
          moduleResolution: "node",
          sourceMap: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          lib: ["es2015", "dom"],
          noImplicitAny: true,
          suppressImplicitAnyIndexErrors: true
      },
      meta: {
          typescript: {
              exports: "ts"
          },
          '*.css': {loader: 'css'}
      },
      paths: {
          // paths serve as alias
          "npm:": "https://unpkg.com/"
      },
      // RxJS makes a lot of requests to unpkg. This guy addressed it:
      // https://github.com/OasisDigital/rxjs-system-bundle.
      bundles: {
          "npm:rxjs-system-bundle@5.5.5/Rx.system.js": [
              "rxjs",
              "rxjs/*",
              "rxjs/operator/*",
              "rxjs/operators/*",
              "rxjs/observable/*",
              "rxjs/scheduler/*",
              "rxjs/symbol/*",
              "rxjs/add/operator/*",
              "rxjs/add/observable/*",
              "rxjs/util/*"
          ]
      },
      // map tells the System loader where to look for things
      map: Object.assign(
          {
              // css plugin
              'css': 'npm:systemjs-plugin-css/css.js',

              // angular bundles
              "@angular/animations": "npm:@angular/animations@" + ANGULAR_VERSION + "/bundles/animations.umd.js",
              "@angular/animations/browser": "npm:@angular/animations@" + ANGULAR_VERSION + "/bundles/animations-browser.umd.js",
              "@angular/core": "npm:@angular/core@" + ANGULAR_VERSION + "/bundles/core.umd.js",
              "@angular/common": "npm:@angular/common@" + ANGULAR_VERSION + "/bundles/common.umd.js",
              "@angular/common/http": "npm:@angular/common@" + ANGULAR_VERSION + "/bundles/common-http.umd.js",
              "@angular/compiler": "npm:@angular/compiler@" + ANGULAR_VERSION + "/bundles/compiler.umd.js",
              "@angular/platform-browser": "npm:@angular/platform-browser@" + ANGULAR_VERSION + "/bundles/platform-browser.umd.js",
              "@angular/platform-browser/animations": "npm:@angular/platform-browser@" + ANGULAR_VERSION + "/bundles/platform-browser-animations.umd.js",
              "@angular/platform-browser-dynamic": "npm:@angular/platform-browser-dynamic@" + ANGULAR_VERSION + "/bundles/platform-browser-dynamic.umd.js",
              "@angular/http": "npm:@angular/http@" + ANGULAR_VERSION + "/bundles/http.umd.js",
              "@angular/router": "npm:@angular/router@" + ANGULAR_VERSION + "/bundles/router.umd.js",
              "@angular/router/upgrade": "npm:@angular/router@" + ANGULAR_VERSION + "/bundles/router-upgrade.umd.js",
              "@angular/forms": "npm:@angular/forms@" + ANGULAR_VERSION + "/bundles/forms.umd.js",
              "@angular/upgrade": "npm:@angular/upgrade@" + ANGULAR_VERSION + "/bundles/upgrade.umd.js",
              "@angular/upgrade/static": "npm:@angular/upgrade@" + ANGULAR_VERSION + "/bundles/upgrade-static.umd.js",
              "angular-in-memory-web-api": "npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js",
              // material design
              "@angular/material": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material.umd.js",
              "@angular/cdk/platform": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-platform.umd.js",
              "@angular/cdk/bidi": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-bidi.umd.js",
              "@angular/cdk/coercion": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-coercion.umd.js",
              "@angular/cdk/keycodes": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-keycodes.umd.js",
              "@angular/cdk/a11y": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-a11y.umd.js",
              "@angular/cdk/overlay": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-overlay.umd.js",
              "@angular/cdk/portal": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-portal.umd.js",
              "@angular/cdk/observers": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-observers.umd.js",
              "@angular/cdk/collections": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-collections.umd.js",
              "@angular/cdk/accordion": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-accordion.umd.js",
              "@angular/cdk/scrolling": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-scrolling.umd.js",
              "@angular/cdk/layout": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-layout.umd.js",
              "@angular/cdk/table": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-table.umd.js",
              "@angular/cdk/text-field": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-text-field.umd.js",
              "@angular/cdk/tree": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-tree.umd.js",
              "@angular/cdk/stepper": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-stepper.umd.js",
              // ngx bootstrap
              "ngx-bootstrap": "npm:ngx-bootstrap@2.0.0-rc.0",
              // ng2 typeahead
              "ng2-typeahead": "npm:ng2-typeahead@1.2.0",

              ts: "npm:plugin-typescript@5.2.7/lib/plugin.js",
              tslib: "npm:tslib@1.7.1/tslib.js",
              typescript: "npm:typescript@2.3.2/lib/typescript.js",

              // for some of the examples
              lodash: "npm:lodash@4.17.4/lodash.js",

              // our app is within the app folder, appLocation comes from index.html
              app: appLocation + "app",

              rxjs: "npm:rxjs@6.1.0/bundles/rxjs.umd.min.js"
          },
          systemJsMap
      ),
      // packages tells the System loader how to load when no filename and/or no extension
      packages: {
          app: {
              main: "./main.ts",
              defaultExtension: "ts",
              meta: {
                  "./*.ts": {
                      loader: boilerplatePath + "systemjs-angular-loader.js"
                  }
              }
          },
          'ag-charts-angular': {
              main: './dist/ag-charts-angular/bundles/ag-charts-angular.umd.js',
              defaultExtension: 'js'
          },
          'ag-charts-community': {
              main: './dist/cjs/main.js',
              defaultExtension: 'js'
          },
          rxjs: {
              defaultExtension: false
          }
      }
  });
})(this);`
      };
    case 'vue':
      return {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Vue example</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div id="app" style="height: 100%">
        <my-component>Loading Vue example&hellip;</my-component>
    </div>

    <script>
        var appLocation = '';
        var boilerplatePath = '';
        var systemJsMap = {
            "ag-charts-community": "//localhost:8080/dev/ag-charts-community",
            "ag-charts-vue": "//localhost:8080/dev/ag-charts-vue"
        };

        var systemJsPaths = {
            "ag-charts-community": "//localhost:8080/dev/ag-charts-community/dist/ag-charts-community.cjs.js"
        };
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="systemjs.config.js"></script>

    <script>
      System.import('main.js').catch(function(err) { console.error(err); })
    </script>
  </body>
</html>`,
        'main.js': `import Vue from "vue";
import { AgChartsVue } from "ag-charts-vue";

const VueExample = {
  template: \`<ag-charts-vue :options="options"></ag-charts-vue>\`,
  components: {
    "ag-charts-vue": AgChartsVue
  },
  data: function() {
    return {
      options: {}
    };
  },
  beforeMount() {
    this.options = ${formatJson(formattedOptions)};
  },
};

new Vue({
  el: "#app",
  components: {
    "my-component": VueExample
  }
});`,
        'systemjs.config.js': `(function (global) {
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
                // babel transpiler
                'plugin-babel': 'npm:systemjs-plugin-babel@0.0.25/plugin-babel.js',
                'systemjs-babel-build': 'npm:systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',

                // css plugin
                'css': 'npm:systemjs-plugin-css/css.js',

                // vuejs
                'vue': 'npm:vue/dist/vue.min.js',

                // vue property decorator
                'vue-class-component': 'npm:vue-class-component@6.3.2/dist/vue-class-component.min.js',
                'vue-property-decorator': 'npm:vue-property-decorator@7.2.0/lib/vue-property-decorator.umd.js',

                app: appLocation + 'app'
            },
            systemJsMap
        ), // systemJsMap comes from index.html

        packages: {
            'vue': {
                defaultExtension: 'js'
            },
            'vue-class-component': {
                defaultExtension: 'js'
            },
            'vue-property-decorator': {
                defaultExtension: 'js'
            },
            app: {
                defaultExtension: 'js'
            },
            'ag-charts-vue': {
                main: './main.js',
                defaultExtension: 'js'
            },
            'ag-charts-community': {
                main: './dist/cjs/main.js',
                defaultExtension: 'js'
            },
        },
        meta: {
            '*.js': {
                babelOptions: {
                    stage1: true,
                    stage2: true,
                    es2015: true
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
