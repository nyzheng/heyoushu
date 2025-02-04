
const { ref, reactive, onMounted } = Vue;

import { WebApi } from "../shared/shared.js";

export default {
    template: `
<div id="login-container">
    <div id="login_section">
        <div id="title"><h4>管理員登入</h4></div>
        <form>
            <div id="username">
                <label for="username">帳號：</label>
                <input type="text" id="username" v-model="User.UserName" class="custom-input" />
            </div>
            <div id="password">
                <label for="password">密碼：</label>
                <input type="password" id="password" v-model="User.UserPassword" class="custom-input" />
            </div>
            <button type="button" class="login_button" @click="Login">登入</button>
        </form>
    </div>
</div>
`,
    emits: ["update"],
    props: {

    },
    setup(props, context) {
        const User = reactive({ UserName: '', UserPassword: '' });

        const Login = () => {
            WebApi.post("User/Login", User).then((result) => {
                if (result.data.HttpCode !== 200) {
                    alert(result.data.Message);
                    return;
                }

                sessionStorage.setItem("UserName", User.UserName);
                sessionStorage.setItem("accessToken", "OK");

                context.emit("update", false);
            });
        };

        onMounted(() => {

        });

        return {
            User,
            Login,
        };
    },
    components: {

    }
};
