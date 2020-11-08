/**
 * 公共动画
 */
export default class MiaoAnimation {
  /// 逐渐显示
  static fadeIn(node: cc.Node, callback?: Function) {
    node.active = true;
    node.opacity = 0;
    cc.tween(node).to(0.2, { opacity: 255 }).call(() => {
      callback && callback();
    }).start();
  }
  /// 逐渐消失
  static fadeOut(node: cc.Node, callback?: Function) {
    node.active = true;
    node.opacity = 255;
    cc.tween(node).to(0.2, { opacity: 0 }).call(() => {
      callback && callback();
    }).start();
  }
  /// 左右抖一下
  static shake(node: cc.Node, callback?: Function) {
    const x = node.x;
    cc.tween(node).to(0.05, { x: x + 20 }).to(0.1, { x: x - 20 }).to(0.05, { x }).call(() => {
      callback && callback();
    }).start();
  }
}
