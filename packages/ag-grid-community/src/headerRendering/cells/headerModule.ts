import { defineCommunityModule } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderModule = defineCommunityModule('ColumnHeaderModule', {
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
});

export const ColumnGroupHeaderModule = defineCommunityModule('ColumnGroupHeaderModule', {
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
});
