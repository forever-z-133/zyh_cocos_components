/**
 * 对象关系管理
 * 可能将用于绑定攻击关系，类似王者荣耀持续标记某单位进行输出的效果
 */
export default class Relation<T>  {
    /// 关系列表
    relations: any[] = [];

    /// 绑定关系
    bind(a1: T, a2: T) { }

    /// 解绑关系
    unbind(a1: T, a2: T) { }

    /// 获取与其相关的关系
    getRelation(a: T) { }

    /// 是否有关系
    hasRelation(a1: T, a2: T) { }
}
