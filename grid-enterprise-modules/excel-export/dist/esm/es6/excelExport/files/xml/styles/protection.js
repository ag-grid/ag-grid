const protection = {
    getTemplate(styleProperties) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL3Byb3RlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsTUFBTSxVQUFVLEdBQXFCO0lBQ2pDLFdBQVcsQ0FBQyxlQUEyQjtRQUNuQyxPQUFPO1lBQ0gsSUFBSSxFQUFFLFlBQVk7WUFDbEIsVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFDLENBQUM7d0JBQ2hCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEdBQUcsRUFBRTs0QkFDRCxTQUFTLEVBQUUsZUFBZSxDQUFDLFVBQVcsQ0FBQyxTQUFTOzRCQUNoRCxXQUFXLEVBQUUsZUFBZSxDQUFDLFVBQVcsQ0FBQyxXQUFXO3lCQUN2RDtxQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFVBQVUsQ0FBQyJ9