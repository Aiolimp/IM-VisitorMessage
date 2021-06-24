import axios from 'axios'
export default {
    //客户管理列表
  custManageList(params) {
    return axios.get('/customers/hfwCustomersInfo/listPageJson', {params})
  },
  //设置列表字段  
  setFieldsJson(params) {
    return axios.get('/config/hfwConfigFields/fieldsJson', {params})
  },
  //保存列表字段设置  
  fieldsShowSave(params){
    return axios.post('/config/hfwConfigFields/fieldsShowSaveJson', params)
  },
  //列表字段-表单(新建客户，新建联系人)
  formFieldsJson(params) {
    return axios.get('/config/hfwConfigFields/formFieldsJson', {params})
  },
  //客户管理-设置负责人 
  setPrincipalJson(params){
    return axios.post('/customers/hfwCustomersInfo/setPrincipalJson', params)
  },
  //客户管理-删除 
  delCustomer(params){
    return axios.post('/customers/hfwCustomersInfo/delJson', params)
  },
  //客户管理-创建客户 
  createCustomer(params){
    return axios.post('/customers/hfwCustomersInfo/saveJson', params)
  },
  //客户管理-导出  
  // exportCustomer(params){
  //   return axios.get('/customers/hfwCustomersInfo/exportJson', {params})
  // },
  //客户管理-导入数据 
  importJson(params) {
    return axios.post('/imp/hfwImportFile/importJson', params)
  },
  //客户管理-导入匹配成功
  matchJson(params){
    return axios.post('/imp/hfwImportFile/matchJson', params)
  },
  //客户管理-导入结果
  importResult(params) {
    return axios.get('/imp/hfwImportResult/resultJson', {params})
  },
  //客户管理-下载导入失败 
  errorResult(params) {
    return axios.get('/imp/hfwImportResult/expErrorExcel', {params})
  },
  //客户管理-客户跟进保存 
  saveCustomerFollow(params){
    return axios.post('/customers/hfwCustomersFollow/saveJson', params)
  },
  //客户管理-客户跟进-最近跟进记录 
  lastInfo(params) {
    return axios.get('/customers/hfwCustomersFollow/lastInfo', {params})
  },
  //客户管理-客户详情/tab资料/编辑客户
  customerDetail(params) {
    return axios.get('/customers/hfwCustomersInfo/editInfoJson', {params})
  },
  //客户管理-客户详情-新建联系人  
  createLinkMan(params){
    return axios.post('customers/hfwCustomersContacts/saveJson', params)
  },
  //客户管理-客户详情-联系人列表 
  contactInfo(params) {
    return axios.get('/customers/hfwCustomersInfo/InfoContactsJson', {params})
  },
  //客户管理-客户详情-编辑联系人  
  editContactsInfo(params) {
    return axios.get('/customers/hfwCustomersContacts/editInfoJson', {params})
  },
  //客户管理-客户详情-删除联系人  
  deleteContacts(params){
    return axios.get('/customers/hfwCustomersContacts/delete', {params})
  },
  //客户管理-客户详情-tab资料 
  // materialInfo(params) {
  //   return axios.get('/customers/hfwCustomersInfo/editInfoJson', {params})
  // },
  //客户管理-客户详情-日志  
  logJson(params) {
    return axios.get('/customers/hfwCustomersLog/listJson', {params})
  },
  //客户管理-客户详情-跟进记录  
  detailFollowRecord(params) {
    return axios.get('/customers/hfwCustomersFollow/listJson', {params})
  },
  //客户管理-客户详情-头部详情 
  infoTitle(params) {
    return axios.get('/customers/hfwCustomersInfo/InfoTitleJson', {params})
  },
  //客户管理-客户标签  
  customerLabel(params) {
    return axios.get('/customers/hfwCustomersInfo/searchListJson', {params})
  },
  //客户管理-创建人/负责人   
  staffSkillGroups(params) {
    return axios.get('/staff/hfwStaffSkillGroupsMember/staffSkillGroups', {params})
  },
  //线索管理list 
  clueManageList(params){
    return axios.get('/customers/hfwCustomersClue/listPageJson', {params})
  },
  //线索管理-导出 
  // exportClue(params){
  //   return axios.post('/customers/hfwCustomersClue/exportJson', params)
  // },
  //跟进记录list有分页 
  followRecordList(params){
    return axios.post('/customers/hfwCustomersFollow/listPageJson', params)
  },
  //历史会话list 
  sessionList(params) {
    return axios.get('/hfw/hfwSessionInfo/listPageJson', {params})
  },
  //历史会话-保存咨询备注 
  saveReferRemark(params){
    return axios.post('/hfw/hfwSessionInfo/updateStatus', params)
  },
  //质量检测-会话质检-在线质检 
  sessionOnlineList(params) {
    return axios.get('/session/qc/search', {params})
  },
  //会话质检-单位客服人员  
  sessionAccMember(params) {
    return axios.get('/staff/hfwStaffMember/service/acc/list', {params})
  },
  //会话质检-员工管理-技能组列表  
  sessionServiceGroups(params) {
    return axios.get('/staff/hfwStaffSkillGroups/listJson', {params})
  },
  //质量检测-会话质检-质检详情  
  sessionDetail(params) {
    return axios.get('/session/qc/detail', {params})
  },
  //质量检测-电话质检 
  callphoneList(params) {
    return axios.post('/callphone/qc/serach', params)
  },
  //质量检测-电话质检-质检详情 
  QcDetail(params) {
    return axios.get('/callphone/qc/getQcDetail', {params})
  },
  //质量检测-电话质检-保存评分 
  saveQc(params) {
    return axios.post('/callphone/qc/saveQc', params)
  },
  //质量检测-会话质检-保存评分 
  saveSessionGrade(params) {
    return axios.post('/session/qc/score', params)
  },
  //质量检测-电话质检-咨询分类 
  referClassify(params) {
    return axios.get('/hfw/workbench/getSummarySort', {params})
  },
  //添加服务小结 
  saveServiceSummary(params) {
    return axios.post('/hfw/workbench/saveServiceSummary', params)
  },
}