import numberFormatFactory from './numberFormat';
const numberFormatsFactory = {
    getTemplate(numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(numberFormat => numberFormatFactory.getTemplate(numberFormat))
        };
    }
};
export default numberFormatsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyRm9ybWF0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvbnVtYmVyRm9ybWF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLG1CQUFtQixNQUFNLGdCQUFnQixDQUFDO0FBRWpELE1BQU0sb0JBQW9CLEdBQXVCO0lBQzdDLFdBQVcsQ0FBQyxhQUE2QjtRQUNyQyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxhQUFhLENBQUMsTUFBTTtpQkFDOUI7YUFDSjtZQUNELFFBQVEsRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzdGLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsb0JBQW9CLENBQUMifQ==