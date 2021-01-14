import MiaoAnimation from "../../../utils/animation";
import CoordinateItemRect from "../../map/utils/CoordinateItemRect";
import MainPeople from "../MainPeople";
import PeopleAttack from "../utils/PeopleAttack";

const { ccclass, property } = cc._decorator;

/**
 * 炸弹怪
 */
@ccclass
export default class Robot01 extends PeopleAttack {
    handleDead() {
        MiaoAnimation.shake(this.node, 10, () => {
            this.node.active = false;
        });
    }

    meetHero(hero: MainPeople, from: CoordinateItemRect) {
        this.waitHeroMoveFinish(hero, () => {
            // 将主角拉到身边
            const to = hero.pm.mapTool.coordinate._rectList[16];
            const orginSpeed = hero.pm.moveSpeed;
            // hero.pc.triggerCancelMove(from, to);
            hero.pm.moveSpeed = 1;
            hero.pm.triggerPeopleMove(from, to, true);
            hero.pm.moveSpeed = orginSpeed;
            // 血量掉空，主角死亡
            this.attack(hero.node);
            hero.die();
        });
        return false;
    }

    waitHeroMoveFinish(hero: MainPeople, callback?: Function) {
        cc.tween(hero.node).delay(hero.pm.moveSpeed).call(() => {
            callback && callback();
        }).start();
    }

    // waitHeroMoveFinish(hero: MainPeople, callback?: Function) {
    //     cc.tween(hero.node).delay(1).call(() => {
    //         callback && callback();
    //     }).start();
    // }
}
