1s/^/import \{ AgGridAngular \} from 'ag-grid-angular';\n/
/import { Component, signal } from '@angular\/core';/ r ../global.partial
/import { Component, signal } from '@angular\/core';/ r ../imports.partial
s/\imports: \[\]/imports: \[AgGridAngular\]/
/protected readonly title = .*/{
  a\
  gridOptions: any = {
  r ../gridOptions.shared.partial
  r ../gridOptions.partial
  a\
  };
}
