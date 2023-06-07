const cell = {
    getTemplate(c) {
        const { mergeAcross, styleId, data } = c;
        const properties = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvY2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLElBQUksR0FBcUI7SUFDM0IsV0FBVyxDQUFDLENBQVk7UUFDcEIsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sVUFBVSxHQUFzQyxFQUFFLENBQUM7UUFFekQsSUFBSSxXQUFXLEVBQUU7WUFDYixVQUFVLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztTQUN4QztRQUNELElBQUksT0FBTyxFQUFFO1lBQ1QsVUFBVSxDQUFDLE9BQU8sR0FBRyxPQUFpQixDQUFDO1NBQzFDO1FBRUQsT0FBTztZQUNILElBQUksRUFBRSxNQUFNO1lBQ1osVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFFLENBQUM7d0JBQ2pCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEdBQUcsRUFBRSxVQUFVO3FCQUNsQixDQUFDO2FBQ0w7WUFDRCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsTUFBTTtvQkFDWixVQUFVLEVBQUU7d0JBQ1Isa0JBQWtCLEVBQUUsQ0FBQztnQ0FDakIsTUFBTSxFQUFFLEtBQUs7Z0NBQ2IsR0FBRyxFQUFFO29DQUNELElBQUksRUFBRSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsSUFBSTtpQ0FDbkI7NkJBQ0osQ0FBQztxQkFDTDtvQkFDRCxRQUFRLEVBQUUsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUs7aUJBQ3hCLENBQUM7U0FDTCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLElBQUksQ0FBQyJ9