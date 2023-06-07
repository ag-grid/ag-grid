import { _ } from '@ag-grid-community/core';
const numberFormatFactory = {
    getTemplate(numberFormat) {
        let { formatCode, numFmtId } = numberFormat;
        // excel formulas requires $ to be placed between quotes and symbols to be escaped
        if (formatCode.length) {
            formatCode = _.escapeString(formatCode.replace(/\$/g, '"$"'));
        }
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId
                }
            }
        };
    }
};
export default numberFormatFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyRm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9udW1iZXJGb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFzQixDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUdoRSxNQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxXQUFXLENBQUMsWUFBMEI7UUFDbEMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxZQUFZLENBQUM7UUFFNUMsa0ZBQWtGO1FBQ2xGLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNuQixVQUFVLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBRSxDQUFDO1NBQ2xFO1FBRUQsT0FBTztZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixVQUFVO29CQUNWLFFBQVE7aUJBQ1g7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsbUJBQW1CLENBQUMifQ==