import { _ } from '@ag-grid-community/core';
import { getStyleId } from './styles/stylesheet';
var convertLegacyType = function (type) {
    var t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
var cellFactory = {
    getTemplate: function (config, idx, currentSheet) {
        var ref = config.ref, data = config.data, styleId = config.styleId;
        var _a = data || { type: 'empty', value: null }, type = _a.type, value = _a.value;
        var convertedType = type;
        if (type === 'f') {
            convertedType = 'str';
        }
        else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        var obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? getStyleId(styleId, currentSheet) : undefined
                }
            }
        };
        if (convertedType === 'empty') {
            return obj;
        }
        var children;
        if (convertedType === 'str' && type === 'f') {
            children = [{
                    name: 'f',
                    textNode: _.escapeString(_.utf8_encode(value))
                }];
        }
        else if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: _.escapeString(_.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return Object.assign({}, obj, { children: children });
    }
};
export default cellFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9jZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUMsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDM0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRWpELElBQU0saUJBQWlCLEdBQUcsVUFBQyxJQUFZO0lBQ25DLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFdkMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUM7QUFFRixJQUFNLFdBQVcsR0FBdUI7SUFDcEMsV0FBVyxFQUFYLFVBQVksTUFBaUIsRUFBRSxHQUFXLEVBQUUsWUFBb0I7UUFDcEQsSUFBQSxHQUFHLEdBQW9CLE1BQU0sSUFBMUIsRUFBRSxJQUFJLEdBQWMsTUFBTSxLQUFwQixFQUFFLE9BQU8sR0FBSyxNQUFNLFFBQVgsQ0FBWTtRQUNoQyxJQUFBLEtBQWtCLElBQUksSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUF0RCxJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQTJDLENBQUM7UUFDL0QsSUFBSSxhQUFhLEdBQVcsSUFBSSxDQUFDO1FBRWpDLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtZQUNkLGFBQWEsR0FBRyxLQUFLLENBQUM7U0FDekI7YUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN4RCxhQUFhLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0M7UUFFRCxJQUFNLEdBQUcsR0FBRztZQUNSLElBQUksRUFBRSxHQUFHO1lBQ1QsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixDQUFDLEVBQUUsR0FBRztvQkFDTixDQUFDLEVBQUUsYUFBYSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhO29CQUN4RCxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBaUIsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDdkU7YUFDSjtTQUNKLENBQUM7UUFFRixJQUFJLGFBQWEsS0FBSyxPQUFPLEVBQUU7WUFBRSxPQUFPLEdBQUcsQ0FBQztTQUFFO1FBRTlDLElBQUksUUFBUSxDQUFDO1FBRWIsSUFBSSxhQUFhLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxHQUFHLEVBQUU7WUFDekMsUUFBUSxHQUFHLENBQUM7b0JBQ1IsSUFBSSxFQUFFLEdBQUc7b0JBQ1QsUUFBUSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakQsQ0FBQyxDQUFDO1NBQ047YUFBTSxJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUU7WUFDdEMsUUFBUSxHQUFHLENBQUM7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsUUFBUSxFQUFFLENBQUM7NEJBQ1AsSUFBSSxFQUFFLEdBQUc7NEJBQ1QsUUFBUSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDakQsQ0FBQztpQkFDTCxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsUUFBUSxHQUFHLENBQUM7b0JBQ1IsSUFBSSxFQUFFLEdBQUc7b0JBQ1QsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLENBQUMsQ0FBQztTQUNOO1FBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFdBQVcsQ0FBQyJ9