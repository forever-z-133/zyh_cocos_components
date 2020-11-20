import MainMap from "../../map/MainMap";
import { FACE_TO } from "../../map/utils/Coordinate";
import CoordinateItemRect from "../../map/utils/CoordinateItemRect";
import CoordinatePeopleTool from "../../map/utils/CoordinatePeopleTool";
import MainPeople from "../MainPeople";

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
 * 坐标系上的人物移动
 */
@ccclass
export default class PeopleMove extends cc.Component {
    @property({
        type: cc.Float,
        displayName: '移动速率',
        tooltip: '例如 0.5s 跑完一格'
    })
    moveSpeed: number = 0.5;

    /// 地图位置与朝向计算工具类
    mapTool: CoordinatePeopleTool = null;

    /// 主角实例，由外部传入
    hero: MainPeople = null;

    /// 本元素动画
    camera: cc.Camera = null;

    worldPoint = new cc.Vec2(-480, -320);

    onLoad() {
        // 事件由 CoordinatePeopleTool 提供
        this.node.on('move', this._handleMove, this);
        this.node.on('face', this._handleFaceChange, this);
    }

    bindMap(map: MainMap) {
        this.node.setPosition(0, 0);
        this.mapTool = new CoordinatePeopleTool();
        this.mapTool.coordinate = map.coordinate;
        this.mapTool.emit = this.node.emit.bind(this.node);
    }

    bindCamera(camera: cc.Camera) {
        this.camera = camera;
    }

    /// 触发移动
    _handleMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true, direct = false) {
        if (this.hero.pa.isDead) return;
        const isJump = this.mapTool.isJump(from, to);
        this.node.emit(isJump ? 'jump' : 'moving');
        // 若有回调则完全走自定义
        if (!direct && this.node.hasEventListener('will-collide')) {
            this.node.emit('will-collide', from, to, withAnim);
        } else {
            this.triggerMove(from, to, withAnim);
        }
    }
    triggerMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        // 人物移动
        this.triggerPeopleMove(from, to, withAnim);
        // 镜头移动
        this.triggerCameraMove(from, to, withAnim);
    }
    /// 触发人物移动
    triggerPeopleMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        const { x, y } = to.getCenterPoint();
        const node = this.node;
        if (!withAnim) {
            node.setPosition(x, y);
            this.triggerMoveFinish(from, to, withAnim);
        } else {
            cc.tween(node).to(this.moveSpeed, { x, y }).call(() => {
                this.triggerMoveFinish(from, to, withAnim);
            }).start();
        }
    }
    /// 同时触发摄像头移动
    triggerCameraMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
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
        if (this.hero.pa.isDead) return;
        let faceToStr = faceToChineseMap[faceTo] || 'duang~';
        // this.updateTestLabel(faceToStr);
    }
    triggerMoveFinish(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        this.mapTool.moveFinish();
        const isJump = this.mapTool.isJump(from, to);
        this.node.emit(isJump ? 'jump-finish' : 'move-finish');
    }

    setPosition(row: number, col: number, withAnim = false) {
        this.mapTool.setPosition(row, col, withAnim);
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

    updateTestLabel(str: string) {
        const $label = this.node.getChildByName('face-to').getComponent(cc.Label);
        $label.string = str;
    }
}
