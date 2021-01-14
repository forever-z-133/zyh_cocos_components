import MiaoAnimation from "../../../utils/animation";
import MainPeople from "../MainPeople";
import PeopleAttack from "../utils/PeopleAttack";

const { ccclass, property } = cc._decorator;

/**
 * 炸弹怪
 */
@ccclass
export default class Robot01 extends PeopleAttack {
    handleDead() {
        this.stopKeepAttack();
        MiaoAnimation.shake(this.node, 10, () => {
            this.node.active = false;
        });
    }

    meetHero(hero: MainPeople) {
        this.keepAttack(hero.node);
        return false;
    }
}
