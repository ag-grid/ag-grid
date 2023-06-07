const getColorChildren = (props) => {
    const [type, innerType, val, lastClr] = props;
    return {
        name: `a:${type}`,
        children: [{
                name: `a:${innerType}`,
                properties: {
                    rawMap: {
                        val,
                        lastClr
                    }
                }
            }]
    };
};
const colorScheme = {
    getTemplate() {
        return {
            name: "a:clrScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getColorChildren(['dk1', 'sysClr', 'windowText', '000000']),
                getColorChildren(['lt1', 'sysClr', 'window', 'FFFFFF']),
                getColorChildren(['dk2', 'srgbClr', '44546A']),
                getColorChildren(['lt2', 'srgbClr', 'E7E6E6']),
                getColorChildren(['accent1', 'srgbClr', '4472C4']),
                getColorChildren(['accent2', 'srgbClr', 'ED7D31']),
                getColorChildren(['accent3', 'srgbClr', 'A5A5A5']),
                getColorChildren(['accent4', 'srgbClr', 'FFC000']),
                getColorChildren(['accent5', 'srgbClr', '5B9BD5']),
                getColorChildren(['accent6', 'srgbClr', '70AD47']),
                getColorChildren(['hlink', 'srgbClr', '0563C1']),
                getColorChildren(['folHlink', 'srgbClr', '954F72'])
            ]
        };
    }
};
export default colorScheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JTY2hlbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvdGhlbWVzL29mZmljZS9jb2xvclNjaGVtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLGdCQUFnQixHQUFHLENBQUMsS0FBd0MsRUFBYyxFQUFFO0lBQzlFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7SUFFOUMsT0FBTztRQUNILElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtRQUNqQixRQUFRLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3RCLFVBQVUsRUFBRTtvQkFDUixNQUFNLEVBQUU7d0JBQ0osR0FBRzt3QkFDSCxPQUFPO3FCQUNWO2lCQUNKO2FBQ0osQ0FBQztLQUNMLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBdUI7SUFDcEMsV0FBVztRQUVQLE9BQU87WUFDSCxJQUFJLEVBQUUsYUFBYTtZQUNuQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLElBQUksRUFBRSxRQUFRO2lCQUNqQjthQUNKO1lBQ0QsUUFBUSxFQUFFO2dCQUNOLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzNELGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDOUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2xELGdCQUFnQixDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRCxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2xELGdCQUFnQixDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsRCxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELGdCQUFnQixDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN0RDtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsV0FBVyxDQUFDIn0=