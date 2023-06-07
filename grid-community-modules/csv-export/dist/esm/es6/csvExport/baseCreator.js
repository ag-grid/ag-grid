export class BaseCreator {
    setBeans(beans) {
        this.beans = beans;
    }
    getFileName(fileName) {
        const extension = this.getDefaultFileExtension();
        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }
        return fileName.indexOf('.') === -1 ? `${fileName}.${extension}` : fileName;
    }
    getData(params) {
        const serializingSession = this.createSerializingSession(params);
        const data = this.beans.gridSerializer.serialize(serializingSession, params);
        return data;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L2Jhc2VDcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sT0FBZ0IsV0FBVztJQUluQixRQUFRLENBQUMsS0FBdUI7UUFDdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQU1TLFdBQVcsQ0FBQyxRQUFpQjtRQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUVqRCxJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ3RDLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUN4QztRQUVELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNoRixDQUFDO0lBRVMsT0FBTyxDQUFDLE1BQVM7UUFDdkIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FNSiJ9