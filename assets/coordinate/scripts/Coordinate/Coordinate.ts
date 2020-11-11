import { forEachRect } from "../../../utils/utils";
import CoordinateItemRect from "./CoordinateItemRect";

/// 直角坐标系，45 度角坐标系
export enum AngleType {
    VerticalAngle, // 直角
    FiftyFiveAngle, // 45 度角
}
/// 朝向
export enum FACE_TO {
    TOP, // 上
    BOTTOM, // 下
    LEFT, // 左
    RIGHT, // 右
    LEFT_TOP, // 左上
    RIGHT_TOP, // 右上
    LEFT_BOTTOM, // 左下
    RIGHT_BOTTOM, // 右下
}
/// 偏移值与朝向的映射关系
export const faceToMap = {
    '1,0': FACE_TO.TOP,
    '-1,0': FACE_TO.BOTTOM,
    '0,1': FACE_TO.LEFT,
    '0,-1': FACE_TO.RIGHT,
    '1,1': FACE_TO.LEFT_TOP,
    '1,-1': FACE_TO.RIGHT_TOP,
    '-1,1': FACE_TO.LEFT_BOTTOM,
    '-1,-1': FACE_TO.RIGHT_BOTTOM,
}

/**
 * 坐标系工具，类似棋盘
 * 注：本原型是取格子，后期可能会扩展取交点
 * 注：本原型是以第四象限为界面，后续可能会改为其他象限
 * 注：本原型是以左上角为 0,0 坐标，后期可能会对原点进行配置拓展
 */
export default class Coordinate {
    /// 主要配置
    public width: number = 0;
    public height: number = 0;
    public rowCount: number = 5;
    public colCount: number = 5;
    public angle: AngleType = AngleType.VerticalAngle;

    /// 坐标格子集合
    _rectList: CoordinateItemRect[] = [];
    _rectMap: { [name: string]: CoordinateItemRect } = {};

    /// 先给宽度
    constructor(width = 0, height = width) {
        this.width = width;
        this.height = height;
    }

    /// 再给棋盘配置
    init(rowCount = 5, colCount = rowCount, angle = AngleType.VerticalAngle) {
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.angle = angle;
        this._updateRectList();
    }

    /// 设置路径，即对多余部分进行排除
    setInclude(lineData: string[]) {
        if (!lineData || !lineData.length) return;
        this._rectList = this._rectList.filter(rect => {
            const { row, col } = rect;
            const isMatch = lineData.includes(`${row}${col}`);
            if (!isMatch) delete this._rectMap[`${row},${col}`];
            if (isMatch) return rect;
        });
    }

    /// 根据棋盘配置生成格子集合
    _updateRectList() {
        let _width = this.width / this.colCount;
        const _height = this.height / this.rowCount;
        let x = 0;
        let y = 0;
        const _rectList = [];
        const _rectMap = {};
        let itemOffsetX = 0;
        if (this.angle === AngleType.FiftyFiveAngle) {
            const offsetWidth = this.height;
            _width = (this.width - offsetWidth) / (this.colCount - 1);
            itemOffsetX =  offsetWidth / this.rowCount;
        }
        forEachRect(this.rowCount, this.colCount, (row, col) => {
            x = (itemOffsetX * (this.rowCount - 1 - row)) + col * _width;
            y = row * _height * -1; // 坐标系在第 4 象限，故而要 -1
            const _rect = new CoordinateItemRect(this, x, y, _width, _height, row, col, this.angle);
            _rectMap[`${row},${col}`] = _rect;
            _rectList.push(_rect);
        });
        this._rectList = _rectList;
        this._rectMap = _rectMap;
    }

    /// 获取所有格子列表
    getWholeRects(): CoordinateItemRect[] {
        return this._rectList;
    }

    /// 获取所有格子表
    getWholeRectsMap(): { [name: string]: CoordinateItemRect } {
        return this._rectMap;
    }

    /// 获取某个格子
    getRect(row: number, col: number): CoordinateItemRect {
        return this._rectMap[`${row},${col}`];
    }

    /// 获取整行格子
    getRowRects(row: number): CoordinateItemRect[] {
        return this._rectList.filter(e => e.row === row);
    }

    /// 获取整列格子
    getColRects(col: number): CoordinateItemRect[] {
        return this._rectList.filter(e => e.col === col);
    }
}
