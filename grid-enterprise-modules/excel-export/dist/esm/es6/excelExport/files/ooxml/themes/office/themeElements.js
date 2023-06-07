import colorScheme from './colorScheme';
import fontScheme from './fontScheme';
import formatScheme from './formatScheme';
const themeElements = {
    getTemplate() {
        return {
            name: "a:themeElements",
            children: [
                colorScheme.getTemplate(),
                fontScheme.getTemplate(),
                formatScheme.getTemplate()
            ]
        };
    }
};
export default themeElements;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVFbGVtZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC90aGVtZXMvb2ZmaWNlL3RoZW1lRWxlbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUUxQyxNQUFNLGFBQWEsR0FBdUI7SUFDdEMsV0FBVztRQUVQLE9BQU87WUFDSCxJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLFFBQVEsRUFBRTtnQkFDTixXQUFXLENBQUMsV0FBVyxFQUFFO2dCQUN6QixVQUFVLENBQUMsV0FBVyxFQUFFO2dCQUN4QixZQUFZLENBQUMsV0FBVyxFQUFFO2FBQzdCO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==