# MiaoEvent

举个反例，只用 touchend 来作点击的话，滑动结束也会触发，双击更如此，事件间容易混淆。  
再比如，每次写拖拽都要写三个语义无关的事件，想对该元素再拓展其他事件也会比较麻烦。

因此，将通用事件抽离出适用于 Cocos Creator 开发的 MiaoEvent 事件类。  
将比较场景化的点击拖拽等事件抽离，并拓展出 DragAble 等基础类，  
使用户事件更容易规范化，也可为预制体等后置渲染元素增加事件。  

#### 演示用例

```
import MiaoEvent from './miao-event';
import ClickAble from './miao-event/clickable';
const { ccclass } = cc._decorator;

@ccclass
export default class Test extends cc.Component {
  onLoad() {
    const node: cc.Node;

    // 方式一：绑定事件类
    const miaoEvent = new MiaoEvent();
    node['miaoEvent'] = miaoEvent;
    miaoEvent.bindEvent(node);
    node.on('longtap', (e) => {});

    // 方式二：添加基础类
    node.addComponent(ClickAble);
    node.on('click', () => {});
  }
}
```

#### 公共事件

* click（点击）
* tap（类似 touchend，相应更快但容易事件冲突）
* dbclick（双击）
* longtap（长按）
* drag/dragstart/dragmove/dragend（拖拽）
* swipe/swipeleft/swiperight/swipeup/swipedown（轻滑）
* scale/scalestart/scaleupdate/scaleend（多指缩放，未完成）
* rotate/rotatestart/rotateupdate/rotateend（多指旋转，未完成）
* dbswipe（多指滑动，未完成）
* dbscale（多指收缩，未完成）

#### 基础类

* ClickAble
* DragAble
