import { randomInt } from "../../../../utils/utils";
import marquee_item from "./marquee-item";

const { ccclass, property } = cc._decorator;

/**
 * 定时生成元素项到该节点中
 */
@ccclass
export default class marquee_item_creator extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '项预制体',
    })
    itemPrefab: cc.Node = null;

    @property({
        displayName: '生成时间',
        tooltip: '例如：1000-2000 表示 1s-2s 时间段中随机时间生成新 item'
    })
    createIntervalStr: string = '1000-2000';

    /// 用于给每个生成项一个可控标记
    _tempId: number = 0;
    itemName: string = '';

    /// 生成是否暂停
    isStop: boolean = true;

    /// 定时相关
    _createStartTime: number = 0;
    _nextCreateInterval: number = 0;

    onLoad() {
        this.itemName = this.node.name + '-child';
    }

    gameStart() {
        this.refreshCreateTime();
        this.clearAllItems();
        cc.director.getCollisionManager().enabled = true;
        this.isStop = false;
    }
    gameStop() {
        this.isStop = true;
        this.stopAllItems();
        // cc.director.getCollisionManager().enabled = false;
    }
    gameReset() {
        this.clearAllItems();
        // cc.director.getCollisionManager().enabled = false;
    }

    /// 刷新定时，开始下项的生成倒计时
    refreshCreateTime(time?: number) {
        const [min, max = min] = this.createIntervalStr ? this.createIntervalStr.split('-') : [];
        if (min < 1 && max < 1) return console.log('生成时间设置有误');
        this._createStartTime = time || Date.now();
        const randomTime = randomInt(min, max);
        this._nextCreateInterval = randomTime;
    }

    /// 生成单项
    triggerCreateItem() {
        const targetWrapper = this.node;
        const item = cc.instantiate(this.itemPrefab);
        item.name = this.itemName;
        item['createId'] = ++this._tempId;
        targetWrapper.addChild(item);
        const comp = item.getComponent(marquee_item);
        comp.itemCreatorComp = this;
        item['itemComp'] = comp;
        this.handleItemCreate(item);
        item.active = true;
    }
    getAllItems() {
        const targetWrapper = this.node;
        return targetWrapper.children.filter(e => e.name === this.itemName);
    }
    clearAllItems() {
        const items = this.getAllItems();
        items.forEach(node => node.destroy());
    }
    stopAllItems() {
        const items = this.getAllItems();
        items.forEach(node => node['itemComp'].setFreeze(true));
    }

    /// 生成后，由主程序决定干什么
    handleItemCreate(item: cc.Node) {
        this.node.emit('create', item);
    }

    /// 放给子项，由子项触发
    handleClickItem(item: cc.Node) { }
    handleItemSuccess(item: cc.Node) { }
    handleItemFail(item: cc.Node) { }

    /// 随机事件后生成新元素
    update(dt: number) {
        if (this.isStop) return;
        const nowTime = Date.now();
        if (this._createStartTime + this._nextCreateInterval <= nowTime) {
            this.triggerCreateItem();
            this.refreshCreateTime(nowTime);
        }
    }
}
