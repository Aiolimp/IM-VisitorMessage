<template>
  <message-bubble :isMine="isMine" :message="message">
    <div class="font">{{payload.text}}</div>
    <div class="btn">
      <a-button type="primary" @click="evaluate">评价</a-button>
    </div>
    <Evaluate :modelStatus="modelStatus" @cancelModel="cancelModel" v-if="modelStatus"/>
  </message-bubble>
</template>

<script>
import MessageBubble from "../message-bubble";
import Evaluate from './../../Evaluate' 
import {mapState} from 'vuex'
export default {
  name: "",
  components: {
    MessageBubble,
    Evaluate
  },
  data(){
    return{
      modelStatus:false,
      
    }
  },
  props: {
    payload: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    },
    isMine: {
      type: Boolean
    }
  },
  mounted() {
    console.log('****************************',this.message)
  },
  computed: {
    ...mapState({
      sessionObj: state => state.basic.sessionObj,
    }),
    showProgressBar() {
      return this.message.status === "unSend";
    }
  },
  methods: {
    //发起评价
    evaluate() {
      console.log(this.message)
      if(this.message.sessionId == this.sessionObj.id){
      let params = {
        orgId: this.$route.query.orgId,
        sessionId: this.sessionObj.id
      };
      // this.modelStatus = true
      this.Request.get("/guest/session/query/appraise", params).then(res => {
        if (res.data.status) {
          
          if (
            res.data.session.appraiseValue == null ||  res.data.session.appraiseValue == ""
          ) {
            this.modelStatus = true
          } else {
            // this.visible = true;
            this.$message.warning("您已填写评价！");
            
          }
        }
      });
      }else{
        this.$message.warning("该评价已过期！");
      }
    },
    cancelModel(e){
      this.modelStatus = e
    },
  }
};
</script>

<style lang="less" scoped>
.video {
  width: 100%;
  max-height: 300px;
}
.font{
  padding-top:10px ;
}
.btn{
  text-align: center;
  padding-top: 20px;
}
</style>
