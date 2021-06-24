<template>
  <div>
    <a-modal
      title="留言表单"
      :visible="visible"
      :footer="null"
      @cancel="handleCancel"
    >
      <a-form-model ref="ruleForm" v-bind="formItemLayout" :model="formObj">
        <a-form-model-item
          v-for="(item, index) in formObj.formList"
          :key="item.fieldId"
          :label="item.fieldName"
          :prop="'formList.' + index + '.fieldValue'"
          :rules="[
            {
              required: item.isRequired ? true : false,
              message: '不能为空',
              trigger: 'blur',
            },
            { validator: checkForm }
          ]"
        >
          <div v-if="item.dataType == 1">
            <a-input v-model="item.fieldValue" placeholder="请输入" />
          </div>
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 14, offset: 10 }">
          <a-button
            type="primary"
            @click="submitForm"
            >提交</a-button
          >
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
export default {
  data() {
    return {
      formObj: {
        formList: [],
      },
      formItemLayout: {
        labelCol: { span: 7 },
        wrapperCol: { span: 14 },
      },
      visible: this.isVisible,
    };
  },
  props: {
    isVisible: false,
  },
  mounted() {
    this.getList();
  },
  computed:{
      ...mapState({
          sessionObj: state => state.basic.sessionObj,
      })
  },
  methods: {
    getList() {
      //
      this.Request.get(
        "/hfw/hfwFormFieldSet/listJson",{orgId: this.$route.query.orgId,enable:1}
      ).then((res) => {
        console.log("留言表列表", res);
        this.formObj.formList = res.data.list;
      });
    },
    submitForm() {
        console.log(this.sessionObj.id)
        this.$refs.ruleForm.validate(valid => {
            if (valid) {
                let params = {
                    sessionId: this.sessionObj.id,
                    orgId:this.$route.query.orgId,
                    list:this.formObj.formList
                }
                this.Request.post('/hfw/hfwSessionInfoForm/saveJson',params).then(res=>{
                    if(res.data.status){
                        this.$message.success("保存成功");
                        this.visible = false
                        this.$emit("closeModel", false);
                    }
                })
            }
        })
    },
    checkForm(rule, value, callback) {
      let ind = rule.field.replace(/[^0-9]/gi, "");
      const index = Number(ind);
      let currentListItem = this.formObj.formList[index];
      let fieldCode = currentListItem.fieldCode;
      if (fieldCode == "phone" || fieldCode == "companyPhone") {
        let reg = /^((1[123456789][0-9]))\d{8}$|^0\d{2,3}-?\d{7,8}$/;
        if (value && !reg.test(value)) {
          callback("电话号码不正确");
        }
      }
      if(fieldCode == 'qq'){
        let reg = /^[1-9][0-9]{4,9}$/gim;
        if (value && !reg.test(value)) {
          callback("QQ格式错误");
        }
      }
      if(fieldCode == 'weChat'){
        let reg = /[\u4E00-\u9FA5]/g;
        if (value && reg.test(value)) {
          callback("微信号格式错误");
        }
      }
      callback();
    },
    handleCancel() {
      this.visible = false;
      this.$emit("closeModel", false);
      this.$refs["ruleForm"].resetFields();
    },
  },
};
</script>

<style>
</style>