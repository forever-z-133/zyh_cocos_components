import CoordinateItemRect from "../../map/utils/CoordinateItemRect";
import MainPeople from "../MainPeople";
import PeopleAttack from "./PeopleAttack";

const { ccclass, property } = cc._decorator;

/**
 * 人物与敌人的碰撞
 */
@ccclass
export default class PeopleCollide extends cc.Component {
    @property({
        type: [cc.Node],
        displayName: '敌人元素'
    })
    enemies: cc.Node[] = [];

    @property({
        displayName: '敌人位置',
        tooltip: '用逗号隔开'
    })
    enemiesPositionIndex: string = '';

    /// 主角实例，由外部传入
    hero: MainPeople = null;

    /// 敌人攻击数据
    enemiesPosition: number[] = [];

    onLoad() {
        this.node.on('will-collide', this._handleMoveCollid, this);
        this.enemiesPosition = this.enemiesPositionIndex.split ? this.enemiesPositionIndex.split(',').map(e => +e) : [];
    }

    /// 每次移动前做遇敌判断
    _handleMoveCollid(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        const total = this.hero.pm.mapTool.coordinate._rectList.length;
        const nowIndex = from.row;
        const targetIndex = Math.min(total, to.row);

        let willMove: boolean = true;

        for (let i = 0; i < total; i++) {
            // 找到起始位置之后的生还敌人
            const enemyPosition = i;
            if (enemyPosition < nowIndex) continue;
            const enemyIndex = this.enemiesPosition.indexOf(enemyPosition);
            if (enemyIndex < 0) continue;
            const enemy = this.enemies[enemyIndex];
            if (!enemy) continue;
            const comp = enemy.getComponent(PeopleAttack);
            if (!comp || comp.isDead) continue;

            const startAttackPosition = enemyPosition - (comp.range - 1);

            /// 主角可攻击到敌人
            if (targetIndex + this.hero.pa.range - 1 >= enemyPosition && comp.canBeAttack) {
                this.hero.pa.triggerNearByEnemy(enemy);
            }

            if (targetIndex < startAttackPosition) {
                // 在攻击范围外，不考虑
                continue;
            } else if (targetIndex === enemyPosition && comp.canJumpThrough) {
                // 是个陷阱，走到陷阱位置才会被打
                const heroFreeze = comp.meetHero(this.hero, from);
                if (heroFreeze) willMove = false;
                break;
            } else if (targetIndex >= startAttackPosition && targetIndex < enemyPosition) {
                // 在敌人攻击范围内
                const heroFreeze = comp.meetHero(this.hero, from);
                if (heroFreeze) willMove = false;
                continue;
            } else if (targetIndex >= enemyPosition && !comp.canJumpThrough) {
                // 在敌人后方但不能跳过
                willMove = false;
                break;
            } else {
                // 其他情况自由移动
            }
        }

        willMove ? this.triggerHeroMove(from, to, withAnim) : this.triggerCancelMove(from, to, withAnim);
    }

    /// 主角移动
    triggerHeroMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        this.hero.pm.triggerMove(from, to, withAnim);
    }
    /// 取消主角移动
    triggerCancelMove(from: CoordinateItemRect, to: CoordinateItemRect, withAnim = true) {
        this.hero.pm.mapTool.tempRect = from;
        this.hero.pm.triggerMoveFinish(from, to, withAnim);
        this.node.emit('cancel-move');
    }
}
