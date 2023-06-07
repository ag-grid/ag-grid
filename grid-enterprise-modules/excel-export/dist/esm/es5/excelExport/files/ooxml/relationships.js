import relationshipFactory from './relationship';
var relationshipsFactory = {
    getTemplate: function (c) {
        var children = c.map(function (relationship) { return relationshipFactory.getTemplate(relationship); });
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children: children
        };
    }
};
export default relationshipsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXRpb25zaGlwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9yZWxhdGlvbnNoaXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sbUJBQW1CLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsSUFBTSxvQkFBb0IsR0FBdUI7SUFDN0MsV0FBVyxFQUFYLFVBQVksQ0FBc0I7UUFDOUIsSUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFlBQVksSUFBSSxPQUFBLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBN0MsQ0FBNkMsQ0FBQyxDQUFDO1FBRXRGLE9BQU87WUFDSCxJQUFJLEVBQUUsZUFBZTtZQUNyQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSw4REFBOEQ7aUJBQ3hFO2FBQ0o7WUFDRCxRQUFRLFVBQUE7U0FDWCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLG9CQUFvQixDQUFDIn0=