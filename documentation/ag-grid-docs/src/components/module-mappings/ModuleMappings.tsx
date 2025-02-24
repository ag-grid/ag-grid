import type { Framework } from '@ag-grid-types';
import type { ModuleMappings as ModuleMappingsType } from '@ag-grid-types';
import { Snippet } from '@ag-website-shared/components/snippet/Snippet';
import { type FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';

import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry, RowSelectionModule } from 'ag-grid-community';
import type {
    ColDef,
    GetRowIdParams,
    IRowNode,
    RowSelectedEvent,
    RowSelectionOptions,
    ValueGetterParams,
} from 'ag-grid-community';
import { ClipboardModule, ContextMenuModule, TreeDataModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ModuleCellRenderer } from './ModuleCellRenderer';
import { ModuleConfiguration } from './ModuleConfiguration';
import styles from './ModuleMappings.module.scss';
import { ModuleNameCellRenderer } from './ModuleNameCellRenderer';
import { ModuleSearch } from './ModuleSearch';
import { getChartsModuleName, useModuleConfig } from './useModuleConfig';

interface Props {
    framework: Framework;
    modules: ModuleMappingsType;
}

ModuleRegistry.registerModules([
    AllCommunityModule,
    ClientSideRowModelModule,
    TreeDataModule,
    RowSelectionModule,
    ContextMenuModule,
    ClipboardModule,
]);

export const ModuleMappings: FunctionComponent<Props> = ({ framework, modules }) => {
    const gridRef = useRef<AgGridReact>(null);
    const moduleConfig = useModuleConfig(gridRef);
    const {
        selectedDependenciesSnippet,
        updateSelectedModule,
        bundleOption,
        rowModelOption,
        initialState,
        chartOptions,
    } = moduleConfig;

    const rowData = useMemo(() => {
        const groups = modules.groups;
        // update data to hide/unhide modules that are included as part of SSRM
        if (rowModelOption === 'ServerSideRowModelModule') {
            const modifyData = (row: any) => ({
                ...row,
                children: row.children?.map(modifyData),
                showSSRMLabel: row.ssrmBundled,
            });
            const modifiedGroups = groups.map(modifyData);
            return modifiedGroups;
        }
        return groups;
    }, [rowModelOption, modules.groups]);

    const [defaultColDef] = useState<ColDef>({
        flex: 1,
        sortable: false,
        resizable: false,
        suppressMovable: true,
    });
    const [columnDefs] = useState([
        {
            field: 'moduleName',
            valueGetter: ({ data }: ValueGetterParams) => {
                return data.showSSRMLabel ? null : data.moduleName;
            },
            cellRenderer: ModuleNameCellRenderer,
        },
    ]);
    const [autoGroupColumnDef] = useState({
        headerName: 'Feature',
        cellRendererParams: {
            innerRenderer: ModuleCellRenderer,
        },
    });
    const getRowId = useCallback(
        (params: GetRowIdParams) => (params.data.children ? `${params.data.name} group` : params.data.moduleName),
        []
    );

    const onRowSelected = useCallback(
        (event: RowSelectedEvent) => {
            // All disabled, so nothing to select
            if (bundleOption === 'AllEnterpriseModule') {
                return;
            }

            const {
                node,
                data: { moduleName },
                api,
            } = event;
            const isSelected = !!node.isSelected();
            if (!moduleName && !isSelected) {
                const nodesToReselect: IRowNode[] = [];

                node.allLeafChildren?.forEach((child) => {
                    if (
                        // Reselect community module if AllCommunityModule is selected
                        (bundleOption === 'AllCommunityModule' && !child.isSelected() && !child.data.isEnterprise) ||
                        // Reselect row module if selected
                        (!child.isSelected() && rowModelOption === child.data.moduleName) ||
                        // Reselect SSRM modules if selected
                        (!child.isSelected() &&
                            rowModelOption === 'ServerSideRowModelModule' &&
                            child.data.ssrmBundled) ||
                        // Reselect charts option if selected
                        (!child.isSelected() &&
                            Object.entries(chartOptions)
                                .filter(([_, isSelected]) => isSelected)
                                .map(([name]) => getChartsModuleName(name))
                                .includes(child.data.moduleName))
                    ) {
                        nodesToReselect.push(child);
                    }
                });

                api.setNodesSelected({
                    nodes: nodesToReselect,
                    newValue: true,
                });
            }

            updateSelectedModule({
                moduleName,
                isSelected,
                isEnterprise: node.data.isEnterprise,
            });
        },
        [bundleOption, updateSelectedModule, rowModelOption, chartOptions]
    );

    const rowSelection = useMemo<RowSelectionOptions>(() => {
        return {
            mode: 'multiRow',
            checkboxes: (params) => {
                let isInBundle = false;
                if (bundleOption === '') {
                    // No bundles are checked, so everything available
                    isInBundle = true;
                } else if (bundleOption === 'AllCommunityModule') {
                    // All community is checked, only enterprise values are available
                    isInBundle = params.node.allLeafChildren?.length
                        ? params.node.allLeafChildren.some((child) => child.data.isEnterprise)
                        : params.data.isEnterprise;
                }

                const isRowModel =
                    (rowModelOption === 'ClientSideRowModelModule' &&
                        params.data.moduleName === 'ClientSideRowModelModule') ||
                    (rowModelOption === 'InfiniteRowModelModule' &&
                        params.data.moduleName === 'InfiniteRowModelModule') ||
                    (rowModelOption === 'ServerSideRowModelModule' &&
                        params.data.moduleName === 'ServerSideRowModelModule') ||
                    (rowModelOption === 'ViewportRowModelModule' &&
                        params.data.moduleName === 'ViewportRowModelModule');
                const showSSRMLabel = params.data.showSSRMLabel;

                const isChartsModel = Object.entries(chartOptions).some(
                    ([name, isSelected]) => isSelected && params.data.moduleName === getChartsModuleName(name)
                );

                return isInBundle && !isRowModel && !showSSRMLabel && !isChartsModel;
            },
            groupSelects: 'descendants',
            headerCheckbox: bundleOption === '',
        };
    }, [bundleOption, rowModelOption, chartOptions]);

    return (
        <>
            <ModuleConfiguration moduleConfig={moduleConfig} />
            <ModuleSearch gridRef={gridRef} />
            <div style={{ height: '410px' }}>
                <AgGridReact
                    ref={gridRef}
                    treeDataChildrenField="children"
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowData={rowData}
                    initialState={initialState}
                    treeData
                    getRowId={getRowId}
                    rowSelection={rowSelection}
                    onRowSelected={onRowSelected}
                    loadThemeGoogleFonts
                    suppressContextMenu
                    enableCellTextSelection
                />
            </div>
            {selectedDependenciesSnippet && (
                <div className={styles.moduleSnippet}>
                    <Snippet framework={framework} content={selectedDependenciesSnippet} copyToClipboard />
                </div>
            )}
        </>
    );
};
