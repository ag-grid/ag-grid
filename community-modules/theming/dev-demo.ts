import { createGrid } from 'ag-grid-community';
import 'ag-grid-enterprise';

import {
    colorSchemeDarkNeutral,
    createPart,
    inputStyleUnderlined,
    tabStyleMaterial,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from './src/main';

// 1
themeBalham.install();

// 2
// See console warning
// themeQuartz.install();

// 3
// themeQuartz.install({ loadGoogleFonts: true });
// themeMaterial.install({ loadGoogleFonts: true });
// NOTE: currently no themeAlpine, could create on for migration / compatibility

// 4
// themeQuartz
//     //.usePart(colorSchemeDarkNeutral)
//     //.usePart(inputStyleUnderlined)
//     //.usePart(tabStyleMaterial)
//     //.usePart(inputStyleUnderlined)
//     //.overrideParams({
//     //    // type safe
//     //    primaryColor: 'green',
//     //    inputFocusBorder: { width: 2, color: { ref: 'primaryColor' } },
//     //})
//     .install({ loadGoogleFonts: true });

// 5
// const customCheckboxes = createPart('checkboxStyle', 'custom').addCss(
//     `
//         .ag-checkbox-input-wrapper,
//         .ag-radio-button-input-wrapper {
//             width: 20px;
//             height: 20px;

//             & input {
//                 display: block;
//                 width: 20px;
//                 height: 20px;
//             }
//         }
//     `
// );
// themeQuartz.usePart(customCheckboxes).install({ loadGoogleFonts: true });

//
// GRID SETUP
//

createGrid(document.querySelector<HTMLDivElement>('#app')!, {
    // Data to be displayed
    rowData: [
        { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
        { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
        { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
        { make: 'Fiat', model: '500', price: 15774, electric: false },
        { make: 'Nissan', model: 'Duke', price: 20675, electric: false },
    ],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }],
    defaultColDef: {
        flex: 1,
    },
    sideBar: 'columns',
});
