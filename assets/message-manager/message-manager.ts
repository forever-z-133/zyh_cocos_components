import { pubSub } from './pubSub';
import { sendMessage } from './postMessage';

export enum Role {
  TEACHER = 'TEACHER', /* 老师身份 */
  STUDENT = 'STUDENT', /* 学生身份 */
}

export enum Mode {
  SHOWHOW = 'SHOWHOW', /* 演示模式 */
  ANSWER = 'ANSWER', /* 答题模式 */
  REPLAY = 'REPLAY', /* 回放模式 */
  MONITOR = 'MONITOR', /* 监控模式 */
}

export enum DefaultMessageEvnet {
  CHANGE_MODE = 'CHANGE_MODE', /* 默认事件 - 切换模式 */
  UPDATA_TEACHER_PANEL = 'UPDATA_TEACHER_PANEL', /* 默认事件 - 更新老师面板 */
}

type getMessageCallback = (action: string, data: any) => void;

/**
 * 跨端通信的统一调度器
 * 
 * 旧版本会在业务中加入很多身份和模式的判断来区分处理通信及其回调，比较难以理解和复用
 * 故而集中到调度器中，只外发 init sendMessage 等少量接口，使通信部分独立不与业务杂糅
 * 
 * 举个例子：
 * 演示模式下，
 */
export default class MessageController {
  /// 本人身份
  role: Role = null;
  /// 当前模式，仅
  mode: Mode = null;
  /// 当前 scene 的 this
  context: cc.Component = null;
  /// 老师面板的节点
  teacherPanelNode: cc.Node = null;
  /// 老师面板中每行学院的预置器
  studentLinePrefab: cc.Prefab = null;
  /// 本人的姓名和ID
  userId: string = null;
  userName: string = null;
  /// 外放的统一通信回调函数
  _onUpdateView: getMessageCallback = null;

  /// 初始化，由此配置来分配信息
  constructor(context: cc.Component, gameData: any, fn: getMessageCallback, options?: any) {
    console.log('用户信息', gameData);
    const role: Role = +gameData.role === 0 ? Role.TEACHER : Role.STUDENT;
    const mode = role === Role.TEACHER ? Mode.SHOWHOW : null;
    this.context = context;
    this.role = role;
    this.mode = mode;
    this._onUpdateView = fn;
    this._changeMode(mode);
    this.userId = gameData.name;
    this.userName = gameData.name;
    console.log('本人角色:', role);
    console.log('当前模式:', mode);
  }

  /// 初始化教师面板，非老师或未设预置器会忽略
  initTeacherPanel(teacherPanel: cc.Prefab, studentLinePrefab: cc.Prefab, options?: any) {
    if (this.role !== Role.TEACHER) return;
    if (!teacherPanel) return console.error('请设置教师面板预置器');
    const context = this.context;
    // 新建教师面板，并赋予初始位置
    const teacherPanelNode: cc.Node = cc.instantiate(teacherPanel);
    teacherPanelNode.parent = context.node;
    const tpJS: any = teacherPanelNode.getComponent(cc.Component);
    const position = { x: -330, y: 265 }
    tpJS.init({ position });
    this.teacherPanelNode = teacherPanelNode;
    this.studentLinePrefab = studentLinePrefab;
    // 监听教师面板变化，会有 5 类事件处理
    context.node.off('gainDispatch', this._getTeacherPanlMessage.bind(this), context);
    context.node.on('gainDispatch', this._getTeacherPanlMessage.bind(this), context);
  }

  /// 上次选择的模式
  _lastModeCache: Mode = null;

  /// 通信的唯一对象
  _uniqueTargetUserId: string = null;


  /// 缓存暂未运行的信息
  _userEventMessageCache = {}

  /// 外放统一的发信接口
  sendMessage(action: string, data: any) {
    const defaultEvnets = Object.keys(DefaultMessageEvnet);
    if (defaultEvnets.includes(action)) {
      // 默认事件，总是直接发消息
      return this._sendMessage(action, data);
    }
    const sender = { id: this.userId, role: this.role };
    if (this.mode === Mode.SHOWHOW) {
      // 演示模式下，老师对学生发消息，老师界面更新，学生在回调中更新界面
      if (this.role === Role.TEACHER) {
        this._sendMessage(action, data);
        this._triggerUpdateTeacherView(action, data);
      }
    } else if (this.mode === Mode.ANSWER) {
      // 答题模式下，学生给老师发消息，学生界面更新，老师在回调中缓存操作
      if (this.role === Role.STUDENT) {
        this._sendMessage(action, data);
        this._triggerUpdateStudentView(action, data);
      }
    } else if (this.mode === Mode.MONITOR) {
      // 监控模式下，老师给学生发信息，老师界面更新，学生在回调中更新界面，学生也发
      this._sendMessage(action, data);
      if (this.role === Role.TEACHER) {
        this._triggerUpdateTeacherView(action, data);
      } else if (this.role === Role.STUDENT) {
        this._triggerUpdateStudentView(action, data);
      }
    }
  }
  _sendMessage(action: string, data: any) {
    sendMessage({
      action,
      mode: this.mode,
      senderRole: this.role,
      sender: this.userId,
      target: this._uniqueTargetUserId,
      handleData: { ...data },
    });
  }

  /// 是否监听自主发信，用于学生端被授权后才可发信
  onEnable() {
    pubSub.on(this.context.node.uuid, this._getUserEventMessage.bind(this), this.context);
  }
  onDisable() {
    pubSub.off(this.context.node.uuid);
  }

  /// 监听教师面板事件
  _getTeacherPanlMessage(ev: any) {
    ev.stopPropagation();
    const { action, data, name } = ev.detail;
    this._uniqueTargetUserId = null;
    console.log('面板操作', action, ev.detail);
    // TODO: 何时重置界面有待开发
    switch (action) {
      // 点击切换模式按钮
      case 'EVENT_CHANGE_SIGNALING_MODEL': {
        const newMode = +data === 1 ? Mode.SHOWHOW : Mode.ANSWER;
        this._changeMode(newMode);
        break;
      }
      // // 开启回放模式
      // case 'SHOWWORK_ACTIVE': {
      //   this._uniqueTargetUserId = name;
      //   this._changeMode(Mode.REPLAY);
      //   this._startReplay(name);
      //   break;
      // }
      // // 关闭回放模式
      // case 'SHOWWORK_CANCEL': {
      //   this._changeMode(this._lastModeCache);
      //   break;
      // }
      // 开启监控模式
      case 'MONITOR_ACTIVE': {
        this._uniqueTargetUserId = name;
        this._changeMode(Mode.MONITOR);
        this._startMonitor(name);
        break;
      }
      // 关闭监控模式
      case 'MONITOR_CANCEL': {
        this._changeMode(this._lastModeCache);
        break;
      }
      default: { }
    }
  }

  /// 开始回放
  _startReplay(targetUserId) {
    const events: any[] = this._userEventMessageCache[targetUserId];
    if (!events || !events.length) return;
    console.log('开始回放', events);
    // TODO: 此处回放逻辑最好用队列重构
    const startTime = Date.now();
    (function loop(index) {
      if (index > events.length - 1) return;
      console.log(index, events.length);
      const event: any = events[index++];
      console.log('延迟', Date.now() - startTime);
      this._getUserEventMessage(event);
      setTimeout(() => loop.call(this, index), 400);
    }.bind(this))(0);
  }

  /// 开始监控
  _startMonitor(targetUserId) {
    // 先回放过往操作，再等待新操作
    this._startReplay(targetUserId);
    // TODO: 过往操作何时删除有待商榷
    // ...
  }

  /// 监听自主发送的通信事件
  _getUserEventMessage(data: any) {
    const { action, sender, target, handleData } = data;
    const mode = data.mode || this.mode;
    console.log('获得通信', data, mode);

    // 有特定通信对象时，进行排除
    if (target && target !== this.userId) return;

    // 默认事件 - 更换模式
    if (action === DefaultMessageEvnet.CHANGE_MODE) {
      this.mode = handleData.mode;
      return;
    }

    // 默认事件 - 教师面板更新学员信息
    if (action === DefaultMessageEvnet.UPDATA_TEACHER_PANEL && this.teacherPanelNode) {
      return;
    }

    if (mode === Mode.SHOWHOW && this.role === Role.STUDENT) {
      // 演示模式下，学生被要求更新界面
      this._triggerUpdateStudentView(action, data);
    } else if (mode === Mode.ANSWER && this.role === Role.TEACHER) {
      // 答题模式下，老师被要求缓存学生操作
      console.log('学生事件录入缓存', data);
      if (!this._userEventMessageCache[sender]) this._userEventMessageCache[sender] = [];
      this._userEventMessageCache[sender].push(data);
    } else if (mode === Mode.MONITOR) {
      // 监控模式下，双方都被要求更新界面
      if (target === this.userId) {
        this._triggerUpdateStudentView(action, data);
      } else if (this.role === Role.TEACHER) {
        this._triggerUpdateTeacherView(action, data);
      }
    }
  }

  /// 设置老师面板上的学员数据
  _updateTeacherPanelData(userId: string, data: any) {
    if (this.role !== Role.TEACHER) return;
    if (!this.teacherPanelNode) return;
    let tpJS: any = this.teacherPanelNode.getComponent(cc.Component);
    let stundetColumnNode: cc.Node = tpJS.studentExist(userId);
    if (stundetColumnNode) {
      /// 更新信息
      console.log('更新老师面板学员状态');
      let studentLineNode: cc.Node = stundetColumnNode;
      let saJS: any = studentLineNode.getComponent(cc.Component);
      saJS.setAnswer({ state: data.status, choose: data.answer });
    } else {
      /// 新增信息
      console.log('新增老师面板学员状态');
      let studentLineNode: cc.Node = cc.instantiate(this.studentLinePrefab);
      let saJS: any = studentLineNode.getComponent(cc.Component);
      let stuBox = this.teacherPanelNode.getChildByName('stuBox');
      let stuCount: any = this.teacherPanelNode.getChildByName('top').getChildByName('count').getComponent(cc.Label);
      stuBox.addChild(studentLineNode);
      saJS.init({
        y: -studentLineNode.height * (stuBox.childrenCount - 1),
        name: data.userName,
        data: { state: data.status, choose: data.answer },
      });
      stuCount.string = stuBox.childrenCount;
      tpJS.infoAdd();
    }
  }

  _triggerUpdateTeacherView(action: string, data: any) {
    const callback = this._onUpdateView;
    callback && callback(action, data);
  }
  _triggerUpdateStudentView(action: string, data: any) {
    const callback = this._onUpdateView;
    callback && callback(action, data);
  }

  ///////////// -------------- 其他无关紧要的工具方法
  /// 切换模式
  _changeMode(newMode: Mode) {
    console.log('切换模式: 从 ', this.mode, ' 到 ', newMode);
    this._lastModeCache = this.mode;
    this.mode = newMode;
    this.sendMessage('CHANGE_MODE', { mode: newMode });
  }
}
