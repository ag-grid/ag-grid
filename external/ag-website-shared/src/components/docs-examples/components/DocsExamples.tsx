import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

import type { ColDef } from 'ag-grid-community';

import styles from './DocsExamples.module.scss';
import { ExampleCountComponent } from './cell-renderers/ExampleCountComponent';
import { LinkCellRenderer } from './cell-renderers/LinkCellRenderer';
import { PageCountComponent } from './cell-renderers/PageCountComponent';

export interface DocsExamplesProps {
    exampleContents: Record<string, any>;
}

type Props = DocsExamplesProps & {
    AgGrid: any;
};

const EnterpriseIcon = () => (
    <span title="Enterprise">
        <Icon name="enterprise" svgClasses={styles.icon} />
    </span>
);

const ChartsIcon = () => (
    <span title="Integrated Charts">
        <Icon name="chartsColumn" svgClasses={styles.icon} />
    </span>
);

export const DocsExamples: FunctionComponent<Props> = ({ exampleContents, AgGrid }) => {
    const [colDefs] = useState([
        {
            field: 'pageName',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'exampleName',
            hide: true,
        },
        {
            field: 'isEnterprise',
            headerName: 'Enterprise',
            headerComponent: EnterpriseIcon,
            minWidth: 56,
        },
        {
            field: 'isIntegratedCharts',
            headerName: 'Charts',
            headerComponent: ChartsIcon,
            minWidth: 56,
        },
        {
            field: 'isLocale',
            headerName: 'Locale',
            minWidth: 110,
        },
        {
            field: 'hasExampleConsoleLog',
            headerName: 'Log',
            minWidth: 90,
        },
        {
            headerName: 'React',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'React TS',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'Angular',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'Vue',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'JavaScript',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'Typescript',
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
    ]);

    const defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
    };
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: 'Page Examples',
            field: 'exampleName',
            minWidth: 300,
        };
    }, []);
    const sideBar = useMemo(() => {
        return {
            toolPanels: ['filters', 'columns'],
        };
    }, []);

    const [statusBar] = useState({
        statusPanels: [
            {
                statusPanel: PageCountComponent,
            },
            {
                statusPanel: ExampleCountComponent,
            },
        ],
    });

    return (
        <div className={styles.container}>
            <AgGrid
                rowData={exampleContents}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                statusBar={statusBar}
                sideBar={sideBar}
                autoGroupColumnDef={autoGroupColumnDef}
                groupDisplayType="singleColumn"
                groupDefaultExpanded={1}
            />
        </div>
    );
};
