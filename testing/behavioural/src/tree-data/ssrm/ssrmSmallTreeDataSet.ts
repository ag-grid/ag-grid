import type { IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';

export type EmploymentType = 'Permanent' | 'Contract';

export interface EmployeeNode {
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    employmentType: EmploymentType;
    children?: EmployeeNode[];
}

export interface EmployeeRow {
    employeeId: string;
    employeeName: string;
    jobTitle: string;
    employmentType: EmploymentType;
    group?: boolean;
}

export interface FakeServer {
    loadsCount: number;
    data: EmployeeNode[];
    getData(request: IServerSideGetRowsRequest): EmployeeRow[];
}

export function createFakeServer(fakeServerData: EmployeeNode[]): FakeServer {
    const fakeServer: FakeServer = {
        loadsCount: 0,
        data: fakeServerData,
        getData(request: IServerSideGetRowsRequest): EmployeeRow[] {
            ++this.loadsCount;
            function extractRowsFromData(groupKeys: string[], data: EmployeeNode[]): EmployeeRow[] {
                if (groupKeys.length === 0) {
                    return data.map((d) => ({
                        group: !!d.children?.length,
                        employeeId: d.employeeId,
                        employeeName: d.employeeName,
                        employmentType: d.employmentType,
                        jobTitle: d.jobTitle,
                    }));
                }

                const key = groupKeys[0];
                for (let i = 0; i < data.length; i++) {
                    const node = data[i];
                    if (node.employeeId === key) {
                        const next = node.children ? node.children.slice() : [];
                        return extractRowsFromData(groupKeys.slice(1), next);
                    }
                }
                return [];
            }

            return extractRowsFromData(request.groupKeys ?? [], this.data);
        },
    };
    return fakeServer;
}

export function createServerSideDatasource(fakeServer: FakeServer): IServerSideDatasource {
    const dataSource: IServerSideDatasource = {
        getRows: (params: IServerSideGetRowsParams) => {
            const allRows = fakeServer.getData(params.request);

            const request = params.request;
            const doingInfinite = request.startRow != null && request.endRow != null;
            const result = doingInfinite
                ? {
                      rowData: allRows.slice(request.startRow, request.endRow),
                      rowCount: allRows.length,
                  }
                : { rowData: allRows };
            setTimeout(() => {
                params.success(result);
            }, 1);
        },
    };

    return dataSource;
}

export function getSmallTreeDataSet(): EmployeeNode[] {
    return [
        {
            employeeId: '101',
            employeeName: 'Erica Rogers',
            jobTitle: 'CEO',
            employmentType: 'Permanent',
            children: [
                {
                    employeeId: '102',
                    employeeName: 'Malcolm Barrett',
                    jobTitle: 'Exec. Vice President',
                    employmentType: 'Permanent',
                    children: [
                        {
                            employeeId: '103',
                            employeeName: 'Esther Baker',
                            jobTitle: 'Director of Operations',
                            employmentType: 'Permanent',
                            children: [
                                {
                                    employeeId: '104',
                                    employeeName: 'Brittany Hanson',
                                    jobTitle: 'Fleet Coordinator',
                                    employmentType: 'Permanent',
                                    children: [
                                        {
                                            employeeId: '105',
                                            employeeName: 'Leah Flowers',
                                            jobTitle: 'Parts Technician',
                                            employmentType: 'Contract',
                                        },
                                        {
                                            employeeId: '106',
                                            employeeName: 'Tammy Sutton',
                                            jobTitle: 'Service Technician',
                                            employmentType: 'Contract',
                                        },
                                    ],
                                },
                                {
                                    employeeId: '107',
                                    employeeName: 'Derek Paul',
                                    jobTitle: 'Inventory Control',
                                    employmentType: 'Permanent',
                                },
                            ],
                        },
                        {
                            employeeId: '108',
                            employeeName: 'Francis Strickland',
                            jobTitle: 'VP Sales',
                            employmentType: 'Permanent',
                            children: [
                                {
                                    employeeId: '109',
                                    employeeName: 'Morris Hanson',
                                    jobTitle: 'Sales Manager',
                                    employmentType: 'Permanent',
                                },
                                {
                                    employeeId: '110',
                                    employeeName: 'Todd Tyler',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Contract',
                                },
                                {
                                    employeeId: '111',
                                    employeeName: 'Bennie Wise',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Contract',
                                },
                                {
                                    employeeId: '112',
                                    employeeName: 'Joel Cooper',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Permanent',
                                },
                            ],
                        },
                    ],
                },
                {
                    employeeId: '113',
                    employeeName: 'Luke McBride',
                    jobTitle: 'Exec. Vice President',
                    employmentType: 'Permanent',
                    children: [
                        {
                            employeeId: '114',
                            employeeName: 'Sarah Baker',
                            jobTitle: 'Director of Operations',
                            employmentType: 'Permanent',
                            children: [
                                {
                                    employeeId: '115',
                                    employeeName: 'Mason Hanson',
                                    jobTitle: 'Fleet Coordinator',
                                    employmentType: 'Permanent',
                                    children: [
                                        {
                                            employeeId: '116',
                                            employeeName: 'Hannah Flowers',
                                            jobTitle: 'Parts Technician',
                                            employmentType: 'Contract',
                                        },
                                        {
                                            employeeId: '117',
                                            employeeName: 'Rob Sutton',
                                            jobTitle: 'Service Technician',
                                            employmentType: 'Contract',
                                        },
                                    ],
                                },
                                {
                                    employeeId: '118',
                                    employeeName: 'Paul Smith',
                                    jobTitle: 'Inventory Control',
                                    employmentType: 'Permanent',
                                },
                            ],
                        },
                        {
                            employeeId: '119',
                            employeeName: 'Adam Newman',
                            jobTitle: 'VP Sales',
                            employmentType: 'Permanent',
                            children: [
                                {
                                    employeeId: '120',
                                    employeeName: 'John Smith',
                                    jobTitle: 'Sales Manager',
                                    employmentType: 'Permanent',
                                },
                                {
                                    employeeId: '121',
                                    employeeName: 'Alice Grant',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Contract',
                                },
                                {
                                    employeeId: '122',
                                    employeeName: 'Ben Hill',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Contract',
                                },
                                {
                                    employeeId: '123',
                                    employeeName: 'Joe Cooper',
                                    jobTitle: 'Sales Executive',
                                    employmentType: 'Permanent',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
}
