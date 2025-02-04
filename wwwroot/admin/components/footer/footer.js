
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));

export default {
    template: `
<footer class="pages-scale">
    <nav>
        <div class="logo">
            <img src="/upload/images/首頁規劃-11 1.png" alt="" />
        </div>
        <ul class="menu">
            <li>
                <a>
                    <div class="img-box">
                        <div class="line"></div>
                        <img src="/upload/images/Rectangle 18.png" alt="" />
                    </div>
                    <span>關於荷友舒</span>
                </a>
            </li>
            <li>
                <a>
                    <div class="img-box">
                        <div class="line"></div>
                        <img src="/upload/images/Rectangle 18.png" alt="" />
                    </div>
                    <span>荷友舒藥局位置</span>
                </a>
            </li>

            <li>
                <a>
                    <div class="img-box">
                        <div class="line"></div>
                        <img src="/upload/images/Rectangle 18.png" alt="" />
                    </div>
                    <span>荷友舒聊百病</span>
                </a>
            </li>
            <li>
                <a>
                    <div class="img-box">
                        <div class="line"></div>
                        <img src="/upload/images/Rectangle 18.png" alt="" />
                    </div>
                    <span>最新消息</span>
                </a>
            </li>
        </ul>
        <div class="supplier-menu">
            <p>{{footerText}}</p>
            <div class="mask" @click="editFooter">
                <button type="button" >編輯</button>
            </div>
        </div>
    </nav>
</footer>

        <edit-window v-if="showEditWindow" :data="editData"  @close="closeEditWindow" @save="updateFooter"></edit-window>

`,
    //emits: [],
    props: {


    },
    setup(props, context) {
        const footerText = ref("");
        const showEditWindow = ref(false);

        const Get_Data = () => {
            WebApi.get("Footer/Get_Data").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                footerText.value = result.data.Data.Text
            });
        };
        const editData = reactive({});
        const editFooter = () => {
            editData.img = {
                required: false,
            }
            editData.table = [
                {
                    content: footerText.value,
                    name: "文字敘述",
                    type: "textarea",
                    show: true
                }
            ]
            showEditWindow.value = true;
        }

        const updateFooter = (data) => {
            let updateData = {
                Text: data.table[0].content,
            }
            WebApi.post("Footer/Update_Data/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeEditWindow();
                Get_Data();
            });
        }
        const closeEditWindow = () => {
            showEditWindow.value = false;
        }
        onMounted(() => {
            Get_Data();
        });

        return {
            footerText,
            editFooter,
            editData,
            updateFooter,
            showEditWindow,
            closeEditWindow,

        };
    },
    components: {
        "edit-window": editWindow,
    }
};
