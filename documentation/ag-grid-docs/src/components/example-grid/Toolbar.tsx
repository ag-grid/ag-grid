import { Select } from '@ag-website-shared/components/select/Select';
import { trackDemoToolbar } from '@utils/analytics';
import { useMemo } from 'react';
import type { RefObject } from 'react';

import type { GridApi } from 'ag-grid-community';

import styles from './Toolbar.module.scss';
import { createDataSizeValue } from './utils';

const IS_SSR = typeof window === 'undefined';

function updateUrlParam(key: string, value: string) {
    if (IS_SSR) {
        return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    history.replaceState({}, '', url);
}

interface SelectOption {
    label: string;
    value: string;
}

interface ToolbarProps {
    gridRef: RefObject<{ api: GridApi }>;
    dataSize: string | undefined;
    setDataSize: (size: string) => void;
    rowCols: [number, number][];
    gridTheme: string;
    setGridTheme: (theme: string) => void;
    setCountryColumnPopupEditor: (theme: string, api: GridApi) => void;
}

const options: Record<string, string> = {
    quartz: 'Quartz',
    balham: 'Balham',
    material: 'Material',
    alpine: 'Alpine',
};

export const Toolbar = ({
    gridRef,
    dataSize,
    setDataSize,
    rowCols,
    gridTheme,
    setGridTheme,
    setCountryColumnPopupEditor,
}: ToolbarProps) => {
    function onDataSizeChanged(newValue: SelectOption) {
        const { value } = newValue;
        setDataSize(value);
        trackDemoToolbar({
            type: 'dataSize',
            value,
        });

        updateUrlParam('dataSize', value);
    }

    function onThemeChanged(newValue: SelectOption) {
        if (!gridRef.current?.api) {
            return;
        }

        const newTheme = newValue.value || 'ag-theme-none';
        setCountryColumnPopupEditor(newTheme, gridRef.current.api);
        setGridTheme(newTheme);
        trackDemoToolbar({
            type: 'theme',
            value: newTheme,
        });

        updateUrlParam('theme', newTheme);
    }

    const dataSizeOptions = useMemo(
        () =>
            rowCols.map(([rows, cols]) => {
                return {
                    label: `${rows.toLocaleString()} Rows, ${cols.toLocaleString()} Cols`,
                    value: createDataSizeValue(rows, cols),
                };
            }),
        [rowCols]
    );
    const dataSizeOption = useMemo(
        () => dataSizeOptions.find((o) => o.value === dataSize) || dataSizeOptions[0],
        [dataSizeOptions, dataSize]
    );

    const themeOptions = useMemo(() => {
        return Object.entries(options).map(([themeName, label]) => ({
            label,
            value: themeName,
        }));
    }, []);
    const themeOption = useMemo(
        () => themeOptions.find((o) => gridTheme.includes(o.value)) || themeOptions[0],
        [themeOptions, gridTheme]
    );

    return (
        <div className={styles.toolbar}>
            <div className={styles.controlsContainer}>
                <div className={styles.controls}>
                    <span className={styles.filterLabel}>Data Size:</span>

                    {dataSizeOption && (
                        <Select
                            isPopper
                            options={dataSizeOptions}
                            value={dataSizeOption}
                            onChange={onDataSizeChanged}
                            renderItem={(o: SelectOption) => {
                                return <>{o.label}</>;
                            }}
                        />
                    )}

                    <span className={styles.filterLabel}>Theme:</span>
                    <Select
                        isPopper
                        options={themeOptions}
                        value={themeOption}
                        onChange={onThemeChanged}
                        renderItem={(o: SelectOption) => {
                            return <>{o.label}</>;
                        }}
                    />
                </div>
            </div>
            <div className={styles.scrollIndicator}></div>
        </div>
    );
};
