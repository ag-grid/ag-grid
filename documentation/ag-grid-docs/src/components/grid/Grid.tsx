import LogoMark from '@components/logo/LogoMark';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { type FunctionComponent, useEffect, useState } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColumnsToolPanelModule, MasterDetailModule, SetFilterModule, StatusBarModule } from 'ag-grid-enterprise';
import { AgGridReact, type AgGridReactProps } from 'ag-grid-react';

import styles from './Grid.module.scss';

type Props = {
    gridHeight: string;
} & AgGridReactProps;

export const Grid: FunctionComponent<Props> = ({ gridHeight, ...props }) => {
    return (
        <div className={styles.grid} style={{ width: '100%', height: gridHeight }}>
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
        </div>
    );
};
