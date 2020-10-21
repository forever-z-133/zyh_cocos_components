// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({
        type: cc.Prefab,
        displayName: '星星预制资源',
    })
    starPrefab: cc.Prefab = null;

    @property({
        type: cc.Float,
        displayName: '星星消失时间最小值',
    })
    minStarDuration: number = 0;

    @property({
        type: cc.Float,
        displayName: '星星消失时间最大值',
    })
    maxStarDuration: number = 0;

    @property({
        type: cc.Node,
        displayName: '地面节点',
    })
    ground: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '主角节点',
    })
    player: cc.Node = null;

    @property({
        type: cc.Label,
        displayName: '分数节点',
    })
    scoreDisplay: cc.Label = null;

    @property({
        type: cc.AudioClip,
        displayName: '得分音效资源',
    })
    scoreAudio: cc.AudioClip = null;

    score: number = 0;

    groundY: number = 0;

    // 初始化计时器
    timer: number = 0;
    starDuration: number = 0;

    spawnNewStar() {
        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // 在星星脚本组件上保存 Game 对象的引用
        newStar.getComponent('Star').game = this;
    }

    getNewStarPosition() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    }

    gainScore () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    }

    gameOver() {
        // 停止 Player 节点的跳跃动作
        this.player.stopAllActions();

        // 重新加载场景 game
        cc.director.loadScene('main');
    }

    onLoad() {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;
        // 生成一个新的星星
        this.spawnNewStar();
    }

    update(dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }

        this.timer += dt;
    }
}
