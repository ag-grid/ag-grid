const alignment = {
    getTemplate(styleProperties) {
        const { vertical, horizontal, indent, readingOrder, rotate, shrinkToFit, verticalText, wrapText } = styleProperties.alignment;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9zdHlsZXMvYWxpZ25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sU0FBUyxHQUFxQjtJQUNoQyxXQUFXLENBQUMsZUFBMkI7UUFDbkMsTUFBTSxFQUNGLFFBQVEsRUFDUixVQUFVLEVBQ1YsTUFBTSxFQUNOLFlBQVksRUFDWixNQUFNLEVBQ04sV0FBVyxFQUNYLFlBQVksRUFDWixRQUFRLEVBQ1gsR0FBRyxlQUFlLENBQUMsU0FBVSxDQUFDO1FBQy9CLE9BQU87WUFDSCxJQUFJLEVBQUUsV0FBVztZQUNqQixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUMsQ0FBQzt3QkFDaEIsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFOzRCQUNELFFBQVEsRUFBRSxRQUFROzRCQUNsQixVQUFVLEVBQUUsVUFBVTs0QkFDdEIsTUFBTSxFQUFFLE1BQU07NEJBQ2QsWUFBWSxFQUFFLFlBQVk7NEJBQzFCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLFdBQVcsRUFBRSxXQUFXOzRCQUN4QixZQUFZLEVBQUMsWUFBWTs0QkFDekIsUUFBUSxFQUFFLFFBQVE7eUJBQ3JCO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsU0FBUyxDQUFDIn0=