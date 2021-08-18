module.exports = {
  lintOnSave: false,
  publicPath: "",
  devServer: {
    host: "0.0.0.0",
    port: "9200", //代理端口
    open: false, //项目启动时是否自动打开浏览器，我这里设置为false,不打开，true表示打开
    disableHostCheck: true, //穿透 如果不配置，穿透不了
    proxy: {
      ".*": {
        // target: "http://hfwtest.zjqfxx.net", //回头配置开发本地地址
        target: "http://hfw.test.com", //回头配置开发本地地址
        changeOrigin: true,
        ws: false
      }
    }
  },
  publicPath: "./",
  outputDir: "guestMessage",
  assetsDir: "static"
};
