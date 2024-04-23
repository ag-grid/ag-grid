"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    batchExecutor: function() {
        return batchExecutor;
    },
    inputGlob: function() {
        return inputGlob;
    },
    parseFile: function() {
        return parseFile;
    },
    readFile: function() {
        return readFile;
    },
    readJSONFile: function() {
        return readJSONFile;
    },
    writeFile: function() {
        return writeFile;
    },
    writeJSONFile: function() {
        return writeJSONFile;
    }
});
const _extends = require("@swc/helpers/_/_extends");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _fs = require("fs");
const _promises = /*#__PURE__*/ _interop_require_wildcard._(require("fs/promises"));
const _glob = /*#__PURE__*/ _interop_require_wildcard._(require("glob"));
const _path = /*#__PURE__*/ _interop_require_wildcard._(require("path"));
const _typescript = /*#__PURE__*/ _interop_require_wildcard._(require("typescript"));
async function exists(filePath) {
    try {
        var _this;
        return (_this = await _promises.stat(filePath)) == null ? void 0 : _this.isFile();
    } catch (e) {
        return false;
    }
}
async function readJSONFile(filePath) {
    return await exists(filePath) ? JSON.parse(await _promises.readFile(filePath, 'utf-8')) : null;
}
async function readFile(filePath) {
    return await exists(filePath) ? await _promises.readFile(filePath, 'utf-8') : null;
}
async function writeJSONFile(filePath, data, indent = 2) {
    const dataContent = JSON.stringify(data, null, indent);
    await writeFile(filePath, dataContent);
}
async function writeFile(filePath, newContent) {
    const outputDir = _path.dirname(filePath);
    await _promises.mkdir(outputDir, {
        recursive: true
    });
    await _promises.writeFile(filePath, newContent);
}
function parseFile(filePath) {
    const contents = (0, _fs.readFileSync)(filePath, 'utf8');
    return _typescript.createSourceFile('tempFile.ts', contents, _typescript.ScriptTarget.Latest, true);
}
function inputGlob(fullPath) {
    return _glob.sync(`${fullPath}/**/*.ts`, {
        ignore: [
            `${fullPath}/**/*.test.ts`,
            `${fullPath}/**/*.spec.ts`
        ]
    });
}
function batchExecutor(executor) {
    return async function*(_taskGraph, inputs, overrides, context) {
        const tasks = Object.keys(inputs);
        for(let taskIndex = 0; taskIndex < tasks.length; taskIndex++){
            const task = tasks[taskIndex++];
            const inputOptions = inputs[task];
            let success = false;
            let terminalOutput = '';
            try {
                await executor(_extends._({}, inputOptions, overrides), context);
                success = true;
            } catch (e) {
                terminalOutput += `${e}`;
            }
            yield {
                task,
                result: {
                    success,
                    terminalOutput
                }
            };
        }
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leGVjdXRvcnMtdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFeGVjdXRvckNvbnRleHQsIFRhc2tHcmFwaCB9IGZyb20gJ0BueC9kZXZraXQnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMvcHJvbWlzZXMnO1xuaW1wb3J0ICogYXMgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuZXhwb3J0IHR5cGUgVGFza1Jlc3VsdCA9IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIHRlcm1pbmFsT3V0cHV0OiBzdHJpbmc7XG4gICAgc3RhcnRUaW1lPzogbnVtYmVyO1xuICAgIGVuZFRpbWU/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBCYXRjaEV4ZWN1dG9yVGFza1Jlc3VsdCA9IHtcbiAgICB0YXNrOiBzdHJpbmc7XG4gICAgcmVzdWx0OiBUYXNrUmVzdWx0O1xufTtcblxuYXN5bmMgZnVuY3Rpb24gZXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGZzLnN0YXQoZmlsZVBhdGgpKT8uaXNGaWxlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEpTT05GaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKGF3YWl0IGV4aXN0cyhmaWxlUGF0aCkpID8gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0Zi04JykpIDogbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKGF3YWl0IGV4aXN0cyhmaWxlUGF0aCkpID8gYXdhaXQgZnMucmVhZEZpbGUoZmlsZVBhdGgsICd1dGYtOCcpIDogbnVsbDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlSlNPTkZpbGUoZmlsZVBhdGg6IHN0cmluZywgZGF0YTogdW5rbm93biwgaW5kZW50ID0gMikge1xuICAgIGNvbnN0IGRhdGFDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgaW5kZW50KTtcbiAgICBhd2FpdCB3cml0ZUZpbGUoZmlsZVBhdGgsIGRhdGFDb250ZW50KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlRmlsZShmaWxlUGF0aDogc3RyaW5nLCBuZXdDb250ZW50OiBzdHJpbmcgfCBCdWZmZXIpIHtcbiAgICBjb25zdCBvdXRwdXREaXIgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xuICAgIGF3YWl0IGZzLm1rZGlyKG91dHB1dERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKGZpbGVQYXRoLCBuZXdDb250ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3QgY29udGVudHMgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUoJ3RlbXBGaWxlLnRzJywgY29udGVudHMsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5wdXRHbG9iKGZ1bGxQYXRoOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2xvYi5zeW5jKGAke2Z1bGxQYXRofS8qKi8qLnRzYCwge1xuICAgICAgICBpZ25vcmU6IFtgJHtmdWxsUGF0aH0vKiovKi50ZXN0LnRzYCwgYCR7ZnVsbFBhdGh9LyoqLyouc3BlYy50c2BdLFxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmF0Y2hFeGVjdXRvcjxFeGVjdXRvck9wdGlvbnM+KFxuICAgIGV4ZWN1dG9yOiAob3B0czogRXhlY3V0b3JPcHRpb25zLCBjdHg6IEV4ZWN1dG9yQ29udGV4dCkgPT4gUHJvbWlzZTx2b2lkPlxuKSB7XG4gICAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uKiAoXG4gICAgICAgIF90YXNrR3JhcGg6IFRhc2tHcmFwaCxcbiAgICAgICAgaW5wdXRzOiBSZWNvcmQ8c3RyaW5nLCBFeGVjdXRvck9wdGlvbnM+LFxuICAgICAgICBvdmVycmlkZXM6IEV4ZWN1dG9yT3B0aW9ucyxcbiAgICAgICAgY29udGV4dDogRXhlY3V0b3JDb250ZXh0XG4gICAgKTogQXN5bmNHZW5lcmF0b3I8QmF0Y2hFeGVjdXRvclRhc2tSZXN1bHQsIGFueSwgdW5rbm93bj4ge1xuICAgICAgICBjb25zdCB0YXNrcyA9IE9iamVjdC5rZXlzKGlucHV0cyk7XG5cbiAgICAgICAgZm9yIChsZXQgdGFza0luZGV4ID0gMDsgdGFza0luZGV4IDwgdGFza3MubGVuZ3RoOyB0YXNrSW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRhc2tzW3Rhc2tJbmRleCsrXTtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0T3B0aW9ucyA9IGlucHV0c1t0YXNrXTtcblxuICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCB0ZXJtaW5hbE91dHB1dCA9ICcnO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRvcih7IC4uLmlucHV0T3B0aW9ucywgLi4ub3ZlcnJpZGVzIH0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRlcm1pbmFsT3V0cHV0ICs9IGAke2V9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgeWllbGQgeyB0YXNrLCByZXN1bHQ6IHsgc3VjY2VzcywgdGVybWluYWxPdXRwdXQgfSB9O1xuICAgICAgICB9XG4gICAgfTtcbn1cbiJdLCJuYW1lcyI6WyJiYXRjaEV4ZWN1dG9yIiwiaW5wdXRHbG9iIiwicGFyc2VGaWxlIiwicmVhZEZpbGUiLCJyZWFkSlNPTkZpbGUiLCJ3cml0ZUZpbGUiLCJ3cml0ZUpTT05GaWxlIiwiZXhpc3RzIiwiZmlsZVBhdGgiLCJmcyIsInN0YXQiLCJpc0ZpbGUiLCJlIiwiSlNPTiIsInBhcnNlIiwiZGF0YSIsImluZGVudCIsImRhdGFDb250ZW50Iiwic3RyaW5naWZ5IiwibmV3Q29udGVudCIsIm91dHB1dERpciIsInBhdGgiLCJkaXJuYW1lIiwibWtkaXIiLCJyZWN1cnNpdmUiLCJjb250ZW50cyIsInJlYWRGaWxlU3luYyIsInRzIiwiY3JlYXRlU291cmNlRmlsZSIsIlNjcmlwdFRhcmdldCIsIkxhdGVzdCIsImZ1bGxQYXRoIiwiZ2xvYiIsInN5bmMiLCJpZ25vcmUiLCJleGVjdXRvciIsIl90YXNrR3JhcGgiLCJpbnB1dHMiLCJvdmVycmlkZXMiLCJjb250ZXh0IiwidGFza3MiLCJPYmplY3QiLCJrZXlzIiwidGFza0luZGV4IiwibGVuZ3RoIiwidGFzayIsImlucHV0T3B0aW9ucyIsInN1Y2Nlc3MiLCJ0ZXJtaW5hbE91dHB1dCIsInJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUF5RGdCQSxhQUFhO2VBQWJBOztJQU5BQyxTQUFTO2VBQVRBOztJQUxBQyxTQUFTO2VBQVRBOztJQWZNQyxRQUFRO2VBQVJBOztJQUpBQyxZQUFZO2VBQVpBOztJQWFBQyxTQUFTO2VBQVRBOztJQUxBQyxhQUFhO2VBQWJBOzs7OztvQkFsQ087b0VBQ1Q7Z0VBQ0U7Z0VBQ0E7c0VBQ0Y7QUFjcEIsZUFBZUMsT0FBT0MsUUFBZ0I7SUFDbEMsSUFBSTtZQUNRO1FBQVIsUUFBUSxRQUFBLE1BQU1DLFVBQUdDLElBQUksQ0FBQ0YsOEJBQWYsQUFBQyxNQUEwQkcsTUFBTTtJQUM1QyxFQUFFLE9BQU9DLEdBQUc7UUFDUixPQUFPO0lBQ1g7QUFDSjtBQUVPLGVBQWVSLGFBQWFJLFFBQWdCO0lBQy9DLE9BQU8sQUFBQyxNQUFNRCxPQUFPQyxZQUFhSyxLQUFLQyxLQUFLLENBQUMsTUFBTUwsVUFBR04sUUFBUSxDQUFDSyxVQUFVLFlBQVk7QUFDekY7QUFFTyxlQUFlTCxTQUFTSyxRQUFnQjtJQUMzQyxPQUFPLEFBQUMsTUFBTUQsT0FBT0MsWUFBYSxNQUFNQyxVQUFHTixRQUFRLENBQUNLLFVBQVUsV0FBVztBQUM3RTtBQUVPLGVBQWVGLGNBQWNFLFFBQWdCLEVBQUVPLElBQWEsRUFBRUMsU0FBUyxDQUFDO0lBQzNFLE1BQU1DLGNBQWNKLEtBQUtLLFNBQVMsQ0FBQ0gsTUFBTSxNQUFNQztJQUMvQyxNQUFNWCxVQUFVRyxVQUFVUztBQUM5QjtBQUVPLGVBQWVaLFVBQVVHLFFBQWdCLEVBQUVXLFVBQTJCO0lBQ3pFLE1BQU1DLFlBQVlDLE1BQUtDLE9BQU8sQ0FBQ2Q7SUFDL0IsTUFBTUMsVUFBR2MsS0FBSyxDQUFDSCxXQUFXO1FBQUVJLFdBQVc7SUFBSztJQUM1QyxNQUFNZixVQUFHSixTQUFTLENBQUNHLFVBQVVXO0FBQ2pDO0FBRU8sU0FBU2pCLFVBQVVNLFFBQWdCO0lBQ3RDLE1BQU1pQixXQUFXQyxJQUFBQSxnQkFBWSxFQUFDbEIsVUFBVTtJQUN4QyxPQUFPbUIsWUFBR0MsZ0JBQWdCLENBQUMsZUFBZUgsVUFBVUUsWUFBR0UsWUFBWSxDQUFDQyxNQUFNLEVBQUU7QUFDaEY7QUFFTyxTQUFTN0IsVUFBVThCLFFBQWdCO0lBQ3RDLE9BQU9DLE1BQUtDLElBQUksQ0FBQyxDQUFDLEVBQUVGLFNBQVMsUUFBUSxDQUFDLEVBQUU7UUFDcENHLFFBQVE7WUFBQyxDQUFDLEVBQUVILFNBQVMsYUFBYSxDQUFDO1lBQUUsQ0FBQyxFQUFFQSxTQUFTLGFBQWEsQ0FBQztTQUFDO0lBQ3BFO0FBQ0o7QUFFTyxTQUFTL0IsY0FDWm1DLFFBQXdFO0lBRXhFLE9BQU8sZ0JBQ0hDLFVBQXFCLEVBQ3JCQyxNQUF1QyxFQUN2Q0MsU0FBMEIsRUFDMUJDLE9BQXdCO1FBRXhCLE1BQU1DLFFBQVFDLE9BQU9DLElBQUksQ0FBQ0w7UUFFMUIsSUFBSyxJQUFJTSxZQUFZLEdBQUdBLFlBQVlILE1BQU1JLE1BQU0sRUFBRUQsWUFBYTtZQUMzRCxNQUFNRSxPQUFPTCxLQUFLLENBQUNHLFlBQVk7WUFDL0IsTUFBTUcsZUFBZVQsTUFBTSxDQUFDUSxLQUFLO1lBRWpDLElBQUlFLFVBQVU7WUFDZCxJQUFJQyxpQkFBaUI7WUFDckIsSUFBSTtnQkFDQSxNQUFNYixTQUFTLGVBQUtXLGNBQWlCUixZQUFhQztnQkFDbERRLFVBQVU7WUFDZCxFQUFFLE9BQU9uQyxHQUFHO2dCQUNSb0Msa0JBQWtCLENBQUMsRUFBRXBDLEVBQUUsQ0FBQztZQUM1QjtZQUVBLE1BQU07Z0JBQUVpQztnQkFBTUksUUFBUTtvQkFBRUY7b0JBQVNDO2dCQUFlO1lBQUU7UUFDdEQ7SUFDSjtBQUNKIn0=