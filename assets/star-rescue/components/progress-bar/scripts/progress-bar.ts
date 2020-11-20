const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBar extends cc.Component {
    @property({
        type: cc.Float,
        displayName: '最小值',
    })
    min: number = 0;

    @property({
        type: cc.Float,
        displayName: '最大值',
    })
    max: number = 100;

    @property({
        type: cc.Float,
        displayName: '当前值',
    })
    value: number = 0;

    @property({
        displayName: '只读',
    })
    readonly: boolean = false;

    /// 百分比
    percent: number = 0;

    /// 相关元素
    $value: cc.Node = null;
    
    onLoad() {
        this.$value = this.node.getChildByName('value');
        this.setValue(this.value);
    }

    setRange(n1: number, n2 = 0) {
        this.min = n1 < n2 ? n1 : n2;
        this.max = n1 < n2 ? n2 : n1;
    }

    /// 修改值，更改视图
    setValue(value: number, min = this.min, max = this.max) {
        value = Math.max(min, Math.min(max, value));
        const totalWidth = this.node.width;
        const percent = value / (max - min);
        this.$value.width = totalWidth * percent;
        this.value = value;
        this.percent = percent;
    }
}
