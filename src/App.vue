<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
export default {
  name: "app",
  data:()=>({
    locale: zhCN,
  }),
  mounted(){
      console.log(this)
  }
};
</script>
<style lang="less" scoped>
  #app{
    height: 100%;
  }
</style>
