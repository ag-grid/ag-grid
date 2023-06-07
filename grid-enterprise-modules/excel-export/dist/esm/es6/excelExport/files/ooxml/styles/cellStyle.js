const borderFactory = {
    getTemplate(cellStyle) {
        const { builtinId, name, xfId } = cellStyle;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId
                }
            }
        };
    }
};
export default borderFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0eWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9jZWxsU3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxhQUFhLEdBQXVCO0lBQ3RDLFdBQVcsQ0FBQyxTQUFvQjtRQUM1QixNQUFNLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsR0FBRyxTQUFTLENBQUM7UUFFMUMsT0FBTztZQUNILElBQUksRUFBRSxXQUFXO1lBQ2pCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osU0FBUztvQkFDVCxJQUFJO29CQUNKLElBQUk7aUJBQ1A7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsYUFBYSxDQUFDIn0=