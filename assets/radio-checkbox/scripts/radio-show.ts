import MiaoAnimation from "../../utils/animation";
import RadioCheckbox from "./radio-checkbox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RadioShow extends RadioCheckbox {
  @property({
      type: [cc.Node],
      displayName: '控制目标'
  })
  targetNodes: cc.Node[] = [];

  @property({
    displayName: '单选',
    visible: false,
    override: true,
  })
  singleSelect: boolean = true;

  @property({
    displayName: '选项可取消',
    visible: false,
    override: true,
  })
  canResume: boolean = false;

  @property({
    displayName: '初始值',
    visible: false,
    override: true,
  })
  defaultValue: string = '0';

  /// 当有值变化时触发
  handleChange(index: number) {
    super.handleChange(index);
    this.targetNodes.forEach((node, i) => {
      const showState = index === i;
      if (showState !== node.active) {
        this.setTargetSelected(i, showState);
      }
    });
  }

  /// 设置目标状态（可改写）
  setTargetSelected(index: number, selected: boolean) {
    const node = this.targetNodes[index];
    if (selected) {
      MiaoAnimation.fadeIn(node);
    } else {
      MiaoAnimation.fadeOut(node, () => node.active = false);
    }
  }
}