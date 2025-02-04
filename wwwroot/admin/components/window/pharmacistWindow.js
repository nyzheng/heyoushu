const { ref, reactive, onMounted } = Vue;
import pharmacist from "../pharmacist/pharmacist.js";
import { WebApi } from "../shared/shared.js";

export default {
    template: `
    <div class="pharmacist-window">
        <div class="box">
            <span>請選擇藥師：</span>
        </div>
        <ul>
            <li v-for="item in pharmacistData" :key="item.id" @click="click(item.Id)" :class="{ 'selected': item.selected }">
                <div class="img-box">
                    <img :src="'/upload/images/' + item.FileName">
                </div>
                <span>{{item.Name}}</span>
            </li>
        </ul>
        <div class="button-box">
            <button type="button" @click="yes">確認</button>
            <button type="button" @click="no">取消</button>
        </div>
    </div>
`,
    emits: ["no", "yes"],
    props: {
        "Id": { type: Number, required: true },
    },
    setup(props, context) {
        const no = () => {
            context.emit("no");
        };
        const yes = () => {
            const pharmacist = pharmacistData.find(item=>item.Id===pharmacistId.value)
            const data = {
                pharmacistId: pharmacistId.value,
                Id: props.Id,
                pharmacist 
            }
            if (pharmacistId.value) {
                context.emit("yes", data);
            }
        };
        const pharmacistId = ref(0);
        const pharmacistData = reactive([]);
        const Get_Data = () => {
            WebApi.get(`Pharmacist/Get_PharmacistList/`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                pharmacistData.length = 0;
                for (let pharmacist of result.data.Data.PharmacistList) {
                    pharmacist.selected = false;
                    pharmacistData.push(pharmacist);
                }
            });
        }
        const click = (id) => {
            pharmacistData.forEach(item => item.selected = false);
            const selectedItem = pharmacistData.find(item => item.Id === id);
            selectedItem.selected = true;
            pharmacistId.value = id;
        }

        onMounted(() => {
            Get_Data();
        });

        return {
            yes,
            no,
            pharmacistData,
            click,
        };
    },
    components: {

    }
};
