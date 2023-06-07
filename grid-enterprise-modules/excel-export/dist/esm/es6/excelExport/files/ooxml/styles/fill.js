const fillFactory = {
    getTemplate(fill) {
        const { patternType, fgTheme, fgTint, fgRgb, bgRgb, bgIndexed } = fill;
        const pf = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvZmlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLFdBQVcsR0FBdUI7SUFDcEMsV0FBVyxDQUFDLElBQVU7UUFDbEIsTUFBTSxFQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JFLE1BQU0sRUFBRSxHQUFlO1lBQ25CLElBQUksRUFBRSxhQUFhO1lBQ25CLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osV0FBVztpQkFDZDthQUNKO1NBQ0osQ0FBQztRQUVGLElBQUksT0FBTyxJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUU7WUFDNUIsRUFBRSxDQUFDLFFBQVEsR0FBRyxDQUFDO29CQUNYLElBQUksRUFBRSxTQUFTO29CQUNmLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osS0FBSyxFQUFFLE9BQU87NEJBQ2QsSUFBSSxFQUFFLE1BQU07NEJBQ1osR0FBRyxFQUFFLEtBQUs7eUJBQ2I7cUJBQ0o7aUJBQ0osQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFJLFNBQVMsSUFBSSxLQUFLLEVBQUU7WUFDcEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQUUsRUFBRSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7YUFBRTtZQUN2QyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDYixJQUFJLEVBQUUsU0FBUztnQkFDZixVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxTQUFTO3dCQUNsQixHQUFHLEVBQUUsS0FBSztxQkFDYjtpQkFDSjthQUNKLENBQUMsQ0FBQztTQUNOO1FBRUQsT0FBTztZQUNILElBQUksRUFBRSxNQUFNO1lBQ1osUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDO1NBQ2pCLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsV0FBVyxDQUFDIn0=