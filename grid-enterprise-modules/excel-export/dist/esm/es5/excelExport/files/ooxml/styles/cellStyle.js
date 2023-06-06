var borderFactory = {
    getTemplate: function (cellStyle) {
        var builtinId = cellStyle.builtinId, name = cellStyle.name, xfId = cellStyle.xfId;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId: builtinId,
                    name: name,
                    xfId: xfId
                }
            }
        };
    }
};
export default borderFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0eWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9jZWxsU3R5bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxhQUFhLEdBQXVCO0lBQ3RDLFdBQVcsRUFBWCxVQUFZLFNBQW9CO1FBQ3JCLElBQUEsU0FBUyxHQUFnQixTQUFTLFVBQXpCLEVBQUUsSUFBSSxHQUFVLFNBQVMsS0FBbkIsRUFBRSxJQUFJLEdBQUksU0FBUyxLQUFiLENBQWM7UUFFMUMsT0FBTztZQUNILElBQUksRUFBRSxXQUFXO1lBQ2pCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osU0FBUyxXQUFBO29CQUNULElBQUksTUFBQTtvQkFDSixJQUFJLE1BQUE7aUJBQ1A7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsYUFBYSxDQUFDIn0=