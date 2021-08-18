import store from "@/store";
import Vuex from "vuex";
/**
 *
 * @param {*} path 必填 string 原始路由参数
 * @param {*} rank 非必填 默认 1 最大为3 number 需要返回的是几级路由
 * @return string
 */
export const routeMatching = (path, rank = 1) => {
  if (!path) throw "path不应该为undefined";
  if (rank > 3) throw `暂不支持截取${rank}级路由`;

  const routerArr = path.split("/");
  // let router;

  // router =
  //   rank === 1
  //     ? "/" + routerArr[1]
  //     : rank === 2
  //     ? "/" + routerArr[1] + "/" + routerArr[2]
  //     : "/" + routerArr[1] + "/" + routerArr[2] + "/" + routerArr[3];

  let router = []
  routerArr[routerArr.length - 2] ? router.push(routerArr[routerArr.length - 2]) : router
  router = [...router, routerArr[routerArr.length - 1]]


  return router
};
export function throttle(func, wait) {
  let timeout
  return function () {
    let that = this
    let args = arguments

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null
        func.apply(that, args)
      }, wait)
    }
  }
}

/**
 * 利用 document.title 做新消息提示
 * @export
 * @param {Number} count
 */
export function titleNotify(count) {
  if (count) {
    document.title = '您有新消息！';

  } else {
    document.title = '在线客服';
  }
}

//剔除历史消息中无用消息
export function deleteHistory(list, account) {
  list.map((item, index) => {
    if (
      (item.toAccount != account &&
        item.imMsgType == "TIMCustomElem" &&
        item.subMsgType == "queuinglocation") ||

      item.subMsgType == "transfer" ||
      item.subMsgType == "reception" ||
      item.subMsgType == "stopsession" ||
      item.subMsgType == "createsession"
    ) {
      list.splice(index, 1, '')
    }
    if (
      item.toAccount != account &&
      item.imMsgType == "TIMCustomElem" &&
      item.subMsgType == "prompts"
    ) {
      list.splice(index, 1, "");
    }
  });
  let arr = []
  list.forEach(item => {
    if (item) arr.push(item);
  });
  console.log(list, arr, arr.length);
  return arr
}


//数组去空
export function arrEmpty(list) {
  let arr = []
  list.map(item => {
    if (item) arr.push(item)
  })
  return arr
}

//监听客户端是否关闭会话
export function CloseIM() {
  console.log(JSON.stringify(store.state.basic));
  //如果获取到远程创建的三个参数和远程建立成功的两个url，说明远程已创建成功，关闭访客端时，结束远程控制
  if (store.state.basic.DistanceDate && external.call && store.state.basic.LongTwoUrl) {
    let OrayInit = {
      Type: "3",
      Ctrl: "2",
      AppID: store.state.basic.DistanceDate.AppID,
      AppKey: store.state.basic.DistanceDate.AppKey,
      AppDomain: store.state.basic.DistanceDate.AppDomain,
      SessionUrl: "",
      SessionID: "",
    };
    try {
      external.call(
        "CppOnOrayInfo", {
          OrayInit: OrayInit
        },
        (error, result) => {
          console.log("远程控制结束");
        }
      );
    } catch (e) {
      console.log("远程控制结束失败", e);
    }
  }
  //如果只获取到远程创建的三个参数，没有远程建立成功的两个url，，说明远程只是初始化，关闭访客端时，向客服发送拒绝请求
  let data = {}
  if (store.state.basic.DistanceDate && external.call && !store.state.basic.LongTwoUrl) {
     data = {
      msgText: "对方拒绝了你的远程请求",
      sendType: "automatic",
      subMsgType: "refuserc",
    };
    store.commit('getRefuseDate',data)
  }
}

//监听客户端消息返回
export function OnOrayInfo(obj) {
  store.commit("getTeleMessage", JSON.parse(obj));
}
export function cb_createclient(obj) {
}
