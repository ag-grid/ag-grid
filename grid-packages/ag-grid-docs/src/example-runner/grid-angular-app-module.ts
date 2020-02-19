import { toTitleCase, getImport } from './angular-utils';

export function appModuleAngular(componentFileNames: string[]) {
    const components = [];
    const imports = [
        "import { NgModule } from '@angular/core';",
        "import { BrowserModule } from '@angular/platform-browser';",
        "import { FormsModule } from '@angular/forms'; // <-- NgModel lives here",
        "import { HttpClientModule } from '@angular/common/http';	// HttpClient",
        "",
        "// ag-grid",
        "import { AgGridModule } from '@ag-grid-community/angular';",
        "import { AppComponent } from './app.component';",
        "",
    ];

    if (componentFileNames) {
        componentFileNames.forEach(filename => {
            const componentName = toTitleCase(filename.split('.')[0]);

            components.push(componentName);
            imports.push(getImport(filename));
        });
    }

    return `
        ${imports.join('\n')}

        @NgModule({
          imports: [
            BrowserModule,
            FormsModule,
            HttpClientModule,
            AgGridModule.withComponents([${components.join(',')}])
          ],
          declarations: [
            ${['AppComponent'].concat(components).join(',')}
          ],
          bootstrap: [ AppComponent ]
        })
        export class AppModule { }
    `;
}

if (typeof window !== 'undefined') {
    (<any>window).appModuleAngular = appModuleAngular;
}
