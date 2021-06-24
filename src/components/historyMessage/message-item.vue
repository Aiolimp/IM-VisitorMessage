<template>
  <div
    class="message-wrapper"
    :class="messagePosition"
  >
    <div
      v-if="currentConversationType === TIM.TYPES.CONV_C2C"
      class="c2c-layout"
      :class="messagePosition"
    >
      <div
        class="col-1"
        v-if="showAvatar"
      >
        <!-- 头像 -->
        <a-avatar
          :src="avatar"
          class="avatar"
        />
      </div>
      <div class="col-2">
        <!-- 消息主体 -->
        <message-footer
          v-if="showMessageHeader"
          :message="message"
        />
        <div class="content-wrapper">
          <message-status-icon
            v-if="isMine&&message.subMsgType !== 'rcend'&&message.subMsgType !== 'rcfailure'&&message.subMsgType"
            :message="message"
          />
          <text-element
            v-if="message.imMsgType === TIM.TYPES.MSG_TEXT"
            :isMine="isMine"
            :payload="message.msgContent"
            :message="message"
          />
          <image-element
            v-else-if="message.imMsgType === TIM.TYPES.MSG_IMAGE"
            :isMine="isMine"
            :payload="message.msgContent"
            :message="message"
          />
          <file-element
            v-else-if="message.imMsgType === TIM.TYPES.MSG_FILE"
            :isMine="isMine"
            :payload="message.msgContent"
            :message="message"
          />

          <div v-else-if="message.imMsgType === TIM.TYPES.MSG_CUSTOM">
            <span
              class="prompts"
              v-if="message.subMsgType === 'prompts' 
              || message.subMsgType == 'transfer' 
              || message.subMsgType == 'reception' 
              || message.subMsgType == 'stopsession'
              || message.subMsgType == 'createsession'
              || message.subMsgType == 'cancelrc'
              || message.subMsgType == 'rcstart'
              || message.subMsgType == 'rcend'
              ||message.subMsgType == 'rcrun'
              ||message.subMsgType == 'rcfailure'
              "
            >{{message.msgContent.text}}</span>
            <span
              v-if="message.subMsgType === 'repository'"
              v-html="message.msgContent.text"
            ></span>
            <custom-evaluate
              v-else-if="message.subMsgType === 'inviteevaluate'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <!-- <custom-line-up
              v-else-if="message.subMsgType === 'queuinglocation'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />-->
            <!-- <span class="prompts" v-else-if="message.subMsgType === 'queuinglocation'" >
              <span class="count">{{message.msgContent.text}}</span>
              <span class="cancel" @click="dequeueFn(message)">取消排队</span>
            </span> -->
            <!-- 智能客服自定义热度问题 -->
            <custom-heatquestion
              v-else-if="message.subMsgType === 'heatquestion'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <!-- 智能客服自定义相似问题 -->
            <custom-similarquestion
              v-else-if="message.subMsgType === 'similarquestion'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <!-- 智能客服自定义查看指定问题 -->
            <custom-specifiedquestion
              v-else-if="message.subMsgType === 'specifiedquestion'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <custom-text
              v-else-if="message.subMsgType === 'text'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <custom-image
              v-else-if="message.subMsgType === 'image'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <custom-file
              v-else-if="message.subMsgType === 'file'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <custom-video
              v-else-if="message.subMsgType === 'video'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
            <custom-leaveMessage
              v-else-if="message.subMsgType === 'enterleavemessage'"
              :isMine="isMine"
              :payload="message.msgContent"
              :message="message"
            />
          </div>
          <!-- <custom-element
            v-else-if="message.type === TIM.TYPES.MSG_CUSTOM"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />-->

          <video-element
            v-else-if="message.imMsgType === TIM.TYPES.MSG_VIDEO"
            :isMine="isMine"
            :payload="message.msgContent"
            :message="message"
          />
          <span v-else>暂未支持的消息类型：{{message.type}}</span>
        </div>
      </div>
      <!-- <div class="col-3"> -->
      <!-- 消息状态 -->
      <!-- </div> -->
    </div>

    <div
      class="system-layout"
      v-if="currentConversationType === TIM.TYPES.CONV_SYSTEM "
    >
      <div class="col-1">
        <avatar
          :src="avatar"
          :type="currentConversationType"
        />
      </div>
      <div class="col-2">
        <message-header :message="message" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import MessageStatusIcon from "./message-status-icon.vue";
import MessageHeader from "./message-header";
import MessageFooter from "./message-footer";
import textElement from "./message-item/text-element";
import fileElement from "./message-item/file-element";
import imageElement from "./message-item/image-element";
import videoElement from "./message-item/video-element";
// 自定义消息类组件
import customSpecifiedquestion from "./custom-message/custom-specifiedquestion";
import customSimilarquestion from "./custom-message/custom-similarquestion";
import customHeatquestion from "./custom-message/custom-heatquestion";
import customText from "./custom-message/custom-text";
import customImage from "./custom-message/custom-image";
import customFile from "./custom-message/custom-file";
import customVideo from "./custom-message/custom-video";
import customEvaluate from "./custom-message/custom-evaluate";
import customLeaveMessage from "./custom-message/custom-LeaveMessage";

export default {
  name: "MessageItem",
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  components: {
    MessageHeader,
    MessageFooter,
    MessageStatusIcon,
    textElement,
    fileElement,
    imageElement,
    videoElement,
  
    //自定义消息组件
    customSpecifiedquestion,
    customSimilarquestion,
    customHeatquestion,
    customText,
    customImage,
    customFile,
    customVideo,
    customEvaluate,
    customLeaveMessage,
  },
  data() {
    return {
      renderDom: [],
    };
  },
  mounted() {},
  created() {},
  computed: {
    ...mapState({
      currentConversation: (state) => state.conversation.currentConversation,
      currentUserProfile: (state) => state.user.currentUserProfile,
      sessionObj: (state) => state.basic.sessionObj,
    }),
    // 是否显示头像，群提示消息不显示头像
    showAvatar() {
      console.log(this.message);
      if (this.message.imMsgType == "TIMCustomElem") {
        if (
          this.message.subMsgType == "prompts" ||
          this.message.subMsgType == "transfer" ||
          this.message.subMsgType == "reception" ||
          this.message.subMsgType == "stopsession" ||
          this.message.subMsgType == "createsession" ||
          this.message.subMsgType == "queuinglocation"|| 
          this.message.subMsgType == "cancelrc" || 
          this.message.subMsgType == 'rcstart' ||
          this.message.subMsgType == 'rcend'||
          this.message.subMsgType == 'rcrun'||
          this.message.subMsgType == 'rcfailure'
        ) {
          return false;
        } else {
          return true;
        }
      } else if (
        this.currentConversation.type === "C2C" &&
        !this.message.isRevoked
      ) {
        // C2C且没有撤回的消息
        return true;
      } else if (
        this.currentConversation.type === "GROUP" &&
        !this.message.isRevoked
      ) {
        // group且没有撤回的消息
        return this.message.type !== this.TIM.TYPES.MSG_GRP_TIP;
      }
      return true;
    },
    avatar() {
      // if (this.currentConversation.type === "C2C") {
      if (this.isMine) {
        return this.message.guestAvatar;
      } else {
        return this.message.serviceAccAvatar;
      }
      // } else if (this.currentConversation.type === "GROUP") {
      //   return this.isMine
      //     ? this.currentUserProfile.avatar
      //     : this.message.avatar;
      // } else {
      //   return "";
      // }
    },
    currentConversationType() {
      return this.currentConversation.type;
    },
    isMine() {
      // return this.message.flow === "out";
      return this.message.fromAccount === this.sessionObj.guestImAccount;
    },
    messagePosition() {
      if (
        ["TIMGroupTipElem", "TIMGroupSystemNoticeElem"].includes(
          this.message.type
        )
      ) {
        return "position-center";
      }

      if (this.message.imMsgType == "TIMCustomElem") {
        if (
          this.message.subMsgType == "prompts" ||
          this.message.subMsgType == "transfer" ||
          this.message.subMsgType == "reception" ||
          this.message.subMsgType == "stopsession" ||
          this.message.subMsgType == "createsession" ||
          this.message.subMsgType == "queuinglocation" || 
          this.message.subMsgType == "cancelrc" || 
          this.message.subMsgType == 'rcstart' ||
          this.message.subMsgType == 'rcend'||
          this.message.subMsgType == 'rcrun'||
          this.message.subMsgType == 'rcfailure'
        ) {
          return "position-center";
        }
      }
      if (this.message.isRevoked) {
        // 撤回消息
        return "position-center";
      }
      if (this.isMine) {
        return "position-right";
      } else {
        return "position-left";
      }
    },
    showMessageHeader() {
      if (
        ["TIMGroupTipElem", "TIMGroupSystemNoticeElem"].includes(
          this.message.type
        )
      ) {
        return false;
      }
      if (this.message.isRevoked) {
        // 撤回消息
        return false;
      }
      return true;
    },
  },
  methods: {
    showGroupMemberProfile(event) {
      this.tim
        .getGroupMemberProfile({
          groupID: this.message.to,
          userIDList: [this.message.from],
        })
        .then(({ data: { memberList } }) => {
          if (memberList[0]) {
            this.$bus.$emit("showMemberProfile", {
              event,
              member: memberList[0],
            });
          }
        });
    },
  },
};
</script>

<style lang="less" scoped>
.message-wrapper {
  margin: 20px 0;

  .content-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    .prompts {
      font-size: 12px;
      .count {
        padding: 0 5px;
      }

      .cancel {
        color: #169bd5;
        cursor: pointer;
      }
    }
  }
}

.group-layout,
.c2c-layout,
.system-layout {
  display: flex;

  .col-1 {
    .avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      margin-top: 10px;
    }
  }

  .group-member-avatar {
    cursor: pointer;
  }

  .col-2 {
    display: flex;
    flex-direction: column;
    // max-width 50% // 此设置可以自适应宽度，目前由bubble限制
  }

  .col-3 {
    width: 30px;
  }

  &.position-left {
    .col-2 {
      align-items: flex-start;
    }
  }

  &.position-right {
    flex-direction: row-reverse;

    .col-2 {
      align-items: flex-end;
    }
  }

  &.position-center {
    justify-content: center;
  }
}

.c2c-layout {
  .col-2 {
    .base {
      margin-top: 3px;
    }
  }
}

.group-layout {
  .col-2 {
    .chat-bubble {
      margin-top: 5px;
    }
  }
}
</style>
