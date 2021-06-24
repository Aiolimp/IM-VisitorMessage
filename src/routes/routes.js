import Vue from "vue";
import VueRouter from "vue-router";
import { routes } from "./index";

Vue.use(VueRouter);
// router
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
});
// 路由守卫
let routerArr = [];
router.beforeEach((to, from, next) => {
  routerArr.push(to.path);
  // console.log(routerArr);
  next();
});

export { router };
