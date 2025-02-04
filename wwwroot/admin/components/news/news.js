
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";
import doneWindow from "../window/doneWindow.js";


let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let editWindow2 = defineAsyncComponent(() => import(`../window/edit-window-2.js`));
let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));

export default {
    template: `
<div class="news-container pages-scale" v-if="!showContent">
    <div class="area2">
        <div class="content">
            <div class="article-container">
                <div class="item">
                    <div class="article-box" id="article-box">
                        <template v-for="news in newsList">
                            <a class="article">
                                <div class="img-box">
                                    <img :src="'/upload/images/' + news.FileName" alt="" />
                                </div>
                                <p>{{news.Title}}</p>
                                <div class="mask">
                                    <button type="button" @click="Get_NewsContent(news.Id)">編輯</button>
                                    <button type="button" @click="clickDeleteNews(news.Id)">刪除</button>
                                </div>
                            </a>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div >
</div >

    <div class="btn" v-if="!showContent">
        <button @click=clickCreateNews()>新增消息</button>
    </div>


<div class="news-content-container pages-scale" v-if="showContent">
    <div class="area1">
        <div class="content">
            <div class="news-container">
                <div class="left">
                    <div class="focus-box">
                        <h1>{{contentData.Title}}
                            <div class="mask">
                                <button type="button" @click="editContent('Title')">編輯</button>
                            </div>
                        </h1>
                        <h3>{{contentData.CreationDate}}
                            <div class="mask">
                                <button type="button" @click="editContent('CreationDate')">編輯</button>
                            </div>
                        </h3>
                        <div class="focus-img-box">
                            <img :src="'/upload/images/' + contentData.FileName" alt="" />
                            <div class="mask">
                                <button type="button" @click="editContent('FileName')">編輯</button>
                            </div>
                        </div>
                        <div class="focus-text">
                            <template v-for="content in contentData.NewsContent">
                                <h4 v-if="content.TypeSetting === 'h4'">{{content.Text}}
                                    <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                        <button type="button" @click="editContent(content)">編輯</button>
                                        <button type="button" @click="deleteContent(content)">刪除</button>
                                    </div>
                                </h4>
                                <h5 v-if="content.TypeSetting === 'h5'">{{content.Text}}
                                    <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                        <button type="button" @click="editContent(content)">編輯</button>
                                        <button type="button" @click="deleteContent(content)">刪除</button>
                                    </div>
                                </h5>
                                <p v-if="content.TypeSetting === 'p'">{{content.Text}}
                                    <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                        <button type="button" @click="editContent(content)">編輯</button>
                                        <button type="button" @click="deleteContent(content)">刪除</button>
                                    </div>
                                </p>
                                <div class="focus-img-box" v-if="content.TypeSetting === 'img'">
                                    <img :src="'/upload/images/' + content.FileName" alt="" />
                                    <div class="mask" draggable="true" @dragstart="DragStart($event, content.DisplayOrder)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, content.DisplayOrder)" @dragover="DragOver($event)">
                                        <button type="button" @click="editContent(content)">編輯</button>
                                        <button type="button" @click="deleteContent(content)">刪除</button>
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

    <div class="btn" v-if="showContent">
        <button @click=clickCreateContent()>新增段落</button>
        <button @click=updateContent()>儲存變更</button>
        <button @click=editMeta()>編輯SEO</button>
        <button @click=back()>返回</button>
    </div>

        <edit-window v-if="showCreateNewsWindow" :data="createNewsData" @close="closeCreateNewsWindow" @save="createNews"></edit-window>
        <edit-window v-if="showEditWindow" :data="contentWindowData"  @close="closeEditWindow" @save="saveContent"></edit-window>
        <edit-window-2 v-if="showEditMeta" :data="editMetaData"  @close="closeEditMeta" @save="updateMeta"></edit-window-2>
        <alert-window v-if="showAlertWindow" :data="alertWindowData" @no="closeAlertWindow" @yes="deleteNews"></alert-window>
        <done-window v-if="showDone"></done-window>
`,
    //emits: [],
    props: {


    },
    setup(props, context) {
        const newsList = reactive([]);
        const Get_Data = () => {
            newsList.length = 0;
            WebApi.get("News/Get_Data").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                for (let item of result.data.Data) {
                    newsList.push(item);
                }
            });
        };
        //deleteNews
        const showAlertWindow = ref(false);
        const alertWindowData = reactive({
            message:"確定要刪除嗎？"
        })
        const deleteId = ref(0);
        const clickDeleteNews = (id) => {
            deleteId.value = id;
            showAlertWindow.value = true;
        }
        const closeAlertWindow = () => {
            showAlertWindow.value = false;
        }
        const deleteNews = () => {
            const deleteData = {
                Id: deleteId.value,
            }
            WebApi.post("News/Delete_Data/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAlertWindow();
            });
        }

        //createNews
        const showCreateNewsWindow = ref(false);
        const createNewsData = reactive({});
        const clickCreateNews = () => {
            createNewsData.table = [
                {
                    name: "標題",
                    content: "",
                    type: "text",
                    show: true
                }
            ];
            createNewsData.img = {
                required: true,
                content: "",
            }
            showCreateNewsWindow.value = true;
        }
        const closeCreateNewsWindow = () => {
            showCreateNewsWindow.value = false
        }
        const createNews = (data) => {
            const createData = {
                Title:data.table[0].content,
                FileName: data.img.content,
                CreationDate: getDateString(),
            }
            WebApi.post("News/Create_Data/", createData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeCreateNewsWindow();
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
        const Get_NewsContent = (id) => {
            contentData.NewsContent.length = 0;
            WebApi.get(`News/Get_Content/${id}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                const data = result.data.Data;
                contentData.News_Id = data.News_Id;
                contentData.Title = data.Title;
                contentData.FileName = data.FileName;
                contentData.CreationDate = data.CreationDate;
                contentData.HeadContent = data.HeadContent;
                for (let item of data.NewsContent) {
                    contentData.NewsContent.push(item);
                }
                showContent.value = true;
            });
        }

        const showEditWindow = ref(false);
        const closeEditWindow = () => {
            showEditWindow.value = false;
        }

        const showContent = ref(false);
        const contentData = reactive({
            News_Id: 0,
            Title: "",
            FileName: "",
            NewsContent: [],
        });
        const contentWindowData = reactive({
            table: [],
            img: {
                required: false
            },
            option: false,
            area: ""
        });
        const editContent = (content) => {
            if (content === "Title") {
                contentWindowData.table = [
                    {
                        name: "標題：",
                        content: contentData.Title,
                        type: "text",
                        show: true
                    }
                ]
                contentWindowData.img = {
                    required: false
                }
                contentWindowData.option = false;
                contentWindowData.area = "Title";
            }
            else if (content === "CreationDate") {
                contentWindowData.table = [
                    {
                        name: "日期與時間：",
                        content: contentData.CreationDate,
                        type: "text",
                        show: true
                    }
                ]
                contentWindowData.img = {
                    required: false
                }
                contentWindowData.option = false;
                contentWindowData.area = "CreationDate";
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
                if (content.TypeSetting === "img") {
                    contentWindowData.table = [
                        {
                            name: "內容",
                            content: content.Text,
                            type: "text",
                            show: false
                        }
                    ];
                    contentWindowData.img = {
                        required: true,
                        content: content.FileName
                    }
                }
                else if (content.TypeSetting === "p") {
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
                        content: content.FileName
                    }
                }
                else {
                    contentWindowData.table = [
                        {
                            name: "內容",
                            content: content.Text,
                            type: "text",
                            show: true
                        }
                    ]
                    contentWindowData.img = {
                        required: false,
                        content: "",
                    }
                }
                contentWindowData.option = [
                    {
                        name: "中標題",
                        content: "h4",
                    },
                    {
                        name: "小標題",
                        content: "h5",
                    },
                    {
                        name: "內文",
                        content: "p",
                    },
                    {
                        name: "圖片",
                        content: "img"
                    }
                ];
                contentWindowData.typeSetting = content.TypeSetting;
                contentWindowData.displayOrder = content.DisplayOrder;
                contentWindowData.area = "content";
            }
            showEditWindow.value = true;
        }

        const clickCreateContent = () => {
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
            contentWindowData.option = [
                {
                    name: "中標題",
                    content: "h4",
                },
                {
                    name: "小標題",
                    content: "h5",
                },
                {
                    name: "內文",
                    content: "p",
                },
                {
                    name: "圖片",
                    content: "img"
                }
            ];
            contentWindowData.typeSetting = "h4";
            contentWindowData.displayOrder = 0;
            contentWindowData.area = "content";
            showEditWindow.value = true;
        }

        const saveContent = (data) => {
            if (data.area === "content") {
                if (!data.displayOrder) {
                    const content = {
                        DisplayOrder: contentData.NewsContent.length + 1,
                        Text: data.table[0].content,
                        FileName: data.img.content,
                        TypeSetting: data.typeSetting,
                    }
                    contentData.NewsContent.push(content)
                }
                if (data.displayOrder) {
                    const content = contentData.NewsContent.find(item => item.DisplayOrder === data.displayOrder)
                    content.Text = data.table[0].content;
                    content.FileName = data.img.content;
                    content.TypeSetting = data.typeSetting;
                }
            }
            if (data.area === "Title") {
                contentData.Title = data.table[0].content;
            }
            if (data.area === "CreationDate") {
                contentData.CreationDate = data.table[0].content;
            }
            if (data.area === "FileName") {
                contentData.FileName = data.img.content;
            }
            closeEditWindow();
        }

        const deleteContent = (content) => {
            const indexToDelete = contentData.NewsContent.findIndex(item => item.DisplayOrder === content.DisplayOrder);
            contentData.NewsContent.splice(indexToDelete, 1);
            contentData.NewsContent.forEach((content, index) => {
                content.DisplayOrder = index + 1;
            });
        }

        const updateContent = () => {
            const updateData = {
                News_Id: contentData.News_Id,
                Title: contentData.Title,
                FileName: contentData.FileName,
                CreationDate: contentData.CreationDate,
                NewsContent: contentData.NewsContent.map((content, index) => {
                    return {
                        DisplayOrder: index + 1,
                        Text: content.Text,
                        FileName: content.FileName,
                        TypeSetting: content.TypeSetting
                    }
                })
            }
            WebApi.post("News/Update_Content/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                updateSuccess();
            });
        }
        const showDone = ref(false);
        const updateSuccess = () => {
            showDone.value = true;
            setTimeout(() => {
                showDone.value = false;
            }, 1000)
        }

        const back = () => {
            showContent.value = false;
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
            let index = contentData.NewsContent.findIndex(x => x.DisplayOrder === DisplayOrder);

            DragSource_Index.value = index;
            DragSource_Active.value = index;
        };

        const DragEnd = (event) => {
            cancelDefault(event);
            contentData.NewsContent.forEach((item, index) => {
                item.DisplayOrder = index + 1;
            })

        };

        const DragEnter = (event, displayOrder) => {
            cancelDefault(event);
            let index = contentData.NewsContent.findIndex(x => x.DisplayOrder === displayOrder);

            if (DragSource_Active.value === index) {
                return;
            }
            const source = contentData.NewsContent[DragSource_Active.value];
            contentData.NewsContent.splice(DragSource_Active.value, 1);


            contentData.NewsContent.splice(index, 0, source);

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
            WebApi.post("News/Update_Meta/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                contentData.HeadContent = updateData.HeadContent;
                closeEditMeta();
            });
        }
        const editMeta = () => {
            editMetaData.id = contentData.News_Id;
            editMetaData.table[0].content = contentData.HeadContent;
            showEditMeta.value = true;
        }
        onMounted(() => {
            Get_Data();
        });

        return {
            newsList,

            createNews,
            clickCreateNews,
            showCreateNewsWindow,
            createNewsData,
            closeCreateNewsWindow,

            deleteNews,
            clickDeleteNews,
            showAlertWindow,
            alertWindowData,
            closeAlertWindow,
            deleteId,
            showEditWindow,
            closeEditWindow,
            Get_NewsContent,

            showContent,
            contentData,
            contentWindowData,
            clickCreateContent,
            editContent,
            saveContent,
            deleteContent,
            updateContent,

            updateSuccess,
            showDone,

            back,

            DragStart, // 拖曳 排序
            DragEnd,
            DragEnter,
            DragOver,

            showEditMeta,
            editMetaData,
            closeEditMeta,
            updateMeta,
            editMeta,
        };
    },
    components: {
        "edit-window": editWindow,
        "edit-window-2": editWindow2,
        "alert-window": alertWindow,
        "done-window": doneWindow,
    }
};

