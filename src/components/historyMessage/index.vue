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
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制进行中"
          ) {
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "对方拒绝了你的远程请求"
          ) {
            return false;
          } else if (
            item.fromAccount == this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制已开始"
          ) {
            return false;
          } else if (
            item.fromAccount !== this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制已结束"
          ) {
            return false;
          } else if (
            item.fromAccount !== this.sessionObj.guestImAccount &&
            item.msgContent.text == "远程控制连接失败"
          ) {
            return false;
          } else if (item.msgContent.text == "远程控制会话即将超时") {
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