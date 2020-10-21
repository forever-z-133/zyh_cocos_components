enum EventStatus {
  DOWN = 'DOWN',
  MOVE = 'MOVE',
  DOUBLE_DOWN = 'DOUBLE_DOWN',
}

/**
 * 绑定 点击/双击/拖拽/轻滑/长按/缩放 事件
 * 比如 tap/click/dbclick/longtap/(drag|scale|rotate)start/swipe 等
 * 
 * 作用：
 * 简化事件绑定，拓展可绑定事件；
 * 可用于预制体等后置渲染元素的绑定事件；
 * 规范事件触发时机判断；
 * 
 * 演示用例：
 * const node: cc.Node;
 * const miaoEvent = new MiaoEvent();
 * miaoEvent.bindEvent(node);
 * node.on('longtap', (e) => {});
 * 
 * 注意事项：
 * tap 不同于 click，前者不区分其他事件故，而响应更快，
 * 比如 dbclick 其他会触发两次 tap，或拖拽结束也会触发 tap，可按情况进行选择
 */
export default class MiaoEvent {
  /// 是否禁用
  disabled: boolean = false;
  /// 手指状态标记
  eventStatus: EventStatus = null;

  // 绑定元素，类型在不同端可覆盖
  node: cc.Node = null;

  /// 其他临时变量
  tempFirstEvent: cc.Event.EventTouch = null; // 触屏起始点
  tempStartTime: number = 0; // 触屏起始时间点
  tempMoveDelta: cc.Vec2 = cc.Vec2.ZERO; // 触屏到放手移动的距离

  dbclickDelay: number = 250; // 连击最大间隔时间
  dbclickTimer: any = null; // 双击定时器

  longTapFlag: boolean = false; // 双击定时器结束时还为 true 则为长按了
  longTapDelay: number = 750; // 长按需满足的时长

  swipeDistence: number = 300; // 轻滑需满足的滑动长度

  /// TODO: 轻滑还未想好触发时机
  /// TODO: 双指缩放、双指旋转，有待开发

  /// 绑定基础事件，不同端可覆盖
  bindEvent(node: cc.Node) {
    this.node = node;
    const alreadyBind = node.hasEventListener(cc.Node.EventType.TOUCH_START);
    if (alreadyBind) return;
    node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
    node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
    node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
  }
  /// 解绑基础事件，不同端可覆盖
  unbindEvent(node: cc.Node) {
    node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
    node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
    node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    this.node = null;
  }
  /// 统一触发事件，不同端可覆盖
  dispathEvent(eventName: string, data: any) {
    this.node.emit(eventName, data);
  }

  /// 事件绑定的函数
  _onTouchStart(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    const now: number = Date.now();
    const delta = now - (this.tempStartTime || now);
    if (delta > 0 && delta <= this.dbclickDelay) {
      this.eventStatus = EventStatus.DOUBLE_DOWN;
    } else {
      this.eventStatus = EventStatus.DOWN;
    }
    this.longTapFlag = true;
    this.tempStartTime = now;
    this.tempFirstEvent = e;
    clearTimeout(this.dbclickTimer);
    this.dbclickTimer = setTimeout(this._afterDbClickTimeDelay.bind(this), this.dbclickDelay);
  }
  _onTouchMove(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    const delta = e.touch.getDelta();
    if (this.eventStatus === EventStatus.DOWN) {
      // 触屏后开始判断是否位移，位移则标记为位移
      if (delta.x > 1 || delta.x < -1 || delta.y > 1 || delta.y < -1) {
        this.eventStatus = EventStatus.MOVE;
        this._triggerEvent('dragstart', e, false);
        this._triggerEvent('dragmove', e, false);
      }
    }
    if (this.eventStatus === EventStatus.MOVE) {
      // 已位移后只做位移判断
      this._triggerEvent('dragmove', e, false);
    }
    this.tempMoveDelta.x += delta.x;
    this.tempMoveDelta.y += delta.y;
  }
  _onTouchEnd(e: cc.Event.EventTouch): void {
    if (this.disabled) return;
    const evt = this.tempFirstEvent;
    if (this.eventStatus === EventStatus.MOVE) {
      // 手指移动过，则为拖拽或轻滑
      this._triggerEvent('dragend', e);
      // // swipe 部分没想好怎样才算触发
      // const distenceX = Math.abs(this.tempMoveDelta.x);
      // const distenceY = Math.abs(this.tempMoveDelta.y);
      // if (distenceX > this.swipeDistence && distenceY < 10) {
      //   if (distenceX > 0) this._triggerEvent('swiperight', evt);
      //   else if (distenceX < 0) this._triggerEvent('swipeleft', evt);
      // } else if (distenceX < 10 && distenceY > this.swipeDistence) {
      //   if (distenceY > 0) this._triggerEvent('swipeup', evt);
      //   else if (distenceY < 0) this._triggerEvent('swipedown', evt);
      // }
    } else if (this.eventStatus === EventStatus.DOWN) {
      // 放手时，若时长很长，则为长按
      const now: number = Date.now();
      const delta = now - this.tempStartTime;
      if (delta > this.longTapDelay) {
        this._triggerEvent('longtap', evt);
      }
      // tap 几乎可认为就是 end，响应更快但更易与其他事件冲突，视情况选择使用
      this._triggerEvent('tap', evt, false);
    }
    this.longTapFlag = false;
  }
  _afterDbClickTimeDelay() {
    // 由于双击时肯定会触发单击，故而单击改为在延时后判断
    const evt = this.tempFirstEvent;
    if (this.eventStatus === EventStatus.DOUBLE_DOWN) {
      // 超时，且连击过，则为双击
      this._triggerEvent('dbclick', evt);
    } else if (this.eventStatus === EventStatus.DOWN && this.longTapFlag === false) {
      // 超时，且没有继续按住，则为单击
      this._triggerEvent('click', evt);
    }
  }

  /// 内部触发事件
  _triggerEvent(name: string, e: cc.Event.EventTouch, reset = true) {
    e.type = name;
    if (reset) {
      this.eventStatus = null;
      this.tempFirstEvent = null;
      this.tempMoveDelta = cc.Vec2.ZERO;
    }
    switch(name) {
      case 'tap': {
        this.dispathEvent('tap', e);
        break;
      }
      case 'click': {
        this.dispathEvent('click', e);
        break;
      }
      case 'dbclick': {
        this.dispathEvent('dbclick', e);
        this.dispathEvent('doubletap', e);
        break;
      }
      case 'longtap': {
        this.dispathEvent('longtap', e);
        break;
      }
      case 'dragstart': {
        this.dispathEvent('dragstart', e);
        break;
      }
      case 'dragmove': {
        this.dispathEvent('drag', e);
        this.dispathEvent('dragmove', e);
        break;
      }
      case 'dragend': {
        this.dispathEvent('dragend', e);
        break;
      }
      // case 'swipeup': {
      //   this.dispathEvent('swipeup', e);
      //   break;
      // }
      // case 'swipedown': {
      //   this.dispathEvent('swipedown', e);
      //   break;
      // }
      // case 'swipeleft': {
      //   this.dispathEvent('swipeleft', e);
      //   break;
      // }
      // case 'swiperight': {
      //   this.dispathEvent('swiperight', e);
      //   break;
      // }
    }
  }

  /// 其他外放事件
  setDisabled(disable: boolean) {
    this.disabled = disable;
  }
}

export { EventStatus };
