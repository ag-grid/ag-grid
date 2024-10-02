import type { _KeyboardNavigationGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { CellNavigationService } from './cellNavigationService';
import { HeaderNavigationService } from './headerNavigationService';
import {
    clearFocusedCell,
    getFocusedCell,
    setFocusedCell,
    setFocusedHeader,
    tabToNextCell,
    tabToPreviousCell,
} from './navigationApi';
import { NavigationService } from './navigationService';

export const KeyboardNavigationCoreModule: Module = {
    ...baseCommunityModule('KeyboardNavigationCoreModule'),
    beans: [NavigationService, CellNavigationService, HeaderNavigationService],
};

export const KeyboardNavigationApiModule: ModuleWithApi<_KeyboardNavigationGridApi> = {
    ...baseCommunityModule('KeyboardNavigationApiModule'),
    apiFunctions: {
        getFocusedCell,
        clearFocusedCell,
        setFocusedCell,
        setFocusedHeader,
        tabToNextCell,
        tabToPreviousCell,
    },
    dependsOn: [KeyboardNavigationCoreModule],
};

export const KeyboardNavigationModule: Module = {
    ...baseCommunityModule('KeyboardNavigationModule'),
    dependsOn: [KeyboardNavigationApiModule, KeyboardNavigationCoreModule],
};
