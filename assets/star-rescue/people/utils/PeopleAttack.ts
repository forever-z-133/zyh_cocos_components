import ProgressBar from "../../../components/progress-bar/scripts/progress-bar";
import MiaoAnimation from "../../../utils/animation";
import AttackController from "../../game/utils/AttackController";
import CoordinateItemRect from "../../map/utils/CoordinateItemRect";
import MainPeople from "../MainPeople";

const { ccclass, property } = cc._decorator;

/**
 * 角色攻击
 */
@ccclass
export default class PeopleAttack extends cc.Component {
    @property({
        type: cc.Float,
        displayName: '总血量'
    })
    hp: number = 10;

    @property({
        type: cc.Float,
        displayName: '攻击力'
    })
    power: number = 1;

    @property({
        type: cc.Float,
        displayName: '防御力'
    })
    defense: number = 0;

    @property({
        type: cc.Float,
        displayName: '攻击范围'
    })
    range: number = 1;

    @property({
        type: cc.Float,
        displayName: '攻击间隙',
        tooltip: '单位：ms'
    })
    cd: number = 100;

    @property({
        type: cc.Node,
        displayName: '血条元素'
    })
    hpBarPrefab: cc.Node = null;

    @property({
        displayName: '能否被跳过'
    })
    canJumpThrough: boolean = false;

    @property({
        displayName: '能否被攻击'
    })
    canBeAttack: boolean = true;
    
    /// 主角实例，由外部传入
    hero: MainPeople = null;

    ac: AttackController = null;

    /// 攻击正在冷却
    isCD: boolean = false;
    _cdTempTime: number = 0;

    /// 持续攻击
    isKeepAttack: boolean = false;
    keepAttackTarget: cc.Node = null;

    /// 血条实例
    hpBarComp: ProgressBar = null;

    /// 附近的敌人
    nearByEnemy: cc.Node = null;

    get isDead() {
        return this.ac ? this.ac.data.isDead : true;
    }

    onLoad() {
        // 绑定伤害计算器
        const { hp, power, defense, range, cd } = this;
        this.ac = new AttackController(hp, power, defense, range, cd);
        this.ac.handleHpChange = this.handleHpChange.bind(this);
        // 初始化血条
        if (this.hpBarPrefab) {
            const node = cc.instantiate(this.hpBarPrefab);
            const y = (1 - this.node.anchorY) * this.node.height + 5;
            node.setPosition(0, y);
            this.node.addChild(node);
            this.hpBarComp = node.getComponent(ProgressBar);
            this.hpBarComp.setRange(0, hp);
            this.hpBarComp.setValue(hp);
        }
    }

    triggerNearByEnemy(enemy: cc.Node) {
        this.nearByEnemy = enemy;
    }

    /// 攻击
    attack(node?: cc.Node) {
        // if (this.ac.data.isDead) return;
        // if (this.isCD) return;

        // 攻击冷却
        this.isCD = true;
        this._cdTempTime = Date.now();
        this.handleCdStateChange();
        // 攻击动画
        this.node.emit('attack');
        this.triggerAttach();

        if (!node) return;
        const enemy = node.getComponent(PeopleAttack);
        if (!enemy || enemy.ac.data.isDead) return;
        // 被攻击动画
        this.triggerHurt(enemy.node);
        // 血量计算
        enemy.ac.hurtBy(this.ac);
        // 判断死亡
        if (enemy.ac.data.isDead) {
            this.stopKeepAttack();
            enemy.stopKeepAttack();
            enemy.handleDead();
        }
    }

    /// 攻击动画
    triggerAttach() {
        MiaoAnimation.fadeIn(this.node, 0.2, () => {
            this.node.emit('attack-finish');
        });
    }

    /// 被打动画
    triggerHurt(enemy: cc.Node) {
        MiaoAnimation.fadeIn(enemy, 0.2);
    }

    /// 持续攻击
    keepAttack(node: cc.Node) {
        if (this.isKeepAttack && this.keepAttackTarget === node) return;
        this.keepAttackTarget = node;
        this.isKeepAttack = true;
        this.handleKeepAttackChange();
    }

    /// 停止持续攻击
    stopKeepAttack(node?: cc.Node) {
        if (!this.isKeepAttack) return;
        this.isKeepAttack = false;
        this.keepAttackTarget = null;
        this.handleKeepAttackChange();
    }

    attackNearBy() {
        const enemy = this.nearByEnemy;
        if (enemy) {
            this.hero.pa.attack(enemy);
        }
    }

    /// 血量变化
    handleHpChange(hp: number, hurt: number) {
        if (this.hpBarComp) this.hpBarComp.setValue(hp);
    }

    /// 复活
    rescue() {
        this.ac.rescue();
        this.handleRescue();
    }

    /// 角色死亡
    handleDead() {
        this.node.emit('dead');
    }
    /// 角色复活
    handleRescue() {
        this.node.emit('rescue');
    }

    /// 攻击冷却状态变化，留给外部用
    handleCdStateChange() { }

    /// 自动攻击状态变化，留给外部用
    handleKeepAttackChange() { }

    /// 攻击范围够得着主角，敌人处要重写
    meetHero(hero: MainPeople, from: CoordinateItemRect) {
        return false;
    }

    update() {
        const now = Date.now();
        const { cd } = this.ac.data;
        // 更新技能冷却
        if (now - this._cdTempTime > cd) {
            this.isCD = false;
            this.handleCdStateChange();
        }
        // 如果没有冷却，则看是否触发持续攻击
        if (!this.isCD) {
            if (this.isKeepAttack && this.keepAttackTarget) {
                this.attack(this.keepAttackTarget);
            }
        }
    }
}
