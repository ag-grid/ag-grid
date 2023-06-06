var BaseCreator = /** @class */ (function () {
    function BaseCreator() {
    }
    BaseCreator.prototype.setBeans = function (beans) {
        this.beans = beans;
    };
    BaseCreator.prototype.getFileName = function (fileName) {
        var extension = this.getDefaultFileExtension();
        if (fileName == null || !fileName.length) {
            fileName = this.getDefaultFileName();
        }
        return fileName.indexOf('.') === -1 ? fileName + "." + extension : fileName;
    };
    BaseCreator.prototype.getData = function (params) {
        var serializingSession = this.createSerializingSession(params);
        var data = this.beans.gridSerializer.serialize(serializingSession, params);
        return data;
    };
    return BaseCreator;
}());
export { BaseCreator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUNyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L2Jhc2VDcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0lBQUE7SUFpQ0EsQ0FBQztJQTdCYSw4QkFBUSxHQUFsQixVQUFtQixLQUF1QjtRQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBTVMsaUNBQVcsR0FBckIsVUFBc0IsUUFBaUI7UUFDbkMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFakQsSUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUN0QyxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDeEM7UUFFRCxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFJLFFBQVEsU0FBSSxTQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNoRixDQUFDO0lBRVMsNkJBQU8sR0FBakIsVUFBa0IsTUFBUztRQUN2QixJQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFN0UsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU1MLGtCQUFDO0FBQUQsQ0FBQyxBQWpDRCxJQWlDQyJ9