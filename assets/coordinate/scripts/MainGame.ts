import { AngleType } from "./Coordinate/Coordinate";
import MainMap from "./MainMap";
import MainPeople from "./MainPeople";

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

    onLoad() {
        this.mapComp = this.$map.getComponent(MainMap);
        this.peopleComp = this.$people.getComponent(MainPeople);
        this.init();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._handleKeyDown, this);
    }

    async init() {
        this.mapComp.init();
        await this.peopleComp.bindMap(this.mapComp);
        const first = this.mapComp.lineData[0];
        const [row, col] = first.split('');
        this.peopleComp.setPosition(+row, +col);
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
