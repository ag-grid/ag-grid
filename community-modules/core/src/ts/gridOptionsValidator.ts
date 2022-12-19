import { ColDefUtil } from './components/colDefUtil';
import { ComponentUtil } from './components/componentUtil';
import { Autowired, Bean, PostConstruct } from './context/context';
import { GridOptions, RowGroupingDisplayType, TreeDataDisplayType } from './entities/gridOptions';
import { GridOptionsService } from './gridOptionsService';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { PropertyKeys } from './propertyKeys';
import { doOnce } from './utils/function';
import { fuzzyCheckStrings } from './utils/fuzzyMatch';
import { iterateObject } from './utils/object';

type DeprecatedReference<T> = { [key: string]: { newProp?: keyof T, version: string, message?: string, copyToNewProp?: true, newPropValue?: any } }

export function logDeprecation<T extends {}>(version: string, oldProp: keyof T, newProp?: keyof T, message?: string) {
    const newPropMsg = newProp ? `Please use '${newProp}' instead. ` : '';
    doOnce(() => console.warn(`AG Grid: since v${version}, '${oldProp}' is deprecated. ${newPropMsg}${message ?? ''}`), `Deprecated_${oldProp}`);
}

@Bean('gridOptionsValidator')
export class GridOptionsValidator {

    @Autowired('gridOptions') private readonly gridOptions: GridOptions;
    @Autowired('gridOptionsService') private readonly gridOptionsService: GridOptionsService;

    private pickOneWarning(prop1: keyof GridOptions, prop2: keyof GridOptions) {
        console.warn(`AG Grid: ${prop1} and ${prop2} do not work with each other, you need to pick one.`);
    }

    @PostConstruct
    public init(): void {
        this.checkForDeprecated();
        this.checkForViolations();
        if (this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }

        if (this.gridOptionsService.is('groupSelectsChildren') && this.gridOptionsService.is('suppressParentsInRowNodes')) {
            console.warn("AG Grid: 'groupSelectsChildren' does not work with 'suppressParentsInRowNodes', this selection method needs the part in rowNode to work");
        }

        if (this.gridOptionsService.is('groupSelectsChildren')) {
            if (this.gridOptionsService.get('rowSelection') !== 'multiple') {
                console.warn("AG Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense");
            }
            if (this.gridOptionsService.isRowModelType('serverSide')) {
                console.warn(
                    'AG Grid: group selects children is NOT supported for Server Side Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.'
                );
            }
        }

        if (this.gridOptionsService.is('groupRemoveSingleChildren') && this.gridOptionsService.is('groupHideOpenParents')) {
            this.pickOneWarning('groupRemoveSingleChildren', 'groupHideOpenParents');
        }

        if (this.gridOptionsService.isRowModelType('serverSide')) {
            const msg = (prop: string, alt?: string) => (
                `AG Grid: '${prop}' is not supported on the Server-Side Row Model.` + (alt ? ` Please use ${alt} instead.` : '')
            );
            if (this.gridOptionsService.exists('groupDefaultExpanded')) {
                console.warn(msg('groupDefaultExpanded', 'isServerSideGroupOpenByDefault callback'));
            }
            if (this.gridOptionsService.exists('groupIncludeFooter')) {
                console.warn(msg('groupIncludeFooter'));
            }
            if (this.gridOptionsService.exists('groupIncludeTotalFooter')) {
                console.warn(msg('groupIncludeTotalFooter'));
            }
        }

        if (this.gridOptionsService.is('enableRangeSelection')) {
            ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'enableRangeSelection');
        } else if (this.gridOptionsService.is('enableRangeHandle') || this.gridOptionsService.is('enableFillHandle')) {
            console.warn("AG Grid: 'enableRangeHandle' or 'enableFillHandle' will not work unless 'enableRangeSelection' is set to true");
        }

        if (this.gridOptionsService.exists('sideBar')) {
            // Ensure the SideBar is registered which will then lead them to register Column / Filter Tool panels as required by their config.
            // It is possible to use the SideBar only with your own custom tool panels.
            ModuleRegistry.assertRegistered(ModuleNames.SideBarModule, 'sideBar');
        }
        if (this.gridOptionsService.exists('statusBar')) {
            ModuleRegistry.assertRegistered(ModuleNames.StatusBarModule, 'statusBar');
        }
        if (this.gridOptionsService.exists('enableCharts')) {
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'enableCharts');
        }

        if (this.gridOptionsService.is('groupRowsSticky')) {
            if (this.gridOptionsService.is('groupHideOpenParents')) {
                this.pickOneWarning('groupRowsSticky', 'groupHideOpenParents');                
            }

            if (this.gridOptionsService.is('masterDetail')) {
                this.pickOneWarning('groupRowsSticky', 'masterDetail');                
            }

            if (this.gridOptionsService.is('pagination')) {
                this.pickOneWarning('groupRowsSticky', 'pagination');
            }
        }
    }

    private checkColumnDefProperties() {
        if (this.gridOptions.columnDefs == null) { return; }

        this.gridOptions.columnDefs.forEach(colDef => {
            const userProperties: string[] = Object.getOwnPropertyNames(colDef);
            const validProperties: string[] = [...ColDefUtil.ALL_PROPERTIES, ...ColDefUtil.FRAMEWORK_PROPERTIES];

            this.checkProperties(
                userProperties,
                validProperties,
                validProperties,
                'colDef',
                'https://www.ag-grid.com/javascript-data-grid/column-properties/'
            );
        });
    }

    private checkGridOptionsProperties() {
        const userProperties: string[] = Object.getOwnPropertyNames(this.gridOptions);
        const validProperties: string[] = [
            ...PropertyKeys.ALL_PROPERTIES,
            ...PropertyKeys.FRAMEWORK_PROPERTIES,
            ...ComponentUtil.EVENT_CALLBACKS
        ];

        const validPropertiesAndExceptions: string[] = [...validProperties, 'api', 'columnApi', ...Object.keys(this.deprecatedProperties)];

        this.checkProperties(
            userProperties,
            validPropertiesAndExceptions,
            validProperties,
            'gridOptions',
            'https://www.ag-grid.com/javascript-data-grid/grid-options/'
        );
    }

    private checkProperties(
        userProperties: string[],
        validPropertiesAndExceptions: string[],
        validProperties: string[],
        containerName: string,
        docsUrl: string
    ) {
        const invalidProperties: { [p: string]: string[]; } = fuzzyCheckStrings(
            userProperties,
            validPropertiesAndExceptions,
            validProperties
        );

        iterateObject<any>(invalidProperties, (key, value) => {
            console.warn(`AG Grid: invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(", ")}`);
        });

        if (Object.keys(invalidProperties).length > 0) {
            console.warn(`AG Grid: to see all the valid ${containerName} properties please check: ${docsUrl}`);
        }
    }

    private deprecatedProperties: DeprecatedReference<GridOptions> = {
        serverSideInfiniteScroll: { version: '29', message: 'Infinite Scrolling is now the default behaviour. This can be suppressed with `suppressServerSideInfiniteScroll`.' },
        rememberGroupStateWhenNewData: { version: '24', message: 'Now that transaction updates are possible and they keep group state, this feature is no longer needed.' },

        suppressEnterpriseResetOnNewColumns: { version: '25', message: 'Now that it is possible to dynamically change columns in the grid, this is no longer needed.' },
        suppressColumnStateEvents: { version: '25', message: 'Events should be ignored based on the `event.source`, which will be "api" if the event was due to setting column state via the API.' },
        defaultExportParams: { version: '25.2', message: 'The property `defaultExportParams` has been replaced by `defaultCsvExportParams` and `defaultExcelExportParams`' },
        stopEditingWhenGridLosesFocus: { version: '25.2.2', newProp: 'stopEditingWhenCellsLoseFocus', copyToNewProp: true },

        applyColumnDefOrder: { version: '26', message: 'The property `applyColumnDefOrder` is no longer needed, as this is the default behaviour. To turn this behaviour off, set maintainColumnOrder=true' },
        groupMultiAutoColumn: { version: '26', newProp: 'groupDisplayType', copyToNewProp: true, newPropValue: 'multipleColumns' },
        groupUseEntireRow: { version: '26', newProp: 'groupDisplayType', copyToNewProp: true, newPropValue: 'groupRows' },
        defaultGroupSortComparator: { version: '26', newProp: 'initialGroupOrderComparator' },
        enableMultiRowDragging: { version: '26.1', newProp: 'rowDragMultiRow', copyToNewProp: true },
        colWidth: { version: '26.1', newProp: 'defaultColDef.width' as any },
        minColWidth: { version: '26.1', newProp: 'defaultColDef.minWidth' as any },
        maxColWidth: { version: '26.1', newProp: 'defaultColDef.maxWidth' as any },
        reactUi: { version: '26.1', message: 'React UI is on by default, so no need for reactUi=true. To turn it off, set suppressReactUi=true.' },

        suppressCellSelection: { version: '27', newProp: 'suppressCellFocus', copyToNewProp: true },
        clipboardDeliminator: { version: '27.1', newProp: 'clipboardDelimiter', copyToNewProp: true },
        getRowNodeId: { version: '27.1', newProp: 'getRowId', message: 'The difference: if getRowId() is implemented then immutable data is enabled by default.' },
        defaultGroupOrderComparator: { version: '27.2', newProp: 'initialGroupOrderComparator' },
        groupRowAggNodes: { version: '27.2', newProp: 'getGroupRowAgg' },
        postSort: { version: '27.2', newProp: 'postSortRows' },
        isFullWidthCell: { version: '27.2', newProp: 'isFullWidthRow' },
        localeTextFunc: { version: '27.2', newProp: 'getLocaleText' },

        serverSideFilteringAlwaysResets: { version: '28.0', newProp: 'serverSideFilterAllLevels', copyToNewProp: true, },
        serverSideSortingAlwaysResets: { version: '28.0', newProp: 'serverSideSortAllLevels', copyToNewProp: true, },
        suppressReactUi: { version: '28', message: 'The legacy React rendering engine is deprecated and will be removed in the next major version of the grid.' },
        processSecondaryColDef: { version: '28', newProp: 'processPivotResultColDef', copyToNewProp: true },
        processSecondaryColGroupDef: { version: '28', newProp: 'processPivotResultColGroupDef', copyToNewProp: true },
        getServerSideStoreParams: { version: '28', newProp: 'getServerSideGroupLevelParams', copyToNewProp: true },

        enableChartToolPanelsButton: { version: '29', message: 'The Chart Tool Panels button is now enabled by default. To hide the Chart Tool Panels button and display the hamburger button instead, set suppressChartToolPanelsButton=true.' }
    }

    private checkForDeprecated() {
        // casting to generic object, so typescript compiles even though
        // we are looking for attributes that don't exist
        const options: any = this.gridOptions;

        Object.entries(this.deprecatedProperties).map(([oldProp, details]) => {
            const oldPropValue = (options as any)[oldProp];
            if (oldPropValue) {
                logDeprecation(details.version, oldProp, details.newProp, details.message);
                if (details.copyToNewProp && details.newProp && options[details.newProp] == null) {
                    options[details.newProp] = details.newPropValue ?? oldPropValue;
                }
            }
        });

        // Manual messages and deprecation behaviour that don't fit our standard approach above.

        if (options.groupSuppressAutoColumn) {
            const propName = options.treeData ? 'treeDataDisplayType' : 'groupDisplayType';

            console.warn(`AG Grid: since v26.0, the grid property \`groupSuppressAutoColumn\` has been replaced by \`${propName} = 'custom'\``);
            options[propName] = 'custom';
        }
        if (options.immutableData) {
            if (options.getRowId) {
                console.warn('AG Grid: since v27.1, `immutableData` is deprecated. With the `getRowId` callback implemented, immutable data is enabled by default so you can remove `immutableData=true`.');
            } else {
                console.warn('AG Grid: since v27.1, `immutableData` is deprecated. To enable immutable data you must implement the `getRowId()` callback.');
            }
        }
        if (options.serverSideStoreType) {
            console.warn('AG Grid: since v29.0, `serverSideStoreType` has been replaced by `suppressServerSideInfiniteScroll`. Set to false to use Partial Store, and true to use Full Store.');
            options.suppressServerSideInfiniteScroll = options.serverSideStoreType !== 'partial';
        }
    }

    private checkForViolations() {
        if (this.gridOptionsService.is('treeData')) { this.treeDataViolations(); }
    }

    private treeDataViolations() {
        if (this.gridOptionsService.isRowModelType('clientSide')) {
            if (!this.gridOptionsService.exists('getDataPath')) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=clientSide, but you did not ' +
                    'provide getDataPath function, please provide getDataPath function if using tree data.'
                );
            }
        }
        if (this.gridOptionsService.isRowModelType('serverSide')) {
            if (!this.gridOptionsService.exists('isServerSideGroup')) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide isServerSideGroup function, please provide isServerSideGroup function if using tree data.'
                );
            }
            if (!this.gridOptionsService.exists('getServerSideGroupKey')) {
                console.warn(
                    'AG Grid: property usingTreeData=true with rowModel=serverSide, but you did not ' +
                    'provide getServerSideGroupKey function, please provide getServerSideGroupKey function if using tree data.'
                );
            }
        }
    }

}

export function matchesGroupDisplayType(toMatch: RowGroupingDisplayType, supplied?: string): boolean {
    const groupDisplayTypeValues: RowGroupingDisplayType[] = ['groupRows', 'multipleColumns', 'custom', 'singleColumn'];
    if ((groupDisplayTypeValues as (string | undefined)[]).indexOf(supplied) < 0) {
        console.warn(`AG Grid: '${supplied}' is not a valid groupDisplayType value - possible values are: '${groupDisplayTypeValues.join("', '")}'`);
        return false;
    }
    return supplied === toMatch;
}

export function matchesTreeDataDisplayType(toMatch: TreeDataDisplayType, supplied?: string): boolean {
    const treeDataDisplayTypeValues: TreeDataDisplayType[] = ['auto', 'custom'];
    if ((treeDataDisplayTypeValues as (string | undefined)[]).indexOf(supplied) < 0) {
        console.warn(`AG Grid: '${supplied}' is not a valid treeDataDisplayType value - possible values are: '${treeDataDisplayTypeValues.join("', '")}'`);
        return false;
    }
    return supplied === toMatch;
}