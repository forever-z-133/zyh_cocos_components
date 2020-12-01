import marquee_main_game from "../utils/marquee_main_game";
import marquee_hero_model01 from "./marquee-hero-model01";
import marquee_item_creator_model01 from "./marquee-item-creator-model01";
import time_count_bar from "./time-count-bar";

const { ccclass, property } = cc._decorator;

/**
 * 自动生成元素游戏第一款：接水果
 * 
 */
@ccclass
export default class marquee_game_model01 extends marquee_main_game {
    @property({
        type: cc.Node,
        displayName: '主角',
    })
    hero: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '开始界面',
    })
    startScreen: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '成功界面',
    })
    successScreen: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '按键左',
    })
    leftButton: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '按键右',
    })
    rightButton: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '计时器',
    })
    timeCount: cc.Node = null;

    @property({
        type: cc.Label,
        displayName: '分数节点',
    })
    scoreBar: cc.Label = null;

    @property({
        type: cc.Integer,
        displayName: '答案',
    })
    answer: number = 1;

    @property({
        type: cc.Integer,
        displayName: '答案满足数量',
    })
    answerCount: number = 2;

    itemCreatorComp: marquee_item_creator_model01 = null;
    heroComp: marquee_hero_model01 = null;
    timeCountComp: time_count_bar = null;

    buttonState: string = '';

    hasRightAnswerCount: number = 0;

    onLoad() {
        super.onLoad();
        this.itemCreatorComp.game = this;
        this.timeCountComp = this.timeCount.getComponent(time_count_bar);
        this.heroComp = this.hero.getComponent(marquee_hero_model01);
        this.leftButton.on(cc.Node.EventType.TOUCH_START, this.handleTapLeftButton, this);
        this.leftButton.on(cc.Node.EventType.TOUCH_END, this.handleCancelButton, this);
        this.rightButton.on(cc.Node.EventType.TOUCH_START, this.handleTapRightButton, this);
        this.rightButton.on(cc.Node.EventType.TOUCH_END, this.handleCancelButton, this);
        this.timeCount.on('finish', this.handleOverTime, this);
        this.scoreBar.string = this.answerCount.toString();
    }
    gameStart() {
        super.gameStart();
        this.startScreen.active = false;
        this.successScreen.active = false;
        this.hasRightAnswerCount = 0;
        this.scoreBar.string = this.answerCount.toString();
        this.timeCountComp.timerStart();
    }
    gameStop() {
        super.gameStop();
        this.timeCountComp.timerStop();
    }

    /// 点击开始按钮
    handleClickStartButton() {
        this.gameStart();
    }

    /// 答对一题
    handleItemRight() {
        this.hasRightAnswerCount++;
        const moreNeedCount = this.answerCount - this.hasRightAnswerCount;
        const hasSuccess = moreNeedCount <= 0;
        this.scoreBar.string = moreNeedCount.toString();
        if (hasSuccess) {
            this.gameStop();
            this.playAudio(this.successAudio);
            this.successScreen.active = true;
        } else {
            this.playAudio(this.rightAudio);
        }
    }
    /// 答对一题
    handleItemWrong() {
        this.playAudio(this.wrongAudio);
    }

    /// 按住左键
    handleTapLeftButton() {
        if (this.itemCreatorComp.isStop) return;
        this.buttonState = 'LEFT';
    }
    /// 按住右键
    handleTapRightButton() {
        if (this.itemCreatorComp.isStop) return;
        this.buttonState = 'RIGHT';
    }
    /// 松开手指
    handleCancelButton() {
        this.buttonState = '';
    }

    /// 超时了
    handleOverTime() {
        this.playAudio(this.failAudio);
        this.startScreen.active = true;
        this.gameStop();
    }

    update() {
        if (this.buttonState === 'LEFT') {
            this.heroComp.triggerLeft();
        } else if (this.buttonState === 'RIGHT') {
            this.heroComp.triggerRight();
        }
    }
}
