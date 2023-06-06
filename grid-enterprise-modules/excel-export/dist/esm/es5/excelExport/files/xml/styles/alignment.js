var alignment = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.alignment, vertical = _a.vertical, horizontal = _a.horizontal, indent = _a.indent, readingOrder = _a.readingOrder, rotate = _a.rotate, shrinkToFit = _a.shrinkToFit, verticalText = _a.verticalText, wrapText = _a.wrapText;
        return {
            name: 'Alignment',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Vertical: vertical,
                            Horizontal: horizontal,
                            Indent: indent,
                            ReadingOrder: readingOrder,
                            Rotate: rotate,
                            ShrinkToFit: shrinkToFit,
                            VerticalText: verticalText,
                            WrapText: wrapText
                        }
                    }]
            }
        };
    }
};
export default alignment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9zdHlsZXMvYWxpZ25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQU0sU0FBUyxHQUFxQjtJQUNoQyxXQUFXLEVBQVgsVUFBWSxlQUEyQjtRQUM3QixJQUFBLEtBU0YsZUFBZSxDQUFDLFNBQVUsRUFSMUIsUUFBUSxjQUFBLEVBQ1IsVUFBVSxnQkFBQSxFQUNWLE1BQU0sWUFBQSxFQUNOLFlBQVksa0JBQUEsRUFDWixNQUFNLFlBQUEsRUFDTixXQUFXLGlCQUFBLEVBQ1gsWUFBWSxrQkFBQSxFQUNaLFFBQVEsY0FDa0IsQ0FBQztRQUMvQixPQUFPO1lBQ0gsSUFBSSxFQUFFLFdBQVc7WUFDakIsVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFDLENBQUM7d0JBQ2hCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEdBQUcsRUFBRTs0QkFDRCxRQUFRLEVBQUUsUUFBUTs0QkFDbEIsVUFBVSxFQUFFLFVBQVU7NEJBQ3RCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLFlBQVksRUFBRSxZQUFZOzRCQUMxQixNQUFNLEVBQUUsTUFBTTs0QkFDZCxXQUFXLEVBQUUsV0FBVzs0QkFDeEIsWUFBWSxFQUFDLFlBQVk7NEJBQ3pCLFFBQVEsRUFBRSxRQUFRO3lCQUNyQjtxQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFNBQVMsQ0FBQyJ9