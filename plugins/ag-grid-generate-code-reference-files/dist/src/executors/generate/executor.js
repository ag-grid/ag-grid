/* eslint-disable no-console */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _typescript = /*#__PURE__*/ _interop_require_default._(require("typescript"));
const _executorsutils = require("../../executors-utils");
const _generatecodereferencefiles = require("./generate-code-reference-files");
async function _default(options) {
    try {
        console.log('-'.repeat(80));
        console.log('Generate docs reference files...');
        console.log('Using Typescript version: ', _typescript.default.version);
        await generateFile(options);
        console.log(`Generation completed - written to ${options.output}.`);
        console.log('-'.repeat(80));
        return {
            success: true
        };
    } catch (e) {
        console.error(e, {
            options
        });
        return {
            success: false
        };
    }
}
async function generateFile(options) {
    const workspaceRoot = process.cwd();
    const gridOpsFile = workspaceRoot + "/community-modules/core/src/entities/gridOptions.ts";
    const colDefFile = workspaceRoot + "/community-modules/core/src/entities/colDef.ts";
    const filterFile = workspaceRoot + "/community-modules/core/src/interfaces/iFilter.ts";
    const gridApiFile = workspaceRoot + "/community-modules/core/src/gridApi.ts";
    const columnFile = workspaceRoot + "/community-modules/core/src/entities/column.ts";
    const rowNodeFile = workspaceRoot + "/community-modules/core/src/interfaces/iRowNode.ts";
    const distFolder = workspaceRoot + '/' + options.output;
    // Matches the inputs in generate-doc-references task
    const INTERFACE_GLOBS = [
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/community-modules/core/src'),
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/community-modules/angular/projects/ag-grid-angular/src/lib'),
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/community-modules/react/src/shared'),
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/grid-enterprise-modules/set-filter/src'),
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/grid-enterprise-modules/filter-tool-panel/src'),
        ...(0, _executorsutils.inputGlob)(workspaceRoot + '/grid-enterprise-modules/multi-filter/src')
    ];
    const generateMetaFiles = async ()=>{
        await (0, _executorsutils.writeJSONFile)(distFolder + '/grid-options.AUTO.json', (0, _generatecodereferencefiles.getGridOptions)(gridOpsFile));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/grid-api.AUTO.json', (0, _generatecodereferencefiles.getGridApi)(gridApiFile));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/row-node.AUTO.json', (0, _generatecodereferencefiles.getRowNode)(rowNodeFile));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/column-options.AUTO.json', (0, _generatecodereferencefiles.getColumnOptions)(colDefFile, filterFile));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/column.AUTO.json', (0, _generatecodereferencefiles.getColumn)(columnFile));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/interfaces.AUTO.json', (0, _generatecodereferencefiles.getInterfaces)(INTERFACE_GLOBS));
        await (0, _executorsutils.writeJSONFile)(distFolder + '/doc-interfaces.AUTO.json', (0, _generatecodereferencefiles.buildInterfaceProps)(INTERFACE_GLOBS));
    };
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Generate docs reference files...`);
    console.log('Using Typescript version: ', _typescript.default.version);
    await generateMetaFiles();
    console.log(`Generated OK.`);
    console.log(`--------------------------------------------------------------------------------`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leGVjdXRvcnMvZ2VuZXJhdGUvZXhlY3V0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuaW1wb3J0IHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQgeyBpbnB1dEdsb2IsIHdyaXRlSlNPTkZpbGUgfSBmcm9tICcuLi8uLi9leGVjdXRvcnMtdXRpbHMnO1xuaW1wb3J0IHsgZ2V0R3JpZE9wdGlvbnMsIGdldEludGVyZmFjZXMgIH0gZnJvbSAnLi9nZW5lcmF0ZS1jb2RlLXJlZmVyZW5jZS1maWxlcyc7XG5pbXBvcnQgeyBnZXRHcmlkQXBpIH0gZnJvbSAnLi9nZW5lcmF0ZS1jb2RlLXJlZmVyZW5jZS1maWxlcyc7XG5pbXBvcnQgeyBnZXRSb3dOb2RlIH0gZnJvbSAnLi9nZW5lcmF0ZS1jb2RlLXJlZmVyZW5jZS1maWxlcyc7XG5pbXBvcnQgeyBnZXRDb2x1bW5PcHRpb25zIH0gZnJvbSAnLi9nZW5lcmF0ZS1jb2RlLXJlZmVyZW5jZS1maWxlcyc7XG5pbXBvcnQgeyBnZXRDb2x1bW4gfSBmcm9tICcuL2dlbmVyYXRlLWNvZGUtcmVmZXJlbmNlLWZpbGVzJztcbmltcG9ydCB7IGJ1aWxkSW50ZXJmYWNlUHJvcHMgfSBmcm9tICcuL2dlbmVyYXRlLWNvZGUtcmVmZXJlbmNlLWZpbGVzJztcblxudHlwZSBFeGVjdXRvck9wdGlvbnMgPSB7IG91dHB1dDogc3RyaW5nfTtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKG9wdGlvbnM6IEV4ZWN1dG9yT3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCctJy5yZXBlYXQoODApKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0dlbmVyYXRlIGRvY3MgcmVmZXJlbmNlIGZpbGVzLi4uJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVc2luZyBUeXBlc2NyaXB0IHZlcnNpb246ICcsIHRzLnZlcnNpb24pO1xuXG4gICAgICAgIGF3YWl0IGdlbmVyYXRlRmlsZShvcHRpb25zKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGlvbiBjb21wbGV0ZWQgLSB3cml0dGVuIHRvICR7b3B0aW9ucy5vdXRwdXR9LmApO1xuICAgICAgICBjb25zb2xlLmxvZygnLScucmVwZWF0KDgwKSk7XG5cbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlLCB7IG9wdGlvbnMgfSk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUZpbGUob3B0aW9uczogRXhlY3V0b3JPcHRpb25zKSB7XG4gICAgY29uc3Qgd29ya3NwYWNlUm9vdCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgZ3JpZE9wc0ZpbGUgPSB3b3Jrc3BhY2VSb290ICsgXCIvY29tbXVuaXR5LW1vZHVsZXMvY29yZS9zcmMvZW50aXRpZXMvZ3JpZE9wdGlvbnMudHNcIjtcbiAgICBjb25zdCBjb2xEZWZGaWxlID0gd29ya3NwYWNlUm9vdCArIFwiL2NvbW11bml0eS1tb2R1bGVzL2NvcmUvc3JjL2VudGl0aWVzL2NvbERlZi50c1wiO1xuICAgIGNvbnN0IGZpbHRlckZpbGUgPSB3b3Jrc3BhY2VSb290ICsgIFwiL2NvbW11bml0eS1tb2R1bGVzL2NvcmUvc3JjL2ludGVyZmFjZXMvaUZpbHRlci50c1wiO1xuICAgIGNvbnN0IGdyaWRBcGlGaWxlID0gd29ya3NwYWNlUm9vdCArICBcIi9jb21tdW5pdHktbW9kdWxlcy9jb3JlL3NyYy9ncmlkQXBpLnRzXCI7XG4gICAgY29uc3QgY29sdW1uRmlsZSA9IHdvcmtzcGFjZVJvb3QgKyAgXCIvY29tbXVuaXR5LW1vZHVsZXMvY29yZS9zcmMvZW50aXRpZXMvY29sdW1uLnRzXCI7XG4gICAgY29uc3Qgcm93Tm9kZUZpbGUgPSB3b3Jrc3BhY2VSb290ICsgIFwiL2NvbW11bml0eS1tb2R1bGVzL2NvcmUvc3JjL2ludGVyZmFjZXMvaVJvd05vZGUudHNcIjtcblxuICAgIGNvbnN0IGRpc3RGb2xkZXIgPSB3b3Jrc3BhY2VSb290ICsgJy8nICsgb3B0aW9ucy5vdXRwdXQ7XG5cbiAgICAvLyBNYXRjaGVzIHRoZSBpbnB1dHMgaW4gZ2VuZXJhdGUtZG9jLXJlZmVyZW5jZXMgdGFza1xuICAgIGNvbnN0IElOVEVSRkFDRV9HTE9CUyA9IFtcbiAgICAgICAgLi4uaW5wdXRHbG9iKHdvcmtzcGFjZVJvb3QgKyAnL2NvbW11bml0eS1tb2R1bGVzL2NvcmUvc3JjJyksXG4gICAgICAgIC4uLmlucHV0R2xvYih3b3Jrc3BhY2VSb290ICsgJy9jb21tdW5pdHktbW9kdWxlcy9hbmd1bGFyL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliJyksXG4gICAgICAgIC4uLmlucHV0R2xvYih3b3Jrc3BhY2VSb290ICsgJy9jb21tdW5pdHktbW9kdWxlcy9yZWFjdC9zcmMvc2hhcmVkJyksXG4gICAgICAgIC4uLmlucHV0R2xvYih3b3Jrc3BhY2VSb290ICsgJy9ncmlkLWVudGVycHJpc2UtbW9kdWxlcy9zZXQtZmlsdGVyL3NyYycpLFxuICAgICAgICAuLi5pbnB1dEdsb2Iod29ya3NwYWNlUm9vdCArICcvZ3JpZC1lbnRlcnByaXNlLW1vZHVsZXMvZmlsdGVyLXRvb2wtcGFuZWwvc3JjJyksXG4gICAgICAgIC4uLmlucHV0R2xvYih3b3Jrc3BhY2VSb290ICsgJy9ncmlkLWVudGVycHJpc2UtbW9kdWxlcy9tdWx0aS1maWx0ZXIvc3JjJyksXG4gICAgXTtcblxuICAgIGNvbnN0IGdlbmVyYXRlTWV0YUZpbGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB3cml0ZUpTT05GaWxlKGRpc3RGb2xkZXIgKyAnL2dyaWQtb3B0aW9ucy5BVVRPLmpzb24nLCBnZXRHcmlkT3B0aW9ucyhncmlkT3BzRmlsZSkpO1xuICAgICAgICBhd2FpdCB3cml0ZUpTT05GaWxlKGRpc3RGb2xkZXIgKyAnL2dyaWQtYXBpLkFVVE8uanNvbicsIGdldEdyaWRBcGkoZ3JpZEFwaUZpbGUpKTtcbiAgICAgICAgYXdhaXQgd3JpdGVKU09ORmlsZShkaXN0Rm9sZGVyICsgJy9yb3ctbm9kZS5BVVRPLmpzb24nLCBnZXRSb3dOb2RlKHJvd05vZGVGaWxlKSk7XG4gICAgICAgIGF3YWl0IHdyaXRlSlNPTkZpbGUoZGlzdEZvbGRlciArICcvY29sdW1uLW9wdGlvbnMuQVVUTy5qc29uJywgZ2V0Q29sdW1uT3B0aW9ucyhjb2xEZWZGaWxlLCBmaWx0ZXJGaWxlKSk7XG4gICAgICAgIGF3YWl0IHdyaXRlSlNPTkZpbGUoZGlzdEZvbGRlciArICcvY29sdW1uLkFVVE8uanNvbicsIGdldENvbHVtbihjb2x1bW5GaWxlKSk7XG4gICAgICAgIGF3YWl0IHdyaXRlSlNPTkZpbGUoZGlzdEZvbGRlciArICcvaW50ZXJmYWNlcy5BVVRPLmpzb24nLCBnZXRJbnRlcmZhY2VzKElOVEVSRkFDRV9HTE9CUykpO1xuICAgICAgICBhd2FpdCB3cml0ZUpTT05GaWxlKGRpc3RGb2xkZXIgKyAnL2RvYy1pbnRlcmZhY2VzLkFVVE8uanNvbicsIGJ1aWxkSW50ZXJmYWNlUHJvcHMoSU5URVJGQUNFX0dMT0JTKSk7XG4gICAgfTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1gKTtcbiAgICBjb25zb2xlLmxvZyhgR2VuZXJhdGUgZG9jcyByZWZlcmVuY2UgZmlsZXMuLi5gKTtcbiAgICBjb25zb2xlLmxvZygnVXNpbmcgVHlwZXNjcmlwdCB2ZXJzaW9uOiAnLCB0cy52ZXJzaW9uKVxuICAgIFxuICAgIGF3YWl0IGdlbmVyYXRlTWV0YUZpbGVzKCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYEdlbmVyYXRlZCBPSy5gKTtcbiAgICBjb25zb2xlLmxvZyhgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1gKTtcbn1cbiJdLCJuYW1lcyI6WyJvcHRpb25zIiwiY29uc29sZSIsImxvZyIsInJlcGVhdCIsInRzIiwidmVyc2lvbiIsImdlbmVyYXRlRmlsZSIsIm91dHB1dCIsInN1Y2Nlc3MiLCJlIiwiZXJyb3IiLCJ3b3Jrc3BhY2VSb290IiwicHJvY2VzcyIsImN3ZCIsImdyaWRPcHNGaWxlIiwiY29sRGVmRmlsZSIsImZpbHRlckZpbGUiLCJncmlkQXBpRmlsZSIsImNvbHVtbkZpbGUiLCJyb3dOb2RlRmlsZSIsImRpc3RGb2xkZXIiLCJJTlRFUkZBQ0VfR0xPQlMiLCJpbnB1dEdsb2IiLCJnZW5lcmF0ZU1ldGFGaWxlcyIsIndyaXRlSlNPTkZpbGUiLCJnZXRHcmlkT3B0aW9ucyIsImdldEdyaWRBcGkiLCJnZXRSb3dOb2RlIiwiZ2V0Q29sdW1uT3B0aW9ucyIsImdldENvbHVtbiIsImdldEludGVyZmFjZXMiLCJidWlsZEludGVyZmFjZVByb3BzIl0sIm1hcHBpbmdzIjoiQUFBQSw2QkFBNkI7Ozs7K0JBYTdCOzs7ZUFBQTs7OztxRUFaZTtnQ0FFMEI7NENBQ007QUFTaEMsZUFBZixTQUErQkEsT0FBd0I7SUFDbkQsSUFBSTtRQUNBQyxRQUFRQyxHQUFHLENBQUMsSUFBSUMsTUFBTSxDQUFDO1FBQ3ZCRixRQUFRQyxHQUFHLENBQUM7UUFDWkQsUUFBUUMsR0FBRyxDQUFDLDhCQUE4QkUsbUJBQUUsQ0FBQ0MsT0FBTztRQUVwRCxNQUFNQyxhQUFhTjtRQUVuQkMsUUFBUUMsR0FBRyxDQUFDLENBQUMsa0NBQWtDLEVBQUVGLFFBQVFPLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEVOLFFBQVFDLEdBQUcsQ0FBQyxJQUFJQyxNQUFNLENBQUM7UUFFdkIsT0FBTztZQUFFSyxTQUFTO1FBQUs7SUFDM0IsRUFBRSxPQUFPQyxHQUFHO1FBQ1JSLFFBQVFTLEtBQUssQ0FBQ0QsR0FBRztZQUFFVDtRQUFRO1FBQzNCLE9BQU87WUFBRVEsU0FBUztRQUFNO0lBQzVCO0FBQ0o7QUFFQSxlQUFlRixhQUFhTixPQUF3QjtJQUNoRCxNQUFNVyxnQkFBZ0JDLFFBQVFDLEdBQUc7SUFDakMsTUFBTUMsY0FBY0gsZ0JBQWdCO0lBQ3BDLE1BQU1JLGFBQWFKLGdCQUFnQjtJQUNuQyxNQUFNSyxhQUFhTCxnQkFBaUI7SUFDcEMsTUFBTU0sY0FBY04sZ0JBQWlCO0lBQ3JDLE1BQU1PLGFBQWFQLGdCQUFpQjtJQUNwQyxNQUFNUSxjQUFjUixnQkFBaUI7SUFFckMsTUFBTVMsYUFBYVQsZ0JBQWdCLE1BQU1YLFFBQVFPLE1BQU07SUFFdkQscURBQXFEO0lBQ3JELE1BQU1jLGtCQUFrQjtXQUNqQkMsSUFBQUEseUJBQVMsRUFBQ1gsZ0JBQWdCO1dBQzFCVyxJQUFBQSx5QkFBUyxFQUFDWCxnQkFBZ0I7V0FDMUJXLElBQUFBLHlCQUFTLEVBQUNYLGdCQUFnQjtXQUMxQlcsSUFBQUEseUJBQVMsRUFBQ1gsZ0JBQWdCO1dBQzFCVyxJQUFBQSx5QkFBUyxFQUFDWCxnQkFBZ0I7V0FDMUJXLElBQUFBLHlCQUFTLEVBQUNYLGdCQUFnQjtLQUNoQztJQUVELE1BQU1ZLG9CQUFvQjtRQUN0QixNQUFNQyxJQUFBQSw2QkFBYSxFQUFDSixhQUFhLDJCQUEyQkssSUFBQUEsMENBQWMsRUFBQ1g7UUFDM0UsTUFBTVUsSUFBQUEsNkJBQWEsRUFBQ0osYUFBYSx1QkFBdUJNLElBQUFBLHNDQUFVLEVBQUNUO1FBQ25FLE1BQU1PLElBQUFBLDZCQUFhLEVBQUNKLGFBQWEsdUJBQXVCTyxJQUFBQSxzQ0FBVSxFQUFDUjtRQUNuRSxNQUFNSyxJQUFBQSw2QkFBYSxFQUFDSixhQUFhLDZCQUE2QlEsSUFBQUEsNENBQWdCLEVBQUNiLFlBQVlDO1FBQzNGLE1BQU1RLElBQUFBLDZCQUFhLEVBQUNKLGFBQWEscUJBQXFCUyxJQUFBQSxxQ0FBUyxFQUFDWDtRQUNoRSxNQUFNTSxJQUFBQSw2QkFBYSxFQUFDSixhQUFhLHlCQUF5QlUsSUFBQUEseUNBQWEsRUFBQ1Q7UUFDeEUsTUFBTUcsSUFBQUEsNkJBQWEsRUFBQ0osYUFBYSw2QkFBNkJXLElBQUFBLCtDQUFtQixFQUFDVjtJQUN0RjtJQUVBcEIsUUFBUUMsR0FBRyxDQUFDLENBQUMsZ0ZBQWdGLENBQUM7SUFDOUZELFFBQVFDLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDO0lBQzlDRCxRQUFRQyxHQUFHLENBQUMsOEJBQThCRSxtQkFBRSxDQUFDQyxPQUFPO0lBRXBELE1BQU1rQjtJQUVOdEIsUUFBUUMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO0lBQzNCRCxRQUFRQyxHQUFHLENBQUMsQ0FBQyxnRkFBZ0YsQ0FBQztBQUNsRyJ9