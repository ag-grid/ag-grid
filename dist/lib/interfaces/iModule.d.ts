// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface Module {
    moduleName: string;
    beans?: any[];
    enterpriseComponents?: any[];
    enterpriseBeans?: any[];
    enterpriseDefaultComponents?: {
        componentName: string;
        theClass: any;
    }[];
}
