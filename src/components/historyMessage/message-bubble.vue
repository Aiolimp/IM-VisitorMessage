<template>
  <div class="chat-bubble" id="chat-bubble">
    <a-dropdown
      ref="overlay"
      :trigger="['contextmenu']"
      placement="bottomCenter"
      v-if="!message.retractStatus"
      :getPopupContainer="hiddenMenu"
    >
      <div style="display: flex">
        <div class="message-content" :class="bubbleStyle">
          <slot></slot>
          <div class="icon"></div>
        </div>
      </div>
      <a-menu slot="overlay" @click="handleCommand">
        <a-menu-item key="download" v-if="message.imMsgType == 'TIMImageElem' &&  isShow == true"
          >下载</a-menu-item
        >
        <a-menu-item
          key="copy"
          class="copy"
          v-if="message.imMsgType == 'TIMTextElem'"
          >复制</a-menu-item
        >
      </a-menu>
    </a-dropdown>
    <div class="group-tip-element-wrapper" v-if="message.retractStatus">
      {{ text }}
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { handleClientMethods } from "@/utils/clientFn";
export default {
  name: "MessageBubble",
  data() {
    return {
      isTimeout: false,
      visible: false,
      styleObj1: { color: "red", "font-weight": 200 },
      isShow:false
    };
  },
  props: {
    isMine: {
      type: Boolean
    },
    isNew: {
      type: Boolean
    },
    message: {
      type: Object,
      required: true
    }
  },
  created() {
     external.call ? this.isShow = true : this.isShow = false
  },
  mounted() {},
  beforeDestroy() {},
  computed: {
    bubbleStyle() {
      let classString = "";
      if (this.isMine) {
        classString += "message-send";
      } else {
        classString += "message-received";
      }
      if (this.isNew) {
        classString += "new";
      }
      return classString;
    },
    text() {
      if (this.message.sessionType === "singlechat" && !this.isMine) {
        return "对方撤回了一条消息";
      }
      if (this.message.sessionType === "groupchat" && !this.isMine) {
        let str = getMessageSendUserName(
          this.allStaffGroupList,
          this.message.fromAccount
        );
        return `“${str}” 撤回了一条消息`;
      }
      return "你撤回了一条消息";
    },

    ...mapState({
      visitorInf: state => state.basic.visitorInf,
      qfyInf: state => state.basic.qfyInf,
      imInfo: state => state.basic.imInfo,
      allStaffGroupList: state => state.basic.allStaffGroupList
    })
  },
  methods: {
    hiddenMenu() {
      return document.getElementById("chat-bubble");
    },
    handleCommand(command) {
      let that = this;
      switch (command.key) {
        case "delete":
          break;
        case "copy":
          console.log(that.message)
          let clipboard = new Clipboard(".copy", {
            text: function() {
              return that.message.msgContent.text;
            }
          });
          clipboard.on("success", e => {
            console.log("复制成功");
            // 释放内存
            clipboard.destroy();
          });
          clipboard.on("error", e => {
            console.log("复制失败");
            clipboard.destroy();
          });
          break;
        case "download":
          handleClientMethods("CppOnDownloadUrl", {
            url: that.message.msgContent.ImageInfoArray[0].URL
          });
          // that.downloadIamge(that.message.payload.imageInfoArray[0].imageUrl);
          // that.downloadByBlob(
          //   that.message.payload.imageInfoArray[0].imageUrl,
          //   "qfy_" + new Date().getTime()
          // );
          break;
        default:
          break;
      }
    },
    downloadByBlob(url, name) {
      let image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
      image.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        canvas.toBlob(blob => {
          let url = URL.createObjectURL(blob);
          let eleLink = document.createElement("a");
          eleLink.download = name;
          eleLink.href = url;
          eleLink.click();
          eleLink.remove();
          // 用完释放URL对象
          URL.revokeObjectURL(url);
        });
      };
    },
    downloadIamge(imgsrc, name) {
      //下载图片地址和图片名
      let image = new Image();
      // 解决跨域 Canvas 污染问题
      image.setAttribute("crossOrigin", "anonymous");
      image.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
        let a = document.createElement("a"); // 生成一个a元素
        let event = new MouseEvent("click"); // 创建一个单击事件
        a.download = name || "qfy_" + new Date().getTime(); // 设置图片名称
        a.href = url; // 将生成的URL设置为a.href属性
        a.dispatchEvent(event); // 触发a的单击事件
      };
      image.src = imgsrc;
    }
  }
};
</script>
<style lang="less" scoped>
.chat-bubble {
  position: relative;
  .message-content {
    outline: none;
    font-size: 14px;
    position: relative;
    max-width: 350px;
    word-wrap: break-word;
    // word-break: break-all;
    padding: 9.5px;
    // box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.1);
    span {
      white-space: pre-wrap;
      margin: 0;
      text-shadow: #495060 0 0 0.05em;
    }
    img {
      vertical-align: bottom;
    }
    .icon {
      position: absolute;
      top: 10px;
      display: block;
      width: 12px;
      height: 12px;
      border-width: 6px;
      transform: rotate(45deg);
    }
    // &::before{
    //   position: absolute;
    //   top: 0;
    //   width: 12px;
    //   height: 40px;
    //   content: "\e900";
    //   // content "\e906"
    //   font-family :'tim' !important;
    //   font-size :24px; // 32px 在mac上会模糊 24px正常 , window 24px模糊 28px 32px正常  36px windows mac 基本一致，但是太大
    // }
  }
  .message-received {
    background-color: white; // $white
    margin-left: 15px;
    border-radius: 0 4px 4px 4px;
    // &::before{
    //   left: -10px;
    //   transform: scaleX(-1);
    //   color:white; // $white
    // }
    .icon {
      left: -6px;

      background: white;
      border-style: white;
    }

    &.new {
      transform: scale(0);
      transform-origin: top left;
      animation: bounce 500ms linear both;
    }
  }

  .message-send {
    background-color: #c9e7ff; // $light-primary
    margin-right: 15px;
    border-radius: 4px 0 4px 4px;
    color: black; // $white
    .icon {
      right: -6px;
      display: block;
      background: #c9e7ff;
      border-style: #c9e7ff;
    }
    // &::before{
    //   right: -10px;
    //   color:#DFEAFE; // $light-primary
    //   background-image: url('./../../assets/imgs/current_session/header.png');
    // }
    &.new {
      transform: scale(0);
      transform-origin: top right;
      animation: bounce 500ms linear both;
    }
  }

  .a-dropdown {
    vertical-align: top;
  }
  .a-dropdown + .a-dropdown {
    margin-left: 15px;
  }
  .a-icon-arrow-down {
    font-size: 12px;
  }
  .group-tip-element-wrapper {
    background: #fff;
    padding: 4px 15px;
    border-radius: 3px;
    color: #a5b5c1;
    font-size: 12px;
    // text-shadow $secondary 0 0 0.05em
  }

  .edit-button {
    padding-top: 4px;
    height: 20px;
    font-size: 10px;
  }

  @keyframes bounce {
    0% {
      transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    4.7% {
      transform: matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    9.41% {
      transform: matrix3d(
        0.883,
        0,
        0,
        0,
        0,
        0.883,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    14.11% {
      transform: matrix3d(
        1.141,
        0,
        0,
        0,
        0,
        1.141,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    18.72% {
      transform: matrix3d(
        1.212,
        0,
        0,
        0,
        0,
        1.212,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    24.32% {
      transform: matrix3d(
        1.151,
        0,
        0,
        0,
        0,
        1.151,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    29.93% {
      transform: matrix3d(
        1.048,
        0,
        0,
        0,
        0,
        1.048,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    35.54% {
      transform: matrix3d(
        0.979,
        0,
        0,
        0,
        0,
        0.979,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    41.04% {
      transform: matrix3d(
        0.961,
        0,
        0,
        0,
        0,
        0.961,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    52.15% {
      transform: matrix3d(
        0.991,
        0,
        0,
        0,
        0,
        0.991,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    63.26% {
      transform: matrix3d(
        1.007,
        0,
        0,
        0,
        0,
        1.007,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    85.49% {
      transform: matrix3d(
        0.999,
        0,
        0,
        0,
        0,
        0.999,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
    }
    100% {
      transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
  }
}
</style>
