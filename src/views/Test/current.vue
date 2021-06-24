<template>
  <div class="sessionList">
    <session-center />
    <image-previewer />
    <!-- <image-previewer-history /> -->
  </div>
</template>

<script>
import sessionCenter from "./session";
// import imagePreviewerHistory from '@/components/historyMessage/image-previewer';
import imagePreviewer from '@/components/message/image-previewer'
export default {
  data: () => ({
   
  }),
  components: {
    sessionCenter,
    imagePreviewer,
    // imagePreviewerHistory,
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
