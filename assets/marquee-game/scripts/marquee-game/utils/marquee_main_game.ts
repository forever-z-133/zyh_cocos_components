import marquee_item_creator from "../utils/marquee-item-creator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class marquee_main_game extends cc.Component {
    @property({
        type: cc.AudioClip,
        displayName: '成功音效',
    })
    successAudio: cc.AudioClip = null;
    
    @property({
        type: cc.AudioClip,
        displayName: '失败音效',
    })
    failAudio: cc.AudioClip = null;

    @property({
        type: cc.AudioClip,
        displayName: '正确音效',
    })
    rightAudio: cc.AudioClip = null;

    @property({
        type: cc.AudioClip,
        displayName: '错误音效',
    })
    wrongAudio: cc.AudioClip = null;

    @property({
        type: cc.Node,
        displayName: '项运动区域',
    })
    itemMoveArea: cc.Node = null;

    itemCreatorComp: marquee_item_creator = null;

    onLoad() {
        this.itemCreatorComp = this.itemMoveArea.getComponent(marquee_item_creator);
    }
    gameStart() {
        this.itemCreatorComp.gameStart();
    }
    gameStop() {
        this.itemCreatorComp.gameStop();
    }

    playAudio(audio: cc.AudioClip) {
        if (!audio) return;
        cc.audioEngine.stopAll();
        cc.audioEngine.play(audio, false, 1);
    }
}
