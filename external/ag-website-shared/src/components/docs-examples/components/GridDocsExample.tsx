import {
    DocsExamples,
    type DocsExamplesProps,
} from '@ag-website-shared/components/docs-examples/components/DocsExamples';
import { type FunctionComponent } from 'react';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    RowGroupingModule,
    SideBarModule,
    StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([
    AllCommunityModule,
    StatusBarModule,
    RowGroupingModule,
    SideBarModule,
    FiltersToolPanelModule,
    ColumnsToolPanelModule,
]);

export const GridDocsExample: FunctionComponent<DocsExamplesProps> = (props) => {
    return <DocsExamples AgGrid={AgGridReact} {...props} />;
};
