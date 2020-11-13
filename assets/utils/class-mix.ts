/**
 * 使 class 拥有多继承
 * 
 * 举例：class Dog extends min(Animal, Friendly) {}
 */
export default function mix(...mixins: any[]) {
    class Mix {
        constructor(...ags: any[]) {
            for (let mixin of mixins) {
                copyProperties(this, new mixin(...ags)); // 拷贝实例属性
            }
        }
    }

    for (let mixin of mixins) {
        copyProperties(Mix, mixin); // 拷贝静态属性
        copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }

    return Mix;
}

export function copyProperties(target: object, source: any) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor'
            && key !== 'prototype'
            && key !== 'name'
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}
