
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

export default {
    template: `
<div class="tiktok-table">
    <div class="title">
        <a @click="switchRegion(0)" :class="{ 'active': RegionButton === 0 }">藥師排序</a>
        <a @click="switchRegion(1)" :class="{ 'active': RegionButton === 1 }">藥局排序</a>
    </div>
    <table v-if="!RegionButton">
        <thead>
            <tr>
                <th>藥師名稱</th>
                <th>藥局名稱</th>
                <th>區域</th>
                <th>順序</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in arrayData" :key="index">
                <td>{{ item.Name }}</td>
                <td>{{ item.Pharmacy }}</td>
                <td>{{ item.Region }}</td>
                <td>
                    <input v-model="editedDisplayOrders[index]" type="number">
                </td>
            </tr>
        </tbody>
    </table>
    <table v-if="RegionButton">
        <thead>
            <tr>
                <th>藥局名稱</th>
                <th>區域</th>
                <th>地址</th>
                <th>順序</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in arrayData" :key="index">
                <td>{{ item.PharmacyName }}</td>
                <td>{{ item.Region }}</td>
                <td>{{ item.Address }}</td>
                <td>
                    <input v-model="editedDisplayOrders[index]" type="number">
                </td>
            </tr>
        </tbody>
    </table>
</div>

    <div class="btn">
      <button @click=updateDisplayOrder()>儲存順序</button>
    </div>
`,
    //emits: [],
    props: {


    },
    setup(props, context) {
        const arrayData = reactive([])
        const editedDisplayOrders = reactive([])
        const RegionButton = ref(0);
        const Get_Data = () => {
            arrayData.length = 0;
            editedDisplayOrders.length = 0;
            if (!RegionButton.value) {
                WebApi.get("Pharmacist/Get_Data").then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    for (let i = 0; i < result.data.Data.PharmacistList.length; i++) {
                        let pharmacist = result.data.Data.PharmacistList[i]
                        arrayData.push(pharmacist)
                        editedDisplayOrders.push(pharmacist.DisplayOrder);
                    }
                });
            }   
            if (RegionButton.value) {
                WebApi.get(`Pharmacy/Get_AllData/`).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    for (let i = 0; i < result.data.Data.PharmacyList.length; i++) {
                        let pharmacy = result.data.Data.PharmacyList[i]
                        arrayData.push(pharmacy)
                        editedDisplayOrders.push(pharmacy.DisplayOrder);
                    }
                });
            }
        };
        const updateDisplayOrder = () => {
            for (let index = 0; index < arrayData.length; index++) {
                arrayData[index].DisplayOrder = editedDisplayOrders[index];
            }
            if (!RegionButton.value) {
                WebApi.post("Pharmacist/Update_DisplayOrder", arrayData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                });
            }
            if (RegionButton.value) {
                WebApi.post("Pharmacy/Update_DisplayOrder", arrayData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                });
            }
            

        };


        const switchRegion = (region) => {
            RegionButton.value = region;
            Get_Data();
        };
        
        onMounted(() => {
            Get_Data();
        });

        return {
            arrayData,
            editedDisplayOrders,
            updateDisplayOrder,

            switchRegion,
            RegionButton,
        };
    },
    components: {
    }
};
