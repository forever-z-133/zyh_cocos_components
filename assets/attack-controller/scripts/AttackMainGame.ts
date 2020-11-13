import People from "./roles/People";

const { ccclass, property } = cc._decorator;

/**
 * 攻击伤害计算
 */
@ccclass
export default class AttackMainGame extends cc.Component {
    @property({
        type: [cc.Node],
        displayName: '角色集合'
    })
    $peopleNodes: cc.Node[] = [];

    peopleComps: People[] = [];

    $hp1: cc.Label = null;
    $hp2: cc.Label = null;

    onLoad() {
        this.$peopleNodes.forEach((node, i) => {
            const comp = node.getComponent(People);
            this.peopleComps[i] = comp;
        });
        this.$hp1 = this.node.getChildByName('panel-left').getChildByName('value').getComponent(cc.Label);
        this.$hp2 = this.node.getChildByName('panel-right').getChildByName('value').getComponent(cc.Label);
    }

    handleAttack(e: any, index: string) {
        const enemy = this.$peopleNodes[index];
        const hero = this.peopleComps[0];
        hero.attack(enemy);
    }

    flag: boolean = false;
    handleKeepAttack() {
        const enemy = this.$peopleNodes[1];
        const hero = this.peopleComps[0];
        this.flag = !this.flag;
        this.node.getChildByName('methods').getChildByName('持续攻击').getComponent(cc.Label).string = this.flag ? '暂停攻击A' : '持续攻击A';
        this.flag ? hero.keepAttack(enemy) : hero.stopKeepAttack(enemy);
    }

    update() {
        this.$hp1.string = this.peopleComps[0].ac.data.hp.toString();
        this.$hp2.string = this.peopleComps[1].ac.data.hp.toString();
    }
}
