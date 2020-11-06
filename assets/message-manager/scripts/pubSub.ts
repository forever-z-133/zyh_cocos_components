export const pubSub = {
  // 回调列表
  list: {},

  // 订阅
  on(event: string, fn: any, context: any) {
      return this.list[event] = context ? fn.bind(context) : fn;
  },

  // 发布
  emit() {
      let args: IArguments = arguments;
      Object.values(this.list).forEach((fn: any) => fn.apply(this, args));
  },

  // 取消订阅
  off(event: string) {
      let newList = {};
      for (const key in this.list) {
          if (!Object.is(event, key)) {
              newList[key] = this.list[key];
          }
      }
      this.list = newList;
  },
};