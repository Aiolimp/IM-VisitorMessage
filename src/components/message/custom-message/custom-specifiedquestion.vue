<template>
  <message-bubble
    :isMine="isMine"
    :message="message"
  > 
    <div class="font">{{payload.data.msgText}}</div>
  </message-bubble>
</template>

<script>
import MessageBubble from "../message-bubble";
import { mapState } from "vuex";
export default {
  name: "",
  components: {
    MessageBubble,
  },
  data() {
    return {
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
  },
  computed: {
    ...mapState({
      sessionObj: (state) => state.basic.sessionObj,
    }),
  },
  methods: {
  },
};
</script>

<style lang="less" scoped>
.font {
}
</style>
