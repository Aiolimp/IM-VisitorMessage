<template>
  <message-bubble
    :isMine="isMine"
    :message="message"
  >
    <div class="font">{{payload.text}}</div>
    <div
      v-if="payload.questions.length>0&&payload.questions"
      style="margin-top:10px"
    >
      <div class="font">常见问题：</div>
      <div
        :class="(message.type ==4 &&sessionObj.sessionType !=4) ?'question2':'question'"
        v-for="(item,index) in list"
        :key="index"
      >
        <div v-if="(message.type ==4 &&sessionObj.sessionType !=4) ">
          <span>{{item}}</span>
        </div>
        <div
          @click="choseQuestion(item)"
          v-else
        >
          <span>{{item}}</span>
        </div>
      </div>
    </div>
    <div class="font">请点击问题查看解答。如需转人工，请按下方转人工按钮。</div>
  </message-bubble>
</template>

<script>
import messagesendbox from "../../message/message-send-box";
import MessageBubble from "../message-bubble";
import { mapState } from "vuex";
export default {
  name: "",
  components: {
    MessageBubble,
    messagesendbox,
  },
  data() {
    return {
      IntellectMessage: "",
      list: [],
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
    console.log("payload", this.payload);
    if (this.payload.questions && this.payload.questions.length > 0) {
      for (let i in this.payload.questions) {
        const question = `${parseInt(i) + 1}.${this.payload.questions[i]}`;
        this.list.push(question);
      }
    }
  },
  computed: {
    ...mapState({
      sessionObj: (state) => state.basic.sessionObj,
    }),
  },
  methods: {
    choseQuestion(item) {
      this.$bus.$emit("sendIntellectMessage", item);
    },
  },
};
</script>

<style lang="less" scoped>
.font {
}
.question2 {
  span {
    margin-bottom: -2px;
  }
}
.question {
  span {
    margin-bottom: -2px;
    color: #1890ff;
    cursor: pointer;
  }
}
</style>
