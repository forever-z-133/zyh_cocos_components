/**
 * Popup 组件中的弹窗部分
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupDialog extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '选项集',
    })
    choiceWrapper: cc.Node = null;

    @property({
        displayName: '点击背景可关闭',
    })
    backdrop: boolean = true;

    rootNode: cc.Node = null;

    isShow: boolean = false;

    onLoad() {
        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }
    }

    onEnable() {
        // 点击背景，除 block input events 之外的地方都算
        if (this.backdrop) {
            let rootNode: cc.Node = this.node;
            while (rootNode.parent.parent) rootNode = rootNode.parent;
            rootNode.on(cc.Node.EventType.TOUCH_END, this._handleClickBackdrop, this);
            this.rootNode = rootNode;
        }
        // 点击本弹窗内元素
        this.node.on(cc.Node.EventType.TOUCH_END, this._handleClick, this);
    }
    onDisable() {
        if (this.backdrop && this.rootNode) {
            this.rootNode.off(cc.Node.EventType.TOUCH_END, this._handleClickBackdrop, this);
        }
        this.node.off(cc.Node.EventType.TOUCH_END, this._handleClick, this);
    }

    /// 手动显示
    show(withAnimation = true) {
        withAnimation ? this._triggerShow() : this._triggerSimpleShow();
    }
    /// 手动隐藏
    hide(withAnimation = true) {
        withAnimation ? this._triggerHide() : this._triggerSimpleHide();
    }
    /// 手动选中某个元素
    choose(item: number | string | cc.Node) {
        let itemNode: cc.Node = null;
        if (typeof item === 'number' || typeof item === 'string') {
            itemNode = this.choiceWrapper.children[item];
        } else itemNode = item;
        this._handleClickItem(itemNode, true);
    }

    /// 点中本弹窗，判断出是否点中某选项
    _handleClick(e: cc.Event.EventTouch) {
        const pos = this.node.convertToNodeSpaceAR(e.getLocation());
        const point = new cc.Vec2(pos.x, pos.y);
        let itemNode: cc.Node = null;
        for (let node of this.choiceWrapper.children) {
            const rect: cc.Rect = node.getBoundingBox();
            if (rect.contains(point)) { itemNode = node; break; }
        }
        if (!itemNode) return;
        this._handleClickItem(itemNode);
    }

    /// 点中其中选项
    _handleClickItem(itemNode: cc.Node, isByMethod = false) {
        const index = this.choiceWrapper.children.indexOf(itemNode);
        if (isByMethod) {
            this.node.emit('click-item', index, itemNode, isByMethod);
        } else {
            cc.tween(itemNode).to(0.05, { scale: 1.1 }).to(0.05, { scale: 1 }).call(() => {
                this.node.emit('click-item', index, itemNode, isByMethod);
            }).start();
        }
    }

    /// 点中非弹窗部分
    _handleClickBackdrop(e: cc.Event.EventTouch) {
        this._triggerHide();
    }

    /// 显隐弹窗
    _triggerSimpleShow() {
        this.node.active = true;
        this.node.opacity = 255;
        this.isShow = true;
    }
    _triggerShow() {
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node).to(0.1, { opacity: 255 }).call(() => {
            this.isShow = true;
        }).start();
    }
    _triggerSimpleHide() {
        this.node.active = false;
        this.isShow = false;
        this.node.emit('close');
    }
    _triggerHide() {
        this.node.active = true;
        this.node.opacity = 255;
        cc.tween(this.node).to(0.1, { opacity: 0 }).call(() => {
            this.node.active = false;
            this.isShow = false;
            this.node.emit('close');
        }).start();
    }
}
