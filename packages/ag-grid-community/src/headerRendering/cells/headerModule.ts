import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnHeaderCompModule'),
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
};

export const ColumnGroupHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupHeaderCompModule'),
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
};
