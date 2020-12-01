import marquee_item from "../utils/marquee-item";
import PositionTool from "../utils/position-tool";

const { ccclass, property } = cc._decorator;

/**
 * 自动生成元素游戏第一款：接水果
 * 
 */
@ccclass
export default class marquee_item_model01 extends marquee_item {
    @property({
        displayName: '自动消失时间',
        override: true,
        visible: false,
    })
    removeIntervalStr: string = '';
    @property({
        displayName: '是否增加点击',
        override: true,
        visible: false,
    })
    bindClick: boolean = false;

    @property({
        type: cc.Integer,
        displayName: '位移速度',
        tooltip: '注：值越大则越快',
    })
    moveSpeed: number = 300;

    get topOuterY() {
        if (!this.itemCreatorComp) return 0;
        return PositionTool.topOuter(this.node, this.itemCreatorComp.node);
    }
    get bottomOuterY() {
        if (!this.itemCreatorComp) return 0;
        return PositionTool.bottomOuter(this.node, this.itemCreatorComp.node);
    }

    setValue(value: number) {
        this.sourceNodes[value].active = true;
    }

    update(dt: number) {
        if (!this.node.active) return;
        if (this.freeze) return;
        this.node.y -= dt * this.moveSpeed;
        if (this.bottomOuterY > this.node.y) {
            this.setFreeze(true);
            this.itemCreatorComp.handleItemFail(this.node);
        }
    }

    onCollisionEnter(other, self) {
        if (other.tag !== 9999) return;
        this.setFreeze(true);
        this.itemCreatorComp.handleItemSuccess(this.node);
    }
}
