
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";
import doneWindow from "../window/doneWindow.js";

let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));
let pharmacistWindow = defineAsyncComponent(() => import(`../window/pharmacistWindow.js`));
let editWindow2 = defineAsyncComponent(() => import(`../window/edit-window-2.js`));



export default {
    template: `
<div class="product-container pages-scale" v-if="!showContent && !showDisclaimer">
    <div class="area0">
        <div class="content" v-if="pageData.length>0">
            <div class="banner-box"><img :src="'/upload/images/' + pageData[2].FileName" /></div>
            <div class="mask">
                <button type="button" @click="clickEditPageData(2)">編輯</button>
                <button type="button" @click="clickEditPageData(3)">編輯(手機版)</button>
            </div>
        </div>
    </div>
    <div class="area1">
        <div class="content">
            <div class="title">
                <div class="cross-box">
                    <div class="cross-row"></div>
                    <div class="cross-column"></div>
                </div>
                <span>藥師優品推薦</span>
            </div>
            <div class="recommand-container">
                <template v-for="product in productList" :key="product.Id">
                    <div class="product">
                        <div class="product-tag">{{product.Tag}}</div>
                        <div class="img-box">
                            <img :src="'/upload/images/' + product.FileName" alt="" />
                        </div>
                        <div class="info-box">
                            <div class="score"> <img src="/upload/images/star-empty.svg" alt="" />
                                評分 <span class="number">{{product.Score}}</span> 星<div class="stars">
                                    <img src="/upload/images/star-empty.svg" alt="" />
                                    <img src="/upload/images/star-empty.svg" alt="" />
                                    <img src="/upload/images/star-empty.svg" alt="" />
                                    <img src="/upload/images/star-empty.svg" alt="" />
                                    <img src="/upload/images/star-empty.svg" alt="" />
                                </div>
                            </div>
                            <div class="disscussion"><img src="/upload/images/Vector2.png" alt="" /> <span
                                    class="number">{{product.Popularity}}</span>
                                位民眾參與討論</div>
                            <p>{{product.Title}}</p>
                            <a>瀏覽內容</a>
                        </div>
                        <div class="mask" draggable="true" @dragstart="DragStart($event, product.Id)" @dragend="DragEnd($event)" @dragenter="DragEnter($event, product.Id)" @dragover="DragOver($event)">
                            <button type="button" @click="editProduct(product)">編輯</button>
                            <button type="button" @click="Get_Content(product.Id)">編輯內容</button>
                            <button type="button" @click="clickDeleteProduct(product)">刪除</button>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="more" id="more" @click="Get_AllData"><span>瀏覽更多商品</span></div>
    </div>
    <div class="area2" v-if="pageData.length>0">
        <div class="content">
            <div class="title">
                <div class="cross-box">
                    <div class="cross-row"></div>
                    <div class="cross-column"></div>
                </div>
                <span>{{pageData[6].Text}}
                    <div class="mask">
                        <button type="button" @click="clickEditPageData(6)">編輯</button>
                    </div>
                </span>
            </div>
            <div class="item-container">
                <div class="left-box">
                    <img :src="'/upload/images/' + pageData[0].FileName" alt="" />
                    <div class="join" id="join"><span>{{pageData[0].Text}}</span></div>
                    <div class="mask">
                        <button type="button" @click="clickEditPageData(0)">編輯</button>
                    </div>
                </div>
                <div class="right-box">
                    <img :src="'/upload/images/' + pageData[1].FileName" alt="" />
                    <div class="join" id="join"><span>{{pageData[1].Text}}</span></div>
                    <div class="mask">
                        <button type="button" @click="clickEditPageData(1)">編輯</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    <div class="btn" v-if="!showContent && !showDisclaimer">
        <button @click=createProduct()>新增商品</button>
        <button @click=createDisclaimer()>編輯內頁頁尾</button>
    </div>
    <edit-window v-if="showEditProduct" :data="editProductData" @close="closeEditProductWindow" @save="updateProduct"></edit-window>
    <alert-window v-if="showDeleteProductAlertWindow" :data="deleteProductAlertWindowData" @no="closeAlertWindow" @yes="deleteProduct"></alert-window>


<div class="product-content-container pages-scale" v-if="!showContent && showDisclaimer">
    <div class="area5"  v-if="pageData.length>0">
        <div class="content">
            <div class="title">
                <div class="cross-box">
                    <div class="cross-row"></div>
                    <div class="cross-column"></div>
                </div>
                <span>{{pageData[4].Text}}
                    <div class="mask">
                        <button type="button" @click="clickEditPageData(4)">編輯</button>
                    </div>
                </span>
            </div>
            <div class="disclaimer">
                {{pageData[5].Text}}
                <div class="mask">
                    <button type="button" @click="clickEditPageData(5)">編輯</button>
                </div>
            </div>
        </div>
    </div>
</div>
    <div class="btn" v-if="!showContent && showDisclaimer">
        <button @click=back()>返回</button>
    </div>
    <edit-window v-if="showEditPageDataWindow" :data="editPageDataData" @close="closeEditPageDataWindow" @save="updatePageData"></edit-window>

<div class="product-content-container pages-scale" v-if="showContent">
    <div class="area1">
        <div class="content">
            <div class="title">
                <div class="cross-box">
                    <div class="cross-row"></div>
                    <div class="cross-column"></div>
                </div>
                <span>藥師優品推薦</span>
            </div>
            <div class="recommand-container">
                 <div class="product" href="">
                     <div class="img-box">
                         <img v-if="contentData.img.length>0" :src="'/upload/images/' + contentData.img[0].FileName" alt="" />
                         <img v-if="!contentData.img.length>0" src="/upload/images/Rectangle 49.png" alt="" />
                         <div class="mask">
                             <button type="button" @click="clickEditContentImg">編輯圖片</button>
                         </div>
                         <a>{{contentData.link.Text}}
                            <div class="mask">
                                <button type="button" @click="clickEditContent(contentData.link)">編輯</button>
                            </div>
                         </a>
                     </div>
                     <div class="info-box">
                         <div class="product-tag">{{contentData.tag.Text}}
                            <div class="mask">
                                <button type="button" @click="clickEditContent(contentData.tag)">編輯</button>
                            </div>
                         </div>
                         <div class="product-title">
                             <p>{{contentData.title.Text}}</p>
                             <div class="mask">
                                <button type="button" @click="clickEditContent(contentData.title)">編輯</button>
                            </div>
                         </div>
                         <div class="product-intro">
                             <p>{{contentData.intro.Text}}
                             </p>
                             <div class="mask">
                                 <button type="button" @click="clickEditContent(contentData.intro)">編輯</button>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>

    <div class="area2">
        <div class="content">
            <div class="up">
                <div class="column-line orange"></div>
                <div class="score">
                    <div>
                        產品評分
                    </div>
                    <div>
                        {{contentData.score.Text}}<p>/5</p>
                    </div>
                    <div class="mask">
                        <button type="button" @click="clickEditContent(contentData.score)">編輯</button>
                    </div>
                </div>
                <div class="column-line orange"></div>
                <div class="disscussion">
                    <div>
                        參與民眾
                    </div>
                    <div>
                        {{contentData.pop.Text}}<p>/人</p>
                    </div>
                    <div class="mask">
                        <button type="button" @click="clickEditContent(contentData.pop)">編輯</button>
                    </div>
                </div>
                <div class="column-line orange"></div>
            </div>
            <div class="down">
                <div class="img-box" v-if="commentList.length>0" >
                    <template v-for="comment in commentList" :key="comment.Id">
                        <img :src="'/upload/images/' + comment.Pharmacist.FileName" alt="" />
                    </template>
                    <!--<img class="others" src="/upload/images/group 100.png" alt="" />-->
                </div>
            </div>
        </div>
    </div>


    <div class="area3">
        <div class="content">
            <!--
            <div class="row-line orange"></div>
            <div class="product-record-container">
                <div class="product-record-title">
                    ﹀ 評分紀錄表
                </div>
                <div class="product-record-content">
                    <div class="column-line grey"></div>
                    <div class="left">{{contentData.spec.Text}}</div>
                    <div class="column-line grey"></div>
                    <div class="right">{{contentData.spec.FileName}}</div>
                    <div class="column-line grey"></div>
                    <div class="mask">
                        <button type="button" @click="clickEditContent(contentData.spec)">編輯</button>
                    </div>
                </div>
            </div>
            -->
            <div class="row-line orange"></div>

            <div class="product-detail-container">
                <div class=" product-detail-title">
                    ﹀ 詳細商品資料
                </div>
                <div class="product-detail-content">
                    <template v-for="(detail,index) in contentData.detail">
                        <p v-if="detail.Text!=''">
                            {{detail.Text}}
                            <div class="mask">
                                <button type="button" @click="clickEditContent(detail,index)">編輯文字</button>
                                <button type="button" @click="deleteDetail(index)">刪除文字</button>
                            </div>
                        </p>
                        <div class="img-box" v-else-if="detail.FileName!=''">
                            <img :src="'/upload/images/' + detail.FileName" alt="" />
                            <div class="mask">
                                <button type="button" @click="clickEditContent(detail,index)">編輯圖片</button>
                                <button type="button" @click="deleteDetail(index)">刪除圖片</button>
                            </div>
                        </div>
                    </template>
                    <div class="empty-box">
                        <div class="mask">
                            <button type="button" @click="addDetail('Text')">新增文字</button>
                            <button type="button" @click="addDetail('FileName')">新增圖片</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row-line orange"></div>
        </div>
    </div>

    <div class="area4">
        <div class="content">
            <div class="comment-container">
                <div class="banner-box">
                    <img :src="'/upload/images/' + contentData.banner.FileName" alt="" />
                        <div class="mask">
                            <button type="button" @click="clickEditContent(contentData.banner)">編輯</button>
                        </div>
                    </div>
                <div class="comment">
                    <template v-if="commentList.length>0">
                        <div class="comment-item" v-for="(comment,index) in commentList" :key="comment.Id">
                            <div class="img-box">
                                <img :src="'/upload/images/' + comment.Pharmacist.FileName" alt="" />
                            </div>
                            <div class="text-box">
                                <div class="up">
                                    <div class="name">{{comment.Pharmacist.Name}} {{comment.Pharmacist.Position}} {{comment.Pharmacist.Pharmacy}}</div>
                                    <div class="stars">
                                        <img src="/upload/images/star-empty.svg" alt="" />
                                        <img src="/upload/images/star-empty.svg" alt="" />
                                        <img src="/upload/images/star-empty.svg" alt="" />
                                        <img src="/upload/images/star-empty.svg" alt="" />
                                        <img src="/upload/images/star-empty.svg" alt="" />
                                    </div>
                                </div>
                                <span class="number">{{comment.Score}}/5星</span>
                                <div class="score">
                                </div>
                                <div class="down">{{comment.Text}}</div>
                            </div>
                            <div class="mask">
                                <button type="button" @click="clickEditComment(comment)">編輯評論</button>
                                <button type="button" @click="deleteComment(index)">刪除評論</button>
                            </div>
                            <div class="row-line grey"></div>
                        </div>
                    </template>
                    <div class="empty-box">
                        <div class="mask">
                            <button type="button" @click="clickAddComment()">新增評論</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    <div class="btn" v-if="showContent">
        <button @click=updateContent()>儲存變更</button>
        <button @click=back()>返回</button>
    </div>
    <edit-window v-if="showEditContent" :data="editContentData" @close="closeEditContent" @save="editContent"></edit-window>
    <edit-window v-if="showEditComment" :data="editCommentData" @close="closeEditComment" @save="editComment"></edit-window>
    <done-window v-if="showDone"></done-window>
    <pharmacist-window v-if="showPharmacistWindow" :Id="productId" @no="closePharmacistWindow" @yes="addCommentText"></pharmacist-window>
    <edit-window-2 v-if="showEditContentImg" :data="editContentImgData" @close="closeEditContentImg" @save="editContentImg"></edit-window-2>
    `
    ,
    //emits: [],
    props: {
    },
    setup(props, context) {
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".product-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
            }, 100);
        };
        const Get_Data = () => {
            WebApi.get("Product/Get_ProductList/0").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                productList.length = 0;
                result.data.Data.forEach(item => {
                productList.push(item);
                });
            });
            WebApi.get("Product/Get_PageData").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                pageData.length = 0;
                result.data.Data.forEach(item => {
                    pageData.push(item);
                });
                console.log(pageData);
                setTimeout(showStar, 10)
            });
        };
        const Get_AllData = () => {
            WebApi.get("Product/Get_AllProductList").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                productList.length = 0;
                result.data.Data.forEach(item => {
                    productList.push(item);
                });
            });
        }
        const productList = reactive([]);
        const pageData = reactive([]);

        const showEditPageDataWindow = ref(false);
        const editPageDataData = reactive({
            table: [
                {
                    name: "文字：",
                    content: "",
                    type: "text",
                    show: true
                },
                {
                    name: "連結：",
                    content: "",
                    type: "text",
                    show: true
                }
            ],
            img: {
                required: true,
                content: "",
            },
            allowEmpty: true
        });
        const clickEditPageData = (index) => {
            if (index === 2 || index === 3) {
                editPageDataData.table[0].show = false;
                editPageDataData.table[1].show = false;
                editPageDataData.img.required = true;
            }
            else if (index === 0 || index === 1) {
                editPageDataData.table[0].show = true;
                editPageDataData.table[0].type = "text";
                editPageDataData.table[1].show = true;
                editPageDataData.img.required = true;
            }
            else if (index === 4 || index === 6) {
                editPageDataData.table[0].show = true;
                editPageDataData.table[0].type = "text";
                editPageDataData.table[1].show = false;
                editPageDataData.img.required = false;
            }
            else if (index === 5) {
                editPageDataData.table[0].show = true;
                editPageDataData.table[0].type = "textarea";
                editPageDataData.table[1].show = false;
                editPageDataData.img.required = false;
            }
            const data = pageData[index];
            editPageDataData.table[0].content = data.Text;
            editPageDataData.table[1].content = data.Link;
            editPageDataData.img.content = data.FileName;
            editPageDataData.id = data.Id;
            showEditPageDataWindow.value = true;
        }
        const closeEditPageDataWindow = () => {
            showEditPageDataWindow.value = false;
        }
        const updatePageData = (data) => {
            const updateData = {
                Id: data.id,
                Text: data.table[0].content,
                Link: data.table[1].content,
                FileName: data.img.content
            };
            WebApi.post("Product/Update_PageData/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeEditPageDataWindow();
            });
        }

        const showEditProduct = ref(false);
        const editProductData = reactive({
            table: [
                {
                    name: "標題：",
                    content: "",
                    type: "text",
                    show: true
                },
                {
                    name: "評分：",
                    content: "",
                    type: "text",
                    show: true
                },
                {
                    name: "討論度：",
                    content: "",
                    type: "text",
                    show: true
                },
                {
                    name: "標籤：",
                    content: "",
                    type: "text",
                    show: true
                },
            ],
            img: {
                required: true,
                content:"",
            },
            id:0
        })
        const closeEditProductWindow = () => {
            showEditProduct.value = false;
        }
        const editProduct = (product) => {
            editProductData.table[0].content = product.Title;
            editProductData.table[1].content = product.Score;
            editProductData.table[2].content = product.Popularity;
            editProductData.table[3].content = product.Tag;
            editProductData.img.content = product.FileName;
            editProductData.id = product.Id;
            showEditProduct.value = true;
        }
        const updateProduct = (data) => {
            if (!data.id) {
                const createData = {
                    Title: data.table[0].content,
                    Score: data.table[1].content,
                    Popularity: data.table[2].content,
                    Tag: data.table[3].content,
                    FileName: data.img.content
                }
                WebApi.post("Product/Create_Product/", createData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditProductWindow();
                    setTimeout(updateDisplayOrder,1000)
                });
            }
            if (data.id) {
                const updateData = {
                    Id: data.id,
                    Title: data.table[0].content,
                    Score: data.table[1].content,
                    Popularity: data.table[2].content,
                    Tag: data.table[3].content,
                    FileName: data.img.content
                }
                WebApi.post("Product/Update_Product/", updateData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditProductWindow();
                });
            }
            closeEditProductWindow();
        }
        const createProduct = () => {
            editProductData.table[0].content = "";
            editProductData.table[1].content = "";
            editProductData.table[2].content = "";
            editProductData.table[3].content = "";
            editProductData.img.content = "";
            editProductData.id = 0;
            showEditProduct.value = true;
        }

        const showDeleteProductAlertWindow = ref(false);
        const deleteProductAlertWindowData = reactive({
            message: "確定要刪除嗎？",
            id: 0
        })
        const clickDeleteProduct = (product) => {
            deleteProductAlertWindowData.id = product.Id;
            showDeleteProductAlertWindow.value = true;
        }
        const closeAlertWindow = () => {
            showDeleteProductAlertWindow.value = false;
        }
        const deleteProduct = (id) => {
            const deleteData = {
                id
            };
            WebApi.post("Product/Delete_Product/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAlertWindow();
            });
        }


        //content
        const showContent = ref(false);
        const contentData = reactive({
            img: [],
            link: {},
            tag: {},
            title: {},
            intro: {},
            score: {},
            pop: {},
            spec: {},
            detail: [],
            banner: {},
        })

        const Get_Content = (id) => {
            WebApi.get(`Product/Get_Content/${id}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                productId.value = id;
                contentData.img.length = 0;
                contentData.link = {};
                contentData.tag = {};
                contentData.title = {};
                contentData.intro = {};
                contentData.score = {};
                contentData.pop = {};
                contentData.spec = {};
                contentData.detail.length = 0;
                contentData.banner = {};
                
                result.data.Data.forEach(item => {
                    if (item.Area === "img") {
                        contentData.img.push(item);
                    };
                    if (item.Area === "link") {
                        contentData.link = item;
                    };
                    if (item.Area === "tag") {
                        contentData.tag = item;
                    };
                    if (item.Area === "title") {
                        contentData.title = item;
                    }
                    if (item.Area === "intro") {
                        contentData.intro = item;
                    }
                    if (item.Area === "score") {
                        contentData.score = item;
                    }
                    if (item.Area === "pop") {
                        contentData.pop = item;
                    }
                    if (item.Area === "spec") {
                        contentData.spec = item;
                    }
                    if (item.Area === "detail") {
                        contentData.detail.push(item);
                    };
                    if (item.Area === "banner") {
                        contentData.banner = item;
                    }
                });
                WebApi.get(`Product/Get_Comment/${id}`).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    commentList.length = 0;
                    result.data.Data.forEach(item => {
                        commentList.push(item);
                    })
                });
                showContent.value = true;
                setTimeout(() => {
                    let dom = document.querySelector(".product-content-container");
                    dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
                }, 100);
            });
        }

        const editContentData = reactive({
            table: [
                {
                    name: "",
                    content: "",
                    type:"",
                    show:true
                }
            ],
            img: {
                required: false,
                content: ""
            },
            area:""
        })
        const showEditContent = ref(false);
        const clickEditContent = (content,index) => {
            editContentData.table.length = 0;
            editContentData.img.required = false;
            editContentData.img.content = "";
            if (content.Area === "link") {
                editContentData.table[0] = {};
                editContentData.table[1] = {};
                editContentData.table[0].name = "連結文字：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "text";
                editContentData.table[0].show = true;
                editContentData.table[1].name = "連結網址：";
                editContentData.table[1].content = content.FileName;
                editContentData.table[1].type = "text";
                editContentData.table[1].show = true;
                editContentData.area = "link";
            }
            if (content.Area === "tag") {
                editContentData.table[0] = {};
                editContentData.table[0].name = "標籤文字：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "text";
                editContentData.table[0].show = true;
                editContentData.area = "tag";
            }
            if (content.Area === "title") {
                editContentData.table[0] = {};
                editContentData.table[0].name = "標題文字：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "text";
                editContentData.table[0].show = true;
                editContentData.area = "title";
            }
            if (content.Area === "intro") {
                editContentData.table[0] = {};
                editContentData.table[0].name = "商品介紹：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "textarea";
                editContentData.table[0].show = true;
                editContentData.area = "intro";
            }
            if (content.Area === "score") {
                editContentData.table[0] = {};
                editContentData.table[0].name = "商品評分：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "text";
                editContentData.table[0].show = true;
                editContentData.area = "score";
            }
            if (content.Area === "pop") {
                editContentData.table[0] = {};
                editContentData.table[0].name = "討論度：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "text";
                editContentData.table[0].show = true;
                editContentData.area = "pop";
            }
            if (content.Area === "spec") {
                editContentData.table[0] = {};
                editContentData.table[1] = {};
                editContentData.table[0].name = "左側文字：";
                editContentData.table[0].content = content.Text;
                editContentData.table[0].type = "textarea";
                editContentData.table[0].show = true;
                editContentData.table[1].name = "右側文字：";
                editContentData.table[1].content = content.FileName;
                editContentData.table[1].type = "textarea";
                editContentData.table[1].show = true;
                editContentData.area = "spec";
            }
            if (content.Area === "detail") {
                if (content.Text !== '') {
                    editContentData.table[0] = {};
                    editContentData.table[0].name = "文字內容：";
                    editContentData.table[0].content = content.Text;
                    editContentData.table[0].type = "textarea";
                    editContentData.table[0].show = true;
                }
                else if (content.FileName !== ''){
                    editContentData.img.required = true;
                    editContentData.img.content = content.FileName;
                }
                    editContentData.area = "detail";
                    editContentData.index = index;
            }
            if (content.Area === "banner") {
                editContentData.img.required = true;
                editContentData.img.content = content.FileName;
                editContentData.area = "banner";
            }
            showEditContent.value = true;
        }
        const closeEditContent = () => {
            showEditContent.value = false;
        }
        const editContent = (data) => {
            if (data.area === "link") {
                contentData.link.Text = data.table[0].content;
                contentData.link.FileName = data.table[1].content;
            }
            if (data.area === "tag") {
                contentData.tag.Text = data.table[0].content;
            }
            if (data.area === "title") {
                contentData.title.Text = data.table[0].content;
            }
            if (data.area === "intro") {
                contentData.intro.Text = data.table[0].content;
            }
            if (data.area === "score") {
                contentData.score.Text = data.table[0].content;
            }
            if (data.area === "pop") {
                contentData.pop.Text = data.table[0].content;
            }
            if (data.area === "spec") {
                contentData.spec.Text = data.table[0].content;
                contentData.spec.FileName = data.table[1].content;
            }
            if (data.area === "detail") {
                if (data.index === -1) {
                    if (data.type === 'Text') {
                        const content = {
                            Area: "detail",
                            Text: data.table[0].content,
                            FileName: ""
                        }
                        contentData.detail.push(content);
                    }
                    if (data.type === 'FileName') {
                        const content = {
                            Area: "detail",
                            Text: "",
                            FileName: data.img.content
                        }
                        contentData.detail.push(content);
                    }
                }
                else {
                    if (data.type === 'Text') {
                        contentData.detail[data.index].Text = data.table[0].content;
                    }
                    if (data.type === 'FileName') {
                        contentData.detail[data.index].FileName = data.img.content;
                    }
                }
            }
            if (data.area === "banner") {
                contentData.banner.FileName = data.img.content;
            }
            closeEditContent();
        }
        const deleteDetail = (index) => {
            contentData.detail.splice(index, 1);
        }
        const addDetail = (type) => {
            if (type === 'Text') {
                editContentData.table.length = 0;
                editContentData.img.required = false;
                editContentData.table[0] = {};
                editContentData.table[0].name = "文字內容：";
                editContentData.table[0].content = "";
                editContentData.table[0].type = "textarea";
                editContentData.table[0].show = true;
                editContentData.type = "Text";

            }
            if (type === 'FileName') {
                editContentData.table.length = 0;
                editContentData.img.required = true;
                editContentData.img.content = "";
                editContentData.type = "FileName";
            }
            editContentData.area = "detail";
            editContentData.index = -1;
            showEditContent.value = true;
        }
        const productId = ref(0);
        const updateContent = () => {
            const updateData = {
                Product_Id: productId.value,
                ContentList: [],
                CommentList: []
            };
            contentData.img.forEach(item => updateData.ContentList.push(item));
            updateData.ContentList.push(contentData.link);
            updateData.ContentList.push(contentData.tag);
            updateData.ContentList.push(contentData.title);
            updateData.ContentList.push(contentData.intro);
            updateData.ContentList.push(contentData.score);
            updateData.ContentList.push(contentData.pop);
            updateData.ContentList.push(contentData.spec);
            contentData.detail.forEach(item => updateData.ContentList.push(item));
            updateData.ContentList.push(contentData.banner);

            commentList.forEach(comment => {
                const data = {
                    Product_id: productId.value,
                    Pharmacist: comment.Pharmacist,
                    Text: comment.Text,
                    Score:comment.Score
                }
                updateData.CommentList.push(data);
            })
            WebApi.post("Product/Update_Content/", updateData).then((result) => {
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

        const showStar = () => {
            const productElements = document.querySelectorAll('.product');
            productElements.forEach((productElement) => {
                const scoreElement = productElement.querySelector('.number');
                const score = parseFloat(scoreElement.innerText);

                const starsContainer = productElement.querySelector('.stars');
                const starImages = starsContainer.querySelectorAll('img');

                const fullStars = Math.floor(score);
                const decimalPart = score - fullStars;
                const hasHalfStar = decimalPart >= 0.45 && decimalPart <= 0.95;

                for (let i = 0; i < starImages.length; i++) {
                    if (i < fullStars) {
                        starImages[i].src = "/upload/images/star-full.svg";
                        starImages[i].style.transform = "scaleX(1)"; 
                    } else if (i === fullStars && hasHalfStar) {
                        starImages[i].src = "/upload/images/star-half.svg";
                        starImages[i].style.transform = "scaleX(1)"; 
                    } else {
                        starImages[i].src = "/upload/images/star-empty.svg";
                        starImages[i].style.transform = "scaleX(1)"; 
                    }
                }
            })
        }

        const back = () => {
            showContent.value = false;
            showDisclaimer.value = false;
        }

        const commentList = reactive([])

        const showEditComment = ref(false);
        const editCommentData = reactive({
            table: [
                {
                    name: "評論內容：",
                    content: "",
                    type: "textarea",
                    show: true,
                },
                {
                    name: "評分：",
                    content: "",
                    type: "text",
                    show: true,
                }
            ],
            img: {
                content: "",
                required: false
            },
            id: 0,
            pharmacistId: 0,
            pharmacist: {}
        });
        const closeEditComment = () => {
            showEditComment.value = false;
        };
        const clickEditComment = (comment) => {
            editCommentData.table[0].content = comment.Text;
            editCommentData.table[1].content = comment.Score;
            editCommentData.id = comment.Id;
            showEditComment.value = true;
        };
        const editComment = (data) => {
            if (data.id) {
                const comment = commentList.find(item => item.Id == data.id);
                comment.Text = data.table[0].content;
                comment.Score = data.table[1].content;
            }
            if (!data.id) {
                const comment = {
                    Product_Id: productId.value,
                    Text: data.table[0].content,
                    Score: data.table[1].content,
                    Pharmacist: {
                        Id: data.pharmacistId,
                        Name: data.pharmacist.Name,
                        Position: data.pharmacist.Position,
                        Pharmacy: data.pharmacist.Pharmacy,
                        FileName: data.pharmacist.FileName
                    }
                }
                commentList.push(comment);
            }
            closeEditComment();
        };

        const showPharmacistWindow = ref(false);
        const closePharmacistWindow = () => {
            showPharmacistWindow.value = false;
        }
        const addCommentText = (data) => {
            editCommentData.table[0].content = "";
            editCommentData.table[1].content = "";
            editCommentData.id = 0;
            editCommentData.pharmacistId = data.pharmacistId;
            editCommentData.pharmacist = data.pharmacist
            closePharmacistWindow();
            showEditComment.value = true;
        }
        const clickAddComment = () => {
            showPharmacistWindow.value = true;
        }
        const deleteComment = (index) => {
            commentList.splice(index, 1);
        }



        const showEditContentImg = ref(false);
        const editContentImgData = reactive({
            table: [
                {
                    name: "圖片1：",
                    content: "",
                    type:"img"
                },
                {
                    name: "圖片2：",
                    content: "",
                    type: "img"
                },
                {
                    name: "圖片3：",
                    content: "",
                    type: "img"
                }
            ]
        })
        const clickEditContentImg = () => {
            for (let i = 0; i < 3; i++) {
                if (contentData.img[i]) {
                    editContentImgData.table[i].content = contentData.img[i].FileName;
                }
                if (!contentData.img[i]) {
                    editContentImgData.table[i].content = "";
                }
            }
            showEditContentImg.value = true;
        }
        const closeEditContentImg = () => {
            showEditContentImg.value = false;
        }
        const editContentImg = (data) => {
            contentData.img.length = 0;
            data.table.forEach(item => {
                if (item.content.length) {
                    const imgData = {
                        Product_Id: productId.value,
                        Area: "img",
                        FileName: item.content
                    }
                    contentData.img.push(imgData);
                }
            })
            closeEditContentImg();
        }

        const showDisclaimer = ref(false);
        const createDisclaimer = () => {
            showDisclaimer.value = true;
        }

        // 拖曳 排序 Start
        const DragSource_Index = ref(-1);
        const DragSource_Active = ref(-1);

        const cancelDefault = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        const DragStart = (event, id) => {
            event.stopPropagation();

            let index = productList.findIndex(x => x.Id === id);

            DragSource_Index.value = index;
            DragSource_Active.value = index;
        };

        const DragEnd = (event) => {
            cancelDefault(event);
            productList.forEach((item, index) => {
                item.DisplayOrder = index;
            })

        };

        const DragEnter = (event, id) => {
            cancelDefault(event);
            let index = productList.findIndex(x => x.Id === id);

            if (DragSource_Active.value === index) {
                return;
            }
            const source = productList[DragSource_Active.value];
            productList.splice(DragSource_Active.value, 1);


            productList.splice(index, 0, source);

            DragSource_Active.value = index;

            updateDisplayOrder();
        };

        const DragOver = (event) => {
            event.preventDefault();
        };
        // 拖曳

        const updateDisplayOrder = () => {
            const updateData = productList.map((product, index) => {
                return {
                    Id: product.Id,
                    DisplayOrder: index+1
                }
            })
            WebApi.post("Product/Update_DisplayOrder/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
            });
        }
        onMounted(() => {
            Get_Data();
            Page_Setting();
        });

        return {
            pageData,
            productList,
            clickEditPageData,
            showEditPageDataWindow,
            editPageDataData,
            closeEditPageDataWindow,
            updatePageData,

            showEditProduct,
            editProductData,
            closeEditProductWindow,
            editProduct,
            updateProduct,
            createProduct,

            showDeleteProductAlertWindow,
            deleteProductAlertWindowData,
            closeAlertWindow,
            deleteProduct,
            clickDeleteProduct,

            productId,
            contentData,
            Get_Content,
            showContent,

            showEditContent,
            editContentData,
            clickEditContent,
            closeEditContent,
            editContent,
            deleteDetail,
            addDetail,
            updateContent,
            showDone,

            back,

            commentList,
            showEditComment,
            editCommentData,
            closeEditComment,
            showEditComment,
            clickEditComment,
            editComment,

            showPharmacistWindow,
            closePharmacistWindow,
            addCommentText,
            clickAddComment,

            showEditContentImg,
            editContentImgData,
            closeEditContentImg,
            editContentImg,
            clickEditContentImg,

            deleteComment,

            Get_AllData,

            showDisclaimer,
            createDisclaimer,

            DragStart, // 拖曳 排序
            DragEnd,
            DragEnter,
            DragOver,
        };
    },
    components: {
        "edit-window": editWindow,
        "alert-window": alertWindow,
        "pharmacist-window": pharmacistWindow,
        "done-window": doneWindow,
        "edit-window-2": editWindow2
    }
};