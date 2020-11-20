/**
 * 队列数据结构
 * 新数据在队尾，从头部取出，先进先出
 */
export default class Queue<T> {
    dataStore: T[] = [];

    enqueue(element?: T) {
        this.dataStore.push(element)
    }
    dequeue(): T {
        return this.dataStore.shift();
    }
    clear() {
        this.dataStore.length = 0;
    }
    fisrt() {
        return this.dataStore[0];
    }
    last() {
        return this.dataStore[this.dataStore.length - 1];
    }
    isEmpty() {
        return this.dataStore.length === 0;
    }
    size() {
        return this.dataStore.length;
    }
}
