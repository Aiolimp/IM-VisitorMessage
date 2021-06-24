<template>
  <div class="image-previewer-wrapper" v-show="showPreviewer" @mousewheel="handleMouseWheel">
    dfsadfsdafdsafdsa
    <div class="image-wrapper">
      <img
        class="image-preview"
        :style="{transform: `scale(${zoom}) rotate(${rotate}deg)`}"
        :src="previewUrl"
        @click="close"
      />
    </div>
    <a-icon type="close" class="el-icon-close close-button" @click="close" />
    <a-icon type="left" class="el-icon-back prev-button" @click="goPrev" />
    <a-icon type="right" class="el-icon-right next-button" @click="goNext" />
    <div class="actions-bar">
      <a-icon type="minus-circle" class="el-icon-zoom-out" @click="zoomOut" />
      <a-icon type="plus-circle" class="el-icon-zoom-in" @click="zoomIn"></a-icon>
      <a-icon type="undo" class="el-icon-refresh-left" @click="rotateLeft"></a-icon>
      <a-icon type="redo" class="el-icon-refresh-right" @click="rotateRight"></a-icon>
      <span class="image-counter">{{index+1}} / {{imgUrlList.length}}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ImagePreviewer',
  data() {
    return {
      url: '',
      index: 0,
      visible: false,
      zoom: 1,
      rotate: 0,
      minZoom: 0.1
    }
  },
  computed: {
    ...mapGetters(['imgUrlList']),
    showPreviewer() {
      return this.url.length > 0 && this.visible
    },
    imageStyle() {
      return {
        transform: `scale(${this.zoom});`
      }
    },
    previewUrl() {
      return this.formatUrl(this.imgUrlList[this.index])
    }
  },
  mounted() {
    console.log('-----------------=====')
    this.$bus.$on('imagePreview1', this.handlePreview)

  },
  methods: {
   
    handlePreview({ url }) {
      console.log("事件总线")
      console.log(url)
      this.url = url
      this.index = this.imgUrlList.findIndex(item => item === url)
      this.visible = true
    },
    handleMouseWheel(event) {
      if (event.wheelDelta > 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },
    zoomIn() {
      this.zoom += 0.1
    },
    zoomOut() {
      this.zoom =
        this.zoom - 0.1 > this.minZoom ? this.zoom - 0.1 : this.minZoom
    },
    close() {
      Object.assign(this, { zoom: 1 })
      this.visible = false
    },
    rotateLeft() {
      this.rotate -= 90
    },
    rotateRight() {
      this.rotate += 90
    },
    goNext() {
      this.index = (this.index + 1) % this.imgUrlList.length
    },
    goPrev() {
      this.index =
        this.index - 1 >= 0 ? this.index - 1 : this.imgUrlList.length - 1
    },
    formatUrl(url) {
      if (!url) {
        return ''
      }
      return url.slice(0, 2) === '//' ? `https:${url}` : url
    }
  }
}
</script>

<style style="less" scoped>
.image-previewer-wrapper {
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: rgba(14, 12, 12, 0.7);
  z-index: 2000;
  cursor: zoom-out;
}

.close-button {
  cursor: pointer;
  font-size: 28px;
  color: #000;
  position: fixed;
  top: 50px;
  right: 50px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 6px;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-preview {
  transition: transform 0.1s ease 0s;
}
.actions-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 50px;
  left: 50%;
  margin-left: -100px;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}
.actions-bar i {
  font-size: 24px;
  cursor: pointer;
  margin: 0 6px;
}

.prev-button,
.next-button {
  position: fixed;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 24px;
  padding: 12px;
}
.prev-button {
  left: 0;
  top: 50%;
}
.next-button {
  right: 0;
  top: 50%;
}
.image-counter {
  background: rgba(20, 18, 20, 0.53);
  padding: 3px;
  border-radius: 3px;
  color: #fff;
}
</style>
