import { Square } from './square';
import { Circle } from './circle';
import { Cross } from './cross';
import { Diamond } from './diamond';
import { Heart } from './heart';
import { Plus } from './plus';
import { Triangle } from './triangle';
// This function is in its own file because putting it into SeriesMarker makes the Legend
// suddenly aware of the series (it's an agnostic component), and putting it into Marker
// introduces circular dependencies.
export function getMarker(shape = Square) {
    if (typeof shape === 'string') {
        switch (shape) {
            case 'circle':
                return Circle;
            case 'cross':
                return Cross;
            case 'diamond':
                return Diamond;
            case 'heart':
                return Heart;
            case 'plus':
                return Plus;
            case 'triangle':
                return Triangle;
            default:
                return Square;
        }
    }
    if (typeof shape === 'function') {
        return shape;
    }
    return Square;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXJrZXIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBR3RDLHlGQUF5RjtBQUN6Rix3RkFBd0Y7QUFDeEYsb0NBQW9DO0FBQ3BDLE1BQU0sVUFBVSxTQUFTLENBQUMsUUFBYSxNQUFNO0lBQ3pDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQzNCLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxRQUFRO2dCQUNULE9BQU8sTUFBTSxDQUFDO1lBQ2xCLEtBQUssT0FBTztnQkFDUixPQUFPLEtBQUssQ0FBQztZQUNqQixLQUFLLFNBQVM7Z0JBQ1YsT0FBTyxPQUFPLENBQUM7WUFDbkIsS0FBSyxPQUFPO2dCQUNSLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLEtBQUssTUFBTTtnQkFDUCxPQUFPLElBQUksQ0FBQztZQUNoQixLQUFLLFVBQVU7Z0JBQ1gsT0FBTyxRQUFRLENBQUM7WUFDcEI7Z0JBQ0ksT0FBTyxNQUFNLENBQUM7U0FDckI7S0FDSjtJQUVELElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFFO1FBQzdCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyJ9