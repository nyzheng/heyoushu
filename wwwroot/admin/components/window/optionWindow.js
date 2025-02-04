const { ref, reactive, onMounted } = Vue;
import { WebApi } from "../shared/shared.js";

export default {
    template: `
    <div class="option-window">
        <div class="box edit-title" v-if="data.option">
            <label>{{data.message}}</label>
            <select v-model="data.optionId">
                <option v-for="option in data.option" :value="option.id">{{option.name}}</option>
            </select>
        </div>
        <div class="button-box">
            <button type="button" @click="yes">確定</button>
            <button type="button" @click="no">取消</button>
        </div>
    </div>
`,
    emits: ["no", "yes"],
    props: {
        "data": { type: Object },
    },
    setup(props, context) {
        const data = props.data;

        const no = () => {
            context.emit("no");
        };
        const yes = () => {
            context.emit("yes", data);
        };
        onMounted(() => {
        });

        return {
            data,
            yes,
            no,
        };
    },
    components: {
    }
};
