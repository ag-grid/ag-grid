var font = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.font, bold = _a.bold, fontName = _a.fontName, italic = _a.italic, color = _a.color, outline = _a.outline, shadow = _a.shadow, size = _a.size, strikeThrough = _a.strikeThrough, underline = _a.underline, verticalAlign = _a.verticalAlign, charSet = _a.charSet, family = _a.family;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL2ZvbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxJQUFJLEdBQXFCO0lBQzNCLFdBQVcsRUFBWCxVQUFZLGVBQTJCO1FBQzdCLElBQUEsS0FhRixlQUFlLENBQUMsSUFBSyxFQVpyQixJQUFJLFVBQUEsRUFDSixRQUFRLGNBQUEsRUFDUixNQUFNLFlBQUEsRUFDTixLQUFLLFdBQUEsRUFDTCxPQUFPLGFBQUEsRUFDUCxNQUFNLFlBQUEsRUFDTixJQUFJLFVBQUEsRUFDSixhQUFhLG1CQUFBLEVBQ2IsU0FBUyxlQUFBLEVBQ1QsYUFBYSxtQkFBQSxFQUNiLE9BQU8sYUFBQSxFQUNQLE1BQU0sWUFDZSxDQUFDO1FBQzFCLE9BQU87WUFDSCxJQUFJLEVBQUUsTUFBTTtZQUNaLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUU7NEJBQ0QsSUFBSSxFQUFFLElBQUk7NEJBQ1YsUUFBUSxFQUFFLFFBQVE7NEJBQ2xCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLEtBQUssRUFBRSxLQUFLOzRCQUNaLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixNQUFNLEVBQUUsTUFBTTs0QkFDZCxJQUFJLEVBQUUsSUFBSTs0QkFDVixhQUFhLEVBQUUsYUFBYTs0QkFDNUIsU0FBUyxFQUFFLFNBQVM7NEJBQ3BCLGFBQWEsRUFBRSxhQUFhO3lCQUMvQjtxQkFDSixFQUFFO3dCQUNDLE1BQU0sRUFBRSxJQUFJO3dCQUNaLEdBQUcsRUFBRTs0QkFDRCxPQUFPLEVBQUUsT0FBTzs0QkFDaEIsTUFBTSxFQUFFLE1BQU07eUJBQ2pCO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsSUFBSSxDQUFDIn0=