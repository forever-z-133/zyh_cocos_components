import { randomInt } from "../../../../utils/utils";
import marquee_item_creator from "../utils/marquee-item-creator";
import PositionTool from "../utils/position-tool";
import marquee_game_model01 from "./marquee-game-model01";
import marquee_item_model01 from "./marquee-item-model01";

const { ccclass, property } = cc._decorator;

/**
 * 自动生成元素游戏第一款：接水果
 * 
 * 自动生成水果，在最上方，然后向下掉落，当碰到底部则销毁，当碰到篮筐则
 */
@ccclass
export default class marquee_item_creator_model01 extends marquee_item_creator {
    @property({
        type: cc.Integer,
        displayName: '栏数',
    })
    columnCount: number = 5;

    game: marquee_game_model01 = null;

    /// 新建元素时进行赋值
    tempRandomValue: number[] = [];
    handleItemCreate(item: cc.Node) {
        const comp: marquee_item_model01 = item['itemComp'];
        // 赋值，确定显示哪个元素
        const source = comp.sourceNodes;
        if (this.tempRandomValue.length < 1) {
            new Array(source.length).fill(null).map((e, i) => this.tempRandomValue.push(i));
        }
        const index = randomInt(this.tempRandomValue.length);
        const value = this.tempRandomValue[index];
        this.tempRandomValue.splice(index, 1);
        comp.setValue(value);
        item['value'] = value;
        // 放在顶部
        const startX = PositionTool.leftInner(item, this.node);
        const endX = PositionTool.rightInner(item, this.node);
        const x = randomInt(startX, endX);
        item.setPosition(x, comp.topOuterY);
    }

    /// 碰到篮子时触发
    handleItemSuccess(item: cc.Node) {
        if (item['value'] === this.game.answer) {
            this.game.handleItemRight();
        } else {
            this.game.handleItemWrong();
        }
        cc.tween(item).to(0.2, { opacity: 0 }).call(() => {
            item.destroy();
        }).start();
    }

    /// 出界时触发
    handleItemFail(item: cc.Node) {
        cc.tween(item).to(0.2, { opacity: 0 }).call(() => {
            item.destroy();
        }).start();
    }
}
