import { baseCommunityModule } from '../../interfaces/iModule';
import type { _ModuleWithoutApi } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnHeaderCompModule'),
    userComponents: {
        agColumnHeader: HeaderComp,
    },
    icons: {
        // button to launch legacy column menu
        menu: 'menu',
        // button to launch new enterprise column menu
        menuAlt: 'menu-alt',
    },
};

export const ColumnGroupHeaderCompModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupHeaderCompModule'),
    userComponents: {
        agColumnGroupHeader: HeaderGroupComp,
    },
    icons: {
        // header column group shown when expanded (click to contract)
        columnGroupOpened: 'expanded',
        // header column group shown when contracted (click to expand)
        columnGroupClosed: 'contracted',
    },
};
