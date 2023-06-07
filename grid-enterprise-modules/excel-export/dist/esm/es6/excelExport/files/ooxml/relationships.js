import relationshipFactory from './relationship';
const relationshipsFactory = {
    getTemplate(c) {
        const children = c.map(relationship => relationshipFactory.getTemplate(relationship));
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children
        };
    }
};
export default relationshipsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXRpb25zaGlwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9yZWxhdGlvbnNoaXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sbUJBQW1CLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsTUFBTSxvQkFBb0IsR0FBdUI7SUFDN0MsV0FBVyxDQUFDLENBQXNCO1FBQzlCLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUV0RixPQUFPO1lBQ0gsSUFBSSxFQUFFLGVBQWU7WUFDckIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsOERBQThEO2lCQUN4RTthQUNKO1lBQ0QsUUFBUTtTQUNYLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsb0JBQW9CLENBQUMifQ==