import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { ClipboardService } from "./clipboard/clipboardService";
import { VERSION } from "./version";
export const ClipboardModule = {
    version: VERSION,
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        EnterpriseCoreModule,
        CsvExportModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaXBib2FyZE1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFcEMsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFXO0lBQ25DLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsZUFBZTtJQUN2QyxLQUFLLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztJQUN6QixnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtRQUNwQixlQUFlO0tBQ2xCO0NBQ0osQ0FBQyJ9