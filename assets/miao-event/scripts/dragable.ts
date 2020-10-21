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
    cacheDragNode: cc.Node = null;
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
        const dragNode = this.getDragNode(node);

        this.triggerDragStartMethod(dragNode);

        if (this.placeholdPrefab) {
            this.placeholdNode = cc.instantiate(this.placeholdPrefab);
            this.node.parent.addChild(this.placeholdNode);
            this.placeholdNode.setPosition(dragNode.x, dragNode.y);
        }
    }

    /// 拖拽中，移动元素
    defaultDragMove(e: cc.Event.EventTouch): void {
        const node: cc.Node = e.currentTarget;
        const delta: cc.Vec2 = e.touch.getDelta();
        const dragNode: cc.Node = this.getDragNode(node);
        dragNode.x += delta.x;
        dragNode.y += delta.y;
    }

    /// 拖拽结束，清除临时元素，安放最终结果
    defaultDragEnd(e: cc.Event.EventTouch): void {
        const node: cc.Node = e.currentTarget;
        const dragNode: cc.Node = this.getDragNode(node);

        this.triggerDragEndMethod(dragNode);

        if (this.dragPrefab) {
            node.parent.removeChild(dragNode);
            node.opacity = 255;
        }
        if (this.placeholdPrefab) {
            this.node.parent.removeChild(this.placeholdNode);
        }
    }

    /// 公用的开始拖拽
    triggerDragStartMethod(node: cc.Node) {
        const { x, y } = node.position;
        const z = node.zIndex || 0;
        const opacity = node.opacity || 255;
        this.startLocation = { x, y, z, opacity };
        node.zIndex = this.node.z = 999;
    }

    /// 公用的结束拖拽
    triggerDragEndMethod(node: cc.Node) {
        const { z, opacity } = this.startLocation;
        node.zIndex = z || 0;
        node.opacity = opacity || 255;
    }

    /// 获取正在拖拽中的元素，可能是本身，可能是预制体
    getDragNode(eventTragetNode: cc.Node) {
        // 已赋予了拖拽元素，则返回
        if (this.cacheDragNode) return this.cacheDragNode;
        const { x, y } = eventTragetNode.position;
        // 能生成拖拽元素就生成
        if (this.dragPrefab) {
            const dragNode = cc.instantiate(this.dragPrefab);
            eventTragetNode.parent.addChild(dragNode);
            dragNode.setPosition(x, y);
            eventTragetNode.opacity = 0;
            this.cacheDragNode = dragNode;
        }
        // 没有预制体，则可用本身
        return this.cacheDragNode || eventTragetNode;
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
