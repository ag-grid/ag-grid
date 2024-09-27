import type { _KeyboardNavigationGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
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

export const KeyboardNavigationCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/keyboard-navigation-core',
    beans: [NavigationService, CellNavigationService, HeaderNavigationService],
});

export const KeyboardNavigationApiModule = _defineModule<_KeyboardNavigationGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/keyboard-navigation-api',
    apiFunctions: {
        getFocusedCell,
        clearFocusedCell,
        setFocusedCell,
        setFocusedHeader,
        tabToNextCell,
        tabToPreviousCell,
    },
    dependantModules: [KeyboardNavigationCoreModule],
});

export const KeyboardNavigationModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/keyboard-navigation',
    dependantModules: [KeyboardNavigationApiModule, KeyboardNavigationCoreModule],
});
