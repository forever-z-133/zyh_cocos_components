import { forEachRect } from "../../utils/utils";
import Coordinate, { AngleType, faceToMap } from "./Coordinate";

/**
 * 坐标系工具类中的方块
 */
export default class CoordinateItemRect extends cc.Rect {
    public row: number = 0;
    public col: number = 0;
    public angle: AngleType = AngleType.VerticalAngle;
    public isOrigin: boolean = false;
    public isBoundary: boolean = false;
    private coordinate: Coordinate = null;
    constructor(coordinate: Coordinate, x = 0, y = 0, width = 0, height = width, row = 0, col = 0, angle = AngleType.VerticalAngle) {
        super(x, y, width, height);
        this.coordinate = coordinate;
        this.row = row;
        this.col = col;
        this.angle = angle;
    }
    /// 获取方格中心点
    getCenterPoint() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 * -1;
        return new cc.Vec2(centerX, centerY);
    }
    /// 获取相邻的四个元素
    getSiblingItems(): { [name: string]: CoordinateItemRect } {
        return {
            top: this.coordinate.getRect(this.row, this.col - 1),
            bottom: this.coordinate.getRect(this.row, this.col + 1),
            left: this.coordinate.getRect(this.row - 1, this.col),
            right: this.coordinate.getRect(this.row + 1, this.col)
        }
    }
    /// 获取相邻范围内的所有元素
    getItemsByDistence(distence = 1): CoordinateItemRect[] {
        const length = 1 + 2 * distence;
        const result: CoordinateItemRect[] = [];
        forEachRect(length, length, (row, col) => {
            const distRow = col - 1 + this.row;
            const distCol = row - 1 + this.col;
            const rect = this.coordinate.getRect(distRow, distCol);
            if (rect) result.push(rect);
        });
        return result;
    }
    /// 获取本方格在另一个方格的什么方向
    getFaceToFromOtherItem(rect: CoordinateItemRect) {
        const distX = Math.max(-1, Math.min(1, this.row - rect.row));
        const distY = Math.max(-1, Math.min(1, this.col - rect.col));
        const faceTo = faceToMap[`${distX},${distY}`];
        return faceTo;
    }
}
