
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
export default {
    template: `
    <div class="index-container pages-scale">
            <div class="area1">
                <div class="content">
                    <div class="banner-box" v-if="bannerList.length > 0">
                        <img :src="'/upload/images/' + bannerList[0].FileName" alt="" />
                    </div>
                    <div class="mask" @click="editBanner">
                        <button type="button">編輯</button>
                    </div>
                </div>
            </div>
            <div class="area2">
                <div class="content">
                    <div class="title">
                        <div class="cross-box">
                            <div class="cross-row"></div>
                            <div class="cross-column"></div>
                        </div>
                        <span>影音專區</span>
                    </div>
                    <div class="video-container">
                        <div class="item" v-for="item in tiktokData">
                            <a href="javascript:;">
                                <img :src="'/upload/images/' + item.FileName" alt="" />
                            </a>
                            <div class="mask" @click="editTiktok(item)">
                                <button type="button" >編輯</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="area3">
                <div class="content">
                    <div class="title">
                        <div class="cross-box">
                            <div class="cross-row"></div>
                            <div class="cross-column"></div>
                        </div>
                        <span>我們的友舒</span>
                    </div>
                    <div class="person-box">
                        <div class="item" v-for="item in pharmacists" :key="item.Id">
                            <img :src="'../../../upload/images/' + item.FileName" alt="" />
                            <p>{{item.Name}}</p>
                            <p><span style="color: #e84c2e">{{item.Pharmacy}}</span></p>
                        </div>
                        <div class="mask" @click="editPharmacist()">
                            <button type="button" >編輯</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="area4">
                <div class="content">
                    <div class="title">
                        <div class="cross-box">
                            <div class="cross-row"></div>
                            <div class="cross-column"></div>
                        </div>
                        <span>荷友舒聊百病</span>
                    </div>
                    <div class="article-container">
                        <div class="item" v-for="category in ArticleList" :key = category.Id>
                            <div class="title">
                                <p>{{category.CategoryName}}</p>
                            </div>

                            <div class="article-box">
                                <div class="article" v-for="article in category.ArticleList" :key = article.Id>
                                    <div class="img-box">
                                        <img :src="'../../../upload/images/' + article.FileName" alt="" />
                                    </div>
                                    <p>{{article.Title}}</p>
                                </div>
                            </div>
                        </div>
                        <div class="mask" @click="editArticle()">
                            <button type="button">編輯</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="area5">
                <div class="content">
                    <div class="title">
                        <div class="cross-box">
                            <div class="cross-row"></div>
                            <div class="cross-column"></div>
                        </div>
                        <span>荷友舒位置</span>
                    </div>
                    <a href="javascript:;">
                        <div class="map-box" v-if="bannerList.length > 0">
                            <img :src="'../../../upload/images/' + bannerList[1].FileName" alt="" />
                            <div class="mask" @click="clickEditBanner(2)">
                                <button type="button" >編輯</button>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>


        <div class="window" v-if="Edit_Show" >
            <div class="box">
                <div class="small-box">
                    <span>原本的圖片：</span>
                    <div class="image-box">
                        <img :src="'../../../upload/images/' + BeforeImg"  />
                    </div>
                </div>
                <div class="small-box">
                    <span>修改後的圖片：</span>
                    <div class="image-box" v-if="selectFile">
                        <img :src="'../../../upload/images/' + AfterImg"  />
                    </div>
                </div>
            </div>
            <div class="box">
            <span>選擇圖片：</span>
                <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="uploadFile($event)"/>
            </div>
            <div class="button-box">
                <button type="button" @click="close">關閉</button>
                <button type="button" @click="save">儲存</button>
            </div>
        </div>

        <edit-window v-if="showEditTiktokWindow" :data="editTiktokData"  @close="closeEditWindow" @save="updateTiktok"></edit-window>
        <edit-window v-if="showEditBannerWindow" :data="editBannerData"  @close="closeEditWindow" @save="updateBanner"></edit-window>

`,
    //emits: [],
    props: {
        editPharmacist: Function,
        editArticle: Function,
        editBanner: Function,
    },
    setup(props, context) {
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".index-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.7}px;`);
            }, 100);
        };
        const pharmacists = reactive([]);
        const editPharmacist = () => {
            props.editPharmacist()
        }
        const editArticle = () => {
            props.editArticle()
        }
        const editBanner = () => {
            props.editBanner()
        }
        const close = () => {
            Edit_Show.value = false;
        }
        const save = () => {
            if (!selectFile.value) {
                close();
                return
            } 
            const data = {
                Id: bannerId.value,
                FileName: AfterImg.value,
            }
            WebApi.post("Banner/Update_Data",data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                GetBanner();
                close();
            });
        }
        const Get_pharmacists = () => {
            pharmacists.length = 0;
            WebApi.get("Pharmacist/Get_Homepage_Data").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let item of result.data.Data) {
                    pharmacists.push(item);
                }

            });
        };
        const ArticleList = reactive([]);
        const Get_ArticleData = () => {
            ArticleList.length = 0;

            WebApi.get("Article/Get_Data").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let Category of result.data.Data.CategoryList) {
                    Category.ArticleList = [];
                    for (let Article of result.data.Data.ArticleList) {
                        if (Article.Category_Id === Category.Id) {
                            Category.ArticleList.push(Article);
                        }
                    }
                    ArticleList.push(Category);
                }
            });
        };

        const Edit_Show = ref(false);
        const bannerId = ref(0);
        const BeforeImg = ref("");
        const AfterImg = ref("");
        const selectFile = ref(false);
        const bannerList = reactive([]);
        const GetBanner = () => {
            bannerList.length = 0;
            WebApi.get("Banner/Get_Data/").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let banner of result.data.Data) {
                    bannerList.push(banner);
                }
            });
        }


        const uploadFile = (event) => {
            event.target.files.length <= 0 ? event.target.value = "" : ImageToBase64(event.target.files);
        };
        function GetWebpFile(file, Name) {
            return new Promise((resolve, reject) => {
                let worker = new Worker("./components/image-manage/to-webp-processs.js");
                worker.onmessage = ({ data }) => { // 接收Worker線程傳來的base64
                    resolve(data);
                };
                worker.postMessage({ file, Name });
            });
        };
        const ImageToBase64 = async (fileList) => {
            const file = fileList[0]
            let extIndex = file.name.lastIndexOf(".");
            let ext = file.name.split(".").pop().toLowerCase();
            let Name = file.name.substr(0, extIndex), Type, Extension;
            Name = Name.replace("(", "-").replace(")", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "");
            let fileData = { MyFile: file, Name, OldExtension: ext, Extension }
            let newFile = await GetWebpFile(fileData.MyFile, `${fileData.Name}.webp`);
            fileData.MyFile = newFile;
            let formData = new FormData();
            formData.append("data", fileData.MyFile);
            formData.append("fileName", `${fileData.Name}.webp`);
            WebApi.post("Files/CreateSmall", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((result) => {
                if (result.data.HttpCode === 200) {
                    AfterImg.value = `${fileData.Name}.webp`
                    selectFile.value = true;
                } else {
                    console.error("Error (create-small-files):", result.data.Message);
                }

            });
        };

        const tiktokData = reactive([]);
        const GetTiktok = () => {
            WebApi.get("Homepage/Get_Tiktok").then((result) => {
                tiktokData.length = 0;
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let item of result.data.Data) {
                    tiktokData.push(item);
                }
            })
        }
        const showEditTiktokWindow = ref(false);
        const editTiktokData = reactive({
            table: [],
            img: {}
        });
        const editTiktok = (item) => {
            editTiktokData.Id = item.Id;
            editTiktokData.table = [{ type: 'text', name: "超連結：", content: item.Link, show: true}];
            editTiktokData.img = {
                content: item.FileName,
                required: true,
            }
            showEditTiktokWindow.value = true;
        }
        const updateTiktok = (data) => {
            const updateData = {
                Id: data.Id,
                Link: data.table[0].content,
                FileName: data.img.content,
            }
            WebApi.post("Homepage/Update_Tiktok", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeEditWindow();
                GetTiktok();
            });
        }
        const closeEditWindow = () => {
            showEditTiktokWindow.value = false;
            showEditBannerWindow.value = false;
        }

        const showEditBannerWindow = ref(false);
        const editBannerData = reactive({
            table: [],
            img: {
                required: true,
                content: "",
            }
        })
        const clickEditBanner = (id) => {
            editBannerData.img.content = bannerList.find(item=>item.Id === id).FileName;
            editBannerData.Id = id;
            showEditBannerWindow.value = true;

        }

        const updateBanner = (data) => {
            const updateData = {
                Id: data.Id,
                FileName: data.img.content,
            }
            WebApi.post("Banner/Update_Data", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                GetBanner();
                closeEditWindow();
            });
        }

        onMounted(() => {
            Get_pharmacists();
            Get_ArticleData();
            GetBanner();
            GetTiktok();
            Page_Setting();
        });

        return {
            pharmacists,
            Edit_Show, // 編輯 圖片及文字
            editPharmacist,
            editArticle,
            close,
            save,

            ArticleList,

            bannerList,
            bannerId,
            BeforeImg,
            AfterImg,
            selectFile,
            editBanner,
            uploadFile,

            tiktokData,
            editTiktok,
            showEditTiktokWindow,
            editTiktokData,
            closeEditWindow,
            updateTiktok,

            showEditBannerWindow,
            editBannerData,
            clickEditBanner,
            updateBanner,
        };
    },
    components: {
        "edit-window": editWindow,
    }
};
