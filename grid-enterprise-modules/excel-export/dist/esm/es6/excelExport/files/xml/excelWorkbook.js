const excelWorkbook = {
    getTemplate() {
        return {
            name: "ExcelWorkbook",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:excel"
                }
            },
            children: [{
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowWidth",
                    textNode: "15135"
                }, {
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowTopX",
                    textNode: "120"
                }, {
                    name: "WindowTopY",
                    textNode: "45"
                }, {
                    name: "ProtectStructure",
                    textNode: "False"
                }, {
                    name: "ProtectWindow",
                    textNode: "False"
                }]
        };
    }
};
export default excelWorkbook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxXb3JrYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvZXhjZWxXb3JrYm9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLGFBQWEsR0FBcUI7SUFDcEMsV0FBVztRQUNQLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSx3Q0FBd0M7aUJBQ2xEO2FBQ0o7WUFDRCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsY0FBYztvQkFDcEIsUUFBUSxFQUFFLE1BQU07aUJBQ25CLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLFFBQVEsRUFBRSxPQUFPO2lCQUNwQixFQUFFO29CQUNDLElBQUksRUFBRSxjQUFjO29CQUNwQixRQUFRLEVBQUUsTUFBTTtpQkFDbkIsRUFBRTtvQkFDQyxJQUFJLEVBQUUsWUFBWTtvQkFDbEIsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLFFBQVEsRUFBRSxJQUFJO2lCQUNqQixFQUFFO29CQUNDLElBQUksRUFBRSxrQkFBa0I7b0JBQ3hCLFFBQVEsRUFBRSxPQUFPO2lCQUVwQixFQUFFO29CQUNDLElBQUksRUFBRSxlQUFlO29CQUNyQixRQUFRLEVBQUUsT0FBTztpQkFDcEIsQ0FBQztTQUNMLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsYUFBYSxDQUFDIn0=