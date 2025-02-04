const { ref, reactive, onMounted } = Vue;

export default {
    template: `
    <div class="doneWindow">
        <div class="box">
            <span>儲存成功</span>
        </div>
    </div>
`,
    emits: [],
    props: {
    },
    setup(props, context) {
        onMounted(() => {
        });

        return {
        };
    },
    components: {
    }
};
