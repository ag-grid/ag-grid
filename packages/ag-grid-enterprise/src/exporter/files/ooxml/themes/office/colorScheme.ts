import { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

const getColorChildren = (props: [string, string, string, string?]): XmlElement => {
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

const colorScheme: ExcelOOXMLTemplate = {
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
