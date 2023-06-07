const numberFormat = {
    getTemplate(styleProperties) {
        const { format } = styleProperties.numberFormat;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Format: format
                        }
                    }]
            }
        };
    }
};
export default numberFormat;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyRm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9zdHlsZXMvbnVtYmVyRm9ybWF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sWUFBWSxHQUFxQjtJQUNuQyxXQUFXLENBQUMsZUFBMkI7UUFDbkMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLGVBQWUsQ0FBQyxZQUFhLENBQUM7UUFDakQsT0FBTztZQUNILElBQUksRUFBRSxjQUFjO1lBQ3BCLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsS0FBSzt3QkFDYixHQUFHLEVBQUU7NEJBQ0QsTUFBTSxFQUFFLE1BQU07eUJBQ2pCO3FCQUNKLENBQUM7YUFDTDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsWUFBWSxDQUFDIn0=