import numberFormatFactory from './numberFormat';
var numberFormatsFactory = {
    getTemplate: function (numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(function (numberFormat) { return numberFormatFactory.getTemplate(numberFormat); })
        };
    }
};
export default numberFormatsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyRm9ybWF0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvbnVtYmVyRm9ybWF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLG1CQUFtQixNQUFNLGdCQUFnQixDQUFDO0FBRWpELElBQU0sb0JBQW9CLEdBQXVCO0lBQzdDLFdBQVcsRUFBWCxVQUFZLGFBQTZCO1FBQ3JDLE9BQU87WUFDSCxJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLGFBQWEsQ0FBQyxNQUFNO2lCQUM5QjthQUNKO1lBQ0QsUUFBUSxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBQSxZQUFZLElBQUksT0FBQSxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQTdDLENBQTZDLENBQUM7U0FDN0YsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxvQkFBb0IsQ0FBQyJ9