
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";

let imagesManage = defineAsyncComponent(() => import("../image-manage/image-manage.js"));
import doneWindow from "../window/doneWindow.js";

let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let editWindow2 = defineAsyncComponent(() => import(`../window/edit-window-2.js`));
let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));

export default {
    template: `
    <div class="article-page-container pages-scale" v-if="show === 'page'">
        <div class="area2">
            <div class="content">
                <div class="article-container">
                    <div class="item" v-for="category in ArticleList" :key = category.Id>
                        <div class="title">
                            <p>{{category.CategoryName}}</p>
                            <div class="mask">
                                <button type="button" @click="editCategory(category)">編輯</button>
                                <button type="button" @click="clickDeleteCategory(category)">刪除</button>
                            </div>
                        </div>
                        
                        <div class="article-box">
                            <div class="article" v-for="article in category.ArticleList" :key = article.Id>
                                <div class="img-box">
                                    <img :src="'../../../upload/images/' + article.FileName" alt="" />
                                </div>
                                <p>{{article.Title}}</p>
                                <div class="mask">
                                    <button type="button" @click="Get_ArticleContent(article.Id)">編輯</button>
                                    <button type="button" @click="clickDeleteArticle(article.Id)">刪除</button>
                                </div>
                            </div>
                        </div>
                        <div class="more"><a @click="getArticleList(category.Id)">文章清單</a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <div class="article-content-container pages-scale" v-if="show === 'content'">
        <div class="area1">
            <div class="content">
                <div class="news-container">
                    <div class="left">
                        <div class="focus-box">
                            <h1>{{ArticleTitle}}
                                <div class="mask">
                                    <button type="button" @click="getEditArticleContent('Title')">編輯</button>
                                </div>
                            </h1>
                            <div class="focus-img-box">
                                <img :src="'../../../upload/images/' + ArticleFileName " alt="" />
                                <div class="mask">
                                    <button type="button" @click="getEditArticleContent('FileName')">編輯</button>
                                </div>
                            </div>
                            <div class="focus-text">
                                <template v-for="content in ArticleContent" :key = content.DisplayOrder>
                                    <p v-if="content.TypeSetting === 'p'">
                                        {{content.Text}}
                                        <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                            <button type="button" @click="getEditArticleContent(content.DisplayOrder)">編輯</button>
                                            <button type="button" @click="deleteArticleContent(content.DisplayOrder)">刪除</button>
                                        </div>
                                    </p>
                                    <h4 v-if="content.TypeSetting === 'h4'">
                                        {{content.Text}}
                                        <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                            <button type="button" @click="getEditArticleContent(content.DisplayOrder)">編輯</button>
                                            <button type="button" @click="deleteArticleContent(content.DisplayOrder)">刪除</button>
                                        </div>
                                    </h4>
                                    <h5 v-if="content.TypeSetting === 'h5'">
                                        {{content.Text}}
                                        <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                            <button type="button" @click="getEditArticleContent(content.DisplayOrder)">編輯</button>
                                            <button type="button" @click="deleteArticleContent(content.DisplayOrder)">刪除</button>
                                        </div>
                                    </h5>
                                    <div class="focus-img-box" v-if="content.TypeSetting === 'img'">
                                        <img :src="'../../../upload/images/' + content.FileName " alt="" />
                                        <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                            <button type="button" @click="getEditArticleContent(content.DisplayOrder)">編輯</button>
                                            <button type="button" @click="deleteArticleContent(content.DisplayOrder)">刪除</button>
                                        </div>
                                    </div>
                                    
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

     <div class="article-detail-page-container pages-scale" v-if="show==='list'">
            <div class="area1">
                <div class="content">
                    <div class="article-container">
                        <div class="title"><p>{{selectCategotyName()}}</p></div>
                        <div class="article-box">
                            <a class="article" v-for="article in ArticleListAfterCategory">
                                <div class="img-box">
                                    <img :src="'/upload/images/' + article.FileName" alt="" />
                                </div>
                                <p>{{article.Title}}</p>
                                <div class="mask">
                                    <button type="button" @click="Get_ArticleContent(article.Id)">編輯</button>
                                    <button type="button" @click="clickDeleteArticle(article.Id)">刪除</button>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    <div class="btn" v-if="show === 'page'">
        <button @click=clickCreateCategory()>新增分類</button>
    </div>

    <div class="btn" v-if="show === 'content'">
        <button @click=createNewContent()>新增段落</button>
        <button @click=updateArticleContent()>儲存變更</button>
        <button @click=clickUpdatePopularity()>變更人氣值</button>
        <button @click=editTag()>編輯標籤</button>
        <button @click=editMeta()>編輯SEO</button>
        <button @click=backToArticlePage()>返回</button>
    </div>

    <div class="btn" v-if="show === 'list'">
        <button @click=clickCreateNewArticle()>新增文章</button>
        <button @click=backToArticlePage()>返回</button>
    </div>


    <div class="window" v-if="Edit_Show" >
        <div class="box edit-title">
            <label v-if="Edit_Type==='h4' || Edit_Type==='h5' || Edit_Type==='p' || Edit_Type==='img'">選擇編輯類型：</label>
            <select v-if="Edit_Type==='h4' || Edit_Type==='h5' || Edit_Type==='p' || Edit_Type==='img'" v-model="Edit_Type">
                <option value="h4">中標題</option>
                <option value="h5">小標題</option>
                <option value="p">內文</option>
                <option value="img">圖片</option>
            </select>
        </div>
        <div class="box edit-content">
            <span v-if="Edit_Type==='h4' || Edit_Type==='h5' || Edit_Type==='p' || Edit_Type==='Title'">內容：</span>
            <input type="text" v-if="Edit_Type==='h4' || Edit_Type==='h5' || Edit_Type==='Title'" v-model="Edit_Content" />
            <textarea v-if="Edit_Type==='p'" v-model="Edit_Content" />
            <template v-if="Edit_Type==='img' || Edit_Type==='FileName'" class= "img-container">
                <div class="img-box">
                    <span>原本的圖片：</span>
                    <img :src="'../../../upload/images/' + Edit_Before_Img" alt="" />
                </div>
                <div class="img-box">
                <span>修改後圖片：</span>
                <img v-if = "selectedImage" :src="'../../../upload/images/' + Edit_After_Img " alt="" />
                </div>
            </template>
        </div>
        <div class="box" v-if="Edit_Type==='img' || Edit_Type==='FileName'">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="button-box">
            <button type="button" @click="close">關閉</button>
            <button type="button" @click="save">儲存</button>
        </div>
    </div>


    <div class="window" v-if="create_window_show" >
        <div class="box edit-content">
            <span >標題：</span>
            <input v-model="create_Title" />
            <div class="img-box">
                <span>圖片：</span>
                <img v-if = "create_selectFile" :src="'../../../upload/images/' + create_FileName " alt="" />
            </div>
        </div>
        <div class="box">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="button-box">
            <button type="button" @click="closeCreateNewArticle">關閉</button>
            <button type="button" @click="createNewArticle">新增</button>
        </div>
    </div>

    <div class="alertWindow" v-if="showAlertWindow" >
        <div class="box">
            <span>確定要進行刪除嗎</span>
        </div>
        <div class="button-box">
            <button type="button" @click="deleteArticle">是</button>
            <button type="button" @click="close">否</button>
        </div>
    </div>
    <div class="alertWindow" v-if="showDeleteCategoryAlertWindow" >
        <div class="box">
            <span>確定要進行刪除嗎</span>
        </div>
        <div class="button-box">
            <button type="button" @click="deleteCategory">是</button>
            <button type="button" @click="close">否</button>
        </div>
    </div>
    <div class="doneWindow" v-if="showDone" >
        <div class="box">
            <span>儲存成功</span>
        </div>
    </div>

    <div class="window editCategory" v-if="editCategory_show" >
        <div class="box edit-content">
            <span >名稱：</span>
            <input v-model="categoryName" />
        </div>
        <div class="button-box">
            <button type="button" @click="close">取消</button>
            <button type="button" @click="saveCategory">確定</button>
        </div>
    </div>
    <div class="window editCategory" v-if="showCreateCategoryWindow" >
        <div class="box edit-content">
            <span >名稱：</span>
            <input v-model="createCategoryName" />
        </div>
        <div class="button-box">
            <button type="button" @click="close">取消</button>
            <button type="button" @click="createCategory">確定</button>
        </div>
    </div>
    <div class="window updatePopularityWindow" v-if="showUpdatePopularity" >
        <div class="box edit-content">
            <span >人氣值：</span>
            <input type="number" v-model="ArticlePopularity" />
        </div>
        <div class="button-box">
            <button type="button" @click="updatePopularity">確定</button>
            <button type="button" @click="close">取消</button>
        </div>
    </div>

    <edit-window v-if="showEditTagWindow" :data="editTagWindowData"  @close="closeEditTagWindow" @save="updateTag"></edit-window>
    <edit-window v-if="showEditCategoryWindow" :data="editCategoryWindowData"  @close="closeEditCategoryWindow" @save="updateCategory"></edit-window>
    <edit-window-2 v-if="showEditMeta" :data="editMetaData"  @close="closeEditMeta" @save="updateMeta"></edit-window-2>
`,
    //emits: [],
    props: {
    },
    setup(props, context) {
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".article-page-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
                dom = document.querySelector(".article-content-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
                dom = document.querySelector(".article-detail-page-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
            }, 100);
        };
        const FeaturedArticle = reactive([]);
        const PopularArticleList = reactive([]);
        const ArticleList = reactive([]);
        const Get_ArticleData = () => {
            ArticleList.length = 0;
            FeaturedArticle.length = 0;
            PopularArticleList.length = 0;

            WebApi.get("Article/Get_Data").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                FeaturedArticle.push(result.data.Data.FeaturedArticle)
                for (let PopularArticle of result.data.Data.PopularArticleList) {
                    PopularArticleList.push(PopularArticle);
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

        //article-content
        const show = ref("page");
        const ArticleTitle = ref("");
        const ArticleFileName = ref("");
        const ArticlePopularity = ref(0);
        const ArticleHeadContent = ref("");
        const ArticleContent = reactive([]);
        const Article_Id = ref(0);
        const SameCategoryArticle = reactive([]);
        const Edit_Show = ref(false);
        const Edit_DisplayOrder = ref(0);
        const Edit_Content = ref("");
        const Edit_Type = ref("");
        const Edit_Before_Img = ref("");
        const Edit_After_Img = ref("");

        const getEditArticleContent = (DisplayOrder) => {
            selectedImage.value = false;
            if (DisplayOrder === "Title") {
                Edit_Content.value = ArticleTitle.value;
                Edit_Type.value = "Title"
                Edit_Show.value = true;
            } else if (DisplayOrder === "FileName") {
                Edit_Before_Img.value = ArticleFileName.value
                Edit_Type.value = "FileName"
                Edit_Show.value = true;
            } else {
                let Data = ArticleContent.find(item => item.DisplayOrder === DisplayOrder);
                Edit_DisplayOrder.value = DisplayOrder;
                Edit_Type.value = Data.TypeSetting;
                Edit_Content.value = Data.Text;
                Edit_Before_Img.value = Data.FileName;

                Edit_Show.value = true;
            }
        }
        const close = () => {
            Edit_Show.value = false;
            showAlertWindow.value = false;
            showDeleteCategoryAlertWindow.value = false;
            editCategory_show.value = false;
            showCreateCategoryWindow.value = false;
            showUpdatePopularity.value = false;
        }
        const save = () => {
            if (Edit_Type.value === 'Title') {
                ArticleTitle.value = Edit_Content.value;
                close();
            }
            if (Edit_Type.value === 'FileName') {
                if (selectedImage.value) {
                    ArticleFileName.value = Edit_After_Img.value;
                }
                close();
            }
            if (Edit_Type.value === 'h4' || Edit_Type.value === 'h5' || Edit_Type.value === 'p') {
                const displayOrder = Edit_DisplayOrder.value;
                const text = Edit_Content.value;
                let Content = ArticleContent.find(item => item.DisplayOrder === displayOrder);

                //如果是新增
                if (!Content) {
                    let newArticleContent = {
                        DisplayOrder: ArticleContent.length+1,
                        Text: text,
                        TypeSetting: Edit_Type.value,
                    }
                    ArticleContent.push(newArticleContent)
                } else {
                    Content.TypeSetting = Edit_Type.value;
                    Content.Text = text;
                    Content.FileName = "";
                }

                close();
            }
            if (Edit_Type.value === 'img') {
                const displayOrder = Edit_DisplayOrder.value;
                let FileName=""
                if (Edit_After_Img.value) {
                    FileName = Edit_After_Img.value;
                } else {
                    FileName = Before.value;
                }
                let Content = ArticleContent.find(item => item.DisplayOrder === displayOrder);
                if (!Content) {
                    let newArticleContent = {
                        DisplayOrder: ArticleContent.length+1,
                        Text: "",
                        FileName: Edit_After_Img.value,
                        TypeSetting: Edit_Type.value,
                    }
                    ArticleContent.push(newArticleContent)
                } else {
                    Content.TypeSetting = Edit_Type.value;
                    Content.FileName = FileName;
                    Content.Text = "";

                }
                close();
            }
        }


        const Get_ArticleContent = (id) => {
            Article_Id.value = id;
            ArticleContent.length = 0;
            SameCategoryArticle.length = 0;
            WebApi.get(`Article/Get_Content/${id}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                ArticleTitle.value = result.data.Data.Article.Title;
                ArticleFileName.value = result.data.Data.Article.FileName;
                ArticlePopularity.value = result.data.Data.Article.Popularity;
                ArticleHeadContent.value = result.data.Data.Article.HeadContent;
                for (let Content of result.data.Data.ArticleContent) {
                    ArticleContent.push(Content);
                }
                for (let article of result.data.Data.SameCategoryArticle) {
                    SameCategoryArticle.push(article);
                }
                show.value = "content";
            });
        };

        const updateArticleContent = () => {
            const updateData = {
                Id: Article_Id.value,
                Title: ArticleTitle.value,
                FileName: ArticleFileName.value,
                ArticleContent: ArticleContent.map((content, index) => {
                    return {
                        Text: content.Text,
                        DisplayOrder: index + 1,
                        FileName: content.FileName,
                        TypeSetting: content.TypeSetting
                    }
                })
            }
            WebApi.post("Article/Update_Content/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }
        //這邊開始圖片上傳
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
                    Edit_After_Img.value = `${fileData.Name}.webp`
                    selectedImage.value = true;
                    create_FileName.value = `${fileData.Name}.webp`;
                    create_selectFile.value = true;
                } else {
                    console.error("Error (create-small-files):", result.data.Message);
                }
            });
        };
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

        
        const selectedImage = ref(false);
        
        
        

        const backToArticlePage = () => {
            show.value = "page";
            selectCategory.value = (0);
            Get_ArticleData();
        }

        const deleteArticleContent = (DisplayOrder) => {
            const indexToDelete = ArticleContent.findIndex(content => content.DisplayOrder === DisplayOrder);
            ArticleContent.splice(indexToDelete, 1);
            ArticleContent.forEach((content, index) => {
                content.DisplayOrder = index + 1;
            });
        }

        //新增
        const createNewContent = () => {
            Edit_Type.value = "h4";
            Edit_Content.value = "";
            Edit_Before_Img.value = "";
            selectedImage.value = false;
            Edit_DisplayOrder.value=0
            Edit_Show.value = true;

        }
        const editCategory_show = ref(false);
        const categoryId = ref(0);
        const categoryName = ref("");
        /*const editCategory = (category) => {
            editCategory_show.value = true;
            categoryId.value = category.Id;
            categoryName.value = category.CategoryName;
        }*/
        const saveCategory = () => {
            const data = {
                Id: categoryId.value,
                CategoryName:categoryName.value
            }
            WebApi.post("Article/Update_CategoryName/", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                Get_ArticleData();
            });
        }


        const ArticleListAfterCategory = reactive([]);
        const getArticleList = (id) => {
            WebApi.get(`Article/Get_AllArticleList/${id}`).then((result) => {
                ArticleListAfterCategory.length = 0;
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let article of result.data.Data) {
                    ArticleListAfterCategory.push(article);
                }
            });
            selectCategory.value = id;
            show.value = "list";
        }
        const create_window_show = ref(false);
        const create_Title = ref("");
        const create_FileName = ref("");
        const create_selectFile = ref(false);
        const selectCategory = ref(0);
        const selectCategotyName = () => {
            const category = ArticleList.find((item) => item.Id === selectCategory.value)
            if (category) {
                return category.CategoryName
            }
        }
        const clickCreateNewArticle = () => {
            create_selectFile.value = false;
            create_Title.value = "";
            create_FileName.value = "";
            create_window_show.value = true;
        }

        const closeCreateNewArticle = () => {
            create_window_show.value = false;
        }
        const createNewArticle = () => {
            const CreationDate = getDateString();
            const data = {
                Title: create_Title.value,
                FileName: create_FileName.value,
                Category_Id: selectCategory.value,
                CreationDate,
            };
            WebApi.post("Article/Create_Data/", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                getArticleList(selectCategory.value);
                closeCreateNewArticle();
            });
        }
        const getDateString = () => {
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            return dateString;
        }


        const showAlertWindow = ref(false);
        const deleteArticleId = ref(0);
        const clickDeleteArticle = (id) => {
            deleteArticleId.value = id;
            showAlertWindow.value = true;
        }
        const deleteArticle = () => {
            const deleteData = {
                Id: deleteArticleId.value
            }
            WebApi.post("Article/Delete_Data/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                if (!selectCategory.value) {
                    Get_ArticleData();
                }
                if (selectCategory.value) {
                    getArticleList(selectCategory.value);
                }
            });
        }
        const showDone = ref(false);
        const updateSuccess = () => {
            showDone.value = true;
            setTimeout(() => {
                showDone.value = false;
            }, 1000)
        }

        const showDeleteCategoryAlertWindow = ref(false);
        const deleteCategoryId = ref(0);
        const clickDeleteCategory = (category) => {
            deleteCategoryId.value = category.Id;
            showDeleteCategoryAlertWindow.value = true;
        }
        const deleteCategory = () => {
            const deleteData = {
                Id: deleteCategoryId.value
            }
            WebApi.post("Article/Delete_Category/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                Get_ArticleData();
            });
        }
        const createCategoryName = ref("");
        const showCreateCategoryWindow = ref(false);
        const clickCreateCategory = () => {
            createCategoryName.value = "";
            showCreateCategoryWindow.value = true;
        }
        const createCategory = () => {
            const createData = {
                CategoryName: createCategoryName.value
            }
            WebApi.post("Article/Create_Category/", createData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                Get_ArticleData();
            });
        }
        
        const showUpdatePopularity = ref(false);
        const clickUpdatePopularity = () => {
            showUpdatePopularity.value = true;
        }
        const updatePopularity = () => {
            const data = {
                Id: Article_Id.value,
                Popularity: ArticlePopularity.value
            }
            WebApi.post("Article/Update_Popularity/", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                updateSuccess();
            });
        }

        const editTagWindowData = reactive({
            table: [],
            img: {
                required: false
            },
            option: false,
            addButton: "增加標籤",
            removeButton: "刪除最末標籤",
            addName: "標籤名稱：",
        });
        const showEditTagWindow = ref(false);
        const editTag = () => {
            WebApi.get(`Article/Get_Tag/${Article_Id.value}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                editTagWindowData.table.length = 0;
                const data = result.data.Data;
                for (let i = 0; i < data.length; i++) {
                    const item = {
                        name: "標籤名稱：",
                        content: data[i],
                        type: "text",
                        show: true
                    }
                    editTagWindowData.table.push(item);
                }
                showEditTagWindow.value = true;
            });
        }
        const closeEditTagWindow = () => {
            showEditTagWindow.value = false;
        }
        const updateTag = (windowData) => {
            const updateData = {
                Id: Article_Id.value,
                ArticleTag: []
            }
            windowData.table.forEach((item) => {
                updateData.ArticleTag.push(item.content);
            })
            WebApi.post("Article/Update_Tag/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeEditTagWindow();
            });
        }

        const showEditCategoryWindow = ref(false);
        const closeEditCategoryWindow = () => {
            showEditCategoryWindow.value = false;
        }
        const editCategoryWindowData = reactive({
            table: [{
                name: "分類名稱：",
                content: "",
                show: true,
                type: "text",
            }],
            img: {
                required: true,
                content: "",
            }
        })
        const editCategory = (category) => {
            categoryId.value = category.Id;
            editCategoryWindowData.table[0].content = category.CategoryName;
            editCategoryWindowData.img.content = category.FileName
            showEditCategoryWindow.value = true;
        }
        const updateCategory = (data) => {
            const updateData = {
                Id: categoryId.value,
                CategoryName: data.table[0].content,
                FileName: data.img.content,
            }
            WebApi.post("Article/Update_CategoryName/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeEditCategoryWindow();
                Get_ArticleData();
            });
        }


        // 拖曳 排序 Start
        const DragSource_Index = ref(-1);
        const DragSource_Active = ref(-1);

        const cancelDefault = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        const DragStart = (event, DisplayOrder) => {
            event.stopPropagation();
            let index = ArticleContent.findIndex(x => x.DisplayOrder === DisplayOrder);

            DragSource_Index.value = index;
            DragSource_Active.value = index;
        };

        const DragEnd = (event) => {
            cancelDefault(event);
            ArticleContent.forEach((item, index) => {
                item.DisplayOrder = index + 1;
            })

        };

        const DragEnter = (event, displayOrder) => {
            cancelDefault(event);
            let index = ArticleContent.findIndex(x => x.DisplayOrder === displayOrder);

            if (DragSource_Active.value === index) {
                return;
            }
            const source = ArticleContent[DragSource_Active.value];
            ArticleContent.splice(DragSource_Active.value, 1);


            ArticleContent.splice(index, 0, source);

            DragSource_Active.value = index;
        };

        const DragOver = (event) => {
            event.preventDefault();
        };

        // 拖曳


        const showEditMeta = ref(false);
        const editMetaData = reactive({
            table: [
                {
                    name: "代碼：",
                    content: "",
                    type: "textarea",
                    show: true,
                },
            ],
            id: 0
        })
        const closeEditMeta = () => {
            showEditMeta.value = false;
        }
        const updateMeta = (data) => {
            const updateData = {
                Id: data.id,
                HeadContent: data.table[0].content,
            }
            WebApi.post("Article/Update_Meta/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                ArticleHeadContent.value = updateData.HeadContent;
                closeEditMeta();
            });
        }
        const editMeta = () => {
            editMetaData.id = Article_Id.value;
            editMetaData.table[0].content = ArticleHeadContent.value;
            showEditMeta.value = true;
        }
        onMounted(() => {
            Get_ArticleData();
            Page_Setting();
        });

        return {
            PopularArticleList,
            FeaturedArticle,
            ArticleList,

            show,
            Edit_Show,
            Edit_DisplayOrder,
            Edit_Content,
            Edit_Type,
            Edit_Before_Img,
            Edit_After_Img,
            SelectFiles,
            close,
            save,
            Get_ArticleContent,
            getEditArticleContent,
            ArticleTitle,
            ArticleFileName,
            ArticleContent,
            updateArticleContent,
            SameCategoryArticle,
            
            selectedImage,

            backToArticlePage,
            createNewContent,
            deleteArticleContent,

            editCategory,
            editCategory_show,
            categoryId,
            categoryName,
            saveCategory,


            getArticleList,
            clickCreateNewArticle,
            ArticleListAfterCategory,
            create_window_show,
            create_Title,
            create_FileName,
            create_selectFile,
            createNewArticle,
            closeCreateNewArticle,
            selectCategory,
            selectCategotyName,

            clickDeleteArticle,
            showAlertWindow,
            deleteArticleId,
            deleteArticle,

            showDone,

            clickDeleteCategory,
            clickCreateCategory,
            deleteCategoryId,
            deleteCategory,
            createCategoryName,
            createCategory,
            showDeleteCategoryAlertWindow,
            showCreateCategoryWindow,

            clickUpdatePopularity,
            updatePopularity,
            showUpdatePopularity,
            ArticlePopularity,

            editTag,
            updateTag,
            showEditTagWindow,
            editTagWindowData,
            closeEditTagWindow,

            showEditCategoryWindow,
            editCategoryWindowData,
            closeEditCategoryWindow,
            updateCategory,

            DragStart, // 拖曳 排序
            DragEnd,
            DragEnter,
            DragOver,

            ArticleHeadContent,
            showEditMeta,
            editMetaData,
            closeEditMeta,
            updateMeta,
            editMeta,

        };
    },
    components: {
        "images-manage": imagesManage,
        "edit-window": editWindow,
        "alert-window": alertWindow,
        "edit-window-2": editWindow2,
    }
};
