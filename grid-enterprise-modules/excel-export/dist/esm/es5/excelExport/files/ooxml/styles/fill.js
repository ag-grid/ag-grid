var fillFactory = {
    getTemplate: function (fill) {
        var patternType = fill.patternType, fgTheme = fill.fgTheme, fgTint = fill.fgTint, fgRgb = fill.fgRgb, bgRgb = fill.bgRgb, bgIndexed = fill.bgIndexed;
        var pf = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType: patternType
                }
            }
        };
        if (fgTheme || fgTint || fgRgb) {
            pf.children = [{
                    name: 'fgColor',
                    properties: {
                        rawMap: {
                            theme: fgTheme,
                            tint: fgTint,
                            rgb: fgRgb
                        }
                    }
                }];
        }
        if (bgIndexed || bgRgb) {
            if (!pf.children) {
                pf.children = [];
            }
            pf.children.push({
                name: 'bgColor',
                properties: {
                    rawMap: {
                        indexed: bgIndexed,
                        rgb: bgRgb
                    }
                }
            });
        }
        return {
            name: "fill",
            children: [pf]
        };
    }
};
export default fillFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvZmlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxJQUFNLFdBQVcsR0FBdUI7SUFDcEMsV0FBVyxFQUFYLFVBQVksSUFBVTtRQUNYLElBQUEsV0FBVyxHQUE4QyxJQUFJLFlBQWxELEVBQUUsT0FBTyxHQUFxQyxJQUFJLFFBQXpDLEVBQUUsTUFBTSxHQUE2QixJQUFJLE9BQWpDLEVBQUUsS0FBSyxHQUFzQixJQUFJLE1BQTFCLEVBQUUsS0FBSyxHQUFlLElBQUksTUFBbkIsRUFBRSxTQUFTLEdBQUksSUFBSSxVQUFSLENBQVM7UUFDckUsSUFBTSxFQUFFLEdBQWU7WUFDbkIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixXQUFXLGFBQUE7aUJBQ2Q7YUFDSjtTQUNKLENBQUM7UUFFRixJQUFJLE9BQU8sSUFBSSxNQUFNLElBQUksS0FBSyxFQUFFO1lBQzVCLEVBQUUsQ0FBQyxRQUFRLEdBQUcsQ0FBQztvQkFDWCxJQUFJLEVBQUUsU0FBUztvQkFDZixVQUFVLEVBQUU7d0JBQ1IsTUFBTSxFQUFFOzRCQUNKLEtBQUssRUFBRSxPQUFPOzRCQUNkLElBQUksRUFBRSxNQUFNOzRCQUNaLEdBQUcsRUFBRSxLQUFLO3lCQUNiO3FCQUNKO2lCQUNKLENBQUMsQ0FBQztTQUNOO1FBRUQsSUFBSSxTQUFTLElBQUksS0FBSyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO2dCQUFFLEVBQUUsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO2FBQUU7WUFDdkMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2IsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsVUFBVSxFQUFFO29CQUNSLE1BQU0sRUFBRTt3QkFDSixPQUFPLEVBQUUsU0FBUzt3QkFDbEIsR0FBRyxFQUFFLEtBQUs7cUJBQ2I7aUJBQ0o7YUFDSixDQUFDLENBQUM7U0FDTjtRQUVELE9BQU87WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUNqQixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFdBQVcsQ0FBQyJ9