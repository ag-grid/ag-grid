import { _ } from '@ag-grid-community/core';
import { getStyleId } from './styles/stylesheet';
const convertLegacyType = (type) => {
    const t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
const cellFactory = {
    getTemplate(config, idx, currentSheet) {
        const { ref, data, styleId } = config;
        const { type, value } = data || { type: 'empty', value: null };
        let convertedType = type;
        if (type === 'f') {
            convertedType = 'str';
        }
        else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        const obj = {
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
        let children;
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
        return Object.assign({}, obj, { children });
    }
};
export default cellFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9jZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUMsQ0FBQyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDM0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRWpELE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFZLEVBQVUsRUFBRTtJQUMvQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXZDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQXVCO0lBQ3BDLFdBQVcsQ0FBQyxNQUFpQixFQUFFLEdBQVcsRUFBRSxZQUFvQjtRQUM1RCxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDdEMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUMvRCxJQUFJLGFBQWEsR0FBVyxJQUFJLENBQUM7UUFFakMsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO1lBQ2QsYUFBYSxHQUFHLEtBQUssQ0FBQztTQUN6QjthQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3hELGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQztRQUVELE1BQU0sR0FBRyxHQUFHO1lBQ1IsSUFBSSxFQUFFLEdBQUc7WUFDVCxVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLENBQUMsRUFBRSxHQUFHO29CQUNOLENBQUMsRUFBRSxhQUFhLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWE7b0JBQ3hELENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2lCQUN2RTthQUNKO1NBQ0osQ0FBQztRQUVGLElBQUksYUFBYSxLQUFLLE9BQU8sRUFBRTtZQUFFLE9BQU8sR0FBRyxDQUFDO1NBQUU7UUFFOUMsSUFBSSxRQUFRLENBQUM7UUFFYixJQUFJLGFBQWEsS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtZQUN6QyxRQUFRLEdBQUcsQ0FBQztvQkFDUixJQUFJLEVBQUUsR0FBRztvQkFDVCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqRCxDQUFDLENBQUM7U0FDTjthQUFNLElBQUksYUFBYSxLQUFLLFdBQVcsRUFBRTtZQUN0QyxRQUFRLEdBQUcsQ0FBQztvQkFDUixJQUFJLEVBQUUsSUFBSTtvQkFDVixRQUFRLEVBQUUsQ0FBQzs0QkFDUCxJQUFJLEVBQUUsR0FBRzs0QkFDVCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUNqRCxDQUFDO2lCQUNMLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxRQUFRLEdBQUcsQ0FBQztvQkFDUixJQUFJLEVBQUUsR0FBRztvQkFDVCxRQUFRLEVBQUUsS0FBSztpQkFDbEIsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFdBQVcsQ0FBQyJ9