import MiaoEvent from './miao-event';

const { ccclass } = cc._decorator;

@ccclass
export default class ClickAble extends cc.Component {

  set disabled(val: boolean) {
    const miaoEvent: MiaoEvent = this.node['miaoEvent'];
    miaoEvent.setDisabled(val);
  }
  get disabled() {
    const miaoEvent: MiaoEvent = this.node['miaoEvent'];
    return miaoEvent.disabled;
  }

  onLoad(): void {
    const miaoEvent: MiaoEvent = new MiaoEvent();
    this.node['miaoEvent'] = miaoEvent;
    miaoEvent.bindEvent(this.node);
    miaoEvent.setDisabled(this.disabled);
  }

  onDestroy() {
    const miaoEvent: MiaoEvent = this.node['miaoEvent'];
    miaoEvent.unbindEvent(this.node);
    this.node['miaoEvent'] = null;
  }
}
