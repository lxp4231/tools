// 1 数组对象去重
// let map = new Map()
// for (let item of res.data) {
//     if (!map.has(item.vessel)) {
//         map.set(item.vessel, item)
//     }
// }
// let arr = [...map.values()]
// // 去重
// let arr = [...map.values()]
// console.log(arr)

// 2 拿到数组中重复项的值
// let arr = [124124, 213412, 124124142, 124124124, 12213, 213124, 124124124, 211244, 124124]
// function duplicates(arr) {
//     var Arr = []
//     arr.forEach((elem) => {
//         if (arr.indexOf(elem) !== arr.lastIndexOf(elem) && Arr.indexOf(elem) === -1) {
//             Arr.push(elem)
//         }
//     })
//     return Arr
// }
// console.log(duplicates(arr))
// function duplicates(arr) {
//     return arr.filter((e, i) => arr.indexOf(e) !== arr.lastIndexOf(e) && arr.indexOf(e) === i)
// }
// console.log(duplicates(arr))
// 3.输入大于0 input="value=value.replace(/^0|[^0-9]/g,'')"
// 4. 输入不能为空
// factoryAddress: [
//     { required: true, message: '请输入详细地址' },
//     {
//         required: true,
//         transform: (value) => value && value.trim(),
//         message: '详细地址不能全部为空',
//         trigger: 'blur'
//     }
// ],

// 5.只能输入数字和保留两位小数
// const onPrice = (value) => {
//     // 只能输入数字和保留两位小数
//     value.unitPrice = value.unitPrice.replace(/^0|[^\d.]/g, '').replace(/^(\d+)\.(\d\d).*$/, '$1.$2')
// }

//6. el-input限制只能输入数字
{
    /* <el-input v-model="number" @input="validateNumber"></el-input> */
    // function validateNumber(value: any) {
    //     const regex = /^[1-9]\d*$/;
    //     if (!regex.test(value)) {
    //       number.value = value.slice(0, -1);
    //     }
    //   }
}
// const validateNumberN = (event: any) => {
//   let value = event.value.replace(/[^\d]+/g, '')
//   value = value.replace(/(\d{15})\d*/, '$1')
//   event.value = value
// }
{
    /* <template>
  <div class="mt10px bg-white h-full pt-16px pl-16px pr-16px pb-16px">
    <div class="box-center">
      <div class="left">
        <div v-for="(item, index) in tableData" :key="index" class="left-line"></div>
      </div>
      <div class="right">
        <div v-for="(item, index) in tableData" :key="index" class="box-item">
          <div class="title">{{ item.title }}</div>
          <div class="close">
            <el-icon><Close /></el-icon>
          </div>
          <div class="ipt">
            <el-input
              v-model="item.value"
              clearable
              class="num-input w-66px h-32px"
              @input="validateNumber(item)"
            ></el-input>
            <span>%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const validateNumber = (event: any) => {
  const inputValue = event.value;
  if (!/^\d+$/.test(inputValue)) {
    // eslint-disable-next-line no-param-reassign
    event.value = inputValue.slice(0, -1);
  }
};
const tableData = ref<any>([
  {
    title: '3min内一次通过率',
    value: 30,
  },
  {
    title: '3min内一次节点准确率',
    value: 20,
  },
  {
    title: '3min内最新通过率',
    value: 30,
  },
  {
    title: '3min内最新节点准确率',
    value: 20,
  },
]);
</script> */
}
7
//
