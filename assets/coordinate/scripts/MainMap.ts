import Coordinate, { AngleType } from "./Coordinate/Coordinate";
import CoordinateItemRect from "./Coordinate/CoordinateItemRect";

const { ccclass, property } = cc._decorator;

/**
 * 地图绘制器
 */
@ccclass
export default class MainMap extends cc.Component {
    @property({
        type: cc.Node,
        displayName: '容器'
    })
    $container: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: '地图素材'
    })
    mapSources: cc.Node[] = [];

    @property({
        type: cc.Integer,
        displayName: '行数'
    })
    rowCount: number = 3;

    @property({
        type: cc.Integer,
        displayName: '列数'
    })
    colCount: number = 3;

    @property({
        type: cc.Enum(AngleType),
        displayName: '坐标系类型'
    })
    angleType: AngleType = AngleType.FiftyFiveAngle;

    coordinate: Coordinate = null;

    lineData: string[] = '60,61,51,41,40,30,20,21,22,23,33,43,44,45,35,25,15,16,06'.split(',');

    onLoad() {
        this.resetWrapperAnchor();
    }

    /// 重置坐标系原点，方便后续计算
    resetWrapperAnchor() {
        const { x: originX, y: originY, width, height, anchorX, anchorY } = this.node;
        if (anchorX !== 0) {
            this.node.x = originX + width * -anchorX;
            this.node.anchorX = 0;
        }
        if (anchorY !== 1) {
            this.node.y = originY + height * anchorY;
            this.node.anchorY = 1;
        }
    }

    /// 初始化
    init() {
        const { width, height } = this.node;
        this.coordinate = this.coordinate || new Coordinate(width, height);
        this.coordinate.init(this.rowCount, this.colCount, this.angleType);
        this.coordinate.setInclude(this.lineData);
        this.reset();
        this.render();
    }

    /// 重置
    reset() {
        this.$container.removeAllChildren();
    }

    /// 渲染地图
    render() {
        const rects = this.coordinate.getWholeRects();
        rects.forEach(rect => this.renderItem(rect));
    }

    /// 渲染单个地图方块
    renderItem(rect: CoordinateItemRect) {
        const prefab = this.mapSources[1];
        const node = cc.instantiate(prefab);
        const { x, y } = rect.getCenterPoint();
        node.setPosition(x, y);
        node.width = rect.width;
        node.height = rect.height;
        node.getChildByName('label').getComponent(cc.Label).string = rect.row + ',' + rect.col;
        this.$container.addChild(node);
    }
}
