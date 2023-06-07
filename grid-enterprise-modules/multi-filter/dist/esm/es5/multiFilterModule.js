import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { MultiFilter } from './multiFilter/multiFilter';
import { MultiFloatingFilterComp } from './multiFilter/multiFloatingFilter';
import { VERSION } from './version';
export var MultiFilterModule = {
    version: VERSION,
    moduleName: ModuleNames.MultiFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agMultiColumnFilter', componentClass: MultiFilter },
        { componentName: 'agMultiColumnFloatingFilter', componentClass: MultiFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlGaWx0ZXJNb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbXVsdGlGaWx0ZXJNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXBDLE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFXO0lBQ3JDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSxXQUFXLENBQUMsaUJBQWlCO0lBQ3pDLEtBQUssRUFBRSxFQUFFO0lBQ1QsY0FBYyxFQUFFO1FBQ1osRUFBRSxhQUFhLEVBQUUscUJBQXFCLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRTtRQUNyRSxFQUFFLGFBQWEsRUFBRSw2QkFBNkIsRUFBRSxjQUFjLEVBQUUsdUJBQXVCLEVBQUU7S0FDNUY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLG9CQUFvQjtLQUN2QjtDQUNKLENBQUMifQ==