import { _defineModule } from '../../interfaces/iModule';
import { VERSION } from '../../version';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-header',
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
});

export const ColumnGroupHeaderModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-group-header',
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
});
