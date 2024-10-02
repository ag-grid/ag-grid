import { baseCommunityModule } from '../../interfaces/iModule';
import type { Module } from '../../interfaces/iModule';
import { HeaderComp } from './column/headerComp';
import { HeaderGroupComp } from './columnGroup/headerGroupComp';

export const ColumnHeaderModule: Module = {
    ...baseCommunityModule('ColumnHeaderModule'),
    userComponents: [
        {
            classImp: HeaderComp,
            name: 'agColumnHeader',
        },
    ],
};

export const ColumnGroupHeaderModule: Module = {
    ...baseCommunityModule('ColumnGroupHeaderModule'),
    userComponents: [
        {
            classImp: HeaderGroupComp,
            name: 'agColumnGroupHeader',
        },
    ],
};
