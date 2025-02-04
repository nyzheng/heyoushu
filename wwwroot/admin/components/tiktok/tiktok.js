
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

export default {
    template: `
<div class="tiktok-table">
    <table>
        <thead>
            <tr>
                <th>編號</th>
                <th>內嵌碼</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in arrayData" :key="item.Id">
                <td>{{ item.Id }}</td>
                <td>
                    <textarea v-model="item.EmbedCode"></textarea>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<div class="btn">
  <button @click="Update_Data">儲存資料</button>
</div>
<div class="doneWindow" v-if="showDone" >
    <div class="box">
        <span>儲存成功</span>
    </div>
</div>
`,
    //emits: [],
    props: {
    },
    setup(props, context) {
    /*    const arrayData = reactive([])
        const Get_Data = () => {
            arrayData.length = 0;
            WebApi.get("Homepage/Get_Tiktok").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let i = 0; i < result.data.Data.length; i++) {
                    let item = result.data.Data[i]
                    arrayData.push(item)
                }
            });
        };
        const Update_Data = () => {
            const data = arrayData.map((item) => {
                return {
                    Id: item.Id,
                    EmbedCode: item.EmbedCode
                }
            })
            console.log(data)
            WebApi.post("Homepage/Update_Tiktok", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }
        const showDone = ref(false);
        const updateSuccess = () => {
            showDone.value = true;
            setTimeout(() => {
                showDone.value = false;
            }, 1000)
        }
        onMounted(() => {
            Get_Data();
        });

        return {
            arrayData,
            Update_Data,
            showDone,
        };*/
    },
    components: {
    }
};
