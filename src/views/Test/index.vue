<!-- 模拟用户聊天 -->
<template>
    <div class=''>
        <a-button type="primary" @click="comeIn">
        进入聊天 》》
        </a-button>
    </div>
</template>

<script>
import { v1 as uuidv1 } from 'uuid';
export default {
name:'',
components: {},
data() {
    return {
        uuid:''
    };
},
computed: {},
watch: {},
//方法集合
methods: {
    comeIn(){
        let obj = {
            url:location.host
        }
       
        let routeUrl = this.$router.resolve({path:'/conversation',query: obj})
        window.open(routeUrl .href, '_blank');
        
    },
   
},
created() {

},
mounted() {
   
},
}
</script>
<style lang='less' scoped>

</style>