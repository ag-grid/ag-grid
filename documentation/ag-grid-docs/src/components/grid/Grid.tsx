import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridReact, type AgGridReactProps } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import LogoMark from '@components/logo/LogoMark';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { type FunctionComponent, useEffect, useState } from 'react';

import styles from './Grid.module.scss';

type Props = {
    theme?: string;
    darkModeTheme?: string;
    gridHeight: string;
} & AgGridReactProps;

function useGridTheme({ theme, darkModeTheme }: { theme: string; darkModeTheme?: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [gridTheme, setGridTheme] = useState(theme);
    const [darkMode] = useDarkmode();

    useEffect(() => {
        if (darkModeTheme) {
            setGridTheme(darkMode ? darkModeTheme : theme);
        }

        setIsLoading(false);
    }, [darkMode, theme, darkModeTheme]);

    return {
        isLoading,
        gridTheme,
    };
}

export const Grid: FunctionComponent<Props> = ({ theme = 'ag-theme-quartz', darkModeTheme, gridHeight, ...props }) => {
    const { isLoading, gridTheme } = useGridTheme({
        theme,
        darkModeTheme,
    });

    return (
        <div className={classnames(gridTheme, styles.grid)} style={{ width: '100%', height: gridHeight }}>
            {isLoading && <LogoMark isSpinning />}
            {!isLoading && (
                <AgGridReact
                    loading={false}
                    suppressNoRowsOverlay={true}
                    {...props}
                    modules={[
                        ClientSideRowModelModule,
                        MasterDetailModule,
                        SetFilterModule,
                        ColumnsToolPanelModule,
                        StatusBarModule,
                    ]}
                    statusBar={{
                        statusPanels: [
                            {
                                statusPanel: 'agTotalAndFilteredRowCountComponent',
                                align: 'left',
                            },
                            {
                                statusPanel: 'agTotalRowCountComponent',
                                align: 'center',
                            },
                            { statusPanel: 'agFilteredRowCountComponent' },
                            { statusPanel: 'agSelectedRowCountComponent' },
                            { statusPanel: 'agAggregationComponent' },
                        ],
                    }}
                />
            )}
        </div>
    );
};
