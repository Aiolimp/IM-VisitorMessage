<!--  -->
<template>
  <div class>
    <message-item
      v-for="message in historyList"
      :key="message.id"
      :message="message"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import messageItem from "./message-item";
export default {
  name: "",
  components: {
    messageItem,
  },
  props: ["historySessionList"],
  data() {
    return {
      // historyList: [
      //   {
      //     id: "MjA4MTQ1NTM1Ng==",
      //     sessionId: "LTEzNDEyMzA3NDU=",
      //     orgId: "qftx",
      //     imMsgType: "TIMTextElem",
      //     sendType: "manual",
      //     msgContent: {
      //       text: "a new msg"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   {
      //     id: "MTg5OTg4NjIxMw==",
      //     sessionId: "LTIwMTc1OTg5OTk=",
      //     orgId: "qftx",
      //     imMsgType: "TIMFileElem",
      //     sendType: "manual",
      //     msgContent: {
      //       fileSize: 0,
      //       fileName: "log.txt",
      //       download_Flag: 2,
      //       uuid: "1400328287_13800571500_43516bc24525e9681bf416265d0f2a68.txt",
      //       url:
      //         "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/b1d8-13800571500/43516bc24525e9681bf416265d0f2a68.txt"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //图片类消息：
      //   {
      //     id: "LTQ1MTIxODMzMw==",
      //     sessionId: "MTMxNTE3NTE5MA==",
      //     orgId: "qftx",
      //     imMsgType: "TIMImageElem",
      //     sendType: "manual",
      //     msgContent: {
      //       uuid: "1400328287_13800571550_25d4cbf976c1301132635a452df68eb4.jpg",
      //       imageFormat: 1,
      //       imageInfoArray: [
      //         {
      //           type: 1,
      //           size: 3486160,
      //           width: 2736,
      //           height: 3648,
      //           url:
      //             "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/25d4cbf976c1301132635a452df68eb4.jpg"
      //         },
      //         {
      //           type: 2,
      //           size: 0,
      //           width: 0,
      //           height: 0,
      //           url:
      //             "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/25d4cbf976c1301132635a452df68eb4.jpg?imageView2/3/w/720/h/720"
      //         },
      //         {
      //           type: 3,
      //           size: 0,
      //           width: 198,
      //           height: 264,
      //           url:
      //             "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/25d4cbf976c1301132635a452df68eb4.jpg?imageView2/3/w/198/h/198"
      //         }
      //       ]
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //视频类消息：
      //   {
      //     id: "LTY3Mjg1MTY0NQ==",
      //     sessionId: "MTMxNjIxNzg3NQ==",
      //     orgId: "qftx",
      //     imMsgType: "TIMVideoFileElem",
      //     sendType: "manual",
      //     msgContent: {
      //       videoSize: 46840761,
      //       videoSecond: 600,
      //       videoFormat: "mp4",
      //       thumbSize: 803917,
      //       thumbWidth: 200,
      //       thumbHeight: 200,
      //       thumbFormat: "",
      //       videoDownloadFlag: 2,
      //       videoUUID:
      //         "1400328287_13800571550_951ee7cb8ceacd39f215adf26216c76d.mp4",
      //       videoUrl:
      //         "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/951ee7cb8ceacd39f215adf26216c76d.mp4",
      //       thumbDownloadFlag: 2,
      //       thumbUUID:
      //         "1400328287_13800571550_bcec9b85500af401eb5f9c52fa94068f.jpg",
      //       thumbUrl:
      //         "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/bcec9b85500af401eb5f9c52fa94068f.jpg"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义视频类消息：
      //   {
      //     id: "LTQ0MzkwOTE4",
      //     sessionId: "MTUyNzA2ODA3Mw==",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "video",
      //     sendType: "manual",
      //     msgContent: {
      //       fileSize: 33862,
      //       url:
      //         "https://cos.ap-shanghai.myqcloud.com/7923-shanghai-007-shared-04-1256635546/7693-1400328287/6844-13800571550/951ee7cb8ceacd39f215adf26216c76d.mp4"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义文本类消息：
      //   {
      //     id: "LTQzMTQyODI1MQ==",
      //     sessionId: "LTEzOTM1NzU3NDY=",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "text",
      //     sendType: "automatic",
      //     msgContent: {
      //       text: "您好，有什么可以帮助您的？"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义文本类消息：
      //   {
      //     id: "LTQzMTQyODI1MQ==",
      //     sessionId: "LTEzOTM1NzU3NDY=",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "prompts",
      //     sendType: "automatic",
      //     msgContent: {
      //       text: "您好，有什么可以帮助您的？"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义创建会话消息（通知客服（包括：分配流程后接入访客、排除中接入访客、转接后接入访客））：
      //   {
      //     id: "MjIzNDY0OTE=",
      //     sessionId: "LTYzNTcxMzc1NQ==",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "createsession",
      //     sendType: "automatic",
      //     msgContent: {
      //       text: "fsdfsadfsdafds"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义邀请评价消息（通知访客）：
      //   {
      //     id: "MjIzNDY0OTE=",
      //     sessionId: "LTYzNTcxMzc1NQ==",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "inviteevaluate",
      //     sendType: "automatic",
      //     msgContent: {
      //       text: "感谢您的咨询，请对本次服务进行评价。谢谢"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   },
      //   //自定义排队位置消息（通知访客）：
      //   {
      //     id: "MjIzNDY0OTE=",
      //     sessionId: "LTYzNTcxMzc1NQ==",
      //     orgId: "qftx",
      //     imMsgType: "TIMCustomElem",
      //     subMsgType: "queuinglocation",
      //     sendType: "automatic",
      //     msgContent: {
      //       text: "请稍等，您前面有 xx 人正在排队"
      //     },
      //     fromAccount: "13800571550",
      //     toAccount: "13800571501",
      //     msgRandom: 4259378746,
      //     msgSeq: 64993,
      //     msgTime: 1587460051000,
      //     msgKey: "64993_4259378746_1587460051"
      //   }
      // ],
    };
  },
  computed: {
    ...mapState({
      sessionObj: (state) => state.basic.sessionObj,
    }),
    historyList() {
      console.log(this.sessionObj.guestImAccount);
      console.log("this.historySessionList", this.historySessionList);
      const historySessionList = this.historySessionList.filter((item) => {
        if (item.msgContent) {
          item.msgContent =
            typeof item.msgContent == "string" && item.msgContent != ""
              ? JSON.parse(item.msgContent)
              : item.msgContent;
          if (item.msgContent.address || item.msgContent.domain) {
            console.log("1111111");
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制进行中"
          ) {
            console.log("22222222222222");
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "对方拒绝了你的远程请求"
          ) {
            console.log("22222222222222");
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制已开始"
          ) {
            console.log("33333333333333333333");
            return false;
          } else if (
            item.fromAccount !== this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制已结束"
          ) {
            console.log("44444444444444444444");
            return false;
          } else if (
            item.fromAccount !== this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制连接失败"
          ) {
            console.log("7777777777777777777");
            return false;
          } else if (item.msgContent.text == "远程控制会话即将超时") {
            console.log("5555555555555555555555");
            return false;
          } else {
            return true;
          }
        }
      });
      let arr = [...historySessionList];
      console.log(arr);
      arr.forEach((item) => {
        item.msgContent =
          typeof item.msgContent == "string"
            ? JSON.parse(item.msgContent)
            : item.msgContent;
      });

      console.log(arr);
      return arr.reverse();
    },
  },
  watch: {},
  //方法集合
  methods: {},
  created() {},
  mounted() {},
};
</script>
<style lang='less' scoped>
</style>