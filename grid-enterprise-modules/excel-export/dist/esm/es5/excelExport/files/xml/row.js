import cell from './cell';
var row = {
    getTemplate: function (r) {
        var cells = r.cells;
        return {
            name: "Row",
            children: cells.map(function (it) { return cell.getTemplate(it); })
        };
    }
};
export default row;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL3htbC9yb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLElBQU0sR0FBRyxHQUFxQjtJQUMxQixXQUFXLEVBQVgsVUFBWSxDQUFXO1FBQ1gsSUFBQSxLQUFLLEdBQUssQ0FBQyxNQUFOLENBQU87UUFFcEIsT0FBTztZQUNILElBQUksRUFBRSxLQUFLO1lBQ1gsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFwQixDQUFvQixDQUFDO1NBQ2xELENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsR0FBRyxDQUFDIn0=