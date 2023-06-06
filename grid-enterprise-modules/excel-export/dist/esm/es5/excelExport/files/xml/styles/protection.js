var protection = {
    getTemplate: function (styleProperties) {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Protected: styleProperties.protection.protected,
                            HideFormula: styleProperties.protection.hideFormula
                        }
                    }]
            }
        };
    }
};
export default protection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL3Byb3RlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsSUFBTSxVQUFVLEdBQXFCO0lBQ2pDLFdBQVcsRUFBWCxVQUFZLGVBQTJCO1FBQ25DLE9BQU87WUFDSCxJQUFJLEVBQUUsWUFBWTtZQUNsQixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUMsQ0FBQzt3QkFDaEIsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFOzRCQUNELFNBQVMsRUFBRSxlQUFlLENBQUMsVUFBVyxDQUFDLFNBQVM7NEJBQ2hELFdBQVcsRUFBRSxlQUFlLENBQUMsVUFBVyxDQUFDLFdBQVc7eUJBQ3ZEO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsVUFBVSxDQUFDIn0=