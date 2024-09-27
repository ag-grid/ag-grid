import type { _KeyboardNavigationGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
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

export const KeyboardNavigationCoreModule = defineCommunityModule('@ag-grid-community/keyboard-navigation-core', {
    beans: [NavigationService, CellNavigationService, HeaderNavigationService],
});

export const KeyboardNavigationApiModule = defineCommunityModule<_KeyboardNavigationGridApi>(
    '@ag-grid-community/keyboard-navigation-api',
    {
        apiFunctions: {
            getFocusedCell,
            clearFocusedCell,
            setFocusedCell,
            setFocusedHeader,
            tabToNextCell,
            tabToPreviousCell,
        },
        dependsOn: [KeyboardNavigationCoreModule],
    }
);

export const KeyboardNavigationModule = defineCommunityModule('@ag-grid-community/keyboard-navigation', {
    dependsOn: [KeyboardNavigationApiModule, KeyboardNavigationCoreModule],
});
