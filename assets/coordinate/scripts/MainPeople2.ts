import { FACE_TO } from "./Coordinate/Coordinate2";
import CoordinateItemRect from "./Coordinate/CoordinateItemRect2";
import CoordinatePeopleTool from "./Coordinate/CoordinatePeopleTool2";
import MainMap from "./MainMap2";

const { ccclass, property } = cc._decorator;

const faceToChineseMap = {
    [FACE_TO.TOP]: '面向上',
    [FACE_TO.BOTTOM]: '面向下',
    [FACE_TO.LEFT]: '面向左',
    [FACE_TO.RIGHT]: '面向右',
    [FACE_TO.LEFT_TOP]: '面向左上',
    [FACE_TO.LEFT_BOTTOM]: '面向左下',
    [FACE_TO.RIGHT_TOP]: '面向右上',
    [FACE_TO.RIGHT_BOTTOM]: '面向右下',
}

/**
 * 坐标系上的人物
 */
@ccclass
export default class MainPeople extends cc.Component {
    /// 基础配置
    moveSpeed: number = 0.5;

    /// 地图位置与朝向计算工具类
    mapTool: CoordinatePeopleTool = null;

    /// 地图实例
    map: MainMap = null;

    /// 本元素动画
    camera: cc.Camera = null;

    worldPoint = new cc.Vec2(-480, -320);

    onLoad() {
        this.node.on('move', this._handleMove, this);
        this.node.on('face', this._handleFaceChange, this);
    }

    bindMap(map: MainMap) {
        this.map = map;
        this.node.parent = this.map.node;
        this.node.setPosition(0, 0);
        this.mapTool = new CoordinatePeopleTool();
        this.mapTool.coordinate = this.map.coordinate;
        this.mapTool.emit = this.node.emit.bind(this.node);
    }

    bindCamera(camera: cc.Camera) {
        this.camera = camera;
    }

    /// 触发移动
    _handleMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        this._handlePeopleMove(from, to, withAnim);
        this._handleCameraMove(from, to, withAnim);
    }
    /// 触发人物移动
    _handlePeopleMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        const { x, y } = to.getCenterPoint();
        const node = this.node;
        if (!withAnim) {
            node.setPosition(x, y);
        } else {
            cc.tween(node).to(this.moveSpeed, { x, y }).start();
        }
    }
    /// 同时触发摄像头移动
    _handleCameraMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        const { x: fromX, y: fromY } = from.getCenterPoint();
        const { x: toX, y: toY } = to.getCenterPoint();
        const node = this.camera.node;
        const pos = this.node.convertToWorldSpaceAR(this.worldPoint);
        const x = pos.x + (toX - fromX);
        const y = pos.y + (toY - fromY);
        if (!withAnim) {
            node.setPosition(x, y);
        } else {
            cc.tween(node).to(this.moveSpeed, { x, y }).start();
        }
    }
    /// 触发朝向变化
    _handleFaceChange(faceTo: FACE_TO) {
        const $label = this.node.getChildByName('face-to').getComponent(cc.Label);
        if (faceToChineseMap[faceTo]) {
            $label.string = faceToChineseMap[faceTo];
        } else {
            $label.string = 'duang~';
        }
    }

    dequeueMoveEvent() {

    }

    setPosition(row: number, col: number) {
        this.mapTool.setPosition(row, col, false);
    }
    /// 向上移动
    moveUp(distence = 1, callback?: Function) {
        this.mapTool.moveUp(distence, callback);
    }
    /// 向下移动
    moveDown(distence = 1, callback?: Function) {
        this.mapTool.moveDown(distence, callback);
    }
    /// 向左移动
    moveLeft(distence = 1, callback?: Function) {
        this.mapTool.moveLeft(distence, callback);
    }
    /// 向右移动
    moveRight(distence = 1, callback?: Function) {
        this.mapTool.moveRight(distence, callback);
    }
}
