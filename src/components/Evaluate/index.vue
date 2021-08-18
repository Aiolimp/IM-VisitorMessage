<!--  -->
<template>
  <div class>
    <a-modal
      title="添加评价"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form-model
        :model="formInline"
        ref="ruleForm"
        :rules="rules"
        v-bind="layout"
      >
        <a-form-model-item
          label="评价"
          prop="appraiseValue"
        >
          <a-rate
            v-model="formInline.appraiseValue"
            style="fontSize: 28px"
            :tooltips="desc"
          />
          <span class="ant-rate-text">{{ desc[formInline.appraiseValue - 1] }}</span>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

  </div>
</template>

<script>
import { mapState } from "vuex";
import { throttle } from "@/utils";
export default {
  name: "",
  components: {},
  props: ["modelStatus"],
  data() {
    return {
      visible: false,
      formInline: {
        appraiseValue: 3,
        appraiseDesc: "",
      },
      desc: ["不太满意", "一般满意", "满意", "很满意", "非常满意"],
      layout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
      },
      rules: {
        appraiseValue: [
          { required: true, message: "请选择评价", trigger: "change" },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      sessionObj: (state) => state.basic.sessionObj,
    }),
  },
  watch: {
    modelStatus(a, b) {
      console.log(a, b);
    },
  },
  mounted() {
    console.log(this.modelStatus);
    this.visible = this.modelStatus;
    this.findPersonDebounce = throttle(this.handThrottle, 200);
  },
  //方法集合
  methods: {
    handThrottle() {
      let params = {
        appraiseValue:this.formInline.appraiseValue - 1,
        orgId: this.$route.query.orgId,
        sessionId: this.sessionObj.id,
      };
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.Request.get("/guest/session/appraise", params).then((res) => {
            if (res.data.status) {
              this.$emit("cancelModel", false);
              this.visible = false;
              this.$message.success("操作成功");
            }
          });
        } else {
          return false;
        }
      });
    },
    handleOk() {
      this.findPersonDebounce()
    },
    handleCancel() {
      this.visible = false;
      this.$emit("cancelModel", false);
      this.$refs["ruleForm"].resetFields();
    },
  },
  created() {},
};
</script>
<style lang='less' scoped>
</style>