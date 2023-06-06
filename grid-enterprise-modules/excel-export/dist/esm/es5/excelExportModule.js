import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ExcelCreator } from "./excelExport/excelCreator";
import { CsvCreator, GridSerializer } from "@ag-grid-community/csv-export";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { VERSION } from "./version";
export var ExcelExportModule = {
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator,
        // these beans are part of CSV Export module
        GridSerializer, CsvCreator
    ],
    dependantModules: [
        CsvExportModule,
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxFeHBvcnRNb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnRNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFXO0lBQ3JDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsaUJBQWlCO0lBQ3pDLEtBQUssRUFBRTtRQUNILHVCQUF1QjtRQUN2QixZQUFZO1FBRVosNENBQTRDO1FBQzVDLGNBQWMsRUFBRSxVQUFVO0tBQzdCO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDZCxlQUFlO1FBQ2Ysb0JBQW9CO0tBQ3ZCO0NBQ0osQ0FBQyJ9