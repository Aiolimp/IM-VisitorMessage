const routes = [
  {
    path: "/",
    component: () => import("@/views/Test/index.vue")
  },
  {
    path: "/conversation",
    component: () => import("@/views/Test/conversation.vue")
  },
  {
    path: "*",
    component: () => import("@/components/NotFound")
  }
];

const defaultRoutes = routes[1].children;
export { routes , defaultRoutes };
