<!-- 模拟用户聊天 -->
<template>
  <div class='knowledge'>
    <div class="title"><span>猜您想问:</span>
    </div>
    <div
      :class="{AAA:isPC}"
      class="classify"
    >
      <div
        class="classify-left"
        @click="showQuestion1()"
      >
        <span v-if="groupList&&groupList.length">{{groupList[0].groupName}}</span>
        <a-icon
          :type="isShow1 ? 'down' : 'up'"
          class="icon"
        />
      </div>
      <div
        class="classify-right"
        v-show="isShow1"
      >
        <p
          v-for="(item,index) in FirstList"
          :key="index"
          @click="sendMessage(item)"
        >{{item.title}}</p>
      </div>
    </div>
    <div
      :class="{AAA:isPC}"
      class="classify"
    >
      <div
        class="classify-left"
        @click="showQuestion2()"
      >
        <span v-if="groupList&&groupList.length">{{groupList[1].groupName}}</span>
        <a-icon
          :type="isShow2 ? 'down' : 'up'"
          class="icon"
        />
      </div>
      <div
        class="classify-right"
        v-show="isShow2"
      >
        <p
          v-for="(item,index) in SecondList"
          :key="index"
          @click="sendMessage(item)"
        >{{item.title}}</p>
      </div>
    </div>
  </div>
</template>
<script>
import messagesendbox from "../../components/message/message-send-box";
export default {
  name: "",
  components: {
    messagesendbox,
  },
  data() {
    return {
      uuid: "",
      isShow1: true,
      isShow2: false,
      isPC: false,
      groupList: [],
      FirstList: [],
      SecondList: [],
      IntellectMessage: "",
    };
  },
  computed: {},
  watch: {},
  //方法集合
  methods: {
    getQuestion() {
      let param = {
        orgId: this.$route.query.orgId,
      };
      this.Request.post("/guest/session/knowlege/tree", param).then((res) => {
        this.groupList = res.data.groupList;
        this.FirstList = this.groupList[0].knowlegeBeanList
        this.SecondList = this.groupList[1].knowlegeBeanList
      });
    },
    showQuestion1() {
      this.isShow1 = !this.isShow1;
      if (this.isShow2) {
        this.isShow2 = false;
      }
    },
    showQuestion2() {
      this.isShow2 = !this.isShow2;
      if (this.isShow1) {
        this.isShow1 = false;
      }
    },
    sendMessage(item) {
      console.log(item);
      this.$bus.$emit('sendIntellectMessage',item.title)
    },
  },
  created() {
    this.getQuestion();
    this.isPC = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
      navigator.userAgent
    )
      ? false
      : true;
  },
  mounted() {},
};
</script>
<style lang='less' scoped>
.knowledge {
  padding: 20px;
  .title {
    color: #989898;
  }

  .classify {
    padding: 10px 20px 0 0;

    .icon {
      margin-left: 10px;
    }
    .classify-right {
      margin-left: 0px;
      p {
        color: #1890ff;
        cursor: pointer;
        &:nth-of-type(1) {
          margin-top: 14px;
        }
      }
    }
  }
  .AAA {
    display: flex;
    .classify-right {
      margin-left: 15px;
      p {
        color: #1890ff;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        &:nth-of-type(1) {
          margin-top: 0;
        }
      }
    }
  }
}
</style>