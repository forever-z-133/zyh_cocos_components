import PositionTool from "./position-tool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    wrapper: cc.Node = null;
    item: cc.Node = null;

    onLoad() {
        this.wrapper = this.node.getChildByName('wrapper');
        this.item = this.wrapper.getChildByName('item');

        const { x, y } = PositionTool.topLeftInner(this.item, this.wrapper);
        this.item.setPosition(x, y);
    }
}
