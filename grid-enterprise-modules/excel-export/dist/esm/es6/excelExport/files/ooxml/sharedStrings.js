import { _ } from '@ag-grid-community/core';
const buildSharedString = (strMap) => {
    const ret = [];
    strMap.forEach((val, key) => {
        const textNode = key.toString();
        const child = {
            name: 't',
            textNode: _.utf8_encode(_.escapeString(textNode))
        };
        // if we have leading or trailing spaces, instruct Excel not to trim them
        const preserveSpaces = textNode.trim().length !== textNode.length;
        if (preserveSpaces) {
            child.properties = {
                rawMap: {
                    "xml:space": "preserve"
                }
            };
        }
        ret.push({
            name: 'si',
            children: [child]
        });
    });
    return ret;
};
const sharedStrings = {
    getTemplate(strings) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.size,
                    uniqueCount: strings.size
                }
            },
            children: buildSharedString(strings)
        };
    }
};
export default sharedStrings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkU3RyaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zaGFyZWRTdHJpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0MsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFNUUsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQTJCLEVBQWdCLEVBQUU7SUFDcEUsTUFBTSxHQUFHLEdBQWlCLEVBQUUsQ0FBQztJQUU3QixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3hCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBZTtZQUN0QixJQUFJLEVBQUUsR0FBRztZQUNULFFBQVEsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEQsQ0FBQztRQUVGLHlFQUF5RTtRQUN6RSxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFFbEUsSUFBSSxjQUFjLEVBQUU7WUFDaEIsS0FBSyxDQUFDLFVBQVUsR0FBRztnQkFDZixNQUFNLEVBQUU7b0JBQ0osV0FBVyxFQUFFLFVBQVU7aUJBQzFCO2FBQ0osQ0FBQztTQUNMO1FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNMLElBQUksRUFBRSxJQUFJO1lBQ1YsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBdUI7SUFDdEMsV0FBVyxDQUFDLE9BQTRCO1FBQ3BDLE9BQU87WUFDSCxJQUFJLEVBQUUsS0FBSztZQUNYLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLDJEQUEyRDtvQkFDbEUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJO29CQUNuQixXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUk7aUJBQzVCO2FBQ0o7WUFDRCxRQUFRLEVBQUUsaUJBQWlCLENBQUMsT0FBTyxDQUFDO1NBQ3ZDLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsYUFBYSxDQUFDIn0=