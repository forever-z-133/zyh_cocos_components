import PopupDialog from "./popup-dialog";

const { ccclass, property } = cc._decorator;

enum ValueShowType {
    REPLACE_IMAGE,
    APPEND_CHILD,
}

@ccclass
export default class Popup extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '触发元素',
    })
    triggerNode: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '结果元素',
    })
    valueNode: cc.Node = null;

    @property({
        type: cc.Enum(ValueShowType),
        displayName: '结果渲染方式',
        tooltip: 'REPLACE_IMAGE = 换图片\nAPPEND_CHILD = 插入元素'
    })
    valueShowType: ValueShowType = ValueShowType.APPEND_CHILD;

    @property({
        type: cc.Node,
        displayName: '弹窗元素',
        tooltip: '弹窗元素 和 弹窗预制体 二选一'
    })
    popupNode: cc.Node = null;

    @property({
        type: cc.Prefab,
        displayName: '弹窗预制体',
        tooltip: '弹窗元素 和 弹窗预制体 二选一'
    })
    popupPrefab: cc.Prefab = null;

    popupComp: PopupDialog = null;

    onLoad() {
        // 若有弹窗预制体，则用预制体
        if (this.popupPrefab) {
            this.popupNode = cc.instantiate(this.popupPrefab);
            this.node.addChild(this.popupNode);
            this.setDialogPosition();
        }
        // 本组件必须要有事件穿透拦截
        if (!this.node.getComponent(cc.BlockInputEvents)) {
            this.node.addComponent(cc.BlockInputEvents);
        }
        // 弹窗的类
        this.popupComp = this.popupNode.getComponent(PopupDialog);
        // 弹窗默认关闭
        this.hide(false);
    }
    onEnable() {
        // 绑定点击触发，绑定选择回调
        this.triggerNode.on(cc.Node.EventType.TOUCH_END, this._handleClick, this);
        this.popupNode.on('click-item', this._handleChoose, this);
    }
    onDisable() {
        this.triggerNode.off(cc.Node.EventType.TOUCH_END, this._handleClick, this);
        this.popupNode.off('click-item', this._handleChoose, this);
    }

    show(withAnimation = true) {
        this.popupComp.show(withAnimation);
    }
    hide(withAnimation = true) {
        this.popupComp.hide(withAnimation);
    }
    choose(item: number | string | cc.Node) {
        this.popupComp.choose(item);
    }

    /// 点击弹窗开关
    _handleClick(e: cc.Event.EventTouch) {
        // 外放开启弹窗回调
        this.popupComp.isShow ? this.node.emit('before-hide') : this.node.emit('before-show');
        // 显示隐藏弹窗
        this.popupComp.isShow ? this.popupComp.hide() : this.popupComp.show();
    }

    /// 选中某元素
    _handleChoose(index: number, itemNode: cc.Node, isByMethod = false) {
        this.setValue(index, itemNode);
        // 弹窗消失
        const withAnimation = !isByMethod;
        this.popupComp.hide(withAnimation);
        // 外放回调
        this.node.emit('value-change', index, this, isByMethod);
    }

    /// 设置结果元素，比如放元素或换图（可改写）
    setValue(index: number, chosenNode: cc.Node) {
        if (!chosenNode) {
            chosenNode = this.popupComp.choiceWrapper.children[index];
        }
        switch (this.valueShowType) {
            case ValueShowType.APPEND_CHILD: {
                // 插入元素的复制
                const newNode = cc.instantiate(chosenNode);
                newNode.setPosition(0, 0);
                this.valueNode.removeAllChildren();
                this.valueNode.addChild(newNode);
                break;
            }
            case ValueShowType.REPLACE_IMAGE: {
                const origHeight = this.valueNode.height;
                // 替换两者的图片
                const [item] = chosenNode.children;
                const img = item.getComponent(cc.Sprite).spriteFrame;
                this.valueNode.getComponent(cc.Sprite).spriteFrame = img;
                // 按高度缩放尺寸
                this.valueNode.height = origHeight;
                this.valueNode.width = origHeight / item.height * item.width;
                break;
            }
        }
    }

    /// 预制体弹窗在元素正上方（可改写）
    setDialogPosition() {
        let y = 0;
        y += (1 - this.triggerNode.anchorY) * this.triggerNode.height;
        y += (1 - this.popupNode.anchorY) * this.popupNode.height;
        this.popupNode.setPosition(0, y);
    }
}
