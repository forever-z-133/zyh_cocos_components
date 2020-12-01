const { ccclass, property } = cc._decorator;

@ccclass
export default class time_count_bar extends cc.Component {
    @property({
        type: cc.Integer,
        displayName: '总计时',
    })
    defaultTimeCounter: number = 60;

    @property({
        type: cc.Label,
        displayName: '文字元素',
    })
    labelNode: cc.Label = null;

    timeCounter: number = 0;
    timeCountTimer: any = 0;

    onLoad() {
        const str = this.timeToString(this.defaultTimeCounter);
        this.labelNode.string = str;
    }

    timerStart() {
        const str = this.timeToString(this.defaultTimeCounter);
        this.labelNode.string = str;
        this.timeCounter = this.defaultTimeCounter;
        this.timeCountTimer = setInterval(() => {
            this.updateTimeCount();
            if (this.timeCounter <= 0) {
                this.timerStop();
                this.node.emit('finish');
            }
        }, 1000);
    }
    timerStop() {
        clearInterval(this.timeCountTimer);
    }
    updateTimeCount() {
        const str = this.timeToString(--this.timeCounter);
        this.labelNode.string = str;
    }
    timeToString(time: number) {
        if (time < 1000) time *= 1000;
        const minute = time / 60 / 1000 >> 0;
        const second = (time - minute * 60 * 1000) / 1000 >> 0;
        return this.addZero(minute) + ':' + this.addZero(second);
    }
    addZero(num: number, length = 2) {
        let numStr = num + '';
        while (numStr.length < length) numStr = '0' + numStr;
        return numStr;
    }
}