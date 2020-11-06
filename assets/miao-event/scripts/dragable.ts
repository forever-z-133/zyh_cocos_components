import MiaoEvent from './miao-event';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragAble extends cc.Component {
    @property({
        type: cc.Prefab,
        displayName: '拖拽时样式',
    })
    dragPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        displayName: '占位样式',
    })
    placeholdPrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        displayName: '安放样式',
    })
    dropPrefab: cc.Prefab = null;

    /// 可放置区域，在初始化时由脚本传入
    dropBoxs: cc.Node[] = [];

    /// 临时的 Node 节点
    origDragNode: cc.Node = null;
    dragNode: cc.Node = null;
    placeholdNode: cc.Node = null;
    activeDropBox: cc.Node = null;

    /// 保存元素初始位置，回归动画时用
    startLocation: any = null;

    /// 事件禁用
    disabled: boolean = false;

    onLoad(): void {
        const miaoEvent = new MiaoEvent();
        miaoEvent.bindEvent(this.node);
        miaoEvent.setDisabled(this.disabled);
        this.node['miaoEvent'] = miaoEvent;
        this.node.on('dragstart', this._onTouchStart, this);
        this.node.on('dragmove', this._onTouchMove, this);
        this.node.on('dragend', this._onTouchEnd, this);
    }

    onDestroy() {
        const miaoEvent: MiaoEvent = this.node['miaoEvent'];
        miaoEvent.unbindEvent(this.node);
        this.node['miaoEvent'] = null;
    }

    /// 事件绑定的函数
    _onTouchStart(e: cc.Event.EventTouch): void {
        const hasCustomDragStart = this.node.hasEventListener('custom_dragstart');
        if (hasCustomDragStart) this.node.emit('custom_dragstart', e);
        else this.defaultDragStart(e);
    }
    _onTouchMove(e: cc.Event.EventTouch): void {
        const hasCustomDragMove = this.node.hasEventListener('custom_dragmove');
        if (hasCustomDragMove) this.node.emit('custom_dragmove', e);
        else this.defaultDragMove(e);
    }
    _onTouchEnd(e: cc.Event.EventTouch): void {
        const hasCustomDragEnd = this.node.hasEventListener('custom_dragend');
        const hasCustomDrop = this.node.hasEventListener('custom_drop');
        if (hasCustomDragEnd) this.node.emit('custom_dragend', e);
        else if (hasCustomDrop) this.node.emit('custom_drop', e);
        else this.defaultDragEnd(e);
    }

    /// 拖拽开始，如果有临时元素，则生成临时元素，否则拖拽自身
    defaultDragStart(e: cc.Event.EventTouch): void {
        const node: cc.Node = e.currentTarget;
        this.initDragNode(node);
        this.initPlaceholdNode(this.dragNode);
        this.triggerDragStartMethod();
    }

    /// 拖拽中，移动元素
    defaultDragMove(e: cc.Event.EventTouch): void {
        const delta: cc.Vec2 = e.touch.getDelta();
        this.dragNode.x += delta.x;
        this.dragNode.y += delta.y;
    }

    /// 拖拽结束，清除临时元素，安放最终结果
    defaultDragEnd(e: cc.Event.EventTouch): void {
        this.triggerDragEndMethod();
        this.removeDragNode();
        this.removePlaceholdNode();
    }

    /// 公用的开始拖拽
    triggerDragStartMethod() {
        const node = this.dragNode;
        const { x, y } = node.position;
        const z = node.zIndex || 0;
        const opacity = node.opacity || 255;
        this.startLocation = { x, y, z, opacity };
        node.zIndex = this.node.z = 999;
    }

    /// 公用的结束拖拽
    triggerDragEndMethod() {
        const node = this.origDragNode;
        const { z, opacity } = this.startLocation;
        node.zIndex = z || 0;
        node.opacity = opacity || 255;
        const { x, y } = this.dragNode.position;
        node.setPosition(x, y);
    }

    /// 获取正在拖拽中的元素，可能是本身，可能是预制体
    initDragNode(node: cc.Node) {
        this.origDragNode = node;
        let dragNode: cc.Node = null;
        if (this.dragNode) {
            dragNode = this.dragNode;
            dragNode.active = true;
        } else if (this.dragPrefab) {
            // 能生成自定义拖拽元素
            dragNode = cc.instantiate(this.dragPrefab);
            node.parent.addChild(dragNode);
        } else {
            // 没有自定义的，则可用本身
            dragNode = node;
        }
        if (this.origDragNode !== node) node.opacity = 0;
        const { x, y } = node.position;
        dragNode.setPosition(x, y);
        this.dragNode = dragNode;
        return dragNode;
    }
    removeDragNode() {
        if (this.dragPrefab) {
            this.dragNode.active = false;
            this.origDragNode.opacity = 255;
        }
    }

    initPlaceholdNode(dragNode: cc.Node) {
        let placeholdNode: cc.Node = null;
        if (this.placeholdPrefab) {
            placeholdNode = cc.instantiate(this.placeholdPrefab);
            placeholdNode.setPosition(dragNode.x, dragNode.y);
            this.node.parent.addChild(placeholdNode);
        }
        this.placeholdNode = placeholdNode;
        return placeholdNode;
    }
    removePlaceholdNode() {
        if (this.placeholdNode) {
            this.node.parent.removeChild(this.placeholdNode);
            this.placeholdNode = null;
        }
    }

    /// 播放动画回归到原始位置
    triggerDragEndAnimation(location?: any, duration = 0.2, callback?: Function): void {
        if (!this.cacheDragNode) return console.error('代码使用错误');
        const { x, y } = location;
        let tween = cc.tween(this.cacheDragNode).to(duration, { x, y })
        if (callback) tween = tween.call(callback.bind(this));
        else tween = tween.call(this.triggerDragEndMethod.bind(this));
        tween.start();
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
        const hadCustomChange = this.node.hasEventListener('custom_drop_state_change');
        if (hadCustomChange) this.node.emit('custom_drop_state_change');
    }
    onCollisionExit(other, self) {
        if (!this.activeDropBox) return;
        const dropBox = this.dropBoxs.find((node) => other.node === node);
        if (dropBox === this.activeDropBox) this.activeDropBox = null;
        const hadCustomChange = this.node.hasEventListener('custom_drop_state_change');
        if (hadCustomChange) this.node.emit('custom_drop_state_change');
    }
}
