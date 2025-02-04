
import defaultDiv from "../components/default/default.js";
import loginDiv from "../components/login/login.js";
; (function (Vue) {

    const { createApp, ref, onMounted } = Vue;

    const app = createApp({
        setup() {
            const loginShow = ref(true);

            const LoginUpdate = (Show) => {
                loginShow.value = Show;
            };

            onMounted(() => {
                sessionStorage.getItem("accessToken") ? loginShow.value = false : loginShow.value = true;
            });

            return {
                loginShow,
                LoginUpdate,
            };
        },
        components: {
            "login-div": loginDiv,
            "default-div": defaultDiv,
        }
    });

    app.mount("#app_table");

})(Vue)
