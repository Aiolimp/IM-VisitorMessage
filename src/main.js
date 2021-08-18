import Vue from "vue";
import App from "./App.vue";
import store from "./store/index";
import {
  router
} from "./routes/routes";
import "./assets/css/common.less";
// 有关antdUi组件
import "ant-design-vue/dist/antd.css";
import Antd from "ant-design-vue";
import Request from './api/api'
import './api/index'
import tim from './utils/tim'
import TIM from 'tim-js-sdk'
import {VueJsonp} from 'vue-jsonp'
import {
  OnOrayInfo,CloseIM,cb_createclient
} from "./utils/index";
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM
Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。
Vue.use(Antd);
Vue.use(VueJsonp);
Vue.config.productionTip = false;
Vue.prototype.Request = Request;

window.CloseIM = CloseIM;
window.OnOrayInfo = OnOrayInfo;
window.cb_createclient = cb_createclient;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");