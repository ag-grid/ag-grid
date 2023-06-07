import { ModuleNames } from "@ag-grid-community/core";
import { CsvCreator } from "./csvExport/csvCreator";
import { GridSerializer } from "./csvExport/gridSerializer";
import { VERSION } from "./version";
export var CsvExportModule = {
    version: VERSION,
    moduleName: ModuleNames.CsvExportModule,
    beans: [CsvCreator, GridSerializer]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2RXhwb3J0TW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NzdkV4cG9ydE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBVztJQUNuQyxPQUFPLEVBQUUsT0FBTztJQUNoQixVQUFVLEVBQUUsV0FBVyxDQUFDLGVBQWU7SUFDdkMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztDQUN0QyxDQUFDIn0=