import AttackData from "./attack-data";

/**
 * 伤害计算工具类
 */
export default class AttackController {
    /// 伤害相关数据
    data: AttackData = null;

    /// 攻击关系
    attackRelation: AttackController[] = [];

    constructor(hp: number, power: number, defense: number, range: number, cd: number) {
        // 血量、攻击力、防御力、攻击范围、攻击间隔时间
        this.data = new AttackData(hp, power, defense, range, cd);
        return this;
    }

    /// 被攻击受伤
    hurtBy(from: AttackController) {
        if (this.data.isDead) return;
        const { power } = from.data;
        const hurt = Math.max(0, power - this.data.defense);
        this.setHpReduce(hurt);
    }

    /// 攻击
    attack(target: AttackController) {
        if (this.data.isDead) return;
        target.hurtBy(this);
    }

    /// 血量下降
    setHpReduce(hurt: number) {
        if (this.data.isDead) return;
        this.data.hp = Math.max(0, this.data.hp - hurt);
        if (this.data.hp <= 0) this.data.isDead = true;
        this.handleHpChange(this.data.hp);
    }

    /// 血量增加，不包含护甲
    setHpRaise(raise: number) {
        if (this.data.isDead) return;
        const { hp: maxHp } = this.data.orignData;
        this.data.hp = Math.min(maxHp, this.data.hp + raise);
        this.handleHpChange(this.data.hp);
    }

    /// 血量变化时触发，通常供外部使用
    handleHpChange(hp: number) { }
}
