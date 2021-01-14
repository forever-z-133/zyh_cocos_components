import MiaoAnimation from "../../../utils/animation";
import MainPeople from "../MainPeople";
import PeopleAttack from "../utils/PeopleAttack";

const { ccclass, property } = cc._decorator;

/**
 * 炸弹怪
 */
@ccclass
export default class Boom extends PeopleAttack {
    /// 本身爆炸
    handleDead() {
        MiaoAnimation.shake(this.node, 10, () => {
            this.node.active = false;
        });
    }

    /// 遇到主角，把主角炸死
    meetHero(hero: MainPeople) {
        this.waitHeroMoveFinish(hero, () => {
            this.attack(hero.node);
            this.handleDead();
        });
        return false;
    }

    waitHeroMoveFinish(hero: MainPeople, callback?: Function) {
        cc.tween(hero.node).delay(hero.pm.moveSpeed).call(() => {
            callback && callback();
        }).start();
    }
}
