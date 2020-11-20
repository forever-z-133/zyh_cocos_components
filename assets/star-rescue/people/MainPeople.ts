import MainMap from "../map/MainMap";
import PeopleAttack from "./utils/PeopleAttack";
import PeopleCollide from "./utils/PeopleCollide";
import PeopleMove from "./utils/PeopleMove";

const { ccclass, property } = cc._decorator;

/**
 * 坐标系上的人物
 */
@ccclass
export default class MainPeople extends cc.Component {
    /// 人物移动实例
    pm: PeopleMove = null;

    /// 人物攻击数据实例
    pa: PeopleAttack = null;

    /// 人物遇怪实例
    pc: PeopleCollide = null;

    onLoad() {
        this.pm = this.node.getComponent(PeopleMove);
        this.pa = this.node.getComponent(PeopleAttack);
        this.pc = this.node.getComponent(PeopleCollide);
        this.pa.hero = this;
        this.pm.hero = this;
        this.pc.hero = this;
        this.node.on('moving', this._handleMoving, this);
        this.node.on('move-finish', this._handleMoveFinish, this);
        this.node.on('cancel-move', this._handleCancelMove, this);
        this.node.on('jump', this._handleJump, this);
        this.node.on('jump-finish', this._handleJumpFinish, this);
        this.node.on('attack', this._handleAttack, this);
        this.node.on('will-near-by-enemy', this._handleNearByEnemy, this);
        this.node.on('attack-finish', this._handleAttackFinish, this);
        this.node.on('dead', this._handleDead, this);
    }

    /// 绑定地图
    bindMap(map: MainMap) {
        this.node.parent = map.node;
        this.pm.bindMap(map);
    }

    /// 绑定摄像机
    bindCamera(camera: cc.Camera) {
        this.pm.bindCamera(camera);
    }
    attackNearBy() {
        if (this.pa.isDead) return;
        this.pa.attackNearBy();
    }

    /// 设置位置
    setPosition(row: number, col: number, withAnim = false) {
        if (this.pa.isDead) return;
        this.pm.setPosition(row, col, withAnim);
    }
    /// 向上移动
    moveUp(distence = 1, callback?: Function) {
        if (this.pa.isDead) return;
        this.pm.moveUp(distence, callback);
    }
    /// 向下移动
    moveDown(distence = 1, callback?: Function) {
        if (this.pa.isDead) return;
        this.pm.moveDown(distence, callback);
    }
    /// 向左移动
    moveLeft(distence = 1, callback?: Function) {
        if (this.pa.isDead) return;
        this.pm.moveLeft(distence, callback);
    }
    /// 向右移动
    moveRight(distence = 1, callback?: Function) {
        if (this.pa.isDead) return;
        this.pm.moveRight(distence, callback);
    }

    /// 死亡
    die() {
        if (this.pa.isDead) return;
        this.node.emit('dead');
    }
    /// 复活
    rescue() {
        if (!this.pa.isDead) return;
        this.pa.rescue();
        this.node.emit('rescue');
    }

    /// 显示测试用文本
    testLabel: string = '';

    _handleAttack() {
        this.testLabel = '打';
    }
    _handleAttackFinish() {
        if (!this.pa.isDead) this.testLabel = '';
    }
    _handleNearByEnemy(enemy: PeopleAttack) {
        this.testLabel = '站在' + enemy.node.name + '旁';
    }
    _handleMoving() {
        this.testLabel = '走';
    }
    _handleMoveFinish() {
        if (!this.pa.isDead) this.testLabel = '';
    }
    _handleCancelMove() {
        this.testLabel = '到不了';
    }
    _handleJump() {
        this.testLabel = '跳';
    }
    _handleJumpFinish() {
        if (!this.pa.isDead) this.testLabel = '';
    }
    _handleDead() {
        this.testLabel = '死啦';
    }

    update() {
        const $label = this.node.getChildByName('face-to').getComponent(cc.Label);
        $label.string = this.testLabel || '立定';
    }
}
