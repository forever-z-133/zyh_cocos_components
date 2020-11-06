import MiaoEvent from './miao-event';

const { ccclass } = cc._decorator;

@ccclass
export default class ClickAble extends cc.Component {
  /// 事件禁用
  disabled: boolean = false;

  onLoad(): void {
    const miaoEvent: MiaoEvent = new MiaoEvent();
    miaoEvent.bindEvent(this.node);
    miaoEvent.setDisabled(this.disabled);
    this.node['miaoEvent'] = miaoEvent;
  }

  onDestroy() {
    const miaoEvent: MiaoEvent = this.node['miaoEvent'];
    miaoEvent.unbindEvent(this.node);
    this.node['miaoEvent'] = null;
  }

  update(): void {
    const miaoEvent: MiaoEvent = this.node['miaoEvent'];
    if (miaoEvent && miaoEvent.disabled !== this.disabled) {
      miaoEvent.setDisabled(this.disabled);
    }
  }
}
