const basic = {
  state: {
    visitorInf: {}, //访客信息
    imInfo: {}, //im信息
    sessionObj: {},
    guestInfo: {},
    distributionInfo: {}, //訪客分配信息
    watchImMStatus:false,
    leaveMessageData:'',//留言状态
    intellectMessage:'',//用户点击智能客服消息
    teleMessage:'',//远程协助客户端返回消息
    ModMessage:'',//插件版远程返回的信息
    DistanceDate:'',//远程协助三个参数
    LongTwoUrl:'',//远程建立获取的两个地址参数
    refuseDate:''//访客关闭窗口发送的拒绝信息
  },
  mutations: {
    getModMessage(state, ModMessage) {
      state.ModMessage = ModMessage;
    },
    getVisitorInf(state, visitorInf) {
      state.visitorInf = visitorInf;
    },
    getRefuseDate(state, refuseDate){
      state.refuseDate = refuseDate;
    },
    getLongTwoUrl(state, LongTwoUrl){
      state.LongTwoUrl = LongTwoUrl;
    },
    getDistanceDate(state, DistanceDate){
      state.DistanceDate = DistanceDate;
    },
    getTeleMessage(state, teleMessage){
      state.teleMessage = teleMessage;
    },
    getIntellectMessage(state, intellectMessage){
      state.intellectMessage = intellectMessage;
    },
    getImInfo(state, imInfo) {
      state.imInfo = imInfo;
    },
    getLeaveMessageData(state, leaveMessageData){
      state.leaveMessageData = leaveMessageData;
    },
    getSessionObj(state, sessionObj) {
      state.sessionObj = sessionObj;
    },
    getGuestInfo(state, guestInfo) {
      state.guestInfo = guestInfo;
    },
    getDistributionInfo(state, distributionInfo) {
      state.distributionInfo = distributionInfo;
    }
  },
  action: {}
};
export default basic