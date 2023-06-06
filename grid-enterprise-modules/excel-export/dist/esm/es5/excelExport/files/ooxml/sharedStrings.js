import { _ } from '@ag-grid-community/core';
var buildSharedString = function (strMap) {
    var ret = [];
    strMap.forEach(function (val, key) {
        var textNode = key.toString();
        var child = {
            name: 't',
            textNode: _.utf8_encode(_.escapeString(textNode))
        };
        // if we have leading or trailing spaces, instruct Excel not to trim them
        var preserveSpaces = textNode.trim().length !== textNode.length;
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
var sharedStrings = {
    getTemplate: function (strings) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkU3RyaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zaGFyZWRTdHJpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0MsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFNUUsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLE1BQTJCO0lBQ2xELElBQU0sR0FBRyxHQUFpQixFQUFFLENBQUM7SUFFN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHO1FBQ3BCLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQyxJQUFNLEtBQUssR0FBZTtZQUN0QixJQUFJLEVBQUUsR0FBRztZQUNULFFBQVEsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEQsQ0FBQztRQUVGLHlFQUF5RTtRQUN6RSxJQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFFbEUsSUFBSSxjQUFjLEVBQUU7WUFDaEIsS0FBSyxDQUFDLFVBQVUsR0FBRztnQkFDZixNQUFNLEVBQUU7b0JBQ0osV0FBVyxFQUFFLFVBQVU7aUJBQzFCO2FBQ0osQ0FBQztTQUNMO1FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNMLElBQUksRUFBRSxJQUFJO1lBQ1YsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUM7QUFFRixJQUFNLGFBQWEsR0FBdUI7SUFDdEMsV0FBVyxFQUFYLFVBQVksT0FBNEI7UUFDcEMsT0FBTztZQUNILElBQUksRUFBRSxLQUFLO1lBQ1gsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsMkRBQTJEO29CQUNsRSxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUk7b0JBQ25CLFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSTtpQkFDNUI7YUFDSjtZQUNELFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7U0FDdkMsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==