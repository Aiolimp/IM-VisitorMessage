<template>
  <message-bubble
    :isMine="isMine"
    :message="message"
  >
    <div class="font">{{payload.data.msgText}} <span
        v-if="leaveMessageData"
        @click="leaveMessage"
      >填写表单</span></div>
    <WriteForm
      :isVisible="isVisible"
      @closeModel="closeModel"
      v-if="isVisible"
    />
  </message-bubble>
</template>

<script>
import MessageBubble from "../message-bubble";
import WriteForm from "@/components/writeForm";
import { mapState } from "vuex";
export default {
  name: "",
  components: {
    MessageBubble,
    WriteForm,
  },
  data() {
    return {
      isVisible: false,
      showMessage: false,
    };
  },
  props: {
    payload: {
      type: Object,
      required: true,
    },
    message: {
      type: Object,
      required: true,
    },
    isMine: {
      type: Boolean,
    },
  },
  mounted() {
    // this.IsQuote();
    console.log('新的',this.leaveMessageData);
  },
  computed: {
    ...mapState({
      leaveMessageData: (state) => state.basic.leaveMessageData,
    }),
    showProgressBar() {
      return this.message.status === "unSend";
    },
  },
  watch: {},
  methods: {
    closeModel() {
      this.isVisible = false;
    },
    //查询是否引入表单
    // IsQuote() {
    //   let params = {
    //     orgId: this.$route.query.orgId,
    //   };
    //   this.Request.get("/hfw/tsmHfwLeaveCommentsSet/isQuote",params).then((res) => {
    //       if(res.data.status&&res.data.data == 1){
    //           this.showMessage = true;
    //       }
    //   });
    // },
    //发起留言
    leaveMessage() {
      this.isVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.video {
  width: 100%;
  max-height: 300px;
}
.font {
  padding-top: 10px;
}
.btn {
  text-align: center;
  padding-top: 20px;
}
.font {
  span {
    margin-left: 10px;
    color: #3e7bf8;
    border-bottom: 1px solid #3e7bf8;
    cursor: pointer;
    white-space: nowrap;
  }
}
</style>
