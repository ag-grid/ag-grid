import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnHeaderModule'),
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
};

export const ColumnGroupHeaderModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupHeaderModule'),
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
};
