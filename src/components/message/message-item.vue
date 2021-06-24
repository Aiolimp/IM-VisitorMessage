<template>
  <div
    class="message-wrapper"
    :class="messagePosition"
  >
    <div
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
               v-if="
              isMine &&
              message.payload.data &&
              message.payload.data.subMsgType !== 'rcend' &&
              message.payload.data.subMsgType !== 'rcfailure'
            "
            :message="message"
          />
          <text-element
            v-if="message.type === TIM.TYPES.MSG_TEXT"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />
          <image-element
            v-else-if="message.type === TIM.TYPES.MSG_IMAGE"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />
          <file-element
            v-else-if="message.type === TIM.TYPES.MSG_FILE"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />

          <!-- <sound-element
            v-else-if="message.type === TIM.TYPES.MSG_SOUND"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />-->

          <div v-else-if="message.type === TIM.TYPES.MSG_CUSTOM">
            <span
              class="prompts"
              v-if="message.payload.data.subMsgType === 'prompts'
              || message.payload.data.subMsgType == 'transfer' 
              || message.payload.data.subMsgType == 'reception' 
              || message.payload.data.subMsgType == 'stopsession'
              || message.payload.data.subMsgType == 'createsession'
              || message.payload.data.subMsgType == 'cancelrc'
               || message.payload.data.subMsgType == 'acceptrc' 
              || message.payload.data.subMsgType == 'rcstart'
              ||message.payload.data.subMsgType == 'rcrun'
              ||message.payload.data.subMsgType == 'rcend'
              ||message.payload.data.subMsgType == 'rcfailure'
              "
            >{{message.payload.data.msgText}}</span>
            <span
              v-if="message.payload.data.subMsgType === 'repository'"
              v-html="message.payload.data.msgText"
            ></span>
            <span
              class="prompts"
              v-else-if="message.payload.data.subMsgType === 'queuinglocation'"
            >
              <span class="count">{{message.payload.data.msgText}}</span>
              <span
                class="cancel"
                @click="dequeueFn(message)"
              >取消排队</span>
            </span>
            <!-- 智能客服自定义热度问题 -->
            <custom-heatquestion
              v-else-if="message.payload.data.subMsgType === 'heatquestion'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <!-- 智能客服自定义相似问题 -->
            <custom-similarquestion
              v-else-if="message.payload.data.subMsgType === 'similarquestion'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <!-- 智能客服自定义查看指定问题 -->
            <custom-specifiedquestion
              v-else-if="message.payload.data.subMsgType === 'specifiedquestion'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-evaluate
              v-else-if="message.payload.data.subMsgType === 'inviteevaluate'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-text
              v-else-if="message.payload.data.subMsgType === 'text'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-image
              v-else-if="message.payload.data.subMsgType === 'image'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-file
              v-else-if="message.payload.data.subMsgType === 'file'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-video
              v-else-if="message.payload.data.subMsgType === 'video'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
            <custom-leaveMessage
              v-else-if="message.payload.data.subMsgType === 'enterleavemessage'"
              :isMine="isMine"
              :payload="message.payload"
              :message="message"
            />
          </div>
          <!-- <custom-element
            v-else-if="message.type === TIM.TYPES.MSG_CUSTOM"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />-->
          <!-- <face-element
            v-else-if="message.type === TIM.TYPES.MSG_FACE"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />-->

          <!-- <geo-element
            v-else-if="message.type === TIM.TYPES.MSG_GEO"
            :isMine="isMine"
            :payload="message.payload"
            :message="message"
          />-->

          <video-element
            v-else-if="message.type === TIM.TYPES.MSG_VIDEO"
            :isMine="isMine"
            :payload="message.payload"
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
import FileElement from "./message-elements/file-element.vue";
import FaceElement from "./message-elements/face-element.vue";
import ImageElement from "./message-elements/image-element.vue";
import TextElement from "./message-elements/text-element.vue";
import SoundElement from "./message-elements/sound-element.vue";
import VideoElement from "./message-elements/video-element.vue";

import CustomElement from "./message-elements/custom-element.vue";
import GeoElement from "./message-elements/geo-element.vue";

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
    FileElement,
    FaceElement,
    ImageElement,
    TextElement,
    SoundElement,
    VideoElement,
    CustomElement,
    GeoElement,

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
  mounted() {
    console.log(this.message, "message");
    // console.log(this.sessionObj);
    this.message.aiAnswerStyle = this.sessionObj.aiAnswerStyle;
  },
  created() {},
  beforeDestroy() {
    this.$bus.$off("cancleQueuse", true);
  },
  computed: {
    ...mapState({
      currentConversation: (state) => state.conversation.currentConversation,
      currentUserProfile: (state) => state.user.currentUserProfile,
      imInfo: (state) => state.basic.imInfo,
      sessionObj: (state) => state.basic.sessionObj,
      guestInfo: (state) => state.basic.guestInfo,
    }),
    // 是否显示头像，群提示消息不显示头像
    showAvatar() {
      // if (
      //   this.message.type == "TIMCustomElem" &&
      //   this.message.payload.data.subMsgType == "prompts"
      // ) {
      //   return false;
      // }
      if (this.message.type == "TIMCustomElem") {
        if (
          this.message.payload.data.subMsgType == "prompts" ||
          this.message.payload.data.subMsgType == "transfer" ||
          this.message.payload.data.subMsgType == "reception" ||
          this.message.payload.data.subMsgType == "stopsession" ||
          this.message.payload.data.subMsgType == "createsession" ||
          this.message.payload.data.subMsgType == "queuinglocation" ||
          this.message.payload.data.subMsgType == "cancelrc" ||
          this.message.payload.data.subMsgType == "acceptrc" ||
          this.message.payload.data.subMsgType == "rcstart" || //远程控制开始
          this.message.payload.data.subMsgType == "rcend" || //远程控制结束
          this.message.payload.data.subMsgType == "rcwilltimeout" || //远程控制会话即将超时
          this.message.payload.data.subMsgType == "rcrun" || //远程控制进行中
          this.message.payload.data.subMsgType == "rcfailure"
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
      return false;
    },
    //头像
    avatar() {
      if (this.currentConversation.type === "C2C") {
        if (this.isMine) {
          return this.sessionObj.guestAvatar;
        } else {
          return this.sessionObj.serviceAvatar;
        }
      } else if (this.currentConversation.type === "GROUP") {
        return this.isMine
          ? this.currentUserProfile.avatar
          : this.message.avatar;
      } else {
        return "";
      }
    },
    currentConversationType() {
      return this.currentConversation.type;
    },
    //是否是自己发的消息
    isMine() {
      // console.log(this.message.from,this.imInfo.userID,this.message.from == this.imInfo.userID)
      return this.message.from == this.sessionObj.guestImAccount;
    },
    //消息位置
    messagePosition() {
      if (
        ["TIMGroupTipElem", "TIMGroupSystemNoticeElem"].includes(
          this.message.type
        )
      ) {
        return "position-center";
      }

      if (this.message.type == "TIMCustomElem") {
        if (
          this.message.payload.data.subMsgType == "prompts" ||
          this.message.payload.data.subMsgType == "transfer" ||
          this.message.payload.data.subMsgType == "reception" ||
          this.message.payload.data.subMsgType == "stopsession" ||
          this.message.payload.data.subMsgType == "createsession" ||
          this.message.payload.data.subMsgType == "queuinglocation" ||
          this.message.payload.data.subMsgType == "cancelrc" ||
          this.message.payload.data.subMsgType == "acceptrc" ||
          this.message.payload.data.subMsgType == "rcstart" ||
          this.message.payload.data.subMsgType == "rcend" || //远程控制结束
          this.message.payload.data.subMsgType == "rcwilltimeout" || //远程控制会话即将超时
          this.message.payload.data.subMsgType == "rcrun" || //远程控制进行中
          this.message.payload.data.subMsgType == "rcfailure"
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
    dequeueFn() {
      let params = {
        sessionId: this.sessionObj.id,
        orgId: this.guestInfo.orgId,
      };
      this.Request.get("/guest/session/cancel/waiting", params).then((res) => {
        if (res.status.stauts) {
          this.$message.success("操作成功");
          this.$bus.$emit("cancleQueuse", true);
          //清楚会话id
        } else {
          this.$message.success(res.status.msg);
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
