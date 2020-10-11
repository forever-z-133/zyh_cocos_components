const { ccclass, property } = cc._decorator;

@ccclass
export default class DragAble extends cc.Component {

    @property({
        type: [cc.Prefab],
        displayName: '拖拽时样式',
    })
    dragPrefab: cc.Prefab = null;

    @property({
        type: [cc.Prefab],
        displayName: '占位样式',
    })
    placeholdPrefab: cc.Prefab = null;

    @property({
        type: [cc.Prefab],
        displayName: '安放样式',
    })
    dropPrefab: cc.Prefab = null;

    /// 临时的 Node 节点
    dragNode: cc.Node = null;
    placeholdNode: cc.Node = null;

    /// 保存元素初始位置，回归动画时用
    startLocation: any = null;

    /// 事件禁用
    disabled: boolean = false;

    /// 外发出去的回调函数
    _customOnDragStart: Function = null;
    _customOnDragMove: Function = null;
    _customOnDragEnd: Function = null;
    onDragStart(fn?: Function): void { this._customOnDragStart = fn; }
    onDragMove(fn?: Function): void { this._customOnDragMove = fn; }
    onDragEnd(fn?: Function): void { this._customOnDragEnd = fn; }

    /// 事件绑定的函数
    _onTouchStart(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        if (this._customOnDragStart) {
            const res = this._customOnDragStart(e, this);
            if (res === false) return;
        }
        this.defaultDragStart(e);
    }
    _onTouchMove(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        if (this._customOnDragMove) {
            const res = this._customOnDragMove(e, this);
            if (res === false) return;
        }
        this.defaultDragMove(e);
    }
    _onTouchEnd(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        if (this._customOnDragEnd) {
            const res = this._customOnDragEnd(e, this);
            if (res === false) return;
        }
        this.defaultDragEnd(e);
    }

    /// 拖拽开始，如果有临时元素，则生成临时元素，否则拖拽自身
    defaultDragStart(e: cc.Event.EventTouch): void {
        const { x, y } = this.node.position;
        this.startLocation = { x, y, z: this.node.zIndex };

        if (this.dragPrefab) {
            this.dragNode = cc.instantiate(this.dragPrefab);
            this.node.parent.addChild(this.dragNode);
            this.dragNode.setPosition(x, y);
            this.node.opacity = 0;
        } else {
            this.dragNode = this.node;
        }
        this.dragNode.zIndex = 999;

        if (this.placeholdPrefab) {
            this.placeholdNode = cc.instantiate(this.placeholdPrefab);
            this.node.parent.addChild(this.placeholdNode);
            this.placeholdNode.setPosition(x, y);
        }
    }

    /// 拖拽中，移动元素
    defaultDragMove(e: cc.Event.EventTouch): void {
        const delta = e.touch.getDelta();
        this.dragNode.x += delta.x;
        this.dragNode.y += delta.y;
    }

    /// 拖拽结束，播放动画回归到原始位置，清除临时元素
    defaultDragEnd(e: cc.Event.EventTouch): void {
        this.triggerDragEndAnimation(this.startLocation, 0.2, () => {
            this.triggerDragEndMethod();
        });
    }

    /// 播放动画回归到原始位置
    triggerDragEndAnimation(location?: any, duration?: 0.2, callback?: Function): void {
        const { x, y, z } = location;
        this.node.zIndex = z;
        cc.tween(this.dragNode).to(duration, { x, y }).call(callback.bind(this)).start();
    }

    /// 清除临时元素
    triggerDragEndMethod(): void {
        if (this.dragPrefab) {
            this.node.parent.removeChild(this.dragNode);
            this.node.opacity = 255;
        }
        if (this.placeholdPrefab) {
            this.node.parent.removeChild(this.placeholdNode);
        }
    }

    onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }
}
