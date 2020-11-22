/**
 * 将基于对称点的位置计算全转为从基于左上角开始的计算
 * 比如子级 anchorX 为 0.5，当 x=0 时会有一半元素在父级外，若用本工具转为 x=startX 则可使元素左边界与父级对齐
 */
export default class PositionTool {
    // -------- 获取元素基于左上角计算的位置
    static getStartX(node: cc.Node) {
        const { anchorX, width } = node;
        return -anchorX * width;
    }
    static getEndX(node: cc.Node) {
        const { anchorX, width } = node;
        return (1 - anchorX) * width;
    }
    static getStartY(node: cc.Node) {
        const { anchorY, height } = node;
        return (1 - anchorY) * height;
    }
    static getEndY(node: cc.Node) {
        const { anchorY, height } = node;
        return -anchorY * height;
    }

    // -------- 获取元素挨在父级边界的位置，共 8 种
    static leftInner(item: cc.Node, wrapper: cc.Node): number {
        const x1 = this.getStartX(wrapper);
        const x2 = this.getStartX(item);
        return x1 - x2;
    }
    static leftOuter(item: cc.Node, wrapper: cc.Node): number {
        const x1 = this.getStartX(wrapper);
        const x2 = this.getEndX(item);
        return x1 - x2;
    }
    static rightInner(item: cc.Node, wrapper: cc.Node): number {
        const x = this.leftOuter(item, wrapper);
        return x + wrapper.width;
    }
    static rightOuter(item: cc.Node, wrapper: cc.Node): number {
        const x = this.leftInner(item, wrapper);
        return x + wrapper.width;
    }
    static topInner(item: cc.Node, wrapper: cc.Node): number {
        const y1 = this.getStartY(wrapper);
        const y2 = this.getStartY(item);
        return y1 - y2;
    }
    static topOuter(item: cc.Node, wrapper: cc.Node): number {
        const y1 = this.getStartY(wrapper);
        const y2 = this.getEndY(item);
        return y1 + y2;
    }
    static bottomInner(item: cc.Node, wrapper: cc.Node): number {
        const y = this.topOuter(item, wrapper);
        return y - wrapper.height;
    }
    static bottomOuter(item: cc.Node, wrapper: cc.Node): number {
        const y = this.topInner(item, wrapper);
        return y - wrapper.height;
    }

    // -------- 获取元素挨在父级角落的位置，共 8 种
    static topLeftInner(item: cc.Node, wrapper: cc.Node): { x: number, y: number } {
        const x = this.leftInner(item, wrapper);
        const y = this.topInner(item, wrapper);
        return { x ,y };
    }
}
