import { defineCommunityModule } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderModule = defineCommunityModule('@ag-grid-community/column-header', {
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
});

export const ColumnGroupHeaderModule = defineCommunityModule('@ag-grid-community/column-group-header', {
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
});
