import { toTitleCase, getImport } from './angular-utils';

export function appModuleAngular(componentFileNames: string[], { gridSettings }) {
  const { includeNgFormsModule } = gridSettings;
  const components = [];
  const imports = [
    "import { NgModule } from '@angular/core';",
    "import { BrowserModule } from '@angular/platform-browser';",
    "import { HttpClientModule } from '@angular/common/http';",
    includeNgFormsModule ? "import { FormsModule } from '@angular/forms'" : "",
    "import { AgGridModule } from 'ag-grid-angular';",
    "import { AppComponent } from './app.component';",
  ];

  if (componentFileNames) {
    imports.push("");
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
    HttpClientModule,${includeNgFormsModule ? "\nFormsModule," : ""}
    AgGridModule
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
