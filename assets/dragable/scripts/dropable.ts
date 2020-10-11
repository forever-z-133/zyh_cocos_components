const { ccclass, property } = cc._decorator;

@ccclass
export default class DropAble extends cc.Component {

  @property({
    type: [cc.Node],
    displayName: '接收元素',
  })
  collideNodes: cc.Node[] = [];

  onLoad() {
    this.collideNodes.forEach(el => {
      const comp = el.getComponent('dragable');
      comp.onDragStart(this._onDragMove.bind(this));
      comp.onDragEnd(this._onDragEnd.bind(this));
    });
  }

  /// 判断元素节点与本节点的碰撞关系
  ifCollide(node: cc.Node): boolean {
    const rect1: cc.Rect = this.node.getBoundingBox();
    const rect2: cc.Rect = node.getBoundingBox();
    const isCollide: boolean = rect1.intersects(rect2);
    return isCollide;
  }

  /// 元素拖拽中，若碰撞则显示临时元素
  _onDragMove(e, comp: any) {

  }

  /// 元素拖拽结束，若碰撞则放入本节点
  _onDragEnd(e, comp: any) {
    const dragNode: cc.Node  = comp.dragNode;
    const isCollide = this.ifCollide(dragNode);
    if (isCollide) {
      this.defaultDropEnd(comp);
      return false;
    }
  }

  _triggerActiveChange() {

  }

  /// 确定要放在本节点下
  defaultDropEnd(comp: any) {
    if (comp.dropPrefab) {
      const dropNode = cc.instantiate(comp.dropPrefab);
      this.node.addChild(dropNode);
      dropNode.setPosition(0, 0);
    } else {
      comp.node.setPosition(comp.dragNode.position);
      comp.triggerDragEndMethod();
    }
    // // 放入后则不再能拖拽
    // comp.disabled = true;
  }
}
