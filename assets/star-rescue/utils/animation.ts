// 为避免连续触发造成的蝴蝶效应，写个缓存存储初始状态
const weakMap = new WeakMap();

/**
 * 公共动画
 */
export default class MiaoAnimation {
  /// 逐渐显示
  static fadeIn(node: cc.Node, duration = 0.2, callback?: Function) {
    node.active = true;
    node.opacity = 0;
    cc.tween(node).to(duration, { opacity: 255 }).call(() => {
      callback && callback();
    }).start();
  }

  /// 逐渐消失
  static fadeOut(node: cc.Node, duration = 0.2, callback?: Function) {
    node.active = true;
    node.opacity = 255;
    cc.tween(node).to(duration, { opacity: 0 }).call(() => {
      callback && callback();
    }).start();
  }

  /// 左右抖一下
  static shake(node: cc.Node, distence = 20, callback?: Function) {
    if (!weakMap.get(node)) weakMap.set(node, node.x);
    const x = weakMap.get(node);
    cc.tween(node).to(0.05, { x: x + distence }).to(0.1, { x: x - distence }).to(0.05, { x }).call(() => {
      callback && callback();
    }).start();
  }
}
