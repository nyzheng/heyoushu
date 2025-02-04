
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import article from "../article/article.js";
import { WebApi } from "../shared/shared.js";
let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let editWindow2 = defineAsyncComponent(() => import(`../window/edit-window-2.js`));

export default {
    template: `
    <div class="pharmacist-container pages-scale" v-if="!profile_Show">
        <div class="area1">
            <div class="content">
                <div class="title">
                    <a @click="switchRegion(1)" :class="{ 'active': RegionButton === 1 }">北部</a>
                    <a @click="switchRegion(2)" :class="{ 'active': RegionButton === 2 }">中部</a>
                    <a @click="switchRegion(3)" :class="{ 'active': RegionButton === 3 }">南部</a>
                </div>
            </div>
        </div>
        <div class="area2">
            <div class="content">
                <div class="person-box" v-for="pharmacistBox in pharmacistData">
                    <div class="item" v-for="pharmacist in pharmacistBox">
                        <a href="introduce_1.html">
                            <img :src="'../../../upload/images/' + pharmacist.FileName" alt="" />
                            <p>{{pharmacist.Name}} <span style="color:e84c2e">{{pharmacist.Position}}</span></p>
                            <p><span style="color:e84c2e">{{pharmacist.Pharmacy}}</span></p>
                        </a>
                        <div class="mask">
                            <button type="button" @click="changeRegion(pharmacist)">變更區域</button>
                            <button type="button" @click="getPharmacistProfile(pharmacist.Id)">編輯</button>
                            <button type="button" @click="clickDeletePharmacist(pharmacist.Id)">刪除</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="btn" v-if="!profile_Show">
        <button @click=clickCreatePharmacist()>新增</button>
    </div>

    <div class="window" v-if="Edit_Region_Show" >
        <div class="box">
            <label>選擇區域：</label>
            <select v-model="regionId">
                <template v-for="region in regionData" >
                    <option :value="region.Id">{{region.Region}}</option>
                </template>
            </select>
        </div>

        <div class="button-box">
            <button type="button" @click="closeChangeRegion">關閉</button>
            <button type="button" @click="saveChangeRegion">儲存</button>
        </div>
    </div>

        <edit-window-2 v-if="showCreatePharmacist" :data="createPharmacistData" @close="closeCreatePharmacist" @save="createPharmacist"></edit-window-2>

    <div class="pharmacist-profile-container pages-scale" v-if="profile_Show">
            <div class="area1">
                <div class="content">
                    <div class="doctor-container">
                        <div class="title">
                            <div class="cross-box">
                                <div class="cross-row"></div>
                                <div class="cross-column"></div>
                            </div>
                            <span>藥師簡介</span>
                        </div>
                        <div class="information">
                            <div class="icon">
                                <a href="javascript:;"><img src="../../../upload/images/introduce_icon_1.png" alt="" /></a>
                                <a href="javascript:;"><img src="../../../upload/images/introduce_icon_2.png" alt="" /></a>
                                <a href="javascript:;"><img src="../../../upload/images/introduce_icon_3.png" alt="" /></a>
                            </div>
                            <div class="doctor-pic">
                                <img :src="'../../../upload/images/' + contentData.FileName" alt="" />
                                <div class="mask">
                                    <button type="button" @click="editContent('FileName')">編輯</button>
                                </div>
                            </div>
                            <div class="doctor-detail">
                                <div>
                                    <p style="color: #e84c2e">
                                        <span style="font-size: 36px">{{contentData.Name}}
                                            <div class="mask">
                                                <button type="button" @click="editContent('Name')">編輯</button>
                                            </div>
                                        </span>
                                        <span style="font-size: 24px"> {{contentData.Position}}
                                            <div class="mask">
                                                <button type="button" @click="editContent('Position')">編輯</button>
                                            </div>
                                        </span>
                                        <span style="font-size: 24px"> {{contentData.Pharmacy}}
                                            <div class="mask">
                                                <button type="button" @click="editContent('Pharmacy')">編輯</button>
                                            </div>
                                        </span>
                                    </p>
                                </div>
                                <ul>
                                    <li style="font-size: 20px" v-for="item in contentData.PositionList">{{item.Text}}
                                        <div class="mask">
                                            <button type="button" @click="editContent(item)">編輯</button>
                                            <button type="button" @click="deleteContent(item)">刪除</button>
                                        </div>
                                    </li>
                                </ul>
                                <ul>
                                    <li v-for="item in contentData.CertificationList">{{item.Text}}
                                        <div class="mask">
                                            <button type="button" @click="editContent(item)">編輯</button>
                                            <button type="button" @click="deleteContent(item)">刪除</button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="area2">
                <div class="content">
                    <div class="row-line"></div>
                </div>
            </div>

            <div class="area3">
                <div class="content">
                    <template v-for="item in contentData.ArticleList">
                        <div :class="{[item.TypeSetting]: true}">
                            <div class="img-box" v-if="item.TypeSetting === 'text1' || item.TypeSetting === 'text2'">
                                <img :src="'../../../upload/images/' + item.FileName" alt="" />
                            </div>
                            <p>
                                {{item.Text}}
                            </p>
                            <div class="mask">
                                <button type="button" @click="editContent(item)">編輯</button>
                                <button type="button" @click="deleteContent(item)">刪除</button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>


    <div class="window" v-if="Edit_Show" >
        <div class="box" v-if="articleType">
            <label>選擇圖文類型：</label>
            <select v-model="articleType" @change="articleTypeChange">
                <option value="text1">圖+文(上下)</option>
                <option value="text2">圖+文(左右)</option>
                <option value="text3">純文字</option>
            </select>
        </div>
        <div class="box" v-if="Edit_Img">
            <span>原本的圖片：</span>
            <img :src="'../../../upload/images/' + Edit_Before_Img" alt="" />
            <span>修改後圖片：</span>
            <img v-if = "selectedImage" :src="'../../../upload/images/' + Edit_After_Img " alt="" />
        </div>
        <div class="box" v-if="Edit_Img">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="box" v-if="Edit_Input">
            <span>{{Edit_Title}}</span>
            <input type="text" v-model="Edit_Text" />
        </div>
        <div class="box" v-if="Edit_Input2">
            <span>{{Edit_Title2}}</span>
            <input type="text" v-model="Edit_Text2" />
        </div>
        <div class="box" v-if="Edit_Input3">
            <span>{{Edit_Title3}}</span>
            <input type="text" v-model="Edit_Text3" />
        </div>
        <div class="box" v-if="Edit_Textarea">
            <span>{{Edit_Title}}</span>
            <textarea v-model="Edit_Text" />
        </div>
        <div class="button-box">
            <button type="button" @click="close">關閉</button>
            <button type="button" @click="save">儲存</button>
        </div>
    </div>




    <div class="btn" v-if="profile_Show">
        <button @click="clickCreateContent('position')">新增經歷</button>
        <button @click="clickCreateContent('certification')">新增認證</button>
        <button @click="clickCreateContent('article')">新增文章段落</button>
        <button @click=updateContent()>儲存變更</button>
        <button @click=editLink()>設置連結</button>
        <button @click=backToPharmacistPage()>返回</button>
    </div>

    <div class="alertWindow" v-if="showAlertWindow" >
        <div class="box">
            <span>確定要進行刪除嗎</span>
        </div>

        <div class="button-box">
            <button type="button" @click="deletePharmacist">是</button>
            <button type="button" @click="close">否</button>
        </div>
    </div>
    <div class="doneWindow" v-if="showDone" >
        <div class="box">
            <span>儲存成功</span>
        </div>
    </div>

    <edit-window v-if="showEditLinkWindow" :data="ediwLinkWindowData"  @close="closeEditWindow" @save="updateLink"></edit-window>
    <edit-window v-if="showEditPharmacistContentWindow" :data="contentWindowData"  @close="closeEditContentWindow" @save="saveContent"></edit-window>

`,
    //emits: [],
    props: {


    },
    setup(props, context) {
        //畫面調短
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".pharmacist-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.7}px;`);
            }, 100);
        };

        const pharmacistData = reactive([]);
        const regionData = reactive([]);

        const Edit_Show = ref(false);
        const Edit_Id = ref(0);
        const Edit_Region = ref(0)
        const Edit_Input = ref(false);
        const Edit_Input2 = ref(false);
        const Edit_Input3 = ref(false);
        const Edit_Img = ref(false);
        const Edit_Textarea = ref(false);
        const Edit_Title = ref("");
        const Edit_Title2 = ref("");
        const Edit_Title3 = ref("");
        const Edit_Text = ref("");
        const Edit_Text2 = ref("");
        const Edit_Text3 = ref("");
        const Edit_Before_Img = ref("");
        const Edit_After_Img = ref("");
        const selectedImage = ref(false);
        const editItem = ref("");

        const articleType = ref("");

        const getEditpharmacist = (item) => {
            initializeEditWindow();
            editWindowType.value = "edit";
            editItem.value = item;
            if (item === 'Name') {
                Edit_Input.value = true;
                Edit_Title.value = "藥師名稱："
                Edit_Text.value = pharmacistName.value;
            }
            if (item === 'Position') {
                Edit_Input.value = true;
                Edit_Title.value = "職位資訊："
                Edit_Text.value = pharmacistPosition.value;
            }
            if (item === 'Pharmacy') {
                Edit_Input.value = true;
                Edit_Title.value = "藥局資訊："
                Edit_Text.value = pharmacistPharmacy.value;
            }
            if (item === 'FileName') {
                Edit_Img.value = true;
                Edit_Before_Img.value = pharmacistFileName.value;
            }
            if (item.Area) {
                if (item.Area === 'position' || item.Area === 'certification') {
                    Edit_Input.value = true;
                    Edit_Title.value = "文字內容："
                    Edit_Text.value = item.Text;
                }
                if (item.Area === 'article') {
                    if (item.TypeSetting === 'text1' || item.TypeSetting === 'text2') {
                        articleType.value = item.TypeSetting;
                        Edit_Textarea.value = true;
                        Edit_Title.value = "文字內容";
                        Edit_Text.value = item.Text;
                        Edit_Img.value = true;
                        Edit_Before_Img.value = item.FileName;
                    }
                    if (item.TypeSetting === 'text3') {
                        articleType.value = item.TypeSetting;
                        Edit_Textarea.value = true;
                        Edit_Title.value = "文字內容";
                        Edit_Text.value = item.Text;
                    }
                }
            }


            Edit_Show.value = true;
        }
        const close = () => {
            Edit_Show.value = false;
            showAlertWindow.value = false;
        }
        const save = () => {
            if (editWindowType.value === "edit") {
                if (isStringEmpty(Edit_Text.value) && isStringEmpty(Edit_After_Img.value)) {
                    return
                }
                if (editItem.value === 'Name') {
                    pharmacistName.value = Edit_Text.value;
                    close();
                }
                if (editItem.value === 'Position') {
                    pharmacistPosition.value = Edit_Text.value;
                    close();
                }
                if (editItem.value === 'Pharmacy') {
                    pharmacistPharmacy.value = Edit_Text.value;
                    close();
                }
                if (editItem.value === 'FileName') {
                    if (selectedImage.value) {
                        pharmacistFileName.value = Edit_After_Img.value;
                    }
                        close();
                }
                if (editItem.value.Area) {
                    if (editItem.value.Area === 'position') {
                        let item = positionList.find(item => item.DisplayOrder === editItem.value.DisplayOrder)
                        item.Text = Edit_Text.value;
                    }
                    if (editItem.value.Area === 'certification') {
                        let item = certificationList.find(item => item.DisplayOrder === editItem.value.DisplayOrder)
                        item.Text = Edit_Text.value;
                    }
                    if (editItem.value.Area === 'article') {
                        let item = articleList.find(item => item.DisplayOrder === editItem.value.DisplayOrder)
                        item.TypeSetting = articleType.value;
                        if (item.TypeSetting === 'text1' || item.TypeSetting === 'text2') {
                            if (selectedImage.value) {
                                item.FileName = Edit_After_Img.value;
                            }
                            item.Text = Edit_Text.value;
                        }
                        if (item.TypeSetting === 'text3') {
                            item.Text = Edit_Text.value;
                            item.FileName = "";
                        }
                    }

                    close();
                }
            }
            if (editWindowType.value === "addPharmacist") {
                if (isStringEmpty(Edit_Text.value) || isStringEmpty(Edit_Text2.value) || isStringEmpty(Edit_Text3.value) || isStringEmpty(Edit_After_Img.value)){
                    return
                }
                const data = {
                    Region_Id: Edit_Region.value,
                    Name: Edit_Text.value,
                    Position: Edit_Text2.value,
                    Pharmacy: Edit_Text3.value,
                    FileName: selectedImage.value ? Edit_After_Img.value : Edit_Before_Img.value,
                    DisplayOrder: 0
                }
                WebApi.post("Pharmacist/Create_Data", data).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    close();
                    Get_pharmacistData();
                });
            }
            if (editWindowType.value === "addItem") {
                if (editItem.value.Area === "position") {
                    editItem.value.Pharmacist_Id = pharmacistId.value;
                    editItem.value.Text = Edit_Text.value;
                    editItem.value.DisplayOrder = positionList.length + 1,
                    positionList.push(editItem.value)
                }
                if (editItem.value.Area === "certification") {
                    editItem.value.Pharmacist_Id = pharmacistId.value;
                    editItem.value.Text = Edit_Text.value;
                    editItem.value.DisplayOrder = certificationList.length + 1,
                    certificationList.push(editItem.value)
                }
                if (editItem.value.Area === "article") {
                    if (selectedImage.value) {
                        editItem.value.FileName = Edit_After_Img.value;
                    }
                    editItem.value.Pharmacist_Id = pharmacistId.value;
                    editItem.value.Text = Edit_Text.value;
                    editItem.value.TypeSetting = articleType.value;
                    editItem.value.DisplayOrder = articleList.length + 1,
                        articleList.push(editItem.value);
                }
                close();
            }
        }
        const isStringEmpty = (string) => {
            if (string.length === 0) {
                return true
            }
            return false
        }
        const articleTypeChange = () => {
            if (articleType.value === "text1" || articleType.value === "text2") {
                Edit_Img.value = true;
            }
            if (articleType.value === "text3") {
                Edit_Img.value = false;
            }
        }
        const RegionButton = ref(1);
        const Get_pharmacistData = () => {
            pharmacistData.length = 0;
            regionData.length = 0;
            WebApi.get(`Pharmacist/Get_Pharmacist/${RegionButton.value}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }

                let pharmacistBox = []
                for (let pharmacist of result.data.Data.PharmacistList) {
                    if (pharmacistBox.length === 4) {
                        pharmacistData.push(pharmacistBox);
                        pharmacistBox = []
                    }
                    pharmacistBox.push(pharmacist)
                }
                pharmacistData.push(pharmacistBox);


                for (let region of result.data.Data.RegionList) {
                    regionData.push(region);
                }

            });
        };

        const switchRegion = (region) => {
            RegionButton.value = region;
            Get_pharmacistData();
        };

        //這邊開始圖片上傳
        const SelectFiles = (event) => {
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
                    Edit_After_Img.value = `${fileData.Name}.webp`
                    selectedImage.value = true;
                } else {
                    console.error("Error (create-small-files):", result.data.Message);
                }

            });
        };
        const editWindowType = ref("edit")

        const createNewPharmacist = () => {
            initializeEditWindow();
            Edit_Region.value = RegionButton.value;
            Edit_Input.value = true;
            Edit_Input2.value = true;
            Edit_Input3.value = true;
            Edit_Title.value = "藥師名稱：";
            Edit_Title2.value = "職位：";
            Edit_Title3.value = "藥局："
            Edit_Text.value = "";
            Edit_Text2.value = "";
            Edit_Text3.value = "";
            Edit_Img.value = true;
            Edit_Before_Img.value = "";
            editWindowType.value = "addPharmacist";

            Edit_Show.value = true;
        }
        const deletePharmacist = () => {
            const deleteData = { Id: deletePharmacistId.value }
            WebApi.post("Pharmacist/Delete_Data/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                Get_pharmacistData();
            });
        }
        const clickDeletePharmacist = (id) => {
            deletePharmacistId.value = id;
            showAlertWindow.value = true;
        }


        const profile_Show = ref(false);
        const pharmacistId = ref(0);
        const pharmacistName = ref("");
        const pharmacistFileName = ref("");
        const pharmacistPosition = ref("");
        const pharmacistPharmacy = ref("");

        const positionList = reactive([]);
        const certificationList = reactive([]);
        const articleList = reactive([]);

        const getPharmacistProfile = (id) => {
            WebApi.get(`Pharmacist/Get_Profile/${id}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                pharmacistId.value = result.data.Data.Pharmacist.Id;
                pharmacistName.value = result.data.Data.Pharmacist.Name;
                pharmacistFileName.value = result.data.Data.Pharmacist.FileName;
                pharmacistPosition.value = result.data.Data.Pharmacist.Position;
                pharmacistPharmacy.value = result.data.Data.Pharmacist.Pharmacy;

                positionList.length = 0;
                certificationList.length = 0;
                articleList.length = 0;

                for (let item of result.data.Data.PharmacistProfile) {
                    if (item.Area === "position") {
                        positionList.push(item);
                    }
                    if (item.Area === "certification") {
                        certificationList.push(item);
                    }
                    if (item.Area === "article") {
                        articleList.push(item);
                    }
                }

                //
                contentData.Id = result.data.Data.Pharmacist.Id;
                contentData.Name = result.data.Data.Pharmacist.Name;
                contentData.Position = result.data.Data.Pharmacist.Position;
                contentData.Pharmacy = result.data.Data.Pharmacist.Pharmacy;
                contentData.FileName = result.data.Data.Pharmacist.FileName;
                contentData.PositionList.length = 0;
                contentData.CertificationList.length = 0;
                contentData.ArticleList.length = 0;
                for (let item of result.data.Data.PharmacistProfile) {
                    if (item.Area === "position") {
                        contentData.PositionList.push(item);
                    }
                    if (item.Area === "certification") {
                        contentData.CertificationList.push(item);
                    }
                    if (item.Area === "article") {
                        contentData.ArticleList.push(item);
                    }
                }
                //
                profile_Show.value = true;
            });
        }

        const createNewItem = (area) => {
            editWindowType.value = "addItem";
            initializeEditWindow();
            if (area === 'position' || area === 'certification') {
                Edit_Input.value = true;
                Edit_Title.value = "文字內容：";
                Edit_Text.value = "";
                editItem.value.Area = area;
                Edit_Show.value = true;
            }
            if (area === 'article') {
                articleType.value = "text1";
                Edit_Textarea.value = true;
                Edit_Title.value = "文字內容：";
                Edit_Text.value = "";
                Edit_Img.value = true;
                editItem.value.Area = area;
                Edit_Show.value = true;

            }



        }

        const deleteProfile = (item) => {
            if (item.Area === "position") {
                const indexToDelete = positionList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                positionList.splice(indexToDelete, 1);
                positionList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
            if (item.Area === "certification") {
                const indexToDelete = certificationList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                certificationList.splice(indexToDelete, 1);
                certificationList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
            if (item.Area === "article") {
                const indexToDelete = articleList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                articleList.splice(indexToDelete, 1);
                articleList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
        }

        const updateProfile = () => {
            let PharmacistProfile = positionList.concat(certificationList).concat(articleList)
            const updateData = {
                Id: pharmacistId.value,
                Name: pharmacistName.value,
                FileName: pharmacistFileName.value,
                Position: pharmacistPosition.value,
                Pharmacy: pharmacistPharmacy.value,
                PharmacistProfile
            }
            WebApi.post("Pharmacist/Update_Profile/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }

        const backToPharmacistPage = () => {
            Get_pharmacistData();
            profile_Show.value = false;
        }

        const initializeEditWindow = () => {
            selectedImage.value = false;
            Edit_Input.value = false;
            Edit_Input2.value = false;
            Edit_Input3.value = false;
            Edit_Img.value = false;
            Edit_Textarea.value = false;
            selectedImage.value = false;
            Edit_Text.value = "";
            Edit_Text2.value = "";
            Edit_Before_Img.value = "";
            Edit_After_Img.value = "";
            articleType.value = "";
            editItem.value = {};
        }


        const Edit_Region_Show = ref(false);
        const pharmacistId_forRegion = ref(0);
        const regionId = ref(0);

        const changeRegion = (pharmacist) => {
            pharmacistId_forRegion.value = pharmacist.Id;
            regionId.value = pharmacist.Region_Id;
            Edit_Region_Show.value = true;
        }
        const closeChangeRegion = () => {
            Edit_Region_Show.value = false;
        }
        const saveChangeRegion = () => {
            //
            const data = {
                Id: pharmacistId_forRegion.value,
                Region_Id: regionId.value
            }
            WebApi.post("Pharmacist/UpdatePharmacistRegion", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeChangeRegion();
                Get_pharmacistData();
            });
        }
        
        const showAlertWindow = ref(false);
        const deletePharmacistId = ref(0);

        const showDone = ref(false);
        const updateSuccess = () => {
            showDone.value = true;
            setTimeout(() => {
                showDone.value = false;
            },1000)
        }

        const showEditLinkWindow = ref(false);
        const ediwLinkWindowData = reactive({
            table: [],
            img: {
                required: false
            },
            option: false,
            allowEmpty: true,
        });
        const closeEditWindow = () => {
            showEditLinkWindow.value = false;
        }
        const updateLink = (data) => {
            const updateData = {
                Id: pharmacistId.value,
                PharmacistLink: {
                    Link1: data.table[0].content,
                    Link2: data.table[1].content,
                    Link3: data.table[2].content,
                }
            }
            WebApi.post("Pharmacist/Update_Link", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeEditWindow();
            });
        }
        const editLink = () => {
            WebApi.get(`Pharmacist/Get_Link/${pharmacistId.value}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(reuslt.data.Message);
                    return;
                }
                ediwLinkWindowData.table = [
                    {
                        name: "ＦＢ圖示：",
                        content: result.data.Data.Link1,
                        type: "text",
                        show: true,
                    },
                    {
                        name: "地圖圖示：",
                        content: result.data.Data.Link2,
                        type: "text",
                        show: true,
                    },
                    {
                        name: "網站圖示：",
                        content: result.data.Data.Link3,
                        type: "text",
                        show: true,
                    }
                ]
                showEditLinkWindow.img = {
                    required: false
                }
                showEditLinkWindow.value = true;
            })
        }

        const showEditPharmacistContentWindow = ref(false);
        const closeEditContentWindow = () => {
            showEditPharmacistContentWindow.value = false;
        }
        const contentData = reactive({
            Id: 0,
            Name: "",
            Position: "",
            Pharmacy: "",
            FileName: "",
            PositionList: [],
            CertificationList: [],
            ArticleList: [],

        });
        const contentWindowData = reactive({
            table: [],
            img: {
                required: false
            },
            option: false,
            typeSetting: "",
            area: "",
        });
        const editContent = (content) => {
            if (content === "Name") {
                contentWindowData.table = [
                    {
                        name: "標題：",
                        content: contentData.Name,
                        type: "text",
                        show: true
                    }
                ]
                contentWindowData.img = {
                    required: false
                }
                contentWindowData.option = false;
                contentWindowData.area = "Name";
            }
            else if (content === "Position") {
                contentWindowData.table = [
                    {
                        name: "職位：",
                        content: contentData.Position,
                        type: "text",
                        show: true
                    }
                ]
                contentWindowData.img = {
                    required: false
                }
                contentWindowData.option = false;
                contentWindowData.area = "Position";

            }
            else if (content === "Pharmacy") {
                contentWindowData.table = [
                    {
                        name: "藥局：",
                        content: contentData.Pharmacy,
                        type: "text",
                        show: true
                    }
                ]
                contentWindowData.img = {
                    required: false
                }
                contentWindowData.option = false;
                contentWindowData.area = "Pharmacy";

            }
            else if (content === "FileName") {
                contentWindowData.table = [];
                contentWindowData.img = {
                    required: true,
                    content: contentData.FileName
                }
                contentWindowData.option = false;
                contentWindowData.area = "FileName";

            }
            else {
                if (content.Area === "position" || content.Area === "certification") {
                    contentWindowData.table = [
                        {
                            name: "內容：",
                            content: content.Text,
                            type: "text",
                            show: true
                        }
                    ]
                    contentWindowData.img = {
                        required: false
                    }
                    contentWindowData.option = false;
                }
                if (content.Area === "article") {
                    if (content.TypeSetting === "text1" || content.TypeSetting === "text2") {
                        contentWindowData.table = [
                            {
                                name: "內容",
                                content: content.Text,
                                type: "textarea",
                                show: true,
                            }
                        ];
                        contentWindowData.img = {
                            required: true,
                            content: content.FileName
                        }
                    }
                    else if (content.TypeSetting === "text3") {
                        contentWindowData.table = [
                            {
                                name: "內容",
                                content: content.Text,
                                type: "textarea",
                                show: true
                            }
                        ];
                        contentWindowData.img = {
                            required: false,
                            content: "",
                        }
                    }
                    contentWindowData.option = [
                        {
                            name: "圖+文(上下)",
                            content: "text1",
                        },
                        {
                            name: "圖+文(左右)",
                            content: "text2",
                        },
                        {
                            name: "純文字",
                            content: "text3",
                        },
                    ];
                    contentWindowData.typeSetting = content.TypeSetting;
                }
                contentWindowData.displayOrder = content.DisplayOrder;
                contentWindowData.area = content.Area;
            }
            showEditPharmacistContentWindow.value = true;
        }

        const clickCreateContent = (area) => {
            if (area === "position" || area === "certification") {
                contentWindowData.table = [
                    {
                        name: "內容：",
                        content: "",
                        type: "text",
                        show: true
                    }
                ];
                contentWindowData.img = {
                    required: false,
                    content: "",
                }
                contentWindowData.option = false;
            }
            if (area === "article") {
                contentWindowData.table = [
                    {
                        name: "內容：",
                        content: "",
                        type: "textarea",
                        show: true
                    }
                ];
                contentWindowData.img = {
                    required: true,
                    content: "",
                }
                contentWindowData.option = [
                    {
                        name: "圖+文(上下)",
                        content: "text1",
                    },
                    {
                        name: "圖+文(左右)",
                        content: "text2",
                    },
                    {
                        name: "純文字",
                        content: "text3",
                    },
                ];
                contentWindowData.typeSetting = "text1";
            }
            contentWindowData.displayOrder = 0;
            contentWindowData.area = area;
            showEditPharmacistContentWindow.value = true;
        }

        const saveContent = (data) => {
            if (data.area === "Name") {
                contentData.Name = data.table[0].content;
            }
            if (data.area === "Position") {
                contentData.Position = data.table[0].content;
            }
            if (data.area === "Pharmacy") {
                contentData.Pharmacy = data.table[0].content;
            }
            if (data.area === "FileName") {
                contentData.FileName = data.img.content;
            }
            if (data.area === "position") {
                if (!data.displayOrder) {
                    const content = {
                        DisplayOrder: contentData.PositionList.length + 1,
                        Text: data.table[0].content,
                        FileName: data.img.content,
                        TypeSetting: data.typeSetting,
                        Area: data.area,
                    }
                    contentData.PositionList.push(content)
                }
                if (data.displayOrder) {
                    const content = contentData.PositionList.find(item => item.DisplayOrder === data.displayOrder)
                    content.Text = data.table[0].content;
                    content.FileName = data.img.content;
                    content.TypeSetting = data.typeSetting;
                }
            }
            if (data.area === "certification") {
                if (!data.displayOrder) {
                    const content = {
                        DisplayOrder: contentData.CertificationList.length + 1,
                        Text: data.table[0].content,
                        FileName: data.img.content,
                        TypeSetting: data.typeSetting,
                        Area: data.area,
                    }
                    contentData.CertificationList.push(content)
                }
                if (data.displayOrder) {
                    const content = contentData.CertificationList.find(item => item.DisplayOrder === data.displayOrder)
                    content.Text = data.table[0].content;
                    content.FileName = data.img.content;
                    content.TypeSetting = data.typeSetting;
                }
            }
            if (data.area === "article") {
                if (!data.displayOrder) {
                    const content = {
                        DisplayOrder: contentData.ArticleList.length + 1,
                        Text: data.table[0].content,
                        FileName: data.img.content,
                        TypeSetting: data.typeSetting,
                        Area: data.area,
                    }
                    contentData.ArticleList.push(content)
                }
                if (data.displayOrder) {
                    const content = contentData.ArticleList.find(item => item.DisplayOrder === data.displayOrder)
                    content.Text = data.table[0].content;
                    content.FileName = data.img.content;
                    content.TypeSetting = data.typeSetting;
                }
            }
            closeEditContentWindow();
        }
        const deleteContent = (item) => {
            if (item.Area === "position") {
                const indexToDelete = contentData.PositionList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                contentData.PositionList.splice(indexToDelete, 1);
                contentData.PositionList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
            if (item.Area === "certification") {
                const indexToDelete = contentData.CertificationList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                contentData.CertificationList.splice(indexToDelete, 1);
                contentData.CertificationList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
            if (item.Area === "article") {
                const indexToDelete = contentData.ArticleList.findIndex(_item => _item.DisplayOrder === item.DisplayOrder);
                contentData.ArticleList.splice(indexToDelete, 1);
                contentData.ArticleList.forEach((item, index) => {
                    item.DisplayOrder = index + 1;
                });
            }
        }
        const updateContent = () => {
            let PharmacistProfile = contentData.PositionList.concat(contentData.CertificationList).concat(contentData.ArticleList)
            const updateData = {
                Id: contentData.Id,
                Name: contentData.Name,
                FileName: contentData.FileName,
                Position: contentData.Position,
                Pharmacy: contentData.Pharmacy,
                PharmacistProfile
            }
            WebApi.post("Pharmacist/Update_Profile/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }

        const showCreatePharmacist = ref(false);
        const createPharmacistData = reactive({
            table:[
                {
                    name: "藥師圖片：",
                    content: "",
                    type: "img"
                },
                {
                    name: "藥師名稱：",
                    content: "",
                    type: "text"
                },
                {
                    name: "職位：",
                    content: "",
                    type: "text"
                },
                {
                    name: "藥局：",
                    content: "",
                    type: "text"
                }
            ]
        })
        const clickCreatePharmacist = () => {
            createPharmacistData.table.forEach(item => item.content = "");
            createPharmacistData.regionId = RegionButton.value;
            showCreatePharmacist.value = true;
        }
        const closeCreatePharmacist = () => {
            showCreatePharmacist.value = false;
        }
        const createPharmacist = (data) => {
            if (data.table[0].content.length === 0 || data.table[1].content.length === 0 || data.table[2].content.length === 0 || data.table[3].content.length === 0)return
            const createData = {
                Region_Id: data.regionId,
                Name: data.table[1].content,
                Position: data.table[2].content,
                Pharmacy: data.table[3].content,
                FileName: data.table[0].content,
                DisplayOrder: 0
            }
            WebApi.post("Pharmacist/Create_Data", createData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeCreatePharmacist();
                Get_pharmacistData();
            });
        }
        

        onMounted(() => {
            Get_pharmacistData();
            Page_Setting();
        });

        return {
            pharmacistData,
            Edit_Show,
            Edit_Region,
            Edit_Input,
            Edit_Input2,
            Edit_Input3,
            Edit_Img,
            Edit_Textarea,
            Edit_Title,
            Edit_Title2,
            Edit_Title3,
            Edit_Text,
            Edit_Text2,
            Edit_Text3,
            Edit_Before_Img,
            Edit_After_Img,
            selectedImage,

            getEditpharmacist,
            close,
            save,
            switchRegion,
            RegionButton,

            SelectFiles,

            createNewPharmacist,
            editWindowType,
            deletePharmacist,

            profile_Show,
            getPharmacistProfile,

            pharmacistId,
            pharmacistName,
            pharmacistFileName,
            pharmacistPosition,
            pharmacistPharmacy,
            positionList,
            certificationList,
            articleList,

            createNewItem,
            deleteProfile,
            updateProfile,

            backToPharmacistPage,

            articleType,
            articleTypeChange,

            Edit_Region_Show,
            pharmacistId_forRegion,
            regionId,
            regionData,
            changeRegion,
            closeChangeRegion,
            saveChangeRegion,

            clickDeletePharmacist,
            showAlertWindow,
            deletePharmacistId,

            showDone,

            showEditLinkWindow,
            ediwLinkWindowData,
            closeEditWindow,
            updateLink,
            editLink,

            showEditPharmacistContentWindow,
            contentData,
            contentWindowData,
            closeEditContentWindow,
            editContent,
            saveContent,
            clickCreateContent,
            deleteContent,
            updateContent,

            showCreatePharmacist,
            createPharmacistData,
            clickCreatePharmacist,
            closeCreatePharmacist,
            createPharmacist,
        };
    },
    components: {
        "edit-window": editWindow,
        "edit-window-2": editWindow2,

    }
};
