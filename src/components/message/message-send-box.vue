<template>
  <div
    id="message-send-box-wrapper"
    :style="focus ? { backgroundColor: '#FFFFFF' } : {backgroundColor: '#F5F5F5'}"
  >
    <div class="send-header-bar">
      <a-popover
        placement="top"
        trigger="click"
      >
        <div
          class="emojis"
          slot="content"
        >
          <div
            v-for="item in emojiName"
            class="emoji"
            :key="item"
            @click="chooseEmoji(item)"
          >
            <img
              :src="emojiUrl + emojiMap[item]"
              style="width:30px;height:30px"
            />
          </div>
        </div>
        <i
          class="iconfont icon-smile"
          title="发表情"
        >
          <img
            src="./../../assets/imgs/current_session/expression.jpg"
            alt
          />
        </i>
      </a-popover>
      <i
        class="iconfont icon-tupian"
        title="发图片"
        @click="handleSendImageClick"
      >
        <img
          src="./../../assets/imgs/current_session/picture.jpg"
          alt
        />
      </i>

      <i
        class="iconfont icon-wenjian"
        title="发视频"
        @click="handleSendVideoClick"
      >
        <img
          src="./../../assets/imgs/current_session/shiping.png"
          alt
        />
      </i>
      <i
        class="iconfont icon-wenjian"
        title="发文件"
        @click="handleSendFileClick"
      >
        <img
          src="./../../assets/imgs/current_session/file_s.jpg"
          alt
        />
      </i>
      <i
        class="iconfont icon-wenjian"
        title="评价"
        @click="evaluate"
        v-if="isShow"
      >
        <img
          src="./../../assets/imgs/current_session/evaluate.png"
          alt
        />
      </i>
      <i
        class="iconfont icon-wenjian"
        title="回到顶部"
        @click="goTop"
      >
        <img
          src="./../../assets/imgs/top.png"
          alt
        />
      </i>
      <span
        class="callPsrson"
        @click="getServiceacc()"
        v-if="sessionObj.sessionType == 4"
      >转人工</span>
    </div>
    <div class="bottom">
      <textarea
        ref="text-input"
        rows="4"
        resize="false"
        v-model="messageContent"
        class="text-input"
        @focus="focus = true"
        @blur="focus = false"
        @keydown.enter.exact.prevent="handleEnter"
        @keyup.ctrl.enter.prevent.exact="handleLine"
        @keydown.up.stop="handleUp"
        @keydown.down.stop="handleDown"
      ></textarea>
      <div class="bottom-btn">
        <a-tooltip
          class="item"
          title="按Enter发送消息，Ctrl+Enter换行"
          placement="left"
        >
          <a-button
            type="primary"
            class="btn-send"
            @click="sendTextMessage"
          >发 送</a-button>
        </a-tooltip>
      </div>
    </div>
    <input
      type="file"
      id="imagePicker"
      ref="imagePicker"
      accept=".jpg, .jpeg, .png, .gif, .bmp"
      @change="sendImage"
      style="display:none"
    />
    <input
      type="file"
      id="filePicker"
      ref="filePicker"
      @change="sendFile"
      style="display:none"
    />
    <input
      type="file"
      id="videoPicker"
      ref="videoPicker"
      @change="sendVideo"
      style="display:none"
      accept=".mp4"
    />
    <Evaluate
      :modelStatus="modelStatus"
      @cancelModel="cancelModel"
      v-if="modelStatus"
    />

    <WriteForm
      :isVisible="isVisible"
      @closeModel="closeModel"
      v-if="isVisible"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { emojiMap, emojiName, emojiUrl } from "./../../utils/emojiMap";
import { defaultFormatUtc } from "moment";
import Evaluate from "./../Evaluate";
import WriteForm from "./../writeForm";
export default {
  name: "message-send-box",
  props: ["scrollMessageListToButtom", "IntellectMessage"],
  components: {
    Evaluate,
    WriteForm,
  },
  data() {
    return {
      isVisible: false,
      colors: ["#99A9BF", "#F7BA2A", "#FF9900"],
      messageContent: "",
      messageContent2: "",
      isSendCustomMessage: false,
      sendCustomDialogVisible: false,
      surveyDialogVisible: false,
      file: "",
      emojiMap: emojiMap,
      emojiName: emojiName,
      emojiUrl: emojiUrl,
      showAtGroupMember: false,
      atUserID: "",
      focus: false,
      status: true,
      modelStatus: false,
      isRefashSend: true,
    };
  },

  computed: {
    ...mapGetters(["toAccount", "currentConversationType"]),
    ...mapState({
      // memberList: state => state.group.currentMemberList,
      refuseDate: (state) => state.basic.refuseDate,
      userID: (state) => state.user.userID,
      imInfo: (state) => state.basic.imInfo,
      sessionObj: (state) => state.basic.sessionObj,
      guestInfo: (state) => state.basic.guestInfo,
    }),
    isShow() {
      if (this.sessionObj.sessionType == 2) return true;
    },
  },
  watch: {
     refuseDate(a,b){
      if(a){
        console.log(a);
      this.sendCustomMessage(a);
      }
    },
  },
  mounted() {
    console.log("sessionobj", this.sessionObj);
    this.$refs["text-input"].addEventListener("paste", this.handlePaste);
    this.$bus.$on("reEditMessage", this.reEditMessage);
    this.$bus.$on("message", this.reEditMessage);
    this.$bus.$on("sendIntellectMessage", this.sendIntellectMessage);
    this.$bus.$off("sendCustomMessage");
    this.$bus.$on("sendCustomMessage", this.sendCustomMessage);
  },
  beforeDestroy() {
    this.$refs["text-input"].removeEventListener("paste", this.handlePaste);
    this.offListener();
  },
  methods: {
    offListener() {},
    //远程自定义消息
    handleSendLongClick(data) {
      if (!this.isRefashSend) {
        return;
      }
      if (!this.sessionObj.serviceImAccount) {
        console.log("重新走分配流程");
        this.isRefashSend = false;
        this.customerService(6);
        return;
      }
      this.sendCustomMessage(data);
    },
    //智能客服自定义消息
    sendIntellectMessage(item) {
      if (!this.sessionObj.serviceImAccount) {
        this.isRefashSend = false;
        this.customerService(5);
        return;
      }
      this.messageContent2 = item ? item.substring(item.indexOf(".") + 1) : "";
      console.log(this.messageContent2);
      let data = {
        msgText: this.messageContent2,
        sendType: "manual",
        subMsgType: "specifiedquestion",
      };
      this.sendCustomMessage(data);
    },
    goTop() {
      this.$bus.$emit("scroll-top", 1);
    },
    hiddenMenu() {
      return document.getElementById("chat-bubble");
    },
    //填写表单
    writeForm() {
      this.isVisible = true;
    },
    closeModel() {
      this.isVisible = false;
    },
    //分配流程
    customerService(val) {
      console.log("11111111111111");
      this.Request.get(
        "/guest/session/service/acc/assign",
        this.guestInfo
      ).then((res) => {
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
          this.isRefashSend = true;
          switch (val) {
            case 1:
              this.sendTextMessage();
              break;
            case 2:
              this.handleSendImageClick();
              break;
            case 3:
              this.handleSendFileClick();
              break;
            case 4:
              this.handleSendVideoClick();
              break;
            case 5:
              this.sendIntellectMessage();
              break;
            case 6:
              this.handleSendLongClick();
              break;
            default:
              break;
          }
        }
      });
    },
    reEditMessage(payload) {
      this.messageContent = payload;
    },
    handleSelectAtUser() {
      this.messageContent += this.atUserID + " ";
      this.showAtGroupMember = false;
    },
    handleUp() {
      const index = this.memberList.findIndex(
        (member) => member.userID === this.atUserID
      );
      if (index - 1 < 0) {
        return;
      }
      this.atUserID = this.memberList[index - 1].userID;
    },
    handleDown() {
      const index = this.memberList.findIndex(
        (member) => member.userID === this.atUserID
      );
      if (index + 1 >= this.memberList.length) {
        return;
      }
      this.atUserID = this.memberList[index + 1].userID;
    },
    handleEnter() {
      if (this.showAtGroupMember) {
        this.handleSelectAtUser();
      } else {
        this.sendTextMessage();
      }
    },
    handleLine() {
      this.messageContent += "\n";
    },
    handlePaste(e) {
      let clipboardData = e.clipboardData;
      let file;
      if (
        clipboardData &&
        clipboardData.files &&
        clipboardData.files.length > 0
      ) {
        file = clipboardData.files[0];
      }

      if (typeof file === "undefined") {
        return;
      }
      // 1. 创建消息实例，接口返回的实例可以上屏
      let message = this.tim(this.imInfo.sdkAppID).createImageMessage({
        to: this.sessionObj.serviceImAccount,
        conversationType: this.currentConversationType
          ? this.currentConversationType
          : "C2C",
        payload: {
          file: file,
        },
        onProgress: (percent) => {
          this.$set(message, "progress", percent); // 手动给message 实例加个响应式属性: progress
        },
      });
      this.$store.commit("pushCurrentMessageList", message);

      // 2. 发送消息
      let promise = this.tim(this.imInfo.sdkAppID).sendMessage(message);
      promise.catch((error) => {
        this.$store.commit("showMessage", {
          type: "error",
          message: error.message,
        });
      });
    },

    //访客端发送自定义消息
    sendCustomMessage(data) {
      let data1 = JSON.stringify(data);
      console.log(data1);
      console.log(this.sessionObj.serviceImAccount);
      if (this.sessionObj.serviceImAccount&&data1) {
        let message = this.tim(this.imInfo.sdkAppID).createCustomMessage({
          to: this.sessionObj.serviceImAccount,
          conversationType: this.currentConversationType
            ? this.currentConversationType
            : "C2C",
          payload: {
            data: data1,
            description: "",
            extension: "",
          },
        });
        // setTimeout(()=>{
        console.log(message);
        this.tim(this.imInfo.sdkAppID)
          .sendMessage(message)
          .then((res) => {
            this.$store.commit("pushCurrentMessageList", message);
            this.$bus.$emit("scroll-bottom");
          })
          .catch((error) => {
            this.$store.commit("showMessage", {
              type: "error",
              message: error.message,
            });
          });
        // },500)
        this.$bus.$emit("scroll-bottom");
      }
    },
    sendTextMessage() {
      console.log(this.isRefashSend);
      console.log(this.sessionObj);
      console.log(this.sessionObj.serviceImAccount);
      if (!this.isRefashSend) {
        return;
      }
      if (
        !this.sessionObj.serviceImAccount &&
        this.sessionObj.sessionType !== 4
      ) {
        this.isRefashSend = false;
        this.customerService(1);
        return;
      }
      if (
        this.messageContent === "" ||
        this.messageContent.trim().length === 0
      ) {
        this.messageContent = "";
        this.$store.commit("showMessage", {
          message: "不能发送空消息哦！",
          type: "info",
        });
        return;
      }
      // console.log(this.toAccount, this.sessionObj.serviceImAccount);
      // console.log(this.imInfo.sdkAppID);
      const message = this.tim(this.imInfo.sdkAppID).createTextMessage({
        to: this.sessionObj.serviceImAccount,
        conversationType: this.currentConversationType
          ? this.currentConversationType
          : "C2C",
        payload: { text: this.messageContent },
      });
      this.$store.commit("pushCurrentMessageList", message);
      this.$bus.$emit("scroll-bottom");
      this.tim(this.imInfo.sdkAppID)
        .sendMessage(message)
        .then((res) => {
          if (this.sessionObj.sessionType == 3) {
            this.sessionObj.serviceImAccount = "";
          }
        })
        .catch((error) => {
          this.$store.commit("showMessage", {
            type: "error",
            message: error.message,
          });
        });
      this.messageContent = "";
    },

    random(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    //转人工
    getServiceacc() {
      this.$bus.$emit("toNavigation", 1);

      // let paramy = {
      //   orgId: this.guestInfo.orgId,
      //   sessionId: this.sessionObj.id,
      // };
      // this.Request.post("/guest/session/ai/transfer/serviceacc", paramy).then(
      //   (res) => {
      //     if (res.data.status) {
      //     }
      //   }
      // );
    },
    chooseEmoji(item) {
      // console.log('重新走分配流程')
      // if(!this.sessionObj.serviceImAccount){

      //   this.customerService()
      //   return;
      // }
      this.messageContent += item;
    },
    handleSendImageClick() {
      if (!this.isRefashSend) {
        return;
      }
      if (!this.sessionObj.serviceImAccount) {
        console.log("重新走分配流程");
        this.isRefashSend = false;
        this.customerService(2);
        return;
      }
      this.$refs.imagePicker.click();
    },
    handleSendFileClick() {
      console.log("重新走分配流程");
      if (!this.isRefashSend) {
        return;
      }
      if (!this.sessionObj.serviceImAccount) {
        console.log("重新走分配流程");
        this.isRefashSend = false;
        this.customerService(3);
        return;
      }
      this.$refs.filePicker.click();
    },
    handleSendVideoClick() {
      if (!this.isRefashSend) {
        return;
      }
      if (!this.sessionObj.serviceImAccount) {
        console.log("重新走分配流程");
        this.isRefashSend = false;
        this.customerService(4);
        return;
      }
      this.$refs.videoPicker.click();
    },
    videoCall() {
      this.$bus.$emit("video-call");
    },
    sendImage() {
      let imgArr = ["jpg", "jpeg", "png", "gif", "bmp"];
      let length = this.$refs.imagePicker.value.split(".").length;
      let arr = this.$refs.imagePicker.value.split(".");
      if (!imgArr.includes(arr[length - 1])) {
        this.$message.error("格式错误");
        return;
      }
      const message = this.tim(this.imInfo.sdkAppID).createImageMessage({
        to: this.sessionObj.serviceImAccount,
        conversationType: this.currentConversationType
          ? this.currentConversationType
          : "C2C",
        payload: {
          file: document.getElementById("imagePicker"), // 或者用event.target
        },
        onProgress: (percent) => {
          this.$set(message, "progress", percent); // 手动给message 实例加个响应式属性: progress
        },
      });
      this.$store.commit("pushCurrentMessageList", message);
      this.tim(this.imInfo.sdkAppID)
        .sendMessage(message)
        .then((res) => {
          if (this.sessionObj.sessionType == 3) {
            this.sessionObj.serviceImAccount = "";
          }
        })
        .catch((imError) => {
          this.$store.commit("showMessage", {
            message: imError.message,
            type: "error",
          });
        });
      this.$refs.imagePicker.value = null;
    },
    sendFile() {
      const message = this.tim(this.imInfo.sdkAppID).createFileMessage({
        to: this.sessionObj.serviceImAccount,
        conversationType: this.currentConversationType
          ? this.currentConversationType
          : "C2C",
        payload: {
          file: document.getElementById("filePicker"), // 或者用event.target
        },
        onProgress: (percent) => {
          this.$set(message, "progress", percent); // 手动给message 实例加个响应式属性: progress
        },
      });
      this.$store.commit("pushCurrentMessageList", message);
      this.tim(this.imInfo.sdkAppID)
        .sendMessage(message)
        .then((res) => {
          if (this.sessionObj.sessionType == 3) {
            this.sessionObj.serviceImAccount = "";
          }
        })
        .catch((imError) => {
          this.$store.commit("showMessage", {
            message: imError.message,
            type: "error",
          });
        });
      this.$refs.filePicker.value = null;
    },
    sendVideo() {
      let videoArr = ["mp4"];
      let length = this.$refs.videoPicker.value.split(".").length;
      let arr = this.$refs.videoPicker.value.split(".");
      if (!videoArr.includes(arr[length - 1])) {
        this.$message.error("格式错误");
        return;
      }
      const message = this.tim(this.imInfo.sdkAppID).createVideoMessage({
        to: this.sessionObj.serviceImAccount,
        conversationType: this.currentConversationType
          ? this.currentConversationType
          : "C2C",
        payload: {
          file: document.getElementById("videoPicker"), // 或者用event.target
        },
        onProgress: (percent) => {
          this.$set(message, "progress", percent); // 手动给message 实例加个响应式属性: progress
        },
      });
      this.$store.commit("pushCurrentMessageList", message);
      this.tim(this.imInfo.sdkAppID)
        .sendMessage(message)
        .then((res) => {
          if (this.sessionObj.sessionType == 3) {
            this.sessionObj.serviceImAccount = "";
          }
        })
        .then(() => {
          this.$refs.videoPicker.value = null;
        })
        .catch((imError) => {
          this.$store.commit("showMessage", {
            message: imError.message,
            type: "error",
          });
        });
    },
    //发起评价
    evaluate() {
      console.log(this.sessionObj.id);
      let params = {
        orgId: this.$route.query.orgId,
        sessionId: this.sessionObj.id,
      };
      // this.modelStatus = true
      this.Request.get("/guest/session/query/appraise", params).then((res) => {
        if (res.data.status) {
          console.log(
            res.data.session.appraiseValue,
            res.data.session.appraiseValue == 0
          );
          if (
            res.data.session.appraiseValue == null ||
            res.data.session.appraiseValue == ""
          ) {
            this.modelStatus = true;
          } else {
            // this.visible = true;
            this.$message.warning("您已填写评价！");
          }
        }
      });
    },
    cancelModel(e) {
      this.modelStatus = e;
    },
    handleOk() {
      let that = this;
      let params = {
        ...that.formInline,
        orgId: "",
        sessionId: "",
      };
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.Request.get("/guest/session/appraise", params).then((res) => {
            if (res.data.status) {
              this.visible = false;
              this.$message.success("操作成功");
            }
          });
        } else {
          return false;
        }
      });
    },
    handleCancel() {
      this.visible = false;
      this.$refs["ruleForm"].resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
#message-send-box-wrapper {
  box-sizing: border-box;
  overflow: hidden;
  padding: 3px 20px 20px 20px;
}

.emojis {
  height: 160px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: scroll;
}

.emoji {
  height: 40px;
  width: 40px;
  box-sizing: border-box;
}

.send-header-bar {
  box-sizing: border-box;
  padding: 3px 0 0 0;
}

.send-header-bar i {
  cursor: pointer;
  font-size: 24px;
  // color: gray;
  margin: 0 12px 0 0;
  width: 30px;
  height: 30px;
  opacity: 0.7;
}
.send-header-bar i:hover {
  color: black;
  opacity: 1;
}
.callPsrson {
  color: #1890ff;
  cursor: pointer;
  float: right;
  margin: 15px 15px 0 0;
}
textarea {
  resize: none;
}

.text-input {
  font-size: 16px;
  width: 100%;
  box-sizing: box-sizing;
  border: none;
  outline: none;
  background-color: transparent;
}

.block {
  padding: 10px 0;
  display: flex;
  align-items: center;
}

// .bottom {
//   padding-top: 10px;
//   position: relative;

//   .btn-send {
//     cursor: pointer;
//     position: absolute;
//     // color: red;
//     font-size: 20px;
//     right: 0;
//     bottom: -5px;
//     padding: 6px 6px 4px 4px;
//     border-radius: 50%;
//   }
// }
.bottom {
  padding-top: 10px;
  .bottom-btn {
    .btn-send {
      font-size: 14px;
      cursor: pointer;
      float: right;
    }
  }
}
</style>
