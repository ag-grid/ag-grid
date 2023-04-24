import { toTitleCase, getImport } from './angular-utils';

export function appModuleAngular(componentFileNames: string[]) {
    const components = [];
    const imports = [
        "import { BrowserModule } from '@angular/platform-browser';",
        "import { NgModule } from '@angular/core';",
        "import { AgChartsAngularModule } from 'ag-charts-angular';",
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

    return `${imports.join('\n')}

        @NgModule({
          imports: [
            BrowserModule,
            AgChartsAngularModule
          ],
          declarations: [
            ${['AppComponent'].concat(components).join(', ')}
          ],
          bootstrap: [ AppComponent ]
        })
        export class AppModule { }
    `;
}

if (typeof window !== 'undefined') {
    (<any>window).appModuleAngular = appModuleAngular;
}
