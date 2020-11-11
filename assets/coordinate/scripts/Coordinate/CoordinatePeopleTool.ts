import Coordinate, { faceToMap, FACE_TO } from "./Coordinate";
import CoordinateItemRect from "./CoordinateItemRect";

export default class CoordinatePeopleTool {
    /// 基础信息
    currentRect: CoordinateItemRect = null;
    faceTo: FACE_TO = FACE_TO.TOP;
    /// 地图实例
    coordinate: Coordinate = null;

    /// 事件通信，由外部提供方法实现
    emit(type: string, ...data: any) { }

    /// 设置点阵位置
    setPosition(row: number, col: number) {
        this._moveTo(row, col, null, false);
    }

    /// 向上移动
    moveUp(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row - distence, col, callback);
    }
    /// 向下移动
    moveDown(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row + distence, col, callback);
    }
    /// 向左移动
    moveLeft(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row, col - distence, callback);
    }
    /// 向右移动
    moveRight(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row, col + distence, callback);
    }

    /// 统一的移动接口
    _moveTo(row: number, col: number, callback?: Function, withAnim = true) {
        const rect = this.coordinate.getRect(row, col);
        if (!rect) return console.log('未找到此坐标，也许超出了地图');
        /// 更新朝向
        if (this.currentRect) {
            const { row: originRow, col: originCol } = this.currentRect;
            this._updateFaceTo(originRow - row, originCol - col);
        } else {
            this.setFaceTo(this.faceTo);
        }
        /// 移动动画
        this.emit('move', rect, withAnim);
        /// 设置新位置
        this.currentRect = rect;
    }

    /// 根据移动方向，更新人物朝向
    _updateFaceTo(distRow: number, distCol: number) {
        let faceTo = this.faceTo;
        if (distRow || distCol) { // 必须其一有值才能判
            distRow = Math.max(-1, Math.min(1, distRow));
            distCol = Math.max(-1, Math.min(1, distCol));
            faceTo = faceToMap[`${distRow},${distCol}`];
        }
        this.setFaceTo(faceTo);
    }

    /// 统一的设置朝向接口
    setFaceTo(faceTo: FACE_TO) {
        this.faceTo = faceTo;
        this.emit('face', faceTo);
    }
}
