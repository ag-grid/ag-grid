import { addTransformToInstanceProperty } from './decorator';
export function Default(defaultValue, replaces = [undefined]) {
    return addTransformToInstanceProperty((_, __, v) => {
        if (replaces.includes(v)) {
            return defaultValue;
        }
        return v;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL2RlZmF1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRTdELE1BQU0sVUFBVSxPQUFPLENBQUMsWUFBaUIsRUFBRSxRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUM7SUFDN0QsT0FBTyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBTSxFQUFFLEVBQUU7UUFDcEQsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==