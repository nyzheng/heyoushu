
const { ref, reactive, computed, defineAsyncComponent, watch } = Vue;

import { WebApi } from "../shared/shared.js";

export default {
    template: `
<div class="images-manage">
    <div class="area1">
        <div class="content">
            <div class="item" @dragover="DragOver($event)" @dragleave="DragLeave($event)" @drop="Drop($event)">
                <template v-for="item in TabData" :key="item.Id">
                    <div class="tab" v-if="item.Enabled" :class="{ active: item.Show }" :style="item.Style" @click="TabChange(item.Id)">
                        <span>{{ item.Name }}</span>
                    </div>
                </template>

                <div class="item" v-if="TabIndex === 1">
                    <span>請將圖片拖曳至這裡</span>
                    <div class="item">
                        <label class="btn_save item">
                            <span>從電腦中選取圖片</span>
                            <input type="file" v-if="Enabled.Imgs && Enabled.Files && Enabled.Videos" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-zip-compressed,application/zip,application/vnd.rar,video/mp4" multiple="multiple" style="display: none;" @change="SelectFiles($event)" />
                            <input type="file" v-if="Enabled.Imgs && Enabled.Files && !Enabled.Videos" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-zip-compressed,application/zip,application/vnd.rar" multiple="multiple" style="display: none;" @change="SelectFiles($event)" />
                            <input type="file" v-else-if="Enabled.Imgs && !Enabled.Files && !Enabled.Videos" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" multiple="multiple" style="display: none;" @change="SelectFiles($event)" />
                            <input type="file" v-else-if="!Enabled.Imgs && Enabled.Files && !Enabled.Videos" accept="text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-zip-compressed,application/zip,application/vnd.rar" multiple="multiple" style="display: none;" @change="SelectFiles($event)" />
                            <input type="file" v-else-if="!Enabled.Imgs && !Enabled.Files && Enabled.Videos" accept="video/mp4" multiple="multiple" style="display: none;" @change="SelectFiles($event)" />
                        </label>
                        <div class="btn_save item" @click="TabChange(2)">
                            <span>從圖庫中選取圖片</span>
                        </div>
                    </div>
                    <span>圖片大小上限：2MB</span>
                    <div class="file-error" v-if="ErrorShow">
                        <span>您的檔案 {{ ErrorInfo }}</span>
                        <span v-if="Enabled.Imgs">圖片類型：webp、jpg、png、svg、ico、gif</span>
                        <span v-if="Enabled.Files">檔案類型：txt、pdf、doc、docx、xls、xlsx、zip、rar</span>
                        <span v-if="Enabled.Videos">影片類型：mp4</span>
                    </div>
                </div>

                <template v-if="Enabled.Imgs && TabIndex === 2">
                    <div class="search-box">
                        <input class="search-input" type="text" v-model.lazy="SearchText_Imgs" v-debounceInput="500" @blur="SearchText_Imgs = $event.target.value" @keyup.enter="SearchImages" />
                        <i class="fa-solid fa-magnifying-glass" @click.self="SearchImages"></i>
                    </div>
                    
                    <div class="item2">
                        <div class="pic" v-for="item in ImgList" :key="item.Id" :title="item.FileName" @click.self="SelectImg(item.Id)">
                            <div class="zoompic_img">
                                <img v-lazy="'../upload/images/' + item.FileName" @click="SelectImg(item.Id)" @contextmenu.prevent="openMenu($event, item.Id, 'img')" />
                            </div>
                            <span>{{ item.FileName }}</span>
                            <zoompic :show="ZoomPic_GetShow(item.Id)" :my-id="item.Id" :img-src="'../upload/images/' + item.FileName" :info="item.FileName" @update="ZoomPic_Change"></zoompic>
                        </div>
                    </div>

                    <div class="pagination-bar">
                        <div class="item prev" @click="PrevNextPage(-1)"><i class="fa-solid fa-chevron-left"></i></div>
                        <div class="item next" @click="PrevNextPage(1)"><i class="fa-solid fa-chevron-right"></i></div>
                        <div class="item"><input type="text" v-model="JumpNum" @blur="JumpNum = $event.target.value" @input="ChangePagination" @keyup.enter="JumpPage" /></div>
                        <div class="item btn" @click="JumpPage"><span>確定</span></div>
                    </div>
                </template>


                <div class="file-progress" v-if="ProgressShow">
                    <div class="file-box">
                        <div class="item" v-for="item in UploadFiles" :key="item.Id">
                            <span :title="item.Name + '.' + item.Extension">{{ item.Name }}.{{ item.OldExtension }}{{ item.Type === 'img' ? ' (' + item.Extension + ')' : '' }}</span>
                            <div class="bar">
                                <div class="not-progress"></div>
                                <div class="progress" :style="{ width: item.Percent }"></div>
                                <span>{{ Change_Percent(item.Id) }}</span>
                            </div>
                            <div class="loader">
                                <template v-if="item.State === 1">
                                    <p>狀態：轉換webp格式中...</p>
                                </template>
                                <template v-else-if="item.State === 2">
                                    <p>狀態：上傳中...</p>
                                </template>
                                <template v-else-if="item.State === 3">
                                    <p>狀態：<i class="fa-solid fa-check"></i></p>
                                </template>
                                <template v-else>
                                    <p>狀態：排隊中...</p>
                                </template>
                                <div class="icon-loading" v-show="item.State === 1"></div>
                            </div>
                        </div>
                    </div>
                    <div class="btn-box">
                        <button class="btn_save" type="button" v-show="ProgressCloseShow" @click="ProgressClose">關閉</button>
                    </div>
                </div>
            </div>
            
            <div class="mask-div" v-show="MaskShow"></div>
        </div>
    </div>

    <div class="menu-context" ref="MenuContext" :class="{ 'hidden': MenuContext_Hidden }" :style="MenuContext_PositionAdd && MenuContext_Position" v-show="MenuContext_Show">
        <div class="item" v-for="(item, index) of MenuContext_Data" :key="index" @click="item.FnClick(item.FnName)">{{ item.FnName }}</div>
    </div>

    <div class="finish-info-box" v-show="Show_Finish_Info_Box">
        <span>操作已成功完成</span>
    </div>
</div>
`,
    emits: ["update"],
    props: {
        "enabled": { type: Object, default: { Imgs: true, Select: false } },
    },
    setup(props, context) {
        const Enabled = props.enabled;

        const UploadFiles = reactive([]);
        const ProgressShow = ref(false); // 進度條
        const ProgressCloseShow = ref(false);
        const ErrorShow = ref(false);
        const ErrorInfo = ref("");
        const MaskShow = ref(false);

        const ImgList = reactive([]);
        const SearchText_Imgs = ref("");



        const CurrentPage = ref(1); // 當前頁面-每頁30
        const JumpNum = ref(1); // 跳轉頁面

        const ImgArray = reactive([]);

        //一些工具function

        const stripScript = (val) => {
            //let pattern = /[`~!@#$%^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？]/g; // 完整
            let pattern = /[`~#$%^&()=|{}':;',\\\[\]\<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？]/g; // ! @ . *
            return val.replace(pattern, "");
        }
        function GetWebpFile(file, Name) {
            return new Promise((resolve, reject) => {
                let worker = new Worker("./components/to-webp/to-webp-processs.js");
                worker.onmessage = ({ data }) => { // 接收Worker線程傳來的base64
                    resolve(data);
                };
                worker.postMessage({ file, Name });
            });
        };


        // 讀取 圖片 Start
        const GetImgs = (num) => {
            ImgList.length = 0;
            WebApi.post("Files/GetImgs", { Num: num }).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }

                for (let item of result.data.Data) {
                    ZoomPic_Shows.push({ Id: item.Id, Show: false });
                    ImgList.push(item);
                }

                ImgList.length > 0 && (CurrentPage.value = parseInt(JumpNum.value));
            });
        };

        const SearchImages = () => {
            if (SearchText_Imgs.value !== "") {
                ImgList.length = 0;
                WebApi.post("Files/SearchImages", { Text: stripScript(SearchText_Imgs.value) }).then((result) => { // 過濾特殊字元符號
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }

                    for (let item of result.data.Data) {
                        ZoomPic_Shows.push({ Id: item.Id, Show: false });
                        ImgList.push(item);
                    }

                    CurrentPage.value = JumpNum.value = 1;
                });
            } else {
                CurrentPage.value = JumpNum.value = 1;
                GetImgs(JumpNum.value);
            }
        };
        // 讀取 圖片 End

        
        const Upload_Info = {
            "No_Extension": "(沒有副檔名)",
            "Invalid_Type": "(不支持上傳該類型的檔案)",
            "Size_Error": "(超過2MB)"
        };

        const Allowed_Type = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/x-icon": "ico",
            "image/svg+xml": "svg",
            "image/webp": "webp",
            "image/gif": "gif",
        };

        const SetUploadErrorInfo = (name, info) => {
            UploadFiles.length = 0;
            MaskShow.value = false;
            ProgressShow.value = false;
            ErrorInfo.value = `${name} ${Upload_Info[info]}`;
            ErrorShow.value = true;
        };

        const Change_Percent = computed(() => (MyId) => {
            return UploadFiles.find(x => x.Id === MyId).Percent;
        });

        const ImageToBase64 = async (files) => {
            if (files.length > 0) {
                UploadFiles.length = 0;
                MaskShow.value = true;
                ProgressShow.value = true;
                ErrorShow.value = false;

                for (let file of files) {
                    let extIndex = file.name.lastIndexOf(".");

                    if (extIndex === -1) {
                        SetUploadErrorInfo(file.name, "No_Extension");
                        return;
                    }

                    let ext = file.name.split(".").pop().toLowerCase();
                    console.log(file.type)
                    if (!Allowed_Type[file.type]) {
                        SetUploadErrorInfo(file.name, "Invalid_Type");
                        return;
                    }

                    let Name = file.name.substr(0, extIndex), Type, Extension;

                    if (ext === "jpg" || ext === "jpeg" || ext === "jfif" || ext === "png" || ext === "ico" || ext === "webp") { // svg、gif 不轉換
                        Type = "img";
                        Extension = "webp";
                    }

                    if (file.size > 2097152) { // 2MB
                        SetUploadErrorInfo(file.name, "Size_Error");
                        return;
                    }

                    Name = Name.replace("(", "-").replace(")", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "");

                    let newId = UploadFiles.length > 0 ? (Math.max(...UploadFiles.map(x => x.Id)) + 1) : 1;
                    UploadFiles.push({ Id: newId, MyFile: file, Name, OldExtension: ext, Extension, Size: file.size, Type, Part: [], State: 0, Percent: "0%" });
                }

                if (UploadFiles.length > 0) {
                    for (let file of UploadFiles) {
                        const UploadFilesAsync = async () => {
                            if (file.Type === "Img") {
                                file.State = 1;
                                let newFile = await GetWebpFile(file.MyFile, `${file.Name}.${file.Extension}`);
                                file.MyFile = newFile;
                                file.Size = newFile.size;
                            }

                            if (file.Size <= 102400) { // 100kb
                                file.State = 2;

                                let formData = new FormData();
                                formData.append("data", file.MyFile);
                                formData.append("fileName", `${file.Name}.${file.Extension}`);

                                WebApi.post("Files/CreateSmall", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((result) => {
                                    if (result.data.HttpCode === 200) {
                                        file.Percent = "100%";
                                        file.State = 3;
                                    } else {
                                        console.error("Error (create-small-files):", result.data.Message);
                                    }
                                });
                            } else { // 大於100kb
                                let total = 100;  // 總數
                                let shardSize = Math.floor(file.Size / total); // 無條件捨去

                                for (let i = 0; i < total; i++) {
                                    let start = i * shardSize; // 起始位置
                                    let end = start + shardSize; // 結束位置
                                    let Data;

                                    i === total - 1 ? Data = file.MyFile.slice(start) : Data = file.MyFile.slice(start, end);
                                    file.Part.push({ Index: i + 1, Data });
                                }

                                file.State = 2;

                                let serviceList = ref([]);
                                let FilePercent = 0;

                                const asyncfun = async (formData) => {
                                    return await new Promise((resolve, reject) => {
                                        WebApi.post("Files/Upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((result) => {
                                            if (result.data.HttpCode === 200) {
                                                FilePercent++;
                                                file.Percent = FilePercent + "%";
                                                resolve();
                                            } else {
                                                console.error("Error (upload-files):", result.data.Message);
                                            }
                                        });
                                    });
                                };

                                for (let part of file.Part) {
                                    let formData = new FormData();
                                    formData.append("data", part.Data);
                                    formData.append("fileName", `${file.Name}.${file.Extension}`);
                                    formData.append("index", part.Index);
                                    serviceList.value.push(await asyncfun(formData));
                                }

                                await Promise.all(serviceList.value).then(async () => {
                                    await WebApi.post("Files/Create", { fileName: `${file.Name}.${file.Extension}` }).then((result) => {
                                        result.data.HttpCode === 200 && (file.State = 3) || console.error("Error (create-files):", result.data.Message);
                                    });
                                });
                            }

                            ImgArray.push(`${file.Name}.${file.Extension}`);
                        };

                        await UploadFilesAsync();
                    }

                    if (Enabled.Select) {
                        setTimeout(() => {
                            ProgressClose();
                        }, 1000);
                    } else {
                        ProgressCloseShow.value = true;
                    }
                }
            }
        };

        const ProgressClose = () => {
            ProgressShow.value = false;
            UploadFiles.length = 0;
            ProgressCloseShow.value = false;
            MaskShow.value = false;
            ErrorInfo.value = "";
            ErrorShow.value = false;

            if (Enabled.Select) {
                ImgArray.length > 0 && context.emit("update", ImgArray[0]);
            }
        };

        const SelectFiles = (event) => {
            event.target.files.length <= 0 ? event.target.value = "" : ImageToBase64(event.target.files);
        };

        // 拖曳上傳 Start
        const cancelDefault = (event) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件
        };

        const DragOver = (event) => { // 滑鼠在拖曳狀態下，滑鼠指標在目標物件上時由目標物件觸發
            cancelDefault(event);
            event.target.classList.add("drag-hover");
        };

        const DragLeave = (event) => { // 滑鼠在拖曳狀態下，滑鼠指標在離開目標物件時由目標物件觸發
            event.target.classList.remove("drag-hover");
        };

        const Drop = (event) => { // 滑鼠在拖曳狀態下，在目標物件上放開滑鼠按鈕時，由目標物件觸發
            cancelDefault(event);
            ImageToBase64(event.dataTransfer.files); // 由DataTransfer物件的files屬性取得檔案物件
            event.target.classList.remove("drag-hover");
        };
        // 拖曳上傳 End

        // 放大圖片 Start
        const ZoomPic_Shows = reactive([]);

        const ZoomPic_Open = () => {
            let index = ZoomPic_Shows.findIndex(item => item.Id === MenuContext_Id.value);
            ZoomPic_Shows[index].Show = true;
        };

        const ZoomPic_GetShow = computed(() => (val) => {
            return ZoomPic_Shows.filter(item => item.Id === val)[0].Show;
        });

        const ZoomPic_Change = (MyId, val) => {
            let index = ZoomPic_Shows.findIndex(item => item.Id === MyId);
            ZoomPic_Shows[index].Show = val;
        };
        // 放大圖片 End

        const Show_Finish_Info_Box = ref(false);

        const Delete = (type) => {
            if (MenuContext_Id.value > 0) {
                let Data;

                if (type === "img") {
                    Data = ImgList.find(x => x.Id === MenuContext_Id.value);
                } 

                WebApi.post("Files/DeleteFile", { FileName: Data.FileName }).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }

                    type === "img" && GetImgs(CurrentPage.value);

                    Show_Finish_Info_Box.value = true;
                    setTimeout(() => {
                        Show_Finish_Info_Box.value = false;
                    }, 1500);
                });
            }
        };

        // 刪除圖片 Start
        const DeleteImage = () => {
            Delete("img");
        };
        // 刪除圖片 End
        

        // 滑鼠右鍵選單 Start
        const MenuContext = ref(null);
        const MenuContext_Show = ref(false);
        const MenuContext_Hidden = ref(true); // 隱藏
        const MenuContext_Data = reactive([]);
        const MenuContext_Id = ref(0);
        const MenuContext_Position = ref({});
        const MenuContext_PositionAdd = ref(false);
        const LeftOrRight = ref("left");
        const TopOrBottom = ref("top");

        const closeMenu = () => {
            MenuContext_Show.value = false;
            MenuContext_Hidden.value = true; // 隱藏
            MenuContext_PositionAdd.value = false;
            MenuContext.value && (MenuContext.value.style = "");
        };

        const openMenu = (event, MyId, type) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件

            closeMenu();

            let PageLocking = false;
            MenuContext_Id.value = MyId;
            MenuContext_Show.value = true;
            MenuContext_Data.length = 0;

            if (type === "img") {
                MenuContext_Data.push({ FnName: "檢視圖片", FnClick: ZoomPic_Open });
                MenuContext_Data.push({ FnName: "刪除圖片", FnClick: DeleteImage });
            }

            setTimeout(() => {
                if (!PageLocking) {
                    let OffsetWidth = MenuContext.value.offsetWidth;
                    let OffsetHeight = MenuContext.value.offsetHeight;
                    LeftOrRight.value = window.innerWidth - (event.clientX + OffsetWidth) > 0 ? "left" : "right";
                    TopOrBottom.value = window.innerHeight - (event.clientY + OffsetHeight) > 0 ? "top" : "bottom";

                    for (let key in MenuContext_Position.value) {
                        delete MenuContext_Position.value[key];
                    }

                    MenuContext_Position.value[TopOrBottom.value] = TopOrBottom.value === "bottom" ? "2px" : `${event.clientY}px`;
                    MenuContext_Position.value[LeftOrRight.value] = LeftOrRight.value === "left" ? `${event.clientX + 2}px` : "2px";

                    MenuContext_PositionAdd.value = true;
                    MenuContext_Hidden.value = false; // 顯示
                }
            }, 100);
        };

        watch(() => [MenuContext_Show.value], () => {
            if (MenuContext_Show.value) document.addEventListener("click", closeMenu); else document.removeEventListener("click", closeMenu);
        });
        // 滑鼠右鍵選單 End

        const SelectImg = (MyId) => {
            if (Enabled.Select) {
                let Name = ImgList.filter(item => item.Id === MyId)[0].FileName;
                context.emit("update", Name);
            }
        };

        const ChangePagination = () => {
            if (JumpNum.value !== "") {
                let RegStr = /^\d+$/; // (正規表達式) 只能輸入數字，字數不限
                (!RegStr.test(JumpNum.value)) ? (JumpNum.value = CurrentPage.value) : parseInt(JumpNum.value) <= 0 && (JumpNum.value = CurrentPage.value);
            }
        };

        const PrevNextPage = (num) => {
            ImgList.length <= 0 ? GetImgs(JumpNum.value = CurrentPage.value) : CurrentPage.value + num > 0 ? GetImgs(JumpNum.value = CurrentPage.value + num) : GetImgs(JumpNum.value = CurrentPage.value);
        };

        const JumpPage = () => {
            JumpNum.value = parseInt(JumpNum.value);
            (JumpNum.value > 0 && JumpNum.value !== CurrentPage.value) && GetImgs(JumpNum.value);
        };

        // 設定頁籤 Start
        const TabData = reactive([
            { Id: 1, Name: "上傳圖片", Enabled: true, Show: true, Style: {} },
            { Id: 2, Name: "圖庫", Enabled: Enabled.Imgs, Show: false, Style: {} }
        ]);
        const TabIndex = ref(1);

        const SetTabStyle = () => {
            for (let item of TabData) {
                let Data = TabData.filter(x => x.Enabled && x.Id < item.Id);
                item.Style["left"] = 165 * Data.length + "px";
            }
        };

        SetTabStyle();

        const TabChange = (MyId) => {
            JumpNum.value = 1;
            CurrentPage.value = 1;
            MyId === 2 && GetImgs(CurrentPage.value);
            TabIndex.value = MyId;

            for (let item of TabData) {
                item.Show = item.Id === MyId ? true : false;
            }

            ErrorShow.value = false;
        };
        // 設定頁籤 End

        return {
            Enabled,

            UploadFiles,
            ProgressShow,
            ProgressCloseShow,
            ProgressClose,
            ErrorShow,
            ErrorInfo,
            MaskShow,

            SearchImages,
            SearchText_Imgs,


            Change_Percent,

            ImgList,

            JumpNum,
            ChangePagination,
            PrevNextPage,
            JumpPage,

            SelectFiles,

            DragOver,
            DragLeave,
            Drop,

            ZoomPic_Open, // 放大圖片
            ZoomPic_GetShow,
            ZoomPic_Change,

            Show_Finish_Info_Box,

            MenuContext, // 滑鼠右鍵選單
            MenuContext_Show,
            MenuContext_Hidden,
            MenuContext_Data,
            MenuContext_PositionAdd,
            MenuContext_Position,
            openMenu,

            SelectImg,

            TabData, // 設定頁籤
            TabIndex,
            TabChange,
        };
    },
    components: {
    }
};