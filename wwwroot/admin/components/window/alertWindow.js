const { ref, reactive, onMounted } = Vue;
import { WebApi } from "../shared/shared.js";

export default {
    template: `
    <div class="alertWindow">
        <div class="box">
            <span>{{data.message}}</span>
        </div>

        <div class="button-box">
            <button type="button" @click="yes">是</button>
            <button type="button" @click="no">否</button>
        </div>
    </div>
`,
    emits: ["no", "yes"],
    props: {
        "data": { type: Object},
    },
    setup(props, context) {
        const no = () => {
            context.emit("no");
        };
        const yes = () => {
            context.emit("yes", props.data.id);
        };
        onMounted(() => {
        });

        return {
            yes,
            no,
        };
    },
    components: {
    }
};
