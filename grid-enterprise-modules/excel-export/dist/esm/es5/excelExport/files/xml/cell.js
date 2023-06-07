var cell = {
    getTemplate: function (c) {
        var mergeAcross = c.mergeAcross, styleId = c.styleId, data = c.data;
        var properties = {};
        if (mergeAcross) {
            properties.MergeAcross = mergeAcross;
        }
        if (styleId) {
            properties.StyleID = styleId;
        }
        return {
            name: "Cell",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: properties
                    }]
            },
            children: [{
                    name: "Data",
                    properties: {
                        prefixedAttributes: [{
                                prefix: "ss:",
                                map: {
                                    Type: data === null || data === void 0 ? void 0 : data.type
                                }
                            }]
                    },
                    textNode: data === null || data === void 0 ? void 0 : data.value
                }]
        };
    }
};
export default cell;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvY2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLElBQUksR0FBcUI7SUFDM0IsV0FBVyxFQUFYLFVBQVksQ0FBWTtRQUNaLElBQUEsV0FBVyxHQUFvQixDQUFDLFlBQXJCLEVBQUUsT0FBTyxHQUFXLENBQUMsUUFBWixFQUFFLElBQUksR0FBSyxDQUFDLEtBQU4sQ0FBTztRQUN6QyxJQUFNLFVBQVUsR0FBc0MsRUFBRSxDQUFDO1FBRXpELElBQUksV0FBVyxFQUFFO1lBQ2IsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7U0FDeEM7UUFDRCxJQUFJLE9BQU8sRUFBRTtZQUNULFVBQVUsQ0FBQyxPQUFPLEdBQUcsT0FBaUIsQ0FBQztTQUMxQztRQUVELE9BQU87WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBRSxDQUFDO3dCQUNqQixNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUUsVUFBVTtxQkFDbEIsQ0FBQzthQUNMO1lBQ0QsUUFBUSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxFQUFFLE1BQU07b0JBQ1osVUFBVSxFQUFFO3dCQUNSLGtCQUFrQixFQUFFLENBQUM7Z0NBQ2pCLE1BQU0sRUFBRSxLQUFLO2dDQUNiLEdBQUcsRUFBRTtvQ0FDRCxJQUFJLEVBQUUsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLElBQUk7aUNBQ25COzZCQUNKLENBQUM7cUJBQ0w7b0JBQ0QsUUFBUSxFQUFFLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxLQUFLO2lCQUN4QixDQUFDO1NBQ0wsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxJQUFJLENBQUMifQ==