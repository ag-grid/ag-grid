export function appModuleAngular(componentFileNames) {
    const components = [];
    const imports = [];

    if (componentFileNames) {
        let titleCase = (s) => {
            let camelCased = s.replace(/-([a-z])/g, g => g[1].toUpperCase());
            return camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
        };

        componentFileNames.forEach(filename => {
            let fileFragments = filename.split('.');
            let componentName = titleCase(fileFragments[0]);
            components.push(componentName);
            imports.push('import { ' + componentName + ' } from "./' + fileFragments[0] + '.component";');
        });
    }


    return `
        import { NgModule }      from '@angular/core';
        import { BrowserModule } from '@angular/platform-browser';
        import { FormsModule }   from '@angular/forms'; // <-- NgModel lives here
        // HttpClient
        import {HttpClientModule} from '@angular/common/http';
        
        // ag-grid
        import { AgGridModule }  from "ag-grid-angular";
        import { AppComponent }  from './app.component';
        
        ${imports.join('\n')}
        
        @NgModule({
          imports: [
            BrowserModule,
            FormsModule, // <-- import the FormsModule before binding with [(ngModel)]
            HttpClientModule,
            AgGridModule.withComponents([${components.join(',')}])
          ],
          declarations: [
            ${push(components,'AppComponent').join(',')}
          ],
          bootstrap: [ AppComponent ]
        })
        export class AppModule { }
    `;
}

if (typeof window !== 'undefined') {
    (<any>window).appModuleAngular = appModuleAngular;
}


function push(arr, s) {
    arr.unshift(s);
    return arr;
}