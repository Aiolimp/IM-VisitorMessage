<template>
  <message-bubble :isMine="isMine" :message="message">
    <template v-for="(item, index) in contentList">
      <span :key="index" v-if="item.name === 'text'">{{ item.text }}</span>
      <img v-else-if="item.name === 'img'" :src="item.src" width="20px" height="20px" :key="index"/>
    </template>
  </message-bubble>  
</template>

<script>
import MessageBubble from '../message-bubble'
import {decodeText} from './../../../utils/decodeText'

export default {
  name: 'TextElement',
  components: {
    MessageBubble
  },
  props: {
    payload: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    },
    isMine: {
      type: Boolean
    }
  },
  computed: {
    contentList() {
      let obj = {
          text: this.payload.text
      }
      return decodeText(obj)
    }
  }
}
</script>

