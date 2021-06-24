<template>
<message-bubble :isMine=isMine :message=message>  
  <div class="file-element-wrapper" title="单击下载" @click="downloadFile">
    <div class="header">
      <i class="el-icon-document file-icon"></i>
      <div class="file-element">
        <div class="file_img">
          <img src="./../../../assets/imgs/current_session/file_b.jpg" alt="">
        </div>
        <div class="file_del">
          <div class="file-name">{{ fileName || '文件' }}</div>
          <div class="file-size"><span>{{ size }}</span><span></span></div>
        </div>
        
      </div>
    </div>
    <a-progress
      v-if="showProgressBar"
      :percentage="percentage"
      :color="percentage => (percentage === 100 ? '#67c23a' : '#409eff')"
    />
  </div>
</message-bubble>
</template>

<script>
import MessageBubble from '../message-bubble'

export default {
  name: 'FileElement',
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
  components: {
    MessageBubble,
  },
  computed: {
    fileName() {
      return this.payload.fileName ? this.payload.fileName : '文件'
    },
    fileUrl() {
    //   return this.payload.fileUrl
        return this.payload.url
    },
    size() {
      const size = this.payload.fileSize ? this.payload.fileSize : 0
      if (size > 1024) {
        if (size / 1024 > 1024) {
          return `${this.toFixed(size / 1024 / 1024)} Mb`
        }
        return `${this.toFixed(size / 1024)} Kb`
      }
      return `${this.toFixed(size)}B`
    },
    showProgressBar() {
      return this.$parent.message.status === 'unSend'
    },
    percentage() {
      return Math.floor((this.$parent.message.progress || 0) * 100)
    }
  },
  methods: {
    toFixed(number, precision = 2) {
      return number.toFixed(precision)
    },
    downloadFile() {
      // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
      if (window.fetch) {
        fetch(this.fileUrl)
          .then(res => res.blob())
          .then(blob => {
            let a = document.createElement('a')
            let url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = this.fileName
            a.click()
          })
      } else {
        let a = document.createElement('a')
        a.href = this.fileUrl
        a.target = '_blank'
        a.download = this.filename
        a.click()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.file-element-wrapper {
  cursor: pointer
}
.header {
  display: flex;
}
.file-icon {
  font-size: 40px !important;
}
.file-element {
  display: flex;
  // flex-direction: column;
  margin-left: 12px;
  .file_img{

  }
  .file_del{
    margin-left: 12px;
  }
}
.file-size {
  font-size: 12px;
  padding-top : 5px
}
</style>
