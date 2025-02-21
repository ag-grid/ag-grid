import { type RefObject, useCallback, useMemo, useState } from 'react';

import type { GridState, IRowNode } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';

import {
    ALL_COMMUNITY_MODULE,
    ALL_ENTERPRISE_MODULE,
    type BundleOptionValue,
    type ChartModuleName,
    type ChartOptions,
    DEFAULT_CHART_OPTIONS,
    DEFAULT_SELECTED_ROW_MODEL_OPTION,
    INTEGRATED_CHARTS_MODULE,
    ROW_MODEL_OPTIONS,
    SPARKLINES_MODULE,
} from './constants';
import { type ChartsImportType, type SelectedModules, getModuleMappingsSnippet } from './getModuleMappingsSnippet';

export type ModuleConfig = ReturnType<typeof useModuleConfig>;

const getChartsImportType = (chartOptions: ChartOptions): ChartsImportType => {
    const hasSparklines = chartOptions['Sparklines'];
    const hasIntegratedCharts = chartOptions['Integrated Charts'];
    let chartsImport: ChartsImportType = 'none';
    if (hasSparklines && !hasIntegratedCharts) {
        chartsImport = 'community';
    } else if (hasIntegratedCharts) {
        chartsImport = 'enterprise';
    }

    return chartsImport;
};

export const getChartsModuleName = (name: string) => {
    return name === 'Sparklines' ? SPARKLINES_MODULE.moduleName : INTEGRATED_CHARTS_MODULE.moduleName;
};

export function useModuleConfig(gridRef: RefObject<AgGridReact>) {
    const [rowModelOption, setRowModelOption] = useState<string>(DEFAULT_SELECTED_ROW_MODEL_OPTION.moduleName);
    const [bundleOption, setBundleOption] = useState<BundleOptionValue>('');
    const [chartOptions, setChartOptions] = useState(DEFAULT_CHART_OPTIONS);
    const [selectedModules, setSelectedModules] = useState<SelectedModules>({
        community: [],
        enterprise: [],
    });
    const selectedDependenciesSnippet = useMemo(() => {
        const chartsImportType = getChartsImportType(chartOptions);
        return getModuleMappingsSnippet({ chartsImportType, selectedModules });
    }, [selectedModules, chartOptions]);

    const updateRowModelOption = useCallback(
        (moduleName: string) => {
            const otherRowModelObjs = ROW_MODEL_OPTIONS.filter((rowModel) => rowModel.moduleName !== moduleName);

            setRowModelOption(moduleName);
            // NOTE: `selectedModules` is set by the updatedSelectedModule callback

            const api = gridRef?.current?.api;
            if (!api) {
                return;
            }

            // Select row model chosen
            const selectedRowModel: IRowNode = api.getRowNode(moduleName)!;
            api.setNodesSelected({
                nodes: [selectedRowModel],
                newValue: true,
            });

            if (bundleOption === '') {
                // Deselect other row models
                const otherRowModels: IRowNode[] = otherRowModelObjs.map((node) => {
                    return api.getRowNode(node.moduleName)!;
                });
                api.setNodesSelected({
                    nodes: otherRowModels,
                    newValue: false,
                });
            } else if (bundleOption === ALL_COMMUNITY_MODULE) {
                // Deselect other non-selected enterprise row models
                const otherRowModels: IRowNode[] = otherRowModelObjs
                    .filter((rowModel) => {
                        return rowModel.moduleName !== moduleName && rowModel.isEnterprise;
                    })
                    .map((rowModel) => {
                        return api.getRowNode(rowModel.moduleName)!;
                    });
                api.setNodesSelected({
                    nodes: otherRowModels,
                    newValue: false,
                });
            }
        },
        [gridRef, bundleOption]
    );

    const selectChartOptions = useCallback(() => {
        const api = gridRef?.current?.api;
        if (!api) {
            return;
        }
        const selectedChartRowModels = Object.entries(chartOptions)
            .filter(([_, isSelected]) => isSelected)
            .map(([name]) => {
                const chartModuleName = getChartsModuleName(name);
                return api.getRowNode(chartModuleName)!;
            });

        api.setNodesSelected({
            nodes: selectedChartRowModels,
            newValue: true,
        });

        setSelectedModules((prev) => {
            const community = [...prev.community];
            const enterprise = [...prev.enterprise];

            // NOTE: Charts modules are enterprise only
            Object.entries(chartOptions).forEach(([name, isSelected]) => {
                const moduleName = getChartsModuleName(name);
                const index = enterprise.indexOf(moduleName);
                if (isSelected && index === -1) {
                    enterprise.push(moduleName);
                }
            });

            return {
                community,
                enterprise,
            };
        });
    }, [chartOptions, gridRef]);

    const updateBundleOption = useCallback(
        (moduleName: BundleOptionValue) => {
            const api = gridRef?.current?.api;
            if (!api) {
                return;
            }

            if (moduleName === ALL_ENTERPRISE_MODULE) {
                api.selectAll('all');
                setSelectedModules({
                    community: [],
                    enterprise: [ALL_ENTERPRISE_MODULE],
                });
            } else if (moduleName === ALL_COMMUNITY_MODULE) {
                const nodesToToggle: IRowNode[] = [];

                api.deselectAll('all');
                // toggle all community modules
                api.forEachLeafNode((child) => {
                    if (!child.data.isEnterprise && child.data.moduleName) {
                        nodesToToggle.push(child);
                    } else if (child.data.isEnterprise && child.data.moduleName === rowModelOption) {
                        nodesToToggle.push(child);
                    }
                });
                api.setNodesSelected({
                    nodes: nodesToToggle,
                    newValue: true,
                });

                setSelectedModules((prev) => {
                    return {
                        community: [ALL_COMMUNITY_MODULE],
                        enterprise: [...prev.enterprise],
                    };
                });

                // Reselect chart options
                selectChartOptions();
            } else {
                api.deselectAll('all');

                // Reselect row model
                const selectedRowModel: IRowNode = api.getRowNode(rowModelOption)!;
                api.setNodesSelected({
                    nodes: [selectedRowModel],
                    newValue: true,
                });
                const rowModel = ROW_MODEL_OPTIONS.find((rowModel) => rowModel.moduleName === rowModelOption);
                // When going from AllCommunityModules to none, and when the row model is
                // community, need to add the row model to the selected modules
                if (!rowModel?.isEnterprise) {
                    setSelectedModules((prev) => {
                        const community = [...prev.community, rowModelOption];
                        const enterprise = [...prev.enterprise];

                        return {
                            community,
                            enterprise,
                        };
                    });
                }

                // Reselect chart options
                selectChartOptions();
            }

            setBundleOption(moduleName);
        },
        [gridRef, rowModelOption, selectChartOptions]
    );

    const updateChartOption = useCallback(
        (name: ChartModuleName) => {
            const api = gridRef?.current?.api;
            if (!api) {
                return;
            }

            const moduleName = getChartsModuleName(name);
            const isSelected = chartOptions[name];
            const selectedRowModel: IRowNode = api.getRowNode(moduleName)!;
            api.setNodesSelected({
                nodes: [selectedRowModel],
                newValue: !isSelected,
            });

            setChartOptions((prevSelectedCharts) => {
                const newSelection = {
                    ...prevSelectedCharts,
                    [name]: !prevSelectedCharts[name],
                };

                return newSelection;
            });
        },
        [gridRef, chartOptions]
    );

    // Initialise default selected row model
    const initialState: GridState = {
        rowSelection: [DEFAULT_SELECTED_ROW_MODEL_OPTION.moduleName],
    };

    const updateSelectedModule = useCallback(
        ({
            moduleName,
            isSelected,
            isEnterprise,
        }: {
            moduleName: string;
            isSelected: boolean;
            isEnterprise: boolean;
        }) => {
            if (!moduleName) {
                return;
            }

            if (bundleOption === ALL_ENTERPRISE_MODULE) {
                // No modules can be selected
                return;
            } else if (bundleOption === ALL_COMMUNITY_MODULE) {
                setSelectedModules((curSelectedModules) => {
                    // Only select if enterprise
                    const enterprise = [...curSelectedModules.enterprise].filter(
                        (module) => module !== ALL_ENTERPRISE_MODULE
                    );
                    if (isEnterprise) {
                        const index = enterprise.indexOf(moduleName);
                        if (isSelected && index === -1) {
                            enterprise.push(moduleName);
                        } else {
                            if (index > -1) {
                                enterprise.splice(index, 1);
                            }
                        }
                    }

                    return {
                        community: [...curSelectedModules.community],
                        enterprise,
                    };
                });
                return;
            }

            setSelectedModules((curSelectedModules) => {
                const community = [...curSelectedModules.community].filter((module) => module !== ALL_COMMUNITY_MODULE);
                const enterprise = [...curSelectedModules.enterprise].filter(
                    (module) => module !== ALL_ENTERPRISE_MODULE
                );

                if (isEnterprise) {
                    const index = enterprise.indexOf(moduleName);
                    if (isSelected && index === -1) {
                        enterprise.push(moduleName);
                    } else {
                        if (index > -1) {
                            enterprise.splice(index, 1);
                        }
                    }
                } else {
                    const index = community.indexOf(moduleName);
                    if (isSelected && index === -1) {
                        community.push(moduleName);
                    } else {
                        if (index > -1) {
                            community.splice(index, 1);
                        }
                    }
                }

                return {
                    community,
                    enterprise,
                };
            });
        },
        [bundleOption]
    );

    return {
        initialState,
        rowModelOption,
        updateRowModelOption,
        bundleOption,
        updateBundleOption,
        chartOptions,
        updateChartOption,
        updateSelectedModule,
        selectedDependenciesSnippet,
    };
}
