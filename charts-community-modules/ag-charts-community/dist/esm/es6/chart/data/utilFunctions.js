export function extendDomain(values, domain = [Infinity, -Infinity]) {
    for (const value of values) {
        if (typeof value !== 'number') {
            continue;
        }
        if (value < domain[0]) {
            domain[0] = value;
        }
        if (value > domain[1]) {
            domain[1] = value;
        }
    }
    return domain;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbEZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9kYXRhL3V0aWxGdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxVQUFVLFlBQVksQ0FDeEIsTUFBVyxFQUNYLFNBQThCLENBQUMsUUFBYSxFQUFFLENBQUMsUUFBYSxDQUFDO0lBRTdELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQ3hCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzNCLFNBQVM7U0FDWjtRQUVELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNuQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDckI7S0FDSjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMifQ==