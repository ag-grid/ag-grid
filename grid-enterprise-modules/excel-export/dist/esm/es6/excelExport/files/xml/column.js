const column = {
    getTemplate(c) {
        const { width } = c;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};
export default column;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsTUFBTSxNQUFNLEdBQXFCO0lBQzdCLFdBQVcsQ0FBQyxDQUFjO1FBQ3RCLE1BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEIsT0FBTztZQUNILElBQUksRUFBQyxRQUFRO1lBQ2IsVUFBVSxFQUFDO2dCQUNQLGtCQUFrQixFQUFFLENBQUM7d0JBQ2pCLE1BQU0sRUFBQyxLQUFLO3dCQUNaLEdBQUcsRUFBRTs0QkFDRCxLQUFLLEVBQUUsS0FBSzt5QkFDZjtxQkFDSixDQUFDO2FBQ0w7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLE1BQU0sQ0FBQyJ9