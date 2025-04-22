1s/^/import \{ AgGridAngular \} from 'ag-grid-angular';\n/
/import { Component } from '@angular\/core';/ r ../imports.partial
s/\imports: \[\]/imports: \[AgGridAngular\]/
/title = .*/{
  a\
  gridOptions: any = {
  r ../gridOptions.shared.partial
  r ../gridOptions.partial
  a\
  };
}
