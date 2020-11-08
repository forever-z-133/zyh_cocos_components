import ClickAble from "../../miao-event/scripts/clickable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RadioCheckbox extends cc.Component {
    @property({
        type: [cc.Node],
        displayName: '选项'
    })
    choiceNodes: cc.Node[] = [];

    @property({
        displayName: '单选'
    })
    singleSelect: boolean = true;

    @property({
        displayName: '选项可取消'
    })
    canResume: boolean = false;

    @property({
        displayName: '初始值'
    })
    defaultValue: string = '';

    chosenData: any[] = [];

    onLoad() {
        this.init();
    }

    init() {
        this.reset();
        // 若没有写 button 属性，则自动按索引加上事件
        this.choiceNodes.forEach($choice => {
            if (!$choice.getComponent(cc.Button)) {
                $choice.addComponent(ClickAble);
                $choice.on('tap', this._handleClick.bind(this));
            }
        });
        // 设置默认值
        const defaultValue = this.defaultValue ? this.defaultValue.split(',') : [];
        defaultValue.forEach(value => this.choose(+value));
    }

    // 选择
    choose(index: number) {
        this.choiceNodes.forEach(($choice, i) => {
            if (i === index) {
                const isSelect = this.chosenData.includes(index);
                if (this.canResume) {
                    // 若可取消，则看是否已选中
                    if (isSelect) {
                        this.setSelected(i, false);
                    } else {
                        this.setSelected(i, true);
                    }
                } else {
                    // 若不可取消，则跳过已选中
                    if (!isSelect) {
                        this.setSelected(i, true);
                    }
                }
            } else {
                if (this.singleSelect) {
                    // 单选，其他元素都取消选中
                    this.setSelected(i, false);
                }
            }
        });
        this.handleChange(index);
        this.node.emit('change', this.chosenData);
    }

    // 重置
    reset() {
        this.choiceNodes.forEach(($choice, index) => {
            this.setSelected(index, false);
        });
        this.chosenData.length = 0;
    }

    handleChange(index: number) { }

    /// 显示选中元素
    setSelected(index: number, selected: boolean) {
        const $choice = this.choiceNodes[index];
        const $select = $choice.getChildByName('selected');
        if ($select) $select.active = selected;
        this.updateChosenData(index, selected);
    }

    updateChosenData(index: number, selected: boolean) {
        const dataIndex = this.chosenData.indexOf(index);
        if (dataIndex < 0 && selected) {
            this.chosenData.push(index);
        } else if (dataIndex > -1 && !selected) {
            this.chosenData.splice(dataIndex, 1);
        }
    }

    _handleClick(e: cc.Event.EventTouch) {
        const $choice = e.currentTarget;
        const index = this.choiceNodes.indexOf($choice);
        this.choose(index);
    }
}
