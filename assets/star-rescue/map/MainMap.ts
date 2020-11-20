import Coordinate from "./utils/Coordinate";

const { ccclass, property } = cc._decorator;

/**
 * 地图绘制器
 */
@ccclass
export default class MainMap extends cc.Component {
    @property({
        type: cc.JsonAsset,
        displayName: '地图路线'
    })
    posJsonAsset: cc.JsonAsset = null;

    posJson: { [name: string]: any }[] = [];

    coordinate: Coordinate = null;

    /// 初始化
    init() {
        this.posJson = this.posJsonAsset.json;
        this.coordinate = new Coordinate(1, this.posJson.length);
        this.coordinate.init(this.posJson.length, 1);
        this.render();
    }

    render() {
        this.coordinate._rectList.forEach((_rect, i) => {
            const { row, col } = _rect;
            const item = this.posJson[i];
            this.coordinate._rectMap[`${row},${col}`] = _rect;
            _rect.x = item.x;
            _rect.y = item.y;
        });
    }
}
