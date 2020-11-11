/**
 * 公共方法
 */

/// 遍历二维数组
export function forEachRect(rowCount: number, colCount: number, callback: (row: number, col: number, index: number) => void) {
    let index = 0;
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            callback && callback(row, col, ++index);
        }
    }
}
// 弧度转角度
export function toAngle(radian: number) {
    return (radian / Math.PI) * 180;
}
// 角度转弧度
export function toRadian(angle: number) {
    return (angle / 180) * Math.PI;
}
