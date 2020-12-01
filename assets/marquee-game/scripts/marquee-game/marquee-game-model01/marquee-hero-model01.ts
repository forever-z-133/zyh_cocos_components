import marquee_item from "../utils/marquee-item";
import PositionTool from "../utils/position-tool";

const { ccclass, property } = cc._decorator;

/**
 * 自动生成元素游戏第一款：接水果
 * 
 */
@ccclass
export default class marquee_hero_model01 extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '运动区域',
    })
    moveArea: cc.Node = null;

    @property({
        type: cc.Integer,
        displayName: '运动距离(x)',
    })
    moveDistenceX: number = 10;

    minX: number = 0;
    maxX: number = 0;

    onLoad() {
        this.minX = PositionTool.leftInner(this.node, this.moveArea);
        this.maxX = PositionTool.rightInner(this.node, this.moveArea);
    }

    triggerLeft() {
        if (this.node.x - this.moveDistenceX <= this.minX) return;
        this.node.x -= this.moveDistenceX;
    }
    triggerRight() {
        if (this.node.x + this.moveDistenceX >= this.maxX) return;
        this.node.x += this.moveDistenceX;
    }
}
