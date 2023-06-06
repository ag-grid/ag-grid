import { convertLegacyHorizontalAlignment, convertLegacyVerticalAlignment } from '../../../assets/excelLegacyConvert';
var getReadingOrderId = function (readingOrder) {
    var order = ['Context', 'LeftToRight', 'RightToLeft'];
    var pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
var alignmentFactory = {
    getTemplate: function (alignment) {
        var horizontal = alignment.horizontal, indent = alignment.indent, readingOrder = alignment.readingOrder, rotate = alignment.rotate, shrinkToFit = alignment.shrinkToFit, vertical = alignment.vertical, wrapText = alignment.wrapText;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent: indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit: shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText: wrapText
                }
            }
        };
    }
};
export default alignmentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9hbGlnbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFdEgsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLFlBQW9CO0lBQzNDLElBQU0sS0FBSyxHQUFHLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUN4RCxJQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDO0FBRUYsSUFBTSxnQkFBZ0IsR0FBdUI7SUFDekMsV0FBVyxFQUFYLFVBQVksU0FBeUI7UUFDMUIsSUFBQSxVQUFVLEdBQW1FLFNBQVMsV0FBNUUsRUFBRSxNQUFNLEdBQTJELFNBQVMsT0FBcEUsRUFBRSxZQUFZLEdBQTZDLFNBQVMsYUFBdEQsRUFBRSxNQUFNLEdBQXFDLFNBQVMsT0FBOUMsRUFBRSxXQUFXLEdBQXdCLFNBQVMsWUFBakMsRUFBRSxRQUFRLEdBQWMsU0FBUyxTQUF2QixFQUFFLFFBQVEsR0FBSSxTQUFTLFNBQWIsQ0FBYztRQUU5RixPQUFPO1lBQ0gsSUFBSSxFQUFFLFdBQVc7WUFDakIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixVQUFVLEVBQUUsVUFBVSxJQUFJLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQztvQkFDdEUsTUFBTSxRQUFBO29CQUNOLFlBQVksRUFBRSxZQUFZLElBQUksaUJBQWlCLENBQUMsWUFBWSxDQUFDO29CQUM3RCxZQUFZLEVBQUUsTUFBTTtvQkFDcEIsV0FBVyxhQUFBO29CQUNYLFFBQVEsRUFBRSxRQUFRLElBQUksOEJBQThCLENBQUMsUUFBUSxDQUFDO29CQUM5RCxRQUFRLFVBQUE7aUJBQ1g7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsZ0JBQWdCLENBQUMifQ==