var numberFormat = {
    getTemplate: function (styleProperties) {
        var format = styleProperties.numberFormat.format;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Format: format
                        }
                    }]
            }
        };
    }
};
export default numberFormat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyRm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9zdHlsZXMvbnVtYmVyRm9ybWF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLElBQU0sWUFBWSxHQUFxQjtJQUNuQyxXQUFXLEVBQVgsVUFBWSxlQUEyQjtRQUMzQixJQUFBLE1BQU0sR0FBSyxlQUFlLENBQUMsWUFBYSxPQUFsQyxDQUFtQztRQUNqRCxPQUFPO1lBQ0gsSUFBSSxFQUFFLGNBQWM7WUFDcEIsVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFDLENBQUM7d0JBQ2hCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEdBQUcsRUFBRTs0QkFDRCxNQUFNLEVBQUUsTUFBTTt5QkFDakI7cUJBQ0osQ0FBQzthQUNMO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxZQUFZLENBQUMifQ==