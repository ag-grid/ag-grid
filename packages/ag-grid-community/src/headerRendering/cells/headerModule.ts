import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnHeaderCompModule'),
    userComponents: {
        agColumnHeader: HeaderComp,
    },
};

export const ColumnGroupHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupHeaderCompModule'),
    userComponents: {
        agColumnGroupHeader: HeaderGroupComp,
    },
};
