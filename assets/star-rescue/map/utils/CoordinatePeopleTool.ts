import Coordinate, { faceToMap, FACE_TO } from "./Coordinate";
import CoordinateItemRect from "./CoordinateItemRect";

export default class CoordinatePeopleTool {
    /// 基础信息
    currentRect: CoordinateItemRect = null;
    tempRect: CoordinateItemRect = null;
    faceTo: FACE_TO = FACE_TO.TOP;
    /// 地图实例
    coordinate: Coordinate = null;
    /// 冻结
    freeze: boolean = false;

    /// 事件通信，由外部提供方法实现
    emit(type: string, ...data: any) { }

    bindCoordinate(coordinate: Coordinate) {
        this.coordinate = coordinate
    }

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
        this._moveTo(row - distence, col, callback, true);
    }
    /// 向下移动
    moveDown(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        console.log(row, col);
        this._moveTo(row + distence, col, callback, true);
    }
    /// 向左移动
    moveLeft(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row, col - distence, callback, true);
    }
    /// 向右移动
    moveRight(distence = 1, callback?: Function) {
        const { row, col } = this.currentRect;
        this._moveTo(row, col + distence, callback, true);
    }

    /// 判断是否为跳跃
    isJump(from: CoordinateItemRect, to: CoordinateItemRect) {
        return Math.abs(from.row - to.row) > 1 || Math.abs(from.col - to.col) > 1;
    }

    /// 统一的移动接口
    _moveTo(row: number, col: number, callback?: Function, withAnim = true) {
        if (this.freeze) return;
        const to = this.coordinate.getRect(row, col);
        if (!to) return;
        if (!this.currentRect) this.currentRect = to;
        // 更新朝向
        const { x: originX, y: originY } = this.currentRect;
        this._updateFaceTo(originX - to.x, originY - to.y);
        // 移动动画
        const from = this.currentRect;
        // 设置新位置
        this.tempRect = to;
        this.freeze = true;
        // 放给外部去加动画
        this.emit('move', from, to, withAnim);
    }
    moveFinish() {
        this.freeze = false;
        this.currentRect = this.tempRect;
        this.tempRect = null;
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
