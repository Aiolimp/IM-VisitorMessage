<template>
  <message-bubble
    :isMine="isMine"
    :message="message"
  >
    <div v-if="sessionObj.aiAnswerStyle ==1">
      <div class="font">智能客服检测到您的问题有以下相关内容：</div>
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
      <div class="font">请点击问题查看解答。如需转人工，请按下方转人工按钮。</div>
    </div>
    <div v-if="sessionObj.aiAnswerStyle ==0">
      <div
        class="font"
        style="margin-bottom:10px"
      >{{payload.text}}</div>
      <div class="font">相关问题：</div>
      <div
        :class="(message.type ==4 &&sessionObj.sessionType !=4)  ?'question2':'question'"
        v-for="(item,index) in questionList"
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
      <div class="font">请点击问题查看解答。如需转人工，请按下方转人工按钮。</div>
    </div>
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
      questionList: [],
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
    console.log("message", this.message);
    console.log("sessionObj", this.sessionObj);
    if (this.payload.questions && this.payload.questions.length > 0) {
      for (let i in this.payload.questions) {
        const question = `${parseInt(i) + 1}.${this.payload.questions[i]}`;
        this.list.push(question);
      }
      let questionList = this.list.slice(1);
      for (let i in questionList) {
        const question2 = `${parseInt(i) + 1}.${
          this.payload.questions[parseInt(i) + 1]
        }`;
        this.questionList.push(question2);
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
    // color: #1890ff;
    // cursor: pointer;
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
