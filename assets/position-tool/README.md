# 获取位置工具

比如子级 anchorX 为 0.5，当 x=0 时会有一半元素在父级外，  
而各元素的 anchor 其实不可控，这造成在计算时非常容易走进误区，  
那么，若用本工具转为 x=startX 让所有元素都相当于左上角定位来计算结果，就会稍稍简单一丢丢。  

* `getStartX(node: cc.Node)`
* `getEndX(node: cc.Node)`
* `getStartY(node: cc.Node)`
* `getEndY(node: cc.Node)`
* `leftInner(item: cc.Node, wrapper: cc.Node)`
* `leftOuter(item: cc.Node, wrapper: cc.Node)`
* `rightInner(item: cc.Node, wrapper: cc.Node)`
* `rightOuter(item: cc.Node, wrapper: cc.Node)`
* `topInner(item: cc.Node, wrapper: cc.Node)`
* `topOuter(item: cc.Node, wrapper: cc.Node)`
* `bottomInner(item: cc.Node, wrapper: cc.Node)`
* `bottomOuter(item: cc.Node, wrapper: cc.Node)`

比如，你想定位到某容器的上方贴边的外面，算父子元素的 anchor 来定位就稍稍麻烦，用 `topOuter(item: cc.Node, wrapper: cc.Node)` 轻松解决
