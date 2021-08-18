<template>
  <div class="sessionList">
    <session-center />
    <image-previewer />
  </div>
</template>

<script>
import sessionCenter from "./session";
import imagePreviewer from '@/components/message/image-previewer'
export default {
  data: () => ({
   
  }),
  components: {
    sessionCenter,
    imagePreviewer,
  },
  mounted() {
    
  },
  methods: {
   
  },
  watch: {
  
  },
  computed: {
  }
};
</script>
<style lang="less" scoped>
.sessionList {
  .data {
    width: 100%;
  }
}
</style>
