import Coordinate, { faceToMap, FACE_TO } from "./Coordinate2";
import CoordinateItemRect from "./CoordinateItemRect2";

export default class CoordinatePeopleTool {
    /// 基础信息
    currentRect: CoordinateItemRect = null;
    faceTo: FACE_TO = FACE_TO.TOP;
    /// 地图实例
    coordinate: Coordinate = null;
    /// 冻结
    freeze: boolean = false;

    /// 事件通信，由外部提供方法实现
    emit(type: string, ...data: any) { }

    /// 设置点阵位置
    setPosition(row: number, col: number, withAnim = false) {
        if (this.freeze) return;
        this._moveTo(row, col, null, withAnim);
    }

    /// 设置朝向
    setFaceTo(faceTo: FACE_TO) {
        this.faceTo = faceTo;
        this.emit('face', faceTo);
    }

    /// 冻结，不许再移动
    setFreeze(freeze: boolean) {
        this.freeze = freeze;
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
        const to = this.coordinate.getRect(row, col);
        if (!to) return;
        if (!this.currentRect) this.currentRect = to;
        /// 更新朝向
        const { row: originRow, col: originCol } = this.currentRect;
        this._updateFaceTo(originRow - row, originCol - col);
        /// 移动动画
        const from = this.currentRect;
        this.emit('move', from, to, withAnim);
        /// 设置新位置
        this.currentRect = to;
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
}
