import ClickAble from './clickable';
import DragAble from './dragable';
import MiaoEvent from './miao-event';

const { ccclass } = cc._decorator;

@ccclass
export default class Test extends cc.Component {
    onLoad() {
        const click: ClickAble = this.node.addComponent(ClickAble);
        this.node.on('click', () => console.log('click'));

        const drag: DragAble = this.node.addComponent(DragAble);
        // this.node.on('custom_dragstart', () => console.log('drag'));

        // console.log(this.node);
        // const miaoevent = new MiaoEvent();
        // miaoevent.bindEvent(this.node);
        // // console.log(this.node);
        // this.node.on('click', (e) => {
        //     console.log(e);
        // });
        // this.node.on('dbclick', (e) => {
        //     // console.log(e);
        // });
        // this.node.on('longtap', (e) => {
        //     // console.log(e);
        // });
        // this.node.on('dragstart', (e) => {
        //     // console.log(e);
        // });
        // this.node.on('drag', (e) => {
        //     console.log('e');
        // });
        // this.node.on('dragend', (e) => {
        //     // console.log(e);
        // });
    }
}
