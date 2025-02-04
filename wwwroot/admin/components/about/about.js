
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";
let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));

export default {
    template: `
<div class="about-container pages-scale">
    <div class="area1">
        <div class="content">
            <div class="news-container">
                <div class="left">
                    <div class="focus-box">
                        <ul>
                            <li v-for="item in aboutCategory">
                                <a :class="{ 'active': CategoryButton === item.Id }"  @click="switchCategory(item.Id)">{{item.CategoryName}}</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="right">
                    <div class="hot-box">
                        <template v-for="item in aboutData" >
                            <h4 v-if="item.TypeSetting === 'h4'">{{item.Text}}
                                <div class="mask" draggable="true" @dragstart="DragStart($event, item.Id)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, item.DisplayOrder)" @dragover="DragOver($event)">
                                    <button type="button" @click="editAbout(item)">編輯</button>
                                    <button type="button" @click="deleteAbout(item)">刪除</button>
                                </div>
                            </h4>
                            <div class="text" v-if="item.TypeSetting === 'p'">
                                <p>{{item.Text}}
                                    <div class="mask" draggable="true" @dragstart="DragStart($event, item.Id)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, item.DisplayOrder)" @dragover="DragOver($event)">
                                        <button type="button" @click="editAbout(item)">編輯</button>
                                        <button type="button" @click="deleteAbout(item)">刪除</button>
                                    </div>
                                </p>
                            </div>
                            <div class="img-box" v-if="item.TypeSetting === 'img'"><img :src="'/upload/images/' + item.FileName" alt="" />
                                <div class="mask" draggable="true" @dragstart="DragStart($event, item.Id)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, item.DisplayOrder)" @dragover="DragOver($event)">
                                    <button type="button" @click="editAbout(item)">編輯</button>
                                    <button type="button" @click="deleteAbout(item)">刪除</button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

    <div class="btn">
        <button @click=addAbout()>新增段落</button>
        <button @click=Update_AboutData()>儲存變更</button>
        <button @click=clickCreateCategory()>新增分類</button>
        <button @click=clickEditCategory()>編輯分類</button>
        <button @click=clickDeleteCategory()>刪除分類</button>

    </div>

        
    <div class="window" v-if="showWindow" >
        <div class="box edit-title">
            <label>選擇編輯類型：</label>
            <select v-model="windowType">
                <option value="h4">標題</option>
                <option value="p">內文</option>
                <option value="img">圖片</option>
            </select>
        </div>
        <div class="box edit-content">
            <span v-if="windowType==='h4' || windowType==='p'">內容：</span>
            <input type="text" v-if="windowType==='h4'" v-model="windowText" />
            <textarea v-if="windowType==='p'" v-model="windowText" />
            <template v-if="windowType==='img'" class= "img-container">
                <div class="img-box">
                    <span>原本的圖片：</span>
                    <img :src="'../../../upload/images/' + windowBeforeImg" alt="" />
                </div>
                <div class="img-box">
                <span>修改後圖片：</span>
                <img v-if = "selectedImage" :src="'../../../upload/images/' + windowAfterImg " alt="" />
                </div>
            </template>
        </div>
        <div class="box" v-if="windowType==='img'">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="button-box">
            <button type="button" @click="close">關閉</button>
            <button type="button" @click="save">儲存</button>
        </div>
    </div>

    <div class="doneWindow" v-if="showDone" >
        <div class="box">
            <span>儲存成功</span>
        </div>
    </div>
    <div class="alertWindow" v-if="showExistence" >
        <div class="box">
            <span>已有同名檔案，確定要覆蓋嗎？</span>
        </div>
        <div class="button-box">
            <button type="button" @click="overwrite">是</button>
            <button type="button" @click="closeExistenceWindow">否</button>
        </div>
    </div>

        <edit-window v-if="showEditCategory" :data="editCategoryData"  @close="closeEditCategory" @save="updateCategory"></edit-window>
        <alert-window v-if="showDeleteCategory" :data="deleteCategoryData" @no="closeDeleteCategory" @yes="deleteCategory"></alert-window>
`,
    //emits: [],
    props: {
    },
    setup(props, context) {
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".about-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
            }, 100);
        };
        const showWindow = ref(false);
        const windowOrder = ref(0);
        const windowType = ref("");
        const windowText = ref("");
        const windowBeforeImg = ref("");
        const windowAfterImg = ref("");
        const selectedImage = ref(false);
        const editAbout = (item) => {
            window.value = "edit";
            selectedImage.value = false;
            windowOrder.value = item.DisplayOrder;
            windowType.value = item.TypeSetting;
            windowText.value = item.Text;
            windowBeforeImg.value = item.FileName;
            windowAfterImg.value = "";
            showWindow.value = true;
        }
        const addAbout = () => {
            window.value = "add";
            selectedImage.value = false;
            windowType.value = "p";
            windowText.value = "";
            windowBeforeImg.value = "";
            windowAfterImg.value = "";
            showWindow.value = true;
        }
        const close = () => {
            showWindow.value = false;
        }
        const save = () => {
            const data = {
                DisplayOrder:windowOrder.value,
                TypeSetting: windowType.value,
                Text: windowText.value,
                FileName: selectedImage ? windowAfterImg.value : windowBeforeImg,
            }
            if (data.TypeSetting === "img") {
                data.Text = "";
            }
            if (data.TypeSetting !== "img") {
                data.FileName = "";
            }
            if (window.value === "add") {
                aboutData.push(data)
                updateDisplayOrder(aboutData);
            }
            if (window.value === "edit") {
                let item = aboutData.find(item => item.DisplayOrder === data.DisplayOrder);
                item.TypeSetting = data.TypeSetting;
                item.Text = data.Text;
                item.FileName = data.FileName;

            }
            close();
        }
        const deleteAbout = (data) => {
            const DisplayOrder = data.DisplayOrder;
            const indexToDelete = aboutData.findIndex(item => item.DisplayOrder === DisplayOrder);
            aboutData.splice(indexToDelete, 1);
            updateDisplayOrder(aboutData)
        }
        const updateDisplayOrder = (data) => {
            data.forEach((item,index) => {
                item.DisplayOrder=index+1
            })
        }
        const Update_AboutData = () => {
            const updateData = aboutData.map((item) => {
                return {
                    Text: item.Text,
                    DisplayOrder: item.DisplayOrder,
                    FileName: item.FileName,
                    TypeSetting: item.TypeSetting
                }
            });
            WebApi.post(`About/Update_Data/${CategoryButton.value}`, updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }


        const aboutData = reactive([]);
        const aboutCategory = reactive([]);
        const Get_AboutData = (id) => {
            aboutData.length = 0;
            aboutCategory.length = 0;
            WebApi.get(`About/Get_Data/${id}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let item of result.data.Data.AboutData) {
                    aboutData.push(item);
                }
                for (let item of result.data.Data.AboutCategory) {
                    aboutCategory.push(item);
                }
            });
        };

        const CategoryButton = ref(1);

        const switchCategory = (index) => {
            CategoryButton.value = index;
            Get_AboutData(CategoryButton.value);
        };

        const showDone = ref(false);
        const updateSuccess = () => {
            showDone.value = true;
            setTimeout(() => {
                showDone.value = false;
            }, 1000)
        }

        //圖片上傳
        const SelectFiles = (event) => {
            event.target.files.length <= 0 ? event.target.value = "" : checkExistence(event.target.files);
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
        const ImageToBase64 = async (file, newFileName = "") => {
            let extIndex = file.name.lastIndexOf(".");
            let ext = file.name.split(".").pop().toLowerCase();
            let Name = file.name.substr(0, extIndex), Type, Extension;
            if (newFileName.length == 0) {
                Name = Name.replace("(", "-").replace(")", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "");
            }
            if (newFileName.length > 0) {
                Name = newFileName;
            }
            let fileData = { MyFile: file, Name, OldExtension: ext, Extension }
            let newFile = await GetWebpFile(fileData.MyFile, `${fileData.Name}.webp`);
            fileData.MyFile = newFile;
            let formData = new FormData();
            formData.append("data", fileData.MyFile);
            formData.append("fileName", `${fileData.Name}.webp`);
            WebApi.post("Files/CreateSmall", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((result) => {
                if (result.data.HttpCode === 200) {
                    windowAfterImg.value = `${fileData.Name}.webp`
                    selectedImage.value = true;
                } else {
                    console.error("Error (create-small-files):", result.data.Message);
                }
            });
        };
        const showExistence = ref(false);
        const checkExistence = async (fileList) => {
            const file = fileList[0];
            let extIndex = file.name.lastIndexOf(".");
            let ext = file.name.split(".").pop().toLowerCase();
            let Name = file.name.substr(0, extIndex), Type, Extension;
            Name = Name.replace("(", "-").replace(")", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "");
            let formData = new FormData();
            formData.append("fileName", `${Name}.webp`);
            try {
                const result = await WebApi.post("Files/CheckExistence", formData, { headers: { "Content-Type": "multipart/form-data" } });
                if (result.data.HttpCode === 200) {
                    if (!result.data.Data) {
                        await ImageToBase64(file);
                    }
                    if (result.data.Data) {
                        WebApi.post("Files/ChangeFileName", Name).then(async (result) => {
                            if (result.data.HttpCode === 200) {
                                const newFileName = result.data.Data;
                                await ImageToBase64(file, newFileName);
                            } else {
                                console.error("Error (create-small-files):", result.data.Message);
                            }
                        })
                    }
                } else {
                    console.error("Error (CheckExistence):", result.data.Message);
                }
            } catch (error) {
                console.error("Error (CheckExistence):", error);
            }
        }
        const existFile = ref("");
        const showExistenceWindow = (file) => {
            existFile.value = file;
            showExistence.value = true;
        }
        const closeExistenceWindow = () => {
            showExistence.value = false;
        }
        const overwrite = async() => {
            await ImageToBase64(existFile.value);
            closeExistenceWindow();
        }




        // 拖曳 排序 Start
        const DragSource_Index = ref(-1);
        const DragSource_Active = ref(-1);

        const cancelDefault = (event) => {
            event.preventDefault(); 
            event.stopPropagation(); 
        };

        const DragStart = (event, MyId) => {
            event.stopPropagation();

            let index = aboutData.findIndex(x => x.Id === MyId);

            DragSource_Index.value = index;
            DragSource_Active.value = index;
        };

        const DragEnd = (event) => {
            cancelDefault(event);
            aboutData.forEach((item,index) => {
                item.DisplayOrder = index + 1;
            })

        };

        const DragEnter = (event, displayOrder) => {
            cancelDefault(event);
            let index = aboutData.findIndex(x => x.DisplayOrder === displayOrder);

            if (DragSource_Active.value === index) { 
                return;
            }
            const source = aboutData[DragSource_Active.value];
            aboutData.splice(DragSource_Active.value, 1);


            aboutData.splice(index, 0, source);

            DragSource_Active.value = index;
        };

        const DragOver = (event) => { 
            event.preventDefault();
        };
        // 拖曳

        const editCategoryData = reactive({
            table: [
                {
                    name: "分類名稱：",
                    content: "",
                    type: "text",
                    show: true
                }
            ],
            img: {
                required: false,
                content: ""
            },
            id:0 
        })
        const showEditCategory = ref(false);
        const closeEditCategory = () => {
            showEditCategory.value = false;
        }
        const clickEditCategory = () => {
            const category = aboutCategory.find(item => item.Id === CategoryButton.value);
            editCategoryData.table[0].content = category.CategoryName;
            editCategoryData.id = category.Id;
            showEditCategory.value = true;
        }
        const clickCreateCategory = () => {
            editCategoryData.table[0].content = "";
            editCategoryData.id = 0;
            showEditCategory.value = true;
        }
        const updateCategory = (data) => {
            if (!data.id) {
                const createData = {
                    CategoryName: data.table[0].content
                };
                WebApi.post("About/Create_Category/", createData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_AboutData(CategoryButton.value);
                    closeEditCategory();
                });
            }
            if (data.id) {
                const updateData = {
                    Id: data.id,
                    CategoryName: data.table[0].content
                };
                WebApi.post("About/Update_Category/", updateData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_AboutData(CategoryButton.value);
                    closeEditCategory();
                });
            }
        }
        const deleteCategoryData = reactive({
            message: "確定要刪除此分類嗎？",
            id: 0
        })
        const showDeleteCategory = ref(false);
        const clickDeleteCategory = () => {
            deleteCategoryData.id = CategoryButton.value;
            showDeleteCategory.value = true;
        }
        const closeDeleteCategory = () => {
            showDeleteCategory.value = false;
        }
        const deleteCategory = (id) => {
            const deleteData = {
                Id: id
            }
            WebApi.post("About/Delete_Category/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                CategoryButton.value = 1;
                Get_AboutData(1);
                closeDeleteCategory();
            });
        }

        onMounted(() => {
            Get_AboutData(1);
            Page_Setting();
        });

        return {
            aboutData,
            aboutCategory,
            showWindow,
            window,
            windowOrder,
            windowType,
            windowText,
            windowBeforeImg,
            windowAfterImg,
            selectedImage,
            SelectFiles,
            editAbout,
            addAbout,
            deleteAbout,
            Update_AboutData,
            close,
            save,
            switchCategory,
            CategoryButton,
            showDone,
            showExistence,
            closeExistenceWindow,
            overwrite,

            DragStart, // 拖曳 排序
            DragEnd,
            DragEnter,
            DragOver,

            showEditCategory,
            editCategoryData,
            clickEditCategory,
            closeEditCategory,
            updateCategory,
            clickCreateCategory,
            showDeleteCategory,
            deleteCategoryData,
            clickDeleteCategory,
            closeDeleteCategory,
            deleteCategory,
        };
    },
    components: {
        "edit-window": editWindow,
        "alert-window": alertWindow
    }
};
