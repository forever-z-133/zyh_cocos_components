import ClickAble from "../../miao-event/scripts/clickable";
import { arrayEqual } from "../../utils/utils";
import RadioCheckbox from "./radio-checkbox";

const { ccclass, property } = cc._decorator;

/// 提交按钮显示时机
enum RadioCheckboxSubmitShowType {
    ALLWAYS_SHOW, // 一直显示
    WHEN_CHOSEN_SHOW, // 有勾选时显示
    ALL_RIGHT_SHOW, // 已选全对时显示
    ALL_RIGHT_HIDE, // 答对时隐藏
}

/// 错误标记显示时机
enum RadioCheckboxWrongStateShowType {
    ALL_NOT_RIGHT, // 所有的非正确都标记
    CHOSEN_WRONG, // 已选的非正确则标记
    RIGHT_AND_CHOSEN_WRONG, // 正确答案和已选的非正确则标记
}

@ccclass
export default class RadioCheckboxSubmit extends RadioCheckbox {
    @property({
        type: cc.Node,
        displayName: '提交按钮'
    })
    submitButton: cc.Node = null;

    @property({
        type: cc.Enum(RadioCheckboxSubmitShowType),
        displayName: '提交按钮显示时机',
        tooltip: 'ALLWAYS_SHOW\n一直显示\n\nWHEN_CHOSEN_SHOW\n有勾选时显示\n\nALL_RIGHT_SHOW\n已选全对时显示\n\nALL_RIGHT_HIDE\n一直显示但答对时隐藏'
    })
    submitShowType: RadioCheckboxSubmitShowType = RadioCheckboxSubmitShowType.ALLWAYS_SHOW;

    @property({
        displayName: '答案'
    })
    rightAnswer: string = '';

    @property({
        type: cc.Enum(RadioCheckboxWrongStateShowType),
        displayName: '错误标记显示时机',
        tooltip: 'ALL_WRONG\n所有的非正确都标记\n\nCHOSEN_WRONG\n已选中的非正确则标记\n\nRIGHT_AND_CHOSEN_WRONG\n正确答案和已选的非正确则标记'
    })
    wrongStateShowType: RadioCheckboxWrongStateShowType = RadioCheckboxWrongStateShowType.CHOSEN_WRONG;

    /// 点过提交，用于简单判断是否要重置
    hasSubmit: boolean = false;

    /// 全对时禁用所有事件
    eventPrevent: boolean = false;

    init() {
        super.init();
        const $submit = this.submitButton;
        if ($submit && !$submit.getComponent(cc.Button)) {
            $submit.addComponent(ClickAble);
            $submit.on('tap', this._handleSubmit.bind(this));
        }
    }

    reset() {
        super.reset();
        // 清除答案标记
        this.resetAnswerState();
        // 提交按钮的显示与否
        if (this.submitButton) {
            if (this.submitShowType === RadioCheckboxSubmitShowType.WHEN_CHOSEN_SHOW || this.submitShowType === RadioCheckboxSubmitShowType.ALL_RIGHT_SHOW) {
                this.submitButton.active = false;
            } else {
                this.submitButton.active = true;
            }
        }
        // 取消提交封禁
        this.hasSubmit = false;
        this.eventPrevent = false;
    }

    resetAnswerState() {
        this.choiceNodes.forEach(($choice, index) => {
            this.setRightState(index, false, true);
        });
    }

    // 显示正确错误标记
    setRightState(index: number, right = false, isReset = false) {
        const $choice = this.choiceNodes[index];
        const isRight = isReset ? false : right;
        const isWrong = isReset ? false : !right;
        const $right = $choice.getChildByName('right');
        const $wrong = $choice.getChildByName('wrong');
        if ($right) $right.active = isRight;
        if ($wrong) $wrong.active = isWrong;
    }

    _handleClick(e: cc.Event.EventTouch) {
        if (this.eventPrevent) return false;
        // 若提交过错误的再点，则重置
        this.hasSubmit && this.resetAnswerState();
        this.hasSubmit = false;
        // 原勾选逻辑
        super._handleClick(e);
        // 提交按钮是否隐藏
        if (this.submitButton) {
            if (this.submitShowType === RadioCheckboxSubmitShowType.WHEN_CHOSEN_SHOW) {
                const hasSomeChosen = this.chosenData.length > 0;
                this.submitButton.active = hasSomeChosen;
            } else if (this.submitShowType === RadioCheckboxSubmitShowType.ALL_RIGHT_SHOW) {
                const isAllRight = this._getAnswerData()[2];
                this.submitButton.active = isAllRight;
            }
        }
    }

    _handleSubmit(e: cc.Event.EventTouch) {
        if (this.eventPrevent) return false;
        if (this.chosenData.length < 1) return false;
        this.hasSubmit = true;
        const [nowAnswer, rightAnswer, isAllRight] = this._getAnswerData();
        this._updateAnswerState(nowAnswer, rightAnswer, isAllRight);
        if (isAllRight) this._handleAllRight();
    }

    /// 根据答案显示正确错误标记
    _updateAnswerState(nowAnswer: any[], rightAnswer: any[], isAllRight: boolean) {
        this.choiceNodes.forEach(($choice, index) => {
            const isSelect = nowAnswer.includes(index);
            const needRight = rightAnswer.includes(index);
            const isRight = needRight && isSelect;
            if (this.wrongStateShowType === RadioCheckboxWrongStateShowType.ALL_NOT_RIGHT) {
                // 不是全对时，所有元素都显示标记
                if (isAllRight) {
                    isRight && this.setRightState(index, isRight);
                } else this.setRightState(index, isRight);
            } else if (this.wrongStateShowType === RadioCheckboxWrongStateShowType.CHOSEN_WRONG) {
                // 只有勾选了的显示标记
                if (isSelect) this.setRightState(index, isRight);
            } else if (this.wrongStateShowType === RadioCheckboxWrongStateShowType.RIGHT_AND_CHOSEN_WRONG) {
                // 只有正确答案和已选的显示标记
                if (isSelect || needRight) this.setRightState(index, isRight);
            }
        });
    }

    /// 答案全对，禁掉后续事件，
    _handleAllRight() {
        this.eventPrevent = true;
        // 提交按钮是否隐藏
        if (this.submitButton) {
            if (this.submitShowType !== RadioCheckboxSubmitShowType.ALLWAYS_SHOW) {
                this.submitButton.active = false;
            }
        }
    }

    _getAnswerData(): any[] {
        const splitByChar = this.rightAnswer.indexOf(',') > -1 ? ',' : '';
        const rightAnswer: number[] = this.rightAnswer.split(splitByChar).map(e => +e);
        const nowAnswer: number[] = this.chosenData;
        const isAllRight: boolean = arrayEqual(rightAnswer, nowAnswer);
        return [nowAnswer, rightAnswer, isAllRight];
    }
}
