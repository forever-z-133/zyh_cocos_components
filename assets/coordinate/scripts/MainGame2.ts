import { AngleType } from "./Coordinate/Coordinate2";
import CoordinateItemRect from "./Coordinate/CoordinateItemRect2";
import MainMap from "./MainMap2";
import MainPeople from "./MainPeople2";

const { ccclass, property } = cc._decorator;

enum Keyboard {
    up = 38,
    left = 37,
    right = 39,
    down = 40,
}

/**
 * 地图绘制器
 */
@ccclass
export default class MainGame extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '地图'
    })
    $map: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '角色'
    })
    $people: cc.Node = null;

    mapComp: MainMap = null;
    peopleComp: MainPeople = null;
    camera: cc.Camera = null;

    onLoad() {
        this.mapComp = this.$map.getComponent(MainMap);
        this.peopleComp = this.$people.getComponent(MainPeople);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._handleKeyDown, this);
    }

    start() {
        this.init();
    }

    init() {
        // 初始化地图
        this.mapComp.init();
        // 初始化人物
        this.peopleComp.bindMap(this.mapComp);
        // 初始化摄像头
        this.camera = cc.Camera.findCamera(this.node);
        this.peopleComp.bindCamera(this.camera);
        // 人物初始位置
        const first = this.mapComp.lineData[0];
        const [row, col] = first.split('').map(e => +e);
        this.peopleComp.setPosition(row, col);
    }

    /// 键盘事件
    _handleKeyDown(e: cc.Event.EventKeyboard) {
        switch (e.keyCode) {
            case Keyboard.up: {
                this.triggerMoveUp();
                break;
            }
            case Keyboard.down: {
                this.triggerMoveDown();
                break;
            }
            case Keyboard.left: {
                this.triggerMoveLeft();
                break;
            }
            case Keyboard.right: {
                this.triggerMoveRight();
                break;
            }
        }
    }

    /// 切换坐标系样式
    angleTypeFlag = 1;
    triggerSwitchAngleType() {
        this.angleTypeFlag = this.angleTypeFlag === 0 ? 1 : 0;
        this.mapComp.angleType = this.angleTypeFlag ? AngleType.FiftyFiveAngle : AngleType.VerticalAngle;
        this.init();
    }

    /// 移动
    triggerMoveUp() {
        this.peopleComp.moveUp();
    }
    triggerMoveDown() {
        this.peopleComp.moveDown();
    }
    triggerMoveLeft() {
        this.peopleComp.moveLeft();
    }
    triggerMoveRight() {
        this.peopleComp.moveRight();
    }
}
