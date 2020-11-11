import { FACE_TO } from "./Coordinate/Coordinate";
import CoordinateItemRect from "./Coordinate/CoordinateItemRect";
import CoordinatePeopleTool from "./Coordinate/CoordinatePeopleTool";
import MainMap from "./MainMap";

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
    moveSpeed: number = 0.1;

    /// 地图位置与朝向计算工具类
    mapTool: CoordinatePeopleTool = null;

    /// 地图实例
    map: MainMap = null;

    onLoad() {
        this.node.on('move', this._handleMove, this);
        this.node.on('face', this._handleFaceChange, this);
    }

    async bindMap(map: MainMap) {
        this.map = map;
        this.node.parent = this.map.node;
        await this.initMapTool();
    }

    async initMapTool() {
        return new Promise((resolve) => {
            this.mapTool = new CoordinatePeopleTool();
            this.mapTool.coordinate = this.map.coordinate;
            this.mapTool.emit = this.node.emit.bind(this.node);
            setTimeout(() => resolve());
        });
    }

    _handleMove(rect: CoordinateItemRect, withAnim = true) {
        const { x, y } = rect.getCenterPoint();
        if (!withAnim) return this.node.setPosition(x, y);
        else cc.tween(this.node).to(this.moveSpeed, { x, y }).start();
    }
    _handleFaceChange(faceTo: FACE_TO) {
        const $label = this.node.getChildByName('face-to').getComponent(cc.Label);
        if (faceToChineseMap[faceTo]) {
            $label.string = faceToChineseMap[faceTo];
        } else {
            $label.string = 'duang~';
        }
    }

    setPosition(row: number, col: number) {
        this.mapTool.setPosition(row, col);
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
