
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));
let editWindow2 = defineAsyncComponent(() => import(`../window/edit-window-2.js`));



export default {
    template: `
<div class="banner-container">
    <div class="container">
        <h2>banner輪播</h2>
        <table>
            <thead>
                <tr>
                    <th>順序</th>
                    <th>圖片</th>
                    <th>編輯圖片</th>
                    <th>刪除圖片</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(banner, index) in bannerList" key="banner.Id">
                    <td>{{index+1}}</td>
                    <td><img :src="'/upload/images/' + banner.Img" alt="" /></td>
                    <td><button type="button" @click="clickEditBanner(banner)">編輯圖片</button></td>
                    <td><button type="button" @click="clickDeleteBanner(banner)">刪除圖片</button></td>
                </tr>
            </tbody>
        </table>
        <div class="add-button">
            <button type="button" @click="clickCreateBanner('desktop')">新增圖片</button>
        </div>
    </div>
    <div class="container">
        <h2>手機板</h2>
        <table>
            <thead>
                <tr>
                    <th>順序</th>
                    <th>圖片</th>
                    <th>編輯圖片</th>
                    <th>刪除圖片</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(banner, index) in bannerList_mobile" key="banner.Id">
                    <td>{{index+1}}</td>
                    <td><img :src="'/upload/images/' + banner.Img" alt="" /></td>
                    <td><button type="button" @click = clickEditBanner(banner)>編輯圖片</button></td>
                    <td><button type="button" @click = clickDeleteBanner(banner)>刪除圖片</button></td>
                </tr>
            </tbody>
        </table>
        <div class="add-button">
            <button type="button" @click="clickCreateBanner('mobile')">新增圖片</button>
        </div>
    </div>
</div>

    <alert-window v-if="showDeleteBanner" :data="deleteBannerData" @no="closeDeleteBanner" @yes="deleteBanner"></alert-window>
    <edit-window-2 v-if="showEditBanner" :data="editBannerData" @close="closeEditBanner" @save="updateBanner"></edit-window-2>
    `
    ,
    //emits: [],
    props: {
    },
    setup(props, context) {
        const Get_Data = () => {
            WebApi.get("Homepage/Get_Banner").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                bannerList.length = 0;
                bannerList_mobile.length = 0;
                result.data.Data.forEach(banner => {
                    if (banner.Device === "desktop") {
                        bannerList.push(banner);
                    }
                    if (banner.Device === "mobile") {
                        bannerList_mobile.push(banner);
                    }
                });
            });
        };

        const bannerList = reactive([]);
        const bannerList_mobile = reactive([]);
        const editBannerData = reactive({
            table: [
                {
                    name: "圖片：",
                    content: "",
                    type: "img"
                }
            ],
            id: 0,
            device: ""
        })
        const showEditBanner = ref(false);
        const clickEditBanner = (banner) => {
            editBannerData.id = banner.Id;
            editBannerData.table[0].content = banner.Img;
            editBannerData.device = banner.Device;
            showEditBanner.value = true;   
        }
        const closeEditBanner = () => {
            showEditBanner.value = false;
        }
        const clickCreateBanner = (device) => {
            editBannerData.table[0].content = "";
            editBannerData.id = 0;
            editBannerData.device = device;
            showEditBanner.value = true;   
        }
        const updateBanner = (data) => {
            if (!data.id) {
                const createData = {
                    Img: data.table[0].content,
                    Device: data.device
                }
                WebApi.post("Homepage/Create_Banner", createData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditBanner();
                });
            }
            if (data.id) {
                const updateData = {
                    Id: data.id,
                    Img: data.table[0].content,
                    Device: data.device
                }
                WebApi.post("Homepage/Update_Banner", updateData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditBanner();
                });
            }
        }

        const showDeleteBanner = ref(false);
        const deleteBannerData = reactive({
            message: "確定刪除圖片嗎？",
            id: 0
        })
        const clickDeleteBanner = (banner) => {
            deleteBannerData.id = banner.Id;
            showDeleteBanner.value = true;
        }
        const closeDeleteBanner = () => {
            showDeleteBanner.value = false;
        }
        const deleteBanner = (id) => {
            const deleteData = {
                Id: id
            }
            WebApi.post("Homepage/Delete_Banner", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeDeleteBanner();
            });
        }

        onMounted(() => {
            Get_Data();
        });

        return {
            bannerList,
            bannerList_mobile,
            editBannerData,
            showEditBanner,
            clickEditBanner,
            closeEditBanner,
            clickCreateBanner,
            updateBanner,

            showDeleteBanner,
            deleteBannerData,
            clickDeleteBanner,
            closeDeleteBanner,
            deleteBanner,
        };
    },
    components: {
        "alert-window": alertWindow,
        "edit-window-2": editWindow2
    }
};