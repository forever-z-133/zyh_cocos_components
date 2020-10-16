import { EventStatus } from './events';

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

    /// 可放置区域，在初始化时由脚本传入
    dropBoxs: cc.Node[] = [];

    /// 临时的 Node 节点
    dragNode: cc.Node = null;
    placeholdNode: cc.Node = null;
    activeDropBox: cc.Node = null;

    /// 保存元素初始位置，回归动画时用
    startLocation: any = null;

    /// 事件禁用
    disabled: boolean = false;

    /// 中途放弃点击，比如滑动了一段之类的
    eventStatus: EventStatus;

    /// 按下抬起的事件间隔不得大于 300ms，否则算无效点击
    tempStartTime: number = 0;

    /// 外发出去的回调函数
    _customOnDragStart: Function = null;
    _customOnDragMove: Function = null;
    _customOnDragEnd: Function = null;
    _customOnDropStateChange: Function = null;
    _customOnDrop: Function = null;
    onDragStart(fn?: Function): void { this._customOnDragStart = fn; }
    onDragMove(fn?: Function): void { this._customOnDragMove = fn; }
    onDragEnd(fn?: Function): void { this._customOnDragEnd = fn; }
    onDropStateChange(fn?: Function): void { this._customOnDropStateChange = fn; }
    onDrop(fn?: Function): void { this._customOnDrop = fn; }

    /// 事件绑定的函数
    _onTouchStart(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        this.tempStartTime = Date.now();
        this.eventStatus = EventStatus.DOWN;
        if (this._customOnDragStart) {
            const res = this._customOnDragStart(this.node);
            if (res === false) return;
        }
        this.defaultDragStart(e);
    }
    _onTouchMove(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        const delta = e.touch.getDelta();
        if (delta.x > 1 || delta.y > 1) {
            this.eventStatus = EventStatus.MOVE;
        }
        if (this._customOnDragMove) {
            const res = this._customOnDragMove(this.node);
            if (res === false) return;
        }
        this.defaultDragMove(e);
    }
    _onTouchEnd(e: cc.Event.EventTouch): void {
        if (this.disabled) return;
        if (this.eventStatus !== EventStatus.MOVE) return;
        if (this._customOnDragEnd) {
            const res = this._customOnDragEnd(this.node);
            if (res === false) return;
        }
        if (this._customOnDrop) {
            const res = this._customOnDrop(this.node, this.activeDropBox);
            if (res === false) return;
        }
        this.defaultDragEnd(e);
    }

    /// 拖拽开始，如果有临时元素，则生成临时元素，否则拖拽自身
    defaultDragStart(e: cc.Event.EventTouch): void {
        const { x, y } = this.node.position;
        const z = this.node.zIndex || 0;
        this.startLocation = { x, y, z };

        if (this.dragPrefab) {
            this.dragNode = cc.instantiate(this.dragPrefab);
            this.node.parent.addChild(this.dragNode);
            this.dragNode.setPosition(x, y);
            this.node.opacity = 0;
        } else if (!this.dragNode) {
            this.dragNode = this.node;
        }
        this.dragNode.zIndex = this.node.z = 999;

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
    triggerDragEndAnimation(location?: any, duration = 0.2, callback?: Function): void {
        const { x, y } = location;
        let tween = cc.tween(this.dragNode).to(duration, { x, y })
        if (callback) tween = tween.call(callback.bind(this));
        else tween = tween.call(this.triggerDragEndMethod.bind(this));
        tween.start();
    }

    /// 清除临时元素
    triggerDragEndMethod(): void {
        this.node.zIndex = this.node.z = this.startLocation.z || 0;
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

    /// 监听碰撞事件，判断是否激活放置态
    onEnable() {
        cc.director.getCollisionManager().enabled = true;
    }
    onDisable() {
        cc.director.getCollisionManager().enabled = false;
    }
    onCollisionEnter(other, self) {
        const dropBox: cc.Node = this.dropBoxs.find((node) => other.node === node);
        if (!dropBox) return;
        this.activeDropBox = dropBox;
        if (this._customOnDropStateChange) {
            this._customOnDropStateChange(this.node, this.activeDropBox);
        }
    }
    onCollisionExit(other, self) {
        if (!this.activeDropBox) return;
        const dropBox = this.dropBoxs.find((node) => other.node === node);
        if (dropBox === this.activeDropBox) this.activeDropBox = null;
        if (this._customOnDropStateChange) {
            this._customOnDropStateChange(this.node, this.activeDropBox);
        }
    }
}
