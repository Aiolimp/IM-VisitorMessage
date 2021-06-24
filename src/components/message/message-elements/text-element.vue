<template>
  <message-bubble
    :isMine="isMine"
    :message="message"
  >
    <div v-if="textList.length==0">
      <template v-for="(item, index) in contentList">
        <span
          :key="index"
          v-if="item.name === 'text'"
        >{{ item.text }}</span>
        <img
          v-else-if="item.name === 'img'"
          :src="item.src"
          width="20px"
          height="20px"
          :key="index"
        />
      </template>
    </div>
    <div v-if="textList&&textList.length>0">
      <div
        v-for="(item, index) in textList"
        :key="index"
      >
        <span :key="index">{{ item}}</span>
      </div>
    </div>
  </message-bubble>
</template>

<script>
import MessageBubble from "../message-bubble";
import { decodeText } from "./../../../utils/decodeText";

export default {
  name: "TextElement",
  components: {
    MessageBubble,
  },
  data() {
    return {
      textList: [],
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
  computed: {
    contentList() {
      return decodeText(this.payload);
    },
  },
  mounted() {
    const text = this.payload.text;
    if (text.indexOf("\n") != -1) {
      this.textList = text.split("\n");
    }
    console.log(this.textList);
  },
};
</script>

