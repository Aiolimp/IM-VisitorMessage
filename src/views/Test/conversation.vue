<!-- 会话页 -->
<template>
  <div class="conversation">
    <a-modal
      title="咨询问题分类"
      :visible="visible"
      :footer="null"
      :closable="false"
    >
      <p>请点击选择问题，我们将安排专业人员与您沟通！</p>
      <div>
        <div
          v-for="(item, index) in getNavigationList"
          :key="index"
          class="list"
          :class="{ active: index === select }"
          @click="selectQuestion(item.id, index)"
        >
          {{ item.question }}
        </div>
      </div>
      <div class="btn">
        <a-button
          type="primary"
          @click="onOK()"
        >点击咨询客服</a-button>
      </div>
    </a-modal>
    <current-conversation v-if="!visible" />
    <image-previewer />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import currentConversation from "./session";
import imagePreviewer from "@/components/message/image-previewer";
import { titleNotify } from "@/utils";
import { v1 as uuidv1 } from "uuid";
import { decode } from "js-base64";
export default {
  name: "",
  components: {
    currentConversation,
    imagePreviewer,
  },
  data() {
    return {
      getNavigationList: [],
      getNavigationStatus: false,
      uuid: "",
      visible: false,
      select: "",
      questionId: "",
      newGuestFlag: 1,
      infoObj: {
        userID: "",
        userSig: "",
        sdkAppID: "",
        imPassword: "",
      },
      isAssignment: false,
      localStorageObject: {},
      extDataParams: {},
      index: 0,
      timer: "",
      aiServiceFlag: false,
      aiServiceId: "",
      closeDistanceState:null
    };
  },
  computed: {
    ...mapState({
      sessionObj: (state) => state.basic.sessionObj,
    }),
  },
  watch: {
    uuid(val, oldVal) {
      this.getNavigation();
    },
  },
  //方法集合
  methods: {
    setLocalStorage(uuidObject) {
      if (!uuidObject) {
        this.uuid = uuidv1().replace(/-/g, "");
        this.localStorageObject = Object.assign({}, this.localStorageObject, {
          uuid: this.uuid,
        });
      } else {
        this.localStorageObject = Object.assign(
          {},
          this.localStorageObject,
          uuidObject
        );
      }
      localStorage.setItem(
        this.$route.query.url,
        JSON.stringify(this.localStorageObject)
      );
    },
    getNavigation(type) {
      let params = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
        guestId: this.uuid,
      };

      this.Request.get("/guest/session/question/list", params).then((res) => {
        if (res.data.status) {
          this.getList = res.data.list;
          this.getNavigationStatus = res.data.webNavigationFlag;
          if (res.data.sessionInfo && !type) {
            this.visible = false;
            this.isAssignment = true; //已存在聊天的项目，无需走分配流程
            this.createIM();
            let obj = {
              id: res.data.sessionInfo.id,
              guestName: res.data.sessionInfo.guestName,
              guestImAccount: res.data.sessionInfo.guestImAccount,
              guestAvatar: res.data.sessionInfo.guestAvatar,
              serviceImAccount: res.data.sessionInfo.serviceImAccount,
              serviceAvatar: res.data.sessionInfo.serviceAvatar,
              sessionType: res.data.sessionInfo.sessionType,
              aiAnswerStyle: res.data.sessionInfo.aiAnswerStyle,
            };
            this.$store.commit("getSessionObj", obj);
          } else if (
            res.data.sessionInfo &&
            res.data.sessionInfo.sessionType == 4 &&
            res.data.navigationFlag &&
            type == 1
          ) {
            this.aiServiceFlag = res.data.aiServiceFlag;
            this.aiServiceId = res.data.sessionInfo.id;
            this.getNavigationList = res.data.list;
            this.visible = true;
          } else if (
            res.data.sessionInfo &&
            type == 1 &&
            !res.data.navigationFlag
          ) {
            let paramy = {
              orgId: this.$route.query.orgId,
              sessionId: res.data.sessionInfo.id,
            };
            this.Request.post(
              "/guest/session/ai/transfer/serviceacc",
              paramy
            ).then((res) => {
              if (res.data.status) {
                this.$bus.$emit("scroll-bottom");
              }
            });
          } else if (res.data.navigationFlag && !res.data.aiServiceFlag) {
            this.getNavigationList = res.data.list;
            this.visible = true;
          } else {
            this.visible = false;
            this.createIM();
          }
        }
      });
    },
    //分配流程
    customerService() {
      let params = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
        guestId: this.uuid,
        questionId: this.questionId, //咨询问题ID
        newGuestFlag: this.newGuestFlag, //是否是新访客, 1新访客, 0旧访客
      };
      this.Request.get("/guest/session/service/acc/assign", params).then(
        (res) => {
          if (res.data.status) {
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
            this.login();
            this.initListener();
            this.spinning = false;
          }
        }
      );
    },
    createIM() {
      let params = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
        guestId: this.uuid,
        ...this.extDataParams,
      };
      this.Request.get("/guest/session/im/account/create", params).then(
        (res) => {
          let that = this;
          if (res.data.status && res.data.imAccount) {
            this.$store.commit('getVisitorInf',res.data.sessionId)
            this.index = 0;
            clearTimeout(this.timer);
            this.createSig(res.data.imAccount, res.data.imPassword);
            this.newGuestFlag = res.data.newGuestFlag;
            this.infoObj.userID = res.data.imAccount;
            this.infoObj.imPassword = res.data.imPassword;
          } else {
            if (that.index < 3) {
              that.index++;
              that.timer = setTimeout(function () {
                that.createIM();
              }, 1000);
            } else {
              clearTimeout(that.timer);
              that.index = 0;
              that.$message.warning(res.data.msg);
            }
          }
        }
      );
    },
    getGuestId(dataParams) {
      let params = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
        ...dataParams,
      };
      return new Promise((resolve, reject) => {
        this.Request.get("/guest/session/query/guest/info/by/ext", params).then(
          (res) => {
            resolve(res);
          }
        );
      });
    },
    createSig(imAccount, imPassword) {
      let obj = {
        orgId: this.$route.query.orgId,
        channelId: this.$route.query.channelId,
        guestId: this.uuid,
        questionId: this.questionId, //咨询问题ID
        newGuestFlag: this.newGuestFlag, //是否是新访客, 1新访客, 0旧访客
      };
      this.$store.commit("getGuestInfo", obj);
      let params = {
        orgId: this.$route.query.orgId,
        imAccount,
        imPassword,
      };
      this.Request.get("/guest/session/im/query/user/sig", params).then(
        (res) => {
          let that = this;
          if (res.data.status) {
            this.index = 0;
            clearTimeout(this.timer);
            (this.infoObj.userSig = res.data.userSig),
              (this.infoObj.sdkAppID = res.data.sdkAppid);
            this.$store.commit("getImInfo", this.infoObj);
            if (this.isAssignment) {
              //已存在聊天的项目
              this.login();
              this.initListener();
              this.spinning = false;
            } else {
              this.customerService();
            }
          } else {
            if (this.index < 3) {
              this.index++;
              this.timer = setTimeout(function () {
                that.createSig(that.infoObj.userID, that.infoObj.imPassword);
              }, 1000);
            } else {
              clearTimeout(this.timer);
              this.index = 0;
              this.$message.warning(res.data.msg);
            }
          }
        }
      );
    },
    selectQuestion(id, index) {
      this.select = index;
      this.questionId = id;
    },
    onOK() {
      if (this.aiServiceFlag && this.aiServiceId != "" && this.questionId) {
              this.visible = false;
        let paramy = {
          orgId: this.$route.query.orgId,
          sessionId: this.aiServiceId,
          questionId: this.questionId,
        };
        this.Request.post("/guest/session/ai/transfer/serviceacc", paramy).then(
          (res) => {
            if (res.data.status) {
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
              this.$bus.$emit("scroll-bottom");
            }else{
              this.$message.error('转人工失败')
            }
          }
        );
      } else if (this.questionId && !this.aiServiceFlag) {
        this.visible = false;
        this.createIM();
      } else {
        this.$message.warning("请选择咨询问题！");
      }
    },
    login() {
      this.tim(this.infoObj.sdkAppID)
        .login({
          userID: this.infoObj.userID,
          userSig: this.infoObj.userSig,
        })
        .then(() => {
          this.$store.commit("toggleIsLogin", true);
          this.$store.commit("startComputeCurrent");
        })
        .catch((error) => {
          this.loading = false;
          this.$store.commit("showMessage", {
            message: "登录失败：" + error.message,
            type: "error",
          });
        });
    },
    initListener() {
      // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
      this.tim(this.infoObj.sdkAppID).on(
        this.TIM.EVENT.SDK_READY,
        this.onReadyStateUpdate,
        this
      );
      // SDK NOT READT
      this.tim(this.infoObj.sdkAppID).on(
        this.TIM.EVENT.SDK_NOT_READY,
        this.onReadyStateUpdate,
        this
      );
      // 被踢出
      this.tim(this.infoObj.sdkAppID).on(
        this.TIM.EVENT.KICKED_OUT,
        this.onKickOut
      );
      // SDK内部出错
      this.tim(this.infoObj.sdkAppID).on(this.TIM.EVENT.ERROR, this.onError);
      // 收到新消息
      this.tim(this.infoObj.sdkAppID).on(
        this.TIM.EVENT.MESSAGE_RECEIVED,
        this.onReceiveMessage
      );
      // 会话列表更新
      this.tim(this.infoObj.sdkAppID).on(
        this.TIM.EVENT.CONVERSATION_LIST_UPDATED,
        this.onUpdateConversationList,
        this
      );
    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TIM.EVENT.SDK_READY ? true : false;
      this.$store.commit("toggleIsSDKReady", isSDKReady);

      if (isSDKReady) {
        this.tim(this.infoObj.sdkAppID)
          .getMyProfile()
          .then(({ data }) => {
            this.$store.commit("updateCurrentUserProfile", data);
          })
          .catch((error) => {
            this.$store.commit("showMessage", {
              type: "error",
              message: error.message,
            });
          });

        this.$store.dispatch("getBlacklist");
      }
    },
    onKickOut(event) {
      this.$store.commit("showMessage", {
        message: `${this.kickedOutReason(event.data.type)}被踢出，请重新登录。`,
        type: "error",
      });
      this.$store.commit("toggleIsLogin", false);
      this.$store.commit("reset");
    },
    kickedOutReason(type) {
      switch (type) {
        case this.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
          return "由于多实例登录";
        case this.TIM.TYPES.KICKED_OUT_MULT_DEVICE:
          return "由于多设备登录";
        case this.TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
          return "由于 userSig 过期";
        default:
          return "";
      }
    },
    sendCloseDistance(type){
      this.closeDistanceState = type
    },
    onReceiveMessage({ data: messageList }) {
      const arr = messageList;
      arr.map((item) => {
        if (item) {
          if (item.payload.data) {
            item.payload.data =
              typeof item.payload.data == "string" && item.payload.data != ""
                ? JSON.parse(item.payload.data)
                : item.payload.data;
            let dataInfo = item.payload.data;
            //收到客服远程控制结束
            if (
              dataInfo.subMsgType == "rcend" &&
              dataInfo.rcEndAccount !== this.sessionObj.guestImAccount&&
              this.closeDistanceState!==1
            ) {
              const data = {
                msgText: "远程控制已结束",
                rcEndAccount: dataInfo.rcEndAccount,
                sendType: "automatic",
                subMsgType: "rcend",
              };
              this.$bus.$emit("sendCustomMessage", data);//发送自定义远程已结束消息
              this.$bus.$emit("sessionRcend", true);
              this.$bus.$emit('sendRcendMessage',data.msgText)//用来判断客服是否发送了此消息
            }
            //会话结束访客还没有接受是否远程
            if (dataInfo.subMsgType == "stopsession") {
              this.$bus.$emit("cancelrcYC", 2);
            }
            //收到客服远程开始消息
            if (dataInfo.subMsgType == "rcstart") {
              const data = {
                msgText: "远程控制已开始",
                sendType: "automatic",
                subMsgType: "rcstart",
              };
              this.$bus.$emit("sendCustomMessage", data);//发送自定义远程已开始消息
              this.$bus.$emit('sendRcstartMessage',data.msgText)//用来判断客服是否发送了此消息
            }
            //取消远程
            if (dataInfo.subMsgType == "cancelrc") {
              this.$bus.$emit("cancelrcYC", 2);
            }
            //远程会话即将超时结束
            if (dataInfo.subMsgType == "rcwilltimeout") {
              const data = {
                msgText: "远程控制进行中",
                sendType: "manual",
                subMsgType: "rcrun",
              };
              this.$bus.$emit("sendCustomMessage", data);//发送自定义远程进行中消息
            }
          }
        }
      });
      try {
        external && external.call
          ? external.call("CppMessageUpdate", { count: 1 }, (error, result) => {
              console.log(result);
            })
          : "";
      } catch {}

      titleNotify(1);
      this.$store.commit("pushCurrentMessageList", messageList);
    },
    onError({ data }) {
      if (data.message !== "Network Error") {
        this.$store.commit("showMessage", {
          message: data.message,
          type: "error",
        });
      }
    },
    onUpdateConversationList(event) {
      this.$store.commit("updateConversationList", event.data);
    },
  },
  created() {
    /**
     * {@param localStorage:{uuid,extUuid}} uuid:非唯一标识uuid  extUuid:唯一标识uuid
     */
    let localStorageString = localStorage.getItem(this.$route.query.url);
    if (!!localStorageString) {
      this.localStorageObject = JSON.parse(localStorageString);
    }
    let { uuid, extUuid } = this.localStorageObject;

    let { orgId, channelId, extCustomerId, extContactId, data } =
      this.$route.query;
    // extCustomerId/extContactId 存在，走接口，拿guestId333
    if (!!extCustomerId || !!extContactId || !!data) {
      let dataParams = {
        extCustomerId,
        extContactId,
      };
      if (!!data) {
        dataParams = JSON.parse(decode(data));
      }
      this.extDataParams = dataParams;
      this.getGuestId(dataParams).then((res) => {
        let { guestId } = res.data;
        if (!!guestId) {
          this.setLocalStorage({ extUuid: guestId });
          this.uuid = guestId;
        } else {
          // todo 地址url是同一个，同一台电脑，切换客户端，在线客服进的都是同一个人
          if (!!extUuid) {
            this.uuid = extUuid;
          } else {
            this.uuid = uuidv1().replace(/-/g, "");
            this.setLocalStorage({ extUuid: this.uuid });
          }
        }
      });
    } else if (!!uuid) {
      // 如果localStorage里面有uuid，直接拿来用
      this.uuid = uuid;
    } else {
      this.setLocalStorage(); // 如果localStorage没有东西，生成一个uuid
    }
  },
  mounted() {
    this.$bus.$on("sendCloseDistance", this.sendCloseDistance);
    this.$bus.$on("toNavigation", this.getNavigation);
    // this.getNavigation();
    // this.customerService()
    // this.createIM()
  },
};
</script>
<style lang="less" scoped>
.conversation {
  height: 100%;
  .ant-spin-nested-loading {
    height: 100%;
  }
}
.btn {
  margin-top: 48px;
  margin-bottom: 10px;
  text-align: center;
}
.list {
  padding: 8px 10px;
  margin: 10px 0;
  border: 1px solid #efefef;
  border-radius: 5px;
  cursor: pointer;
}
.active {
  background: #ededed;
}
</style>
