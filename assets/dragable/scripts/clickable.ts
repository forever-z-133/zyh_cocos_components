import { EventStatus } from './events';

const { ccclass } = cc._decorator;

@ccclass
export default class ClickAble extends cc.Component {
  /// 事件禁用
  disabled: boolean = false;

  /// 外发出去的回调函数
  _customOnClick: Function = null;
  onClick(fn?: Function): void { this._customOnClick = fn; }

  /// 中途放弃点击，比如滑动了一段之类的
  eventStatus: EventStatus;

  /// 按下抬起的事件间隔不得大于 300ms，否则算无效点击
  tempStartTime: number = 0;

  /// 事件绑定的函数
  _onTouchStart(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    this.tempStartTime = Date.now();
    this.eventStatus = EventStatus.DOWN;
  }
  _onTouchMove(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    const delta = e.touch.getDelta();
    if (delta.x === 0 && delta.y === 0) return;
    this.eventStatus = EventStatus.MOVE;
  }
  _onTouchEnd(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    if (this.eventStatus !== EventStatus.DOWN) return;
    const offsetTime: number = Date.now() - this.tempStartTime;
    if (offsetTime > 300) return;
    if (this._customOnClick) {
      this._customOnClick(this.node);
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
