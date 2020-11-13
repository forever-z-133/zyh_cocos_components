import ProgressBar from "../../../components/progress-bar/scripts/progress-bar";
import MiaoAnimation from "../../../utils/animation";
import AttackController from "../attack-controller/attack-controller";

const { ccclass, property } = cc._decorator;

/**
 * 角色
 */
@ccclass
export default class People extends cc.Component {
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

    ac: AttackController = null;

    /// 攻击正在冷却
    isCD: boolean = false;
    _cdTempTime: number = 0;

    /// 持续攻击
    isKeepAttack: boolean = false;
    keepAttackTarget: cc.Node = null;

    /// 血条实例
    hpBarComp: ProgressBar = null;

    onLoad() {
        // 绑定伤害计算器
        const { hp, power, defense, range, cd } = this;
        this.ac = new AttackController(hp, power, defense, range, cd);
        this.ac.handleHpChange = this.handleHpChange.bind(this);
        // 初始化血条
        const node = cc.instantiate(this.hpBarPrefab);
        node.setPosition(this.node.x, this.node.y + 80);
        this.node.parent.addChild(node);
        this.hpBarComp = node.getComponent(ProgressBar);
        this.hpBarComp.setRange(0, hp);
        this.hpBarComp.setValue(hp);
    }

    /// 攻击
    attack(node: cc.Node) {
        if (this.ac.data.isDead) return;
        const enemy = node.getComponent(People);
        if (!enemy || enemy.ac.data.isDead) return;
        // 攻击冷却
        // if (this.isCD) return;
        this.isCD = true;
        this._cdTempTime = Date.now();
        this.handleCdStateChange();
        // 攻击动画
        MiaoAnimation.fadeIn(this.node, 0.1);
        // 被攻击动画
        MiaoAnimation.shake(enemy.node);
        // 血量计算
        enemy.ac.hurtBy(this.ac);
        // 判断死亡
        if (enemy.ac.data.isDead) {
            this.stopKeepAttack();
            enemy.stopKeepAttack();
            enemy.handleDead();
        }
    }

    /// 持续攻击
    keepAttack(node: cc.Node) {
        this.keepAttackTarget = node;
        this.isKeepAttack = true;
        this.handleKeepAttackChange();
    }

    /// 停止持续攻击
    stopKeepAttack(node?: cc.Node) {
        this.isKeepAttack = false;
        this.keepAttackTarget = null;
        this.handleKeepAttackChange();
    }

    /// 血量变化
    handleHpChange(hp: number, hurt: number) {
        if (this.hpBarComp) this.hpBarComp.setValue(hp);
    }

    /// 角色死亡
    handleDead() {
        this.node.color = cc.color(100, 100, 100);
        this.node.emit('dead');
    }

    /// 攻击冷却状态变化，留给外部用
    handleCdStateChange() { }

    /// 自动攻击状态变化，留给外部用
    handleKeepAttackChange() { }

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
