import { randomInt } from "../../../../utils/utils";
import marquee_item_creator from "./marquee-item-creator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class marquee_item extends cc.Component {
    @property({
        type: [cc.Node],
        displayName: '素材',
    })
    sourceNodes: cc.Node[] = [];

    @property({
        displayName: '自动消失时间',
    })
    removeIntervalStr: string = '1000-2000';

    @property({
        displayName: '是否增加点击',
    })
    bindClick: boolean = false;

    /// 生成容器，由外部传入
    itemCreatorComp: marquee_item_creator = null;

    /// 冻结，无法进行操作
    freeze: boolean = false;

    /// 定时相关
    _createStartTime: number = 0;
    _removeInterval: number = 0;
    _removeTimer: boolean = false;

    onLoad() { }

    onEnable() {
        if (!this.bindClick) return;
        this.node.on(cc.Node.EventType.TOUCH_END, this._handleClick, this);
    }
    onDisable() {
        if (!this.bindClick) return;
        this.node.off(cc.Node.EventType.TOUCH_END, this._handleClick, this);
    }

    _handleClick() {
        this.itemCreatorComp.handleClickItem(this.node);
    }

    /// 触发开始自动消失
    startRemoveTimer() {
        if (!this.removeIntervalStr) return;
        this._removeTimer = true;
        const [min, max = min] = this.removeIntervalStr ? this.removeIntervalStr.split('-') : [];
        if (min < 1 && max < 1) return console.log('生成时间设置有误');
        this._createStartTime = Date.now();
        const randomTime = randomInt(min, max);
        this._removeInterval = randomTime;
    }
    /// 停止自动消失
    stopRemoveTimer() {
        this._removeTimer = false;
    }

    /// 触发成功效果，比如点对/碰撞等
    success() {
        this.itemCreatorComp.handleItemSuccess(this.node);
    }

    /// 触发失败效果，比如点错/超出屏幕/自动消失等
    fail() {
        this.itemCreatorComp.handleItemFail(this.node);
    }

    /// 设置是否冻结
    setFreeze(freeze: boolean) {
        this.freeze = freeze;
    }

    update(dt: number) {
        if (!this.node.active) return;
        if (this.freeze) return;
        // 定时自动消失
        if (this._removeTimer) {
            const nowTime = Date.now();
            if (this._createStartTime + this._removeInterval <= nowTime) {
                this.stopRemoveTimer();
                this.fail();
            }
        }
    }
}
