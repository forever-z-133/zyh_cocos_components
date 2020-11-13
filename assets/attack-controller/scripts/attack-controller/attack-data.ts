/**
 * 伤害数据
 */
export default class AttackData {
    orignData: { [name: string]: number } = {};
    /// 血量
    hp: number = 100;
    /// 攻击力
    power: number = 5;
    /// 防御力
    defense: number = 0;
    /// 攻击范围
    range: number = 1;
    /// 攻击间隙（单位 ms）
    cd: number = 1000;

    /// 是否已死亡
    isDead: boolean = false;

    /// 初始化
    constructor(hp: number, power: number, defense: number, range: number, cd: number) {
        this.hp = hp;
        this.power = power;
        this.defense = defense;
        this.range = range;
        this.cd = cd;
        this.orignData = { hp, power, defense, range, cd };
    }
}
