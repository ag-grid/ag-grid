const font = {
    getTemplate(styleProperties) {
        const { bold, fontName, italic, color, outline, shadow, size, strikeThrough, underline, verticalAlign, charSet, family, } = styleProperties.font;
        return {
            name: "Font",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Bold: bold,
                            FontName: fontName,
                            Italic: italic,
                            Color: color,
                            Outline: outline,
                            Shadow: shadow,
                            Size: size,
                            StrikeThrough: strikeThrough,
                            Underline: underline,
                            VerticalAlign: verticalAlign
                        }
                    }, {
                        prefix: "x:",
                        map: {
                            CharSet: charSet,
                            Family: family
                        }
                    }]
            }
        };
    }
};
export default font;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL2ZvbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxJQUFJLEdBQXFCO0lBQzNCLFdBQVcsQ0FBQyxlQUEyQjtRQUNuQyxNQUFNLEVBQ0YsSUFBSSxFQUNKLFFBQVEsRUFDUixNQUFNLEVBQ04sS0FBSyxFQUNMLE9BQU8sRUFDUCxNQUFNLEVBQ04sSUFBSSxFQUNKLGFBQWEsRUFDYixTQUFTLEVBQ1QsYUFBYSxFQUNiLE9BQU8sRUFDUCxNQUFNLEdBQ1QsR0FBRyxlQUFlLENBQUMsSUFBSyxDQUFDO1FBQzFCLE9BQU87WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUU7NEJBQ0QsSUFBSSxFQUFFLElBQUk7NEJBQ1YsUUFBUSxFQUFFLFFBQVE7NEJBQ2xCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLEtBQUssRUFBRSxLQUFLOzRCQUNaLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixNQUFNLEVBQUUsTUFBTTs0QkFDZCxJQUFJLEVBQUUsSUFBSTs0QkFDVixhQUFhLEVBQUUsYUFBYTs0QkFDNUIsU0FBUyxFQUFFLFNBQVM7NEJBQ3BCLGFBQWEsRUFBRSxhQUFhO3lCQUMvQjtxQkFDSixFQUFFO3dCQUNDLE1BQU0sRUFBRSxJQUFJO3dCQUNaLEdBQUcsRUFBRTs0QkFDRCxPQUFPLEVBQUUsT0FBTzs0QkFDaEIsTUFBTSxFQUFFLE1BQU07eUJBQ2pCO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsSUFBSSxDQUFDIn0=