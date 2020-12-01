# 随机生成游戏工具类

比如赛车/接水果/打地鼠等，本质上都是随机生成元素、然后元素运动/元素触底/元素被点击等交互后形成反馈，我个人喜欢称之为随机生成类游戏。

工具类有三部分，主程序 `marquee_main_game`，元素随机生成器 `marquee_item_creator`，生成项基础类 `marquee_item`。

继承 `marquee_item_creator` 然后重写 `handleItemCreate` 方法，即可开始给新生成的元素进行操作，比如置于屏幕顶部；  
然后继承 `marquee_item` 重写 `update` 方法，让其不断向下移动并触底后消失；  
再加上一个可碰撞的主角，和一些事件和判断，接水果游戏便可轻松完成了。
