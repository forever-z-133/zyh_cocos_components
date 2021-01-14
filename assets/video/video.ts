const { ccclass, property } = cc._decorator;

@ccclass
export default class TestVideo extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '弹窗'
    })
    modalNode: cc.Node = null;

    @property({
        type: cc.VideoPlayer,
        displayName: '当前视频'
    })
    videoPlayer: cc.VideoPlayer = null;

    videoIsReady: boolean = false;

    onLoad() {
        const fileUrl = 'https://res.miaocode.com/aithinking/pro/bundle/k1-35/native/0a/0a3b85b2-91ec-4e1c-9a08-a406c90a3bf8.mp4';
        cc.assetManager.loadRemote(fileUrl, (err, res: cc.Asset) => {
            if (err) return console.error(err);
            console.log('load video', res);
            this.videoPlayer.clip = res as any;
        });
    }

    handleShowVideoModal() {
        this.modalNode.x = 0;
        if (this.videoIsReady) {
            this.playVideo();
        }
    }

    handleSwitchVideo() {
        const fileUrl = 'https://res.miaocode.com/aithinking/pro/bundle/k1-35/native/2d/2da92915-26df-4fa3-a102-7d2156538b2a.mp4';
        cc.assetManager.loadRemote(fileUrl, (err, res: cc.Asset) => {
            if (err) return console.error(err);
            console.log('load video', res);
            this.videoPlayer.clip = res as any;
            this.playVideo();
        });
    }

    // 播放视频
    playVideo() {
        if (this.videoPlayer) {
            try {
                this.videoPlayer.play();
            } catch (err) {
                throw err;
            }
        }
    }

    onVideoPlayerEvent(videoplayer: any, eventType: any, ced: any) {
        console.log('onVideoPlayerEvent')
        // videoplayer元信息加载完毕
        if (eventType === cc.VideoPlayer.EventType.META_LOADED) {
            console.log('videoplayer元信息加载完毕');
        }

        // videoplayer已准备好
        if (eventType === cc.VideoPlayer.EventType.READY_TO_PLAY) {
            console.log('videoplayer已准备好');
            this.videoIsReady = true;
            // 安卓自动播放
            // this.playVideo();
        }

        // videoplayer正在播放
        if (eventType === cc.VideoPlayer.EventType.PLAYING) {
            console.log('videoplayer正在播放');
        }

        // videoplayer暂停
        if (eventType === cc.VideoPlayer.EventType.PAUSED) {
            console.log('videoplayer暂停');
        }

        // videoplayer关闭
        if (eventType === cc.VideoPlayer.EventType.STOPPED) {
            console.log('videoplayer关闭');
        }

        // videoplayer播放完毕
        if (eventType === cc.VideoPlayer.EventType.COMPLETED) {
            console.log('videoplayer播放完毕');
        }

        // videoplayer被点击
        if (eventType === cc.VideoPlayer.EventType.CLICKED) {
            console.log('videoplayer被点击');
            this.playVideo();
        }
    }
}
