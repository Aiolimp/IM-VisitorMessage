<template>
  <div>
    <div class="current-conversation-wrapper">
      <div
        class="current-conversation"
        @scroll="onScroll"
      >
        <a-spin
          tip="加载中..."
          :spinning="spinning"
        >
          <div class="content">
            <div
              class="message-list scroll"
              ref="message-list"
              @scroll="this.onScroll"
            >
              <div class="Knowledge">
                <Knowledge v-if="spinning == false&&KnowledgeType == 1"></Knowledge>
              </div>
              <div
                class="more"
                v-if="!this.status"
              >
                <a-button
                  v-if="spinning == false"
                  @click="getMOreFn"
                >查看更多</a-button>
              </div>
              <div
                class="no-more"
                v-else
              >没有更多了</div>
              <history-message
                :historySessionList="historySessionList"
                v-if="isSave"
              />
              <message-item
                v-for="message in progressSessionList"
                :key="message.ID"
                :message="message"
              />
            </div>
            <div
              v-show="isShowScrollButtomTips"
              class="newMessageTips"
              @click="scrollMessageListToButtom"
            >
              <!-- 回到最新位置 -->
              <img
                :src="require('./../../assets/imgs/news.png')"
                alt=""
              />
            </div>
          </div>
        </a-spin>
        <div
          class="footer"
          v-if="showMessageSendBox"
        >
          <div
            class="lineUp"
            v-if="isShow"
          >
            <div>{{ date }}</div>
            <div class="text">
              <span class="count">{{ this.queuesObj.payload.data.msgText }}</span>
              <span
                class="cancel"
                @click="dequeueFn()"
              >取消排队</span>
            </div>
          </div>
          <message-send-box />
        </div>
      </div>
    </div>
    <div
      class="message"
      v-show="showLongDistance"
    >
      <div class="message-left">
        <span>客服{{serviceName}}正在请求远程控制你的电脑请选择接受或拒绝。</span>
      </div>
      <div style="margin-right:20px">
        <a-button
          type="primary"
          ghost
          style="margin-right:30px"
          @click="rejectLongDistance"
          size="small"
        >拒绝</a-button>
        <a-button
          size="small"
          type="primary"
          @click="receiveLongDistance"
        >接受</a-button>
      </div>
    </div>
    <div
      class="message"
      v-show="showLongDistanceIng"
    >
      <div class="message-left">
        <span>客服{{serviceName}}正在控制你的电脑</span>
      </div>
      <div style="margin-right:30px">
        <a-button
          type="primary"
          style="margin-right:20px"
          @click="longDistanceDown"
          size="small"
        >断开</a-button>
      </div>
    </div>
    <a-modal
      title="提示"
      :visible="noticeVisible"
      :maskClosable="false"
      @cancel="noticeHandleCancel"
      :footer="null"
    >
      <p>{{ '当前版本不支持远程，请点击下方链接安装最新版本。' }}</p>
      <p
        class="downloads"
        @click="downloads"
      >{{ 'http://www.qifengyun.com/downloads' }}</p>
    </a-modal>
  </div>
</template>

<script>
import axios from "axios";
import Knowledge from "./knowledge";
import { mapGetters, mapState } from "vuex";
import MessageSendBox from "./../../components/message/message-send-box";
import MessageItem from "./../../components/message/message-item";
import historyMessage from "./../../components/historyMessage";
import moment from "moment";
import { deleteHistory, arrEmpty, titleNotify } from "@/utils/index";
import { getFullDate } from "./../../utils/date";
export default {
  name: "CurrentConversation",
  components: {
    MessageSendBox,
    MessageItem,
    historyMessage,
    Knowledge,
  },
  data() {
    return {
      spinning: false,
      isShowScrollButtomTips: false,
      preScrollHeight: 0,
      showConversationProfile: false,
      timeout: "",
      timer: null,
      // messageList: [],
      imStatus: false,
      serviceName: "",
      chatList: [],
      queuesObj: {},
      historyList: [],
      progressSessionList: [],
      historySessionList: [],
      status: false,
      historyStorageList: [],
      progtressStorageList: [],
      isSave: false, //在转接和结束重新发起回话过程中保留之前回话消息判断
      isShow: false, //排队位置文本是否展示
      visible: false,
      noticeVisible: false, //安装新版本弹窗
      confirmLoading: false,
      KnowledgeType: 1,
      showLongDistance: false, //远程协助消息+取消按钮
      showLongDistanceIng: false, //远程成功+断开按钮
      DistanceDate: {}, //获取客服发来的远程三个信息
      timer1: null,
      timer2: null,
      InSessionList: [],
      RcstartMessage: "",
      RcendMessage: "远程控制已结束",
      statusTimer: null, //插件版轮巡时间
      clientStatus: null, //插件版远程是否初始化成功 0：失败 1：成功
    };
  },
  computed: {
    ...mapState({
      ModMessage: (state) => state.basic.ModMessage,
      LongTwoUrl: (state) => state.basic.LongTwoUrl,
      refuseDate: (state) => state.basic.refuseDate,
      teleMessage: (state) => state.basic.teleMessage,
      currentConversation: (state) => state.conversation.currentConversation,
      currentUnreadCount: (state) =>
        state.conversation.currentConversation.unreadCount,
      imInfo: (state) => state.basic.imInfo,
      pageList: (state) => state.conversation.pageList,
      watchImMStatus: (state) => state.basic.watchImMStatus,
      currentMessageList: (state) => {
        // let obj = {};
        let list = [...state.conversation.currentMessageList];
        list.forEach((item, index) => {
          if (item.type == "TIMCustomElem") {
            item.payload.data =
              typeof item.payload.data == "string"
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            if (item.payload.data.subMsgType == "queuinglocation") {
              // obj = item;
              list.splice(index, 1, "");
            }
          }
        });
        list = arrEmpty(list);

        return list;
      },
      isCompleted: (state) => state.conversation.isCompleted,
      isSDKReady: (state) => state.user.isSDKReady,
      conversationList: (state) => state.conversation.conversationList,
      messageList: (state) => state.conversation.messageList,
      sessionObj: (state) => state.basic.sessionObj,
      guestInfo: (state) => state.basic.guestInfo,
      visitorInf: (state) => state.basic.visitorInf,
    }),
    ...mapGetters(["toAccount", "hidden", "totalUnreadCount"]),
    // 是否显示当前会话组件
    showCurrentConversation() {
      return !!this.currentConversation.conversationID;
    },
    name() {
      if (this.currentConversation.type === "C2C") {
        return this.currentConversation.userProfile.nick || this.toAccount;
      } else if (this.currentConversation.type === "GROUP") {
        return this.currentConversation.groupProfile.name || this.toAccount;
      } else if (this.currentConversation.conversationID === "@TIM#SYSTEM") {
        return "系统通知";
      }
      return this.toAccount;
    },
    showMessageSendBox() {
      return this.currentConversation.type !== this.TIM.TYPES.CONV_SYSTEM;
    },
    date() {
      return getFullDate(new Date(this.queuesObj.time * 1000));
    },
  },
  mounted() {
    this.spinning = true;
    this.$bus.$on("image-loaded", this.onImageLoaded);
    this.$bus.$on("scroll-bottom", this.scrollMessageListToButtom);
    this.$bus.$on("scroll-top", this.scrollMessageListToTop);
    this.$bus.$on("cancelrcYC", this.cancelrcYC);
    this.$bus.$on("sessionRcend", this.sessionRcend);
    this.$bus.$on("sendRcstartMessage", this.getRcstartMessage); //用来判断客服是否发送了此消息
    this.$bus.$on("sendRcendMessage", this.getRcendMessage); //用来判断客服是否发送了此消息
    if (this.currentConversation.conversationID === "@TIM#SYSTEM") {
      return false;
    }

    //访客初始化进来轮巡，判断是否有远程
    // 远程未开始的轮巡
    if (external.call) {
      this.timer2 = setInterval(() => {
        let OrayStatus = {
          AppID: "",
          AppKey: "",
          AppDomain: "",
        };
        try {
          external.call(
            "CppOnOrayInfo",
            { OrayStatus: OrayStatus },
            (error, result) => {
              console.log("远程未开始的轮巡");
            }
          );
        } catch (e) {
          console.log(e);
        }
      }, 30000);
    }
  },
  updated() {
    this.keepMessageListOnButtom();
    // 1. 系统会话隐藏右侧资料组件
    // 2. 没有当前会话时，隐藏右侧资料组件。
    //    背景：退出群组/删除会话时，会出现一处空白区域
    if (
      this.currentConversation.conversationID === "@TIM#SYSTEM" ||
      typeof this.currentConversation.conversationID === "undefined"
    ) {
      this.showConversationProfile = false;
    }
  },
  watch: {
    teleMessage: {
      handler(obj1, obj2) {
        console.log("obj1", obj1);
        console.log("obj2", obj2);
        //通知客服创建远程
        if (obj1 && obj1.OrayInit) {
          //访客远程创建成功
          if (obj1.OrayInit.SessionUrl && obj1.OrayInit.SessionID) {
            console.log("获取到了地址和id回调，开始创建客户远程");
            const paramy = {
              SessionUrl: obj1.OrayInit.SessionUrl,
              SessionID: obj1.OrayInit.SessionID,
            };
            this.$store.commit("getLongTwoUrl", paramy);
            this.newDesktopSession(obj1);
          } else if (
            //客服关闭远程
            obj1.OrayInit.Type == "3" &&
            obj1.OrayInit.Ctrl == "2" &&
            obj1.OrayInit.Status == "1" &&
            this.showLongDistanceIng == true
          ) {
            console.log("客服关闭了远程窗口");
            this.$bus.$emit("sendCloseDistance", 1); //检测到客服断开，不需要再发重复结束消息
            this.longDistanceDown2();
          } else if (obj1.OrayInit.Status !== "1") {
            //访客没有获取到地址，元创建失败
            const data = {
              msgText: "远程控制连接失败",
              rcEndAccount: this.sessionObj.guestImAccount,
              sendType: "automatic",
              subMsgType: "rcfailure",
            };
            this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
          }
        }
      },
      immediate: true,
    },
    ModMessage: {
      handler(obj1, obj2) {
        console.log("obj1", obj1);
        console.log("obj2", obj2);
        console.log(this.statusTimer);
        if (obj1.Info.Status !== obj2.Info.Status && obj1.Info.Status == "0") {
          this.RcstartMessage = "";
          this.RcendMessage = "远程控制已结束";
          const that = this;
          clearInterval(that.statusTimer); //关闭远程进行中的轮巡时间
          that.statusTimer = null;
          this.$bus.$emit("sendCloseDistance", 1); //检测到客服断开，不需要再发重复结束消息
          console.log("远程控制中轮巡时间关闭");
          this.$store.commit("getLongTwoUrl", ""); //清除VUEX里的远程地址信息
          const data = {
            msgText: "远程控制已结束",
            rcEndAccount: this.sessionObj.guestImAccount,
            sendType: "automatic",
            subMsgType: "rcend",
          };
          this.$bus.$emit("sendCustomMessage", data); //发送自定义远程结束消息
          this.showLongDistanceIng = false;
        }
      },
    },
    refuseDate(a, b) {
      if (a && a.subMsgType == "refuserc") {
        console.log(a);
        this.showLongDistance = false;
      }
    },
    "sessionObj.sessionType": {
      handler: function (a, b) {
        console.log("********sessionType", a);
        if (a == 3) {
          this.IsQuote();
        }
        if (a !== 4) {
          this.KnowledgeType = 0;
        }
        if (a == 4) {
          this.KnowledgeType = 1;
        }
      },
    },
    watchImMStatus(a) {
      let that = this;
      if (a) {
        this.visible = true;
        this.$warning({
          title: "提示",
          content: "页面超时，点击确定刷新页面",
          okText: "确定",
          onOk() {
            that.spinning = false;
            location.reload();
          },
        });
      }
    },
    pageList(a, b) {
      console.log(a, b);
      if (b.length) {
        console.log(a, this.historySessionList);
        let arr = [];
        let list1 = [...a];
        list1.forEach((item, index) => {
          if (item.type == "TIMCustomElem") {
            item.payload.data =
              typeof item.payload.data == "string"
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            if (item.payload.data.subMsgType == "queuinglocation") {
              // obj = item;
              list1.splice(index, 1, "");
            }
          }
        });
        list1 = arrEmpty(list1);

        if (this.historySessionList.length) {
          if (list1.length) {
            list1.forEach((item, inde) => {
              if (this.historySessionList[0].msgTime / 1000 < item.time) {
                arr.push(item);
              }
            });
            if (arr.length && arr.length > 15) {
              this.isSave = false;
            } else {
              this.isSave = true;
            }
          } else {
            this.isSave = true;
          }
        } else {
          // this.isSave = false;
          arr = [...list1];
        }

        if (list1.length < 15) {
          this.isSave = true;
        }
        this.progressSessionList = [...arr, ...this.progressSessionList];
        console.log(this.progressSessionList);
        console.log(this.sessionObj);
      }
      // if(!a.length && a.length){
      //   this.isSave = false;
      // }
    },
    currentMessageList(a, b) {
      console.log(a, b);
      if (a.length && !b.length) {
        //获取历史消息进行整合
        let arr = [];
        arr = a.filter((item) => {
          if (item.payload.data) {
            item.payload.data =
              typeof item.payload.data == "string" && item.payload.data != ""
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            if (item.from == this.sessionObj.guestImAccount) {
              return (
                item.payload.data.subMsgType !== "rcstart" &&
                item.payload.data.subMsgType !== "rcrun" &&
                item.payload.data.subMsgType !== "acceptrc" &&
                item.payload.data.subMsgType !== "refuserc"
              );
            } else {
              console.log("不相等", item.payload.data.subMsgType);
              return (
                item.payload.data.subMsgType !== "rcend" && //结束会话，谁发送的谁显示
                item.payload.data.subMsgType !== "rcfailure" && //结束会话，谁发送的谁显示
                item.payload.data.subMsgType !== "refuserc" &&
                item.payload.data.subMsgType !== "requestrc" &&
                item.payload.data.subMsgType !== "rcwilltimeout" //远程控制会话即将超时
              );
            }
          } else {
            return true;
          }
        });
        console.log(arr);
        this.getHistoryList(arr);
      }
    },
    messageList(a, b) {
      console.log(a, b);
      console.log("visitorInf", this.visitorInf);
      if (a.length && JSON.stringify(a) != JSON.stringify(b)) {
        a.map((item) => {
          if (item.payload.data) {
            item.payload.data =
              typeof item.payload.data == "string"
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            if (item.payload.data.subMsgType == "requestrc") {
              {
                this.serviceName = item.payload.data.msgText;
                this.DistanceDate = {
                  AppID: item.payload.data.openId,
                  AppDomain: item.payload.data.domain,
                  AppKey: item.payload.data.openKey,
                };
                this.$store.commit("getDistanceDate", this.DistanceDate);
                this.showLongDistance = true;
                window.open("ModOrayPlu://", "_self");
              }
            }
          }
        });
        let arr = [];
        arr = a.filter((item) => {
          if (item.payload.data) {
            item.payload.data =
              typeof item.payload.data == "string" && item.payload.data != ""
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            if (item.from == this.sessionObj.guestImAccount) {
              return (
                item.payload.data.subMsgType !== "rcstart" &&
                item.payload.data.subMsgType !== "rcrun" &&
                item.payload.data.subMsgType !== "acceptrc" &&
                item.payload.data.subMsgType !== "refuserc"
              );
            } else {
              return (
                item.payload.data.subMsgType !== "rcend" &&
                item.payload.data.subMsgType !== "rcfailure" &&
                item.payload.data.subMsgType !== "refuserc" &&
                item.payload.data.subMsgType !== "requestrc" &&
                item.payload.data.subMsgType !== "rcwilltimeout" //远程控制会话即将超时
              );
            }
          } else {
            return true;
          }
        });
        console.log(arr);
        this.chatList = [...arr];
        this.testList();
        this.spinning = false;
      }
    },
    currentUnreadCount(next) {
      if (!this.hidden && next > 0) {
        this.tim(this.imInfo.sdkAppID).setMessageRead({
          conversationID: this.currentConversation.conversationID,
        });
      }
    },
    hidden(next) {
      titleNotify(0);
      if (!next && this.currentUnreadCount > 0) {
        this.tim(this.imInfo.sdkAppID).setMessageRead({
          conversationID: this.currentConversation.conversationID,
        });
      }
    },
    isSDKReady(a, b) {
      // console.log(a, b, this.conversationList);
      // if (a && this.conversationList.length) {
      //   this.imStatus = true;
      //   this.getIsSDKReady();
      // } else if (a) {
      //   this.getIsSDKReady();
      // }
      if (a) {
        let that = this;
        let promise = this.tim(this.imInfo.sdkAppID).getConversationList();
        promise
          .then(function (imResponse) {
            console.log("获取会话列表", imResponse);
            that.$store.commit(
              "updateConversationList",
              imResponse.data.conversationList
            ); // 会话列表，用该列表覆盖原有的会话列表
          })
          .then(() => {
            that.getIsSDKReady();
            that.spinning = false;
          });
      }
    },
    conversationList(a, b) {
      // if (a && a.length && this.isSDKReady && !this.imStatus) {
      //   this.imStatus = true;
      //   this.getIsSDKReady();
      // }
    },
  },
  methods: {
    moment,
    //取消远程，消息弹框关闭
    cancelrcYC() {
      this.showLongDistance = false;
    },
    //远程结束，消息弹框关闭
    sessionRcend() {
      this.showLongDistanceIng = false;
      console.log("this.timer1", this.timer1);
      const that = this;
      clearInterval(that.timer1); //关闭远程进行中的轮巡时间
      that.timer1 = null;
      clearInterval(that.statusTimer); //关闭插件远程进行中的轮巡时间
      that.statusTimer = null;
      console.log(that.timer1);
      console.log("远程控制中轮巡时间关闭");
    },
    getRcstartMessage(text) {
      console.log(text);
      this.RcstartMessage = text;
      this.RcendMessage = "";
    },
    getRcendMessage(text) {
      console.log(text);
      this.RcendMessage = text;
      this.RcstartMessage = "";
    },
    //通知客服创建远程
    newDesktopSession(obj) {
      const data = {
        msgText: this.sessionObj.guestName + "接受了远程",
        address: obj.OrayInit.SessionUrl,
        session: obj.OrayInit.SessionID,
        sendType: "automatic",
        subMsgType: "acceptrc",
      };
      this.showLongDistanceIng = true;
      // this.$bus.$emit("getSessionObj", this.sessionObj);
      this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
      const that = this;
      clearInterval(that.timer2); //关闭远程未开始的轮巡时间
      that.timer2 = null;
      setTimeout(() => {
        console.log(
          "this.RcendMessage",
          this.RcendMessage,
          "this.RcstartMessage",
          this.RcstartMessage,
          "this.teleMessage",
          this.teleMessage
        );
        if (
          this.RcstartMessage == "" &&
          this.teleMessage.OrayInit.Type !== "3" &&
          external.call
        ) {
          let OrayInit = {
            Type: "3",
            Ctrl: "2",
            AppID: this.DistanceDate.AppID,
            AppKey: this.DistanceDate.AppKey,
            AppDomain: this.DistanceDate.AppDomain,
            SessionUrl: this.LongTwoUrl.SessionUrl,
            SessionID: this.LongTwoUrl.SessionID,
          };
          external.call(
            "CppOnOrayInfo",
            { OrayInit: OrayInit },
            (error, result) => {
              console.log("远程创建失败");
              this.RcstartMessage = "";
              this.RcendMessage = "";
              this.$store.commit("getTeleMessage", ""); //清除VUEX里的远程地址信息
              const that = this;
              clearInterval(that.timer1); //关闭远程进行中的轮巡时间
              that.timer1 = null;
              this.showLongDistanceIng = false;
              this.$store.commit("getLongTwoUrl", ""); //清除VUEX里的远程地址信息
              const data = {
                msgText: "远程控制连接失败",
                rcEndAccount: this.sessionObj.guestImAccount,
                sendType: "automatic",
                subMsgType: "rcfailure",
              };
              this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
            }
          );
        } else {
          // 远程控制中的轮巡
          this.timer1 = setInterval(() => {
            let OrayStatus = {
              AppID: "",
              AppKey: "",
              AppDomain: "",
            };
            try {
              external.call(
                "CppOnOrayInfo",
                { OrayStatus: OrayStatus },
                (error, result) => {
                  console.log("开启远程控制中的轮巡");
                }
              );
            } catch (e) {
              console.log(e);
            }
          }, 5000);
        }
      }, 5000);
    },
    longDistanceDown2() {
      let OrayInit = {
        Type: "3",
        Ctrl: "2",
        AppID: this.DistanceDate.AppID,
        AppKey: this.DistanceDate.AppKey,
        AppDomain: this.DistanceDate.AppDomain,
        SessionUrl: "",
        SessionID: "",
      };
      try {
        external.call(
          "CppOnOrayInfo",
          { OrayInit: OrayInit },
          (error, result) => {
            console.log("远程控制结束");
            this.RcstartMessage = "";
            this.RcendMessage = "远程控制已结束";
            const that = this;
            clearInterval(that.timer1); //关闭远程进行中的轮巡时间
            that.timer1 = null;
            console.log("远程控制中轮巡时间关闭");
            this.$store.commit("getLongTwoUrl", ""); //清除VUEX里的远程地址信息
            const data = {
              msgText: "远程控制已结束",
              rcEndAccount: this.sessionObj.guestImAccount,
              sendType: "automatic",
              subMsgType: "rcend",
            };
            this.$bus.$emit("sendCustomMessage", data); //发送自定义远程结束消息
            this.showLongDistanceIng = false;
          }
        );
      } catch (e) {
        console.log("创建桌面会话失败", e);
      }
    },
    //断开远程
    longDistanceDown() {
      let OrayInit = {
        Type: "3",
        Ctrl: "2",
        AppID: this.DistanceDate.AppID,
        AppKey: this.DistanceDate.AppKey,
        AppDomain: this.DistanceDate.AppDomain,
        SessionUrl: "",
        SessionID: "",
      };
      if (external.call) {
        external.call(
          "CppOnOrayInfo",
          { OrayInit: OrayInit },
          (error, result) => {
            console.log("远程控制结束");
            const that = this;
            clearInterval(that.timer1); //关闭远程进行中的轮巡时间
            that.timer1 = null;
            console.log("远程控制中轮巡时间关闭");
            this.$store.commit("getLongTwoUrl", ""); //清除VUEX里的远程地址信息
            this.RcstartMessage = "";
            this.RcendMessage = "远程控制已结束";
            //访客端点断开无需发送，客服获取到回调判断发送断开访客再返回给客服
            // const data = {
            //   msgText: "远程控制已结束",
            //   rcEndAccount: this.sessionObj.guestImAccount,
            //   sendType: "automatic",
            //   subMsgType: "rcend",
            // };
            // this.$bus.$emit("sendCustomMessage", data); //发送自定义远程结束消息
            this.showLongDistanceIng = false;
          }
        );
      } else {
        let url =
          "http://127.0.0.1:3388/oray/destroyclient?callback=cb_destroyclient";
        this.$jsonp(url).then((res) => {});
      }
    },
    //拒绝远程
    rejectLongDistance() {
      const data = {
        msgText: "对方拒绝了你的远程请求",
        sendType: "automatic",
        subMsgType: "refuserc",
      };
      this.showLongDistance = false;
      this.$bus.$emit("sendCustomMessage", data); //发送自定义拒绝消息
    },
    //接受远程
    receiveLongDistance() {
      //1.判断是否有回调
      //2.判断是否为客户端
      console.log(this.DistanceDate);
      if (external.call) {
        //2.判断客户端是否支持远程协助
        console.log("this.DistanceDate", this.DistanceDate);
        let OrayInit = {
          Type: "1",
          Ctrl: "0",
          AppID: this.DistanceDate.AppID,
          AppKey: this.DistanceDate.AppKey,
          AppDomain: this.DistanceDate.AppDomain,
          SessionUrl: "",
          SessionID: "",
        };
        try {
          external.call(
            "CppOnOrayInfo",
            { OrayInit: OrayInit },
            (error, result) => {
              console.log(result);
              if (result.message !== "Success.") {
                // const data = {
                //   msgText: "远程控制连接失败",
                //   rcEndAccount: this.sessionObj.guestImAccount,
                //   sendType: "automatic",
                //   subMsgType: "rcfailure",
                // };
                // this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
                this.noticeVisible = true;
                this.showLongDistance = false;
              } else {
                console.log("我可以进行远程哦");
                this.showLongDistance = false;
                let OrayInit = {
                  Type: "2",
                  Ctrl: "2",
                  AppID: this.DistanceDate.AppID,
                  AppKey: this.DistanceDate.AppKey,
                  AppDomain: this.DistanceDate.AppDomain,
                  SessionUrl: "",
                  SessionID: "",
                };
                try {
                  external.call(
                    "CppOnOrayInfo",
                    { OrayInit: OrayInit },
                    (error, result) => {
                      console.log("访客创建了桌面会话aaa");
                      setTimeout(() => {
                        console.log(
                          "this.RcstartMessage",
                          this.RcstartMessage,
                          " this.RcendMessage",
                          this.RcendMessage,
                          "this.teleMessage",
                          this.teleMessage
                        );
                        if (
                          this.RcstartMessage == "" &&
                          this.RcendMessage == "" &&
                          this.teleMessage == ""
                        ) {
                          console.log("远程创建失败");
                          const data = {
                            msgText: "远程控制连接失败",
                            rcEndAccount: this.sessionObj.guestImAccount,
                            sendType: "automatic",
                            subMsgType: "rcfailure",
                          };
                          this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
                        }
                      }, 4000);
                    }
                  );
                } catch (e) {
                  console.log("创建桌面会话失败", e);
                }
              }
            }
          );
        } catch (e) {}
      } else {
        console.log("这不是客户端");
        let OrayInit = {
          OrayInit: {
            AppID: "285933877118",
            AppKey: "430e209a068f29895f223be31115f0ea",
            AppDomain: "sl-api.oray.com",
          },
        };
        OrayInit = JSON.stringify(OrayInit);
        axios
          .post("http://127.0.0.1:3388/oray/postcreateclient", OrayInit)
          .then((res) => {
            console.log(res);
            if (res.status == 200) {
              let url = "http://127.0.0.1:3388/oray/status?callback=cb_status";
              let url2 =
                "http://127.0.0.1:3388/oray/getclient?callback=cb_createclient&Id=121212121212";
              setTimeout(() => {
                axios.get(url).then((res) => {
                  console.log(res);
                  if (res.data.Info.Status == 1) {
                    axios.get(url2).then((res) => {
                      console.log(res);
                      if (res.data.Info.Status == 1) {
                        const data = {
                          msgText: this.sessionObj.guestName + "接受了远程",
                          address: res.data.Info.SessionUrl,
                          session: res.data.Info.SessionID,
                          sendType: "automatic",
                          subMsgType: "acceptrc",
                        };
                        console.log(data);
                        this.showLongDistance = false;
                        this.showLongDistanceIng = true;
                        this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
                      }
                      setTimeout(() => {
                        console.log(
                          "this.RcstartMessage",
                          this.RcstartMessage,
                          " this.RcendMessage",
                          this.RcendMessage,
                          "res.data.Info.Status",
                          res.data.Info.Status
                        );
                        if (
                          this.RcstartMessage == "" &&
                          res.data.Info.Status == 1
                        ) {
                          console.log("远程创建失败");
                          const data = {
                            msgText: "远程控制连接失败",
                            rcEndAccount: this.sessionObj.guestImAccount,
                            sendType: "automatic",
                            subMsgType: "rcfailure",
                          };
                          this.$bus.$emit("sendCustomMessage", data); //发送自定义接受远程消息
                          this.showLongDistanceIng = false;
                        }
                      }, 2000);
                    });
                  }
                });
              }, 1000);

              this.statusTimer = setInterval(() => {
                axios.get(url).then((res) => {
                  console.log(res);
                  if (res.data.status == 1) {
                    this.$store.commit("getModMessage", res.data); //轮巡的信息放到vuex里
                    this.clientStatus = res.data.Info.Status;
                  }
                });
              }, 5000);
            }
          })
          .catch(() => {
            console.log("111111111111");
            this.$message.error("远程插件未打开");
            const data = {
              msgText: "对方拒绝了你的远程请求",
              sendType: "automatic",
              subMsgType: "refuserc",
            };
            this.showLongDistance = false;
            this.$bus.$emit("sendCustomMessage", data); //发送自定义拒绝消息
          });
      }
    },
    //查询是否引入表单
    IsQuote() {
      let params = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
      };
      this.Request.get("/hfw/tsmHfwLeaveCommentsSet/isQuote", params).then(
        (res) => {
          if (res.data.status) {
            this.$store.commit("getLeaveMessageData", res.data.data);
          }
        }
      );
    },
    handleOk() {
      this.noticeVisible = false;
    },
    noticeHandleCancel() {
      this.noticeVisible = false;
    },
    //获取更多
    getMOreFn() {
      //一旦历史消息时间与腾讯云消息时间有大于等于情况，均拉去历史消息
      if (this.historyList.length) {
        // console.log(
        //   this.historySessionList,
        //   this.progressSessionList,
        //   this.currentMessageList.length
        // );
        if (this.progressSessionList.length) {
          if (
            this.historySessionList.length &&
            this.historySessionList[0].msgTime / 1000 >
              this.currentMessageList[0].time
          ) {
            this.searchChatRecords();
            this.isSave = true;
          } else if (
            this.historySessionList.length &&
            this.historySessionList[0].msgTime / 1000 <
              this.currentMessageList[0].time
          ) {
            this.$store
              .dispatch(
                "getMessageList",
                this.currentConversation.conversationID
              )
              .then(() => {
                // console.log(this.isCompleted, this.isSave);
                if (!this.isCompleted && !this.isSave) {
                  this.isSave = true;
                } else if (this.isCompleted && this.isSave) {
                  this.searchChatRecords();
                  //this.isSave = false
                }
              });
            // this.isSave = false;
          } else {
            this.searchChatRecords();
            this.$store.dispatch(
              "getMessageList",
              this.currentConversation.conversationID
            );
            // this.isSave = true;
          }
        } else {
          this.searchChatRecords();
          this.isSave = true;
        }
      } else {
        this.$store.dispatch(
          "getMessageList",
          this.currentConversation.conversationID
        );
        this.status = this.isCompleted;
      }
    },
    closeSpping() {
      setTimeout(() => {
        console.log("*********************/*/*/*/*/");
        this.spinning = false;
        console.log(this.spinning);
      }, 500);
    },
    //获取历史消息
    searchChatRecords() {
      console.log(
        this.historySessionList,
        this.historySessionList[this.historySessionList.length - 1].msgTime,
        this.historySessionList[0].msgTime
      );
      let params = {
        orgId: this.guestInfo.orgId,
        visitorAccount: this.sessionObj.guestImAccount,
        msgTimeEnd: moment(
          this.historySessionList[this.historySessionList.length - 1].msgTime
        ).format("YYYY-MM-DD HH:mm:ss.SSS"),
        pageSize: 20,
      };

      this.Request.get("/session/chat/record/search", params).then((res) => {
        if (res.data.status) {
          let data = res.data;
          let list = [...data.list];
          let arr = deleteHistory(list, this.imInfo.userID);
          let arr1 = [...arr];
          this.historySessionList.map((item) => {
            arr1.map((val, index) => {
              if (val.id == item.id) {
                arr.splice(index, 1, "");
              }
            });
          });
          arr = arrEmpty(arr);
          if (arr.length) {
            let arr2 = [...arr];
            arr2.forEach((item, index) => {
              if (
                (item.msgTime == this.historySessionList[0].msgTime &&
                  item.id == this.historySessionList[0].id) ||
                item.subMsgType == "queuinglocation"
              ) {
                arr.splice(index, 1, "");
              }
            });
            arr = arrEmpty(arr);
            this.historySessionList = [...this.historySessionList, ...arr];
            // this.$store.commit("getHistoryList", data.list);
          } else {
            this.status = true;
          }
        }
      });
    },
    getIsSDKReady() {
      console.log(this.conversationList, "this.conversationList");
      this.queuesObj = {
        payload: {
          data: {
            msgText: "",
            subMsgType: "",
          },
        },
        time: "",
        type: "",
      };
      console.log(
        this.conversationList.length,
        this.sessionObj.serviceImAccount
      );
      if (this.conversationList.length) {
        let flag = false;
        this.conversationList.map((item, index) => {
          if (item.userProfile.userID == this.sessionObj.serviceImAccount) {
            flag = true;
            this.isCheckouting = true;
            this.$store
              .dispatch("checkoutConversation", item.conversationID)
              .then(() => {
                this.isCheckouting = false;
                if (this.sessionObj.sessionType == "1") {
                  let params = {
                    sessionId: this.sessionObj.id,
                    orgId: this.guestInfo.orgId,
                  };

                  this.Request.post(
                    "/guest/session/waiting/count",
                    params
                  ).then((res) => {
                    if (res.data.status) {
                      if (res.data.waitingCount) {
                        this.queuesObj.payload.data.msgText =
                          res.data.waitingCountTip;
                        this.queuesObj.payload.data.subMsgType =
                          "queuinglocation";
                        this.queuesObj.time = moment().format("X");
                        this.queuesObj.type = "TIMCustomElem";
                        console.log("44444444444444444");
                        this.isShow = true;
                        // this.progressSessionList = [this.queuesObj]
                      }
                    }
                  });
                  this.getQueuesCount(1);
                }
                //获取历史消息列表
                // this.getHistoryList();
              })
              .catch(() => {
                this.isCheckouting = false;
              });
          }
          if (!flag) {
            if (this.sessionObj.sessionType == "1") {
              let params = {
                sessionId: this.sessionObj.id,
                orgId: this.guestInfo.orgId,
              };

              this.Request.post("/guest/session/waiting/count", params).then(
                (res) => {
                  if (res.data.status) {
                    // console.log(res.data.waitingCount, this.queuesObj);
                    if (res.data.waitingCount) {
                      this.queuesObj.payload.data.msgText =
                        res.data.waitingCountTip;
                      this.queuesObj.payload.data.subMsgType =
                        "queuinglocation";
                      this.queuesObj.time = moment().format("X");
                      this.queuesObj.type = "TIMCustomElem";
                      // console.log(this.queuesObj);
                      this.isShow = true;
                      // this.progressSessionList = [this.queuesObj]
                    }
                  }
                }
              );
              this.getQueuesCount(1);
            }
          }
        });
      } else {
        if (this.sessionObj.sessionType == "1") {
          this.getHistoryList([]);
          let params = {
            sessionId: this.sessionObj.id,
            orgId: this.guestInfo.orgId,
          };

          this.Request.post("/guest/session/waiting/count", params).then(
            (res) => {
              if (res.data.status) {
                // console.log(res.data.waitingCount, this.queuesObj);
                if (res.data.waitingCount) {
                  this.queuesObj.payload.data.msgText =
                    res.data.waitingCountTip;
                  this.queuesObj.payload.data.subMsgType = "queuinglocation";
                  this.queuesObj.time = moment().format("X");
                  this.queuesObj.type = "TIMCustomElem";
                  // console.log(this.queuesObj);
                  this.isShow = true;
                }
              }
            }
          );
          this.getQueuesCount(1);
        }
      }
    },
    getHistoryList(a) {
      let params = {
        orgId: this.guestInfo.orgId,
        visitorAccount: this.sessionObj.guestImAccount,
        msgTimeEnd: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        pageSize: 20,
      };
      this.Request.get("/session/chat/record/search", params).then((res) => {
        if (res.data.status) {
          let list = [...res.data.list];
          res.data.list.map((item, index) => {
            if (item.subMsgType == "queuinglocation") {
              list.splice(index, 1, "");
            }
          });
          let arr = deleteHistory(list, this.imInfo.userID);
          this.historyList = [...arr];
          if (this.historyList.length) {
            //判断是否有历史消息情况
            this.progressSessionList = [];
            this.historySessionList = [];
            if (this.historyList.length) {
              let progressSessionList = [...a];
              let historySessionList = [...this.historyList];
              a.forEach((item, index) => {
                if (this.historyList[0].msgTime / 1000 > item.time) {
                  progressSessionList.splice(index, 1, "");
                } else if (item.time == this.historyList[0].msgTime / 1000) {
                  historySessionList.forEach((val, i) => {
                    let msgKey = val.msgKey.replace(/_/g, "-").split("-");
                    let str = msgKey[0] + "-" + msgKey[1];
                    if (item.ID.indexOf(str) > -1) {
                      progressSessionList.splice(index, 1, "");
                    }
                  });
                }
              });
              progressSessionList.forEach((item) => {
                if (item) this.progressSessionList.push(item);
              });
              this.historySessionList = historySessionList;
              // console.log(this.progressSessionList, this.historySessionList);
            } else {
              this.progressSessionList = [...a];
            }
          } else {
            this.progressSessionList = [...a];
          }
          // console.log(this.historySessionList, this.progressSessionList);
          if (
            this.historySessionList.length &&
            this.progressSessionList.length &&
            this.historySessionList[0].msgTime / 1000 <
              this.progressSessionList[0].time &&
            this.progressSessionList.length > 15
          ) {
            this.isSave = false;
          } else {
            this.isSave = true;
          }
          // this.isCheckouting = true;
          //校验当前会话类型
          /**
           * sessionType 会话类型, 0:临时待定会话,1:排队中会话,2:已接入会话,3:留言会话
           */
          // this.conversationList.map((item, index) => {
          //   if (item.userProfile.userID == this.sessionObj.serviceImAccount) {
          //     this.$store
          //       .dispatch("checkoutConversation", item.conversationID)
          //       .then(() => {
          //         this.isCheckouting = false;
          //         if (this.sessionObj.sessionType == "1") {
          //           //开启计时器，获取实时排队数据
          //           this.getQueuesCount();
          //         }
          //         //获取历史消息列表
          //         // this.getHistoryList();
          //       })
          //       .catch(() => {
          //         this.isCheckouting = false;
          //       });
          //   }
          // });
        }
      });
    },
    //监听消息更新，校验指令消息
    testList() {
      //结束旧会话，请求新的会话id，并存储
      // subMsgType == "transfer" ||  subMsgType == "reception"

      //结束会话  在点在发送消息按钮重新走会话流程
      // subMsgType =="stopsession"
      let list = [...this.progressSessionList, ...this.chatList];
      console.log("list", list);
      this.InSessionList = list;
      this.chatList.forEach((item, i) => {
        if (item.type == "TIMCustomElem") {
          item.payload.data =
            typeof item.payload.data == "string"
              ? JSON.parse(item.payload.data)
              : item.payload.data;
        }
        console.log(item);
        if (
          item.type == "TIMCustomElem" &&
          item.payload.data.subMsgType == "reception"
        ) {
          clearInterval(this.timer);
          //判断是否存在回话id，没有需要重新获取
          this.Request.get("/guest/session/question/list", this.guestInfo).then(
            (res) => {
              if (res.data.status) {
                if (res.data.sessionInfo) {
                  this.$store
                    .dispatch("checkoutConversation", item.conversationID)
                    .then(() => {
                      this.isCheckouting = false;
                    })
                    .catch(() => {
                      this.isCheckouting = false;
                    });
                  let obj = {
                    id: res.data.sessionInfo.id,
                    guestImAccount: res.data.sessionInfo.guestImAccount,
                    guestAvatar: res.data.sessionInfo.guestAvatar,
                    serviceImAccount: res.data.sessionInfo.serviceImAccount,
                    serviceAvatar: res.data.sessionInfo.serviceAvatar,
                    sessionType: res.data.sessionInfo.sessionType,
                    aiAnswerStyle: res.data.sessionInfo.aiAnswerStyle,
                    guestName: res.data.sessionInfo.guestName,
                  };
                  this.$store.commit("getSessionObj", obj);
                  this.isShow = false;
                }
              }
              //重新获取历史消息及最近消息
            }
          );

          //判断有排队，排队取消；转接；
        } else if (
          item.type == "TIMCustomElem" &&
          item.payload.data.subMsgType == "transfer"
        ) {
          //获取新的会话信息
          //转接或结束会话
          this.Request.get("/guest/session/question/list", this.guestInfo).then(
            (res) => {
              if (res.data.status) {
                if (res.data.sessionInfo) {
                  this.$store
                    .dispatch("checkoutConversation", item.conversationID)
                    .then(() => {
                      this.isCheckouting = false;
                    })
                    .catch(() => {
                      this.isCheckouting = false;
                    });
                  let obj = {
                    id: res.data.sessionInfo.id,
                    guestImAccount: res.data.sessionInfo.guestImAccount,
                    guestAvatar: res.data.sessionInfo.guestAvatar,
                    serviceImAccount: res.data.sessionInfo.serviceImAccount,
                    serviceAvatar: res.data.sessionInfo.serviceAvatar,
                    sessionType: res.data.sessionInfo.sessionType,
                    aiAnswerStyle: res.data.sessionInfo.aiAnswerStyle,
                    guestName: res.data.sessionInfo.guestName,
                  };
                  this.$store.commit("getSessionObj", obj);
                  console.log("22222222222222222222");
                  this.isShow = false;
                }
              }
              //保留转接前的消息，对新消息进行拼接
            }
          );
        } else if (
          item.type == "TIMCustomElem" &&
          item.payload.data.subMsgType == "stopsession" &&
          item.payload.data.msgText !== "正在为您转接人工客服，请等候"
        ) {
          //清除回话信息
          clearInterval(this.timer);
          //转接或结束会话
          let obj = {
            id: this.sessionObj.id,
            guestImAccount: this.sessionObj.guestImAccount,
            guestAvatar: this.sessionObj.guestAvatar,
            serviceImAccount: "",
            serviceAvatar: this.sessionObj.serviceAvatar,
            sessionType: "",
            aiAnswerStyle: this.sessionObjaiAnswerStyle,
          };
          this.$store.commit("getSessionObj", obj);
          this.scrollMessageListToButtom;
        } else if (
          item.type == "TIMCustomElem" &&
          item.payload.data.subMsgType == "stopsession" &&
          item.payload.data.msgText == "正在为您转接人工客服，请等候"
        ) {
          console.log("智能客服结束会话");
          //清除回话信息
          clearInterval(this.timer);
          //转接或结束会话
          let obj = {
            id: this.sessionObj.id,
            guestImAccount: this.sessionObj.guestImAccount,
            guestAvatar: this.sessionObj.guestAvatar,
            serviceImAccount: this.sessionObj.serviceImAccount,
            serviceAvatar: this.sessionObj.serviceAvatar,
            sessionType: "",
            aiAnswerStyle: this.sessionObjaiAnswerStyle,
          };
          this.$store.commit("getSessionObj", obj);
          this.scrollMessageListToButtom;
          this.queuesObj = {
            payload: {
              data: {
                msgText: "",
                subMsgType: "",
              },
            },
            time: "",
            type: "",
          };
          // if (this.sessionObj.sessionType !== 4) {
          setTimeout(() => {
            this.Request.get(
              "/guest/session/question/list",
              this.guestInfo
            ).then((res) => {
              console.log("***************************");
              if (res.data.status) {
                if (res.data.sessionInfo) {
                  let obj = {
                    id: res.data.sessionInfo.id,
                    guestImAccount: res.data.sessionInfo.guestImAccount,
                    guestAvatar: res.data.sessionInfo.guestAvatar,
                    serviceImAccount: res.data.sessionInfo.serviceImAccount,
                    serviceAvatar: res.data.sessionInfo.serviceAvatar,
                    sessionType: res.data.sessionInfo.sessionType,
                    aiAnswerStyle: res.data.sessionInfo.aiAnswerStyle,
                  };
                  this.$store.commit("getSessionObj", obj);
                  console.log("333333333333333333");
                  // this.isShow = false;
                  this.conversationList.map((item, index) => {
                    console.log(
                      item.userProfile.userID == obj.serviceImAccount
                    );
                    if (item.userProfile.userID == obj.serviceImAccount) {
                      // console.log(item.conversationID);
                      this.$store
                        .dispatch("checkoutConversation", item.conversationID)
                        .then(() => {
                          this.isCheckouting = false;
                          if (this.sessionObj.sessionType == "1") {
                            let params = {
                              sessionId: this.sessionObj.id,
                              orgId: this.guestInfo.orgId,
                            };
                            this.Request.post(
                              "/guest/session/waiting/count",
                              params
                            ).then((res) => {
                              if (res.data.status) {
                                console.log(
                                  res.data.waitingCount,
                                  this.queuesObj
                                );
                                if (res.data.waitingCount) {
                                  this.isShow = true;
                                  if (this.queuesObj.payload.data) {
                                    this.queuesObj.payload.data.msgText =
                                      res.data.waitingCountTip;
                                    this.queuesObj.payload.data.subMsgType =
                                      "queuinglocation";
                                    this.queuesObj.time = moment().format("X");
                                    this.queuesObj.type = "TIMCustomElem";
                                  }
                                  console.log("111111111111111111111");
                                  // this.progressSessionList = [this.queuesObj]
                                }
                              }
                            });
                            this.getQueuesCount(1);
                          }
                        })
                        .catch(() => {
                          this.isCheckouting = false;
                        });
                    }
                  });
                } else {
                  let obj = {
                    id: this.sessionObj.id,
                    guestImAccount: this.sessionObj.guestImAccount,
                    guestAvatar: this.sessionObj.guestAvatar,
                    serviceImAccount: "",
                    serviceAvatar: this.sessionObj.serviceAvatar,
                    sessionType: "",
                    aiAnswerStyle: this.sessionObjaiAnswerStyle,
                  };
                  this.$store.commit("getSessionObj", obj);
                }
              }
              //重新获取历史消息及最近消息
            });
          }, 2000);
        } else if (
          item.type == "TIMCustomElem" &&
          item.payload.data.subMsgType == "queuinglocation"
        ) {
          let obj = {
            id: this.sessionObj.id,
            guestImAccount: this.sessionObj.guestImAccount,
            guestAvatar: this.sessionObj.guestAvatar,
            serviceImAccount: this.sessionObj.serviceImAccount,
            serviceAvatar: this.sessionObj.serviceAvatar,
            sessionType: 1,
            guestName: this.sessionObj.guestName,
          };
          this.$store.commit("getSessionObj", obj);
          clearInterval(this.timer);
          this.queuesObj = item;
          // let index = this.progressSessionList.length - 1;
          let arr = [...list];
          //删除之前排队，创建新的排队
          arr.forEach((item, index) => {
            if (
              item.type == "TIMCustomElem" &&
              item.payload.data.subMsgType == "queuinglocation"
            ) {
              arr.splice(index, 1, "");
            }
          });
          // console.log(arr, arrEmpty(arr));
          arr = arrEmpty(arr);
          list = [...arr];
          // this.isShow = true;
          // if (
          //   this.progressSessionList[index].type == "TIMCustomElem" &&
          //   this.progressSessionList[index].payload.data.subMsgType ==
          //     "queuinglocation"
          // ) {
          //   this.progressSessionList.splice(index, 1, item);
          // }
          this.getQueuesCount(2);
        }
      });
      this.progressSessionList = [...list];
    },

    //更新排隊數量
    getQueuesCount(val) {
      let params = {
        sessionId: this.sessionObj.id,
        orgId: this.guestInfo.orgId,
      };

      this.timer = setInterval(() => {
        this.Request.post("/guest/session/waiting/count", params).then(
          (res) => {
            if (res.data.status) {
              console.log(res.data.waitingCount, this.queuesObj, val);
              // if (val == 2) {
              if (res.data.waitingCount) {
                this.queuesObj.payload.data.msgText = res.data.waitingCountTip;
                if (val == 1) this.queuesObj.time = moment().format("X");
              } else {
                // this.queuesObj.payload.msgText = "正在接入。。。";
              }
              // let index = this.progressSessionList.length - 1;
              //删除之前排队，创建新的排队
              console.log(this.progressSessionList, this.queuesObj);
              // if (
              //   this.progressSessionList[index].type == "TIMCustomElem" &&
              //   this.progressSessionList[index].payload.data.subMsgType ==
              //     "queuinglocation"
              // ) {
              //   this.progressSessionList.splice(index, 1, this.queuesObj);
              // } else {
              //   this.progressSessionList = [
              //     ...this.progressSessionList,
              //     this.queuesObj
              //   ];
              // }
              // }
            }
          }
        );
      }, 30000);
    },
    dequeueFn() {
      let params = {
        sessionId: this.sessionObj.id,
        orgId: this.guestInfo.orgId,
      };
      this.Request.get("/guest/session/cancel/waiting", params).then((res) => {
        if (res.data.status) {
          this.$message.success(res.data.msg);
          this.isShow = false;
          // this.$bus.$emit('cancleQueuse',true)
          this.cancleQueuse(true);
          //清楚会话id
        } else {
          this.$message.warning(res.data.msg);
        }
      });
    },
    cancleQueuse(val) {
      if (val) {
        clearInterval(this.timer);
        let obj = {
          id: this.sessionObj.id,
          guestImAccount: this.sessionObj.guestImAccount,
          guestAvatar: this.sessionObj.guestAvatar,
          serviceImAccount: "",
          serviceAvatar: this.sessionObj.serviceAvatar,
          sessionType: "",
          aiAnswerStyle: this.sessionObj.aiAnswerStyle,
          guestName: this.sessionObj.guestName,
        };
        this.$store.commit("getSessionObj", obj);
      }
    },
    onScroll({ target: { scrollTop } }) {
      let messageListNode = this.$refs["message-list"];
      if (!messageListNode) {
        return;
      }
      if (
        this.preScrollHeight - messageListNode.clientHeight - scrollTop <
        20
      ) {
        this.isShowScrollButtomTips = false;
      }
    },
    // 如果滚到底部就保持在底部，否则提示是否要滚到底部
    keepMessageListOnButtom() {
      let messageListNode = this.$refs["message-list"];
      if (!messageListNode) {
        return;
      }
      // 距离底部20px内强制滚到底部,否则提示有新消息
      if (
        this.preScrollHeight -
          messageListNode.clientHeight -
          messageListNode.scrollTop <
        20
      ) {
        this.$nextTick(() => {
          messageListNode.scrollTop = messageListNode.scrollHeight;
        });
        this.isShowScrollButtomTips = false;
      } else {
        this.isShowScrollButtomTips = true;
      }
      this.preScrollHeight = messageListNode.scrollHeight;
    },
    // 直接滚到底部
    scrollMessageListToButtom() {
      this.$nextTick(() => {
        let messageListNode = this.$refs["message-list"];
        if (!messageListNode) {
          return;
        }
        messageListNode.scrollTop = messageListNode.scrollHeight;
        this.preScrollHeight = messageListNode.scrollHeight;
        this.isShowScrollButtomTips = false;
      });
    },
    scrollMessageListToTop() {
      this.$nextTick(() => {
        let messageListNode = this.$refs["message-list"];
        if (!messageListNode) {
          return;
        }
        messageListNode.scrollTop = 0;
        this.preScrollHeight = messageListNode.scrollHeight;
        this.isShowScrollButtomTips = false;
      });
    },
    showMore() {
      this.showConversationProfile = !this.showConversationProfile;
    },
    onImageLoaded() {
      this.keepMessageListOnButtom();
    },
    downloads() {
      const url = "http://www.qifengyun.com/downloads";
      if (external.call) {
        external.call("CppShowPublicUrl", { url }, (error, result) => {
          console.log(result);
        });
      }
    },
  },
  beforeDestroy() {
    //清除定时器
    if (this.timer1) {
      clearInterval(this.timer1);
    }
    if (this.timer2) {
      clearInterval(this.timer2);
    }
  },
};
</script>
<style lang="less" scoped>
/deep/ .ant-modal {
  width: 400px !important;
}
.downloads {
  margin-top: 15px;
  cursor: pointer;
  color: #1890ff;
}
/* 当前会话的骨架屏 */
.current-conversation-wrapper {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: absolute;
  width: 100%;
  height: calc(100vh - 16px);
  background-color: #f5f5f5;
  color: #1c2438;
  // top: 15px;
  .current-conversation {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    // height: 80vh;
    .content {
      display: flex;
      // overflow-y: scroll;`
      position: relative;
      flex-direction: column;
      flex: 1;
      height: calc(100vh - 210px);

      -webkit-box-flex: 1;
      -ms-flex: 1;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      .message-list {
        overflow-y: auto;
        padding: 0 20px;
        width: 100%;
        height: 100%;
        // height:calc(100% - 224px);

        -webkit-box-sizing: border-box;
        .more {
          display: flex;
          justify-content: center;
          font-size: 12px;

          -webkit-box-pack: center;
          -ms-flex-pack: center;
          .ant-btn {
            border-color: transparent;
            background: #f5f5f5;
            box-shadow: none;
            color: #409eff;

            -webkit-box-shadow: none;
          }
        }

        .no-more {
          display: flex;
          justify-content: center;
          padding: 10px 10px;
          font-size: 12px;
          color: #a5b5c1;
        }
      }
      .newMessageTips {
        position: absolute;
        // left: 0;
        right: 5px;
        z-index: 20;
        margin: auto;
        border-radius: 10px;
        // padding: 5px;
        width: 120px;
        cursor: pointer;
        text-align: center;
        // bottom: 5px;
        font-size: 12px;
        // border: 1px solid #e9eaec;
        // background-color: #fff;
        // color: #2d8cf0;
      }
    }
  }
}

.footer {
  border-top: 1px solid #e7e7e7;
  .lineUp {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
    .text {
      font-size: 12px;
      .count {
        padding: 0 5px;
      }

      .cancel {
        cursor: pointer;
        color: #169bd5;
      }
    }
  }
}
.Knowledge {
  position: relative;
  z-index: 10;
  // box-shadow: 0 5px 10px rgba(51, 51, 51, 0.25);
  margin: 10px 20px 10px 10px;
  width: 96%;
  background: white;
}
.show-more {
  padding: 10px 20px 0 0;
  text-align: right;
}
.message {
  display: flex;
  position: absolute;
  bottom: 210px;
  z-index: 100;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #dae8f1;
  width: 100%;
  height: auto;
  background: #ecf7fd;
  background: #f0fff0;
  font-size: 12px;
  .message-left {
    width: 470px;
    span {
      overflow: hidden;
      margin: 0 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  & > div {
    display: flex;
    align-items: center;
  }
}
</style>
