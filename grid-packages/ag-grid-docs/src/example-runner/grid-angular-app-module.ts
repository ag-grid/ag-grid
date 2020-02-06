function push<T>(arr: T[], s: T) {
    arr.unshift(s);
    return arr;
}

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
        const toTitleCase = value => {
            let camelCased = value.replace(/-([a-z])/g, g => g[1].toUpperCase());
            return camelCased[0].toUpperCase() + camelCased.slice(1);
        };

        componentFileNames.forEach(filename => {
            let componentName = filename.split('.')[0];
            let componentNameTitleCase = toTitleCase(componentName);
            components.push(componentNameTitleCase);
            imports.push(`import { ${componentNameTitleCase} } from './${componentName}.component';`);
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
            ${push(components, 'AppComponent').join(',')}
          ],
          bootstrap: [ AppComponent ]
        })
        export class AppModule { }
    `;
}

if (typeof window !== 'undefined') {
    (<any>window).appModuleAngular = appModuleAngular;
}
