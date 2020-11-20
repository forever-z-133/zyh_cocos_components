import MainMap from "../map/MainMap";
import MainPeople from "../people/MainPeople";
import PeopleAttack from "../people/utils/PeopleAttack";

const { ccclass, property } = cc._decorator;

enum Keyboard {
    up = 38,
    left = 37,
    right = 39,
    down = 40,
    space = 32,
    a = 65,
    s = 83,
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
    hero: MainPeople = null;
    camera: cc.Camera = null;

    onLoad() {
        this.mapComp = this.$map.getComponent(MainMap);
        this.hero = this.$people.getComponent(MainPeople);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._handleKeyDown, this);
    }

    start() {
        this.init();
    }

    init() {
        // 初始化地图
        this.mapComp.init();
        // 初始化人物
        this.hero.bindMap(this.mapComp);
        // 初始化摄像头
        const [mainCamera, gameCamera] = cc.Camera.cameras;
        this.camera = gameCamera;
        this.camera.zoomRatio = 2;
        this.hero.bindCamera(this.camera);
        // 人物初始位置
        this.hero.setPosition(0, 0);
    }

    /// 键盘事件
    _handleKeyDown(e: cc.Event.EventKeyboard) {
        // console.log(e.keyCode);
        switch (e.keyCode) {
            case Keyboard.up: {
                this.triggerMoveForward();
                break;
            }
            case Keyboard.space: {
                this.triggerJump();
                break;
            }
            case Keyboard.s: {
                this.triggerSuperJump();
                break;
            }
            case Keyboard.a: {
                this.triggerAttackNearBy();
                break;
            }
        }
    }

    /// 前进
    triggerMoveForward() {
        this.hero.moveDown();
    }
    /// 后退
    triggerMoveBack() {
        this.hero.moveUp();
    }
    /// 跳跃
    triggerJump() {
        this.hero.moveDown(2);
    }
    /// 超级跳跃
    triggerSuperJump() {
        this.hero.moveDown(4);
    }
    /// 攻击附近的敌人
    triggerAttackNearBy() {
        this.hero.attackNearBy();
    }
    /// 重置
    reset() {
        console.log('xxx');
        this.hero.rescue();
        this.hero.pc.enemies.forEach(enemy => {
            enemy.active = true;
            const comp = enemy.getComponent(PeopleAttack);
            comp.rescue();
        });
        this.hero.pm.mapTool.currentRect = null;
        this.hero.setPosition(0, 0);
    }
    /// 激活
    focus() {}
    /// 挂机
    unfocus() {}
    /// 获取编辑器数据，
}
