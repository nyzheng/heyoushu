
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";
import doneWindow from "../window/doneWindow.js";

let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));
let alertWindow = defineAsyncComponent(() => import(`../window/alertWindow.js`));
let pharmacistWindow = defineAsyncComponent(() => import(`../window/pharmacistWindow.js`));
let optionWindow = defineAsyncComponent(() => import(`../window/optionWindow.js`));

export default {
    template: `
<div class="forum-container pages-scale">
    <div class="area1">
        <div class="content">
            <div class="banner-box" v-if="bannerList.length  > 0"><img :src="'/upload/images/' + bannerList[0].FileName"/>
                <div class="mask">
                    <button type="button" @click="clickEditBanner(1)">編輯</button>
                    <button type="button" @click="clickEditBanner(2)">編輯(手機版)</button>

                </div>
            </div>
        </div>
    </div>
    <div class="area2">
        <div class="content">
            <div class="btn-box">
                <button class="category-button active" id="category-0" @click="switchCategory(0)">全部</button>
                <template v-for="category in categoryList" :key="category.Id">
                    <button class="category-button" :id="'category-' + category.Id" @click="switchCategory(category.Id)">{{category.CategoryName}}</button>
                </template>
                <button class="category-button" id="category--1" @click="switchCategory(-1)">未審核</button>
            </div>
            <div class="banner-box" v-if="bannerList.length  > 0"><img :src="'/upload/images/' + bannerList[2].FileName"/>
                <div class="mask">
                    <button type="button" @click="clickEditBanner(3)">編輯</button>
                </div>
            </div>
        </div>
    </div>
    <div class="area3">
        <div class="content">
        <template v-for="question in questionList" :key="question.Id">
            <div :class="['question', 'category-' + question.Category_Id]">
                <div class="box-header">
                    <div class="question-icon">
                        <img src="/upload/images/question-icon.png" />
                    </div>
                    <div class="text">
                        <div>提問者：{{question.Name}}</div>
                        <div class="question-header">{{question.Content}}</div>
                    </div>

                    <button class="custom-plus-button" @onclick=""></button>
                    <div class="mask">
                        <button type="button" @click="choosePharmacist(question.Id)">回答問題</button>
                        <button type="button" @click="clickDeleteQuestion(question.Id)">刪除問題</button>
                    </div>
                </div>
                <div class="answer-box" id="'answer-' + question.Id">
                    <template v-for="answer in question.AnswerList">

                        <div class="answer-content">
                            <div class="answer-detail">
                                <div class="answer-detail-box" style="color: #E84C2E;">
                                    <div class="img-box">
                                        <img :src="'/upload/images/' + answer.FileName" alt="" />
                                    </div>
                                {{answer.Name}} {{answer.Position}} {{answer.Pharmacy}}</div>
                                <div>{{answer.Content}}</div>
                            </div>
                            <div class="mask">
                                <button type="button" @click="clickDeleteAnswer(answer.Id)">刪除回答</button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
        <template v-for="question in unCheckedQuestionList" :key="question.Id">
            <div class="question unchecked">
                <div class="box-header">
                    <div class="question-icon">
                        <img src="/upload/images/question-icon.png" />
                    </div>
                    <div class="text">
                        <div>提問者：{{question.Name}}</div>
                        <div class="question-header">{{question.Content}}</div>
                    </div>
                    <button class="custom-plus-button" @onclick=""></button>
                </div>
                <div class="mask">
                    <button type="button" @click="clickAcceptQuestion(question.Id)">核准問題</button>
                    <button type="button" @click="clickDeleteQuestion(question.Id)">刪除問題</button>
                </div>
            </div>
        </template>
        </div>
    </div>
</div>
    <div class="btn">
        <button @click=clickAddCategory()>新增分類</button>
        <button @click=clickEditCategory()>編輯分類名稱</button>
        <button @click=clickDeleteCategory()>刪除分類</button>
    </div>
    <edit-window v-if="showEditBannerWindow" :data="editBannerData" @close="closeEditBannerWindow" @save="updateBanner"></edit-window>
    <edit-window v-if="showEditCategoryWindow" :data="editCategoryData" @close="closeEditCategoryWindow" @save="updateCategory"></edit-window>
    <alert-window v-if="showDeleteCategoryAlertWindow" :data="deleteCategoryAlertWindowData" @no="closeAlertWindow" @yes="deleteCategory"></alert-window>
    <pharmacist-window v-if="showPharmacistWindow" :Id="questionId" @no="closePharmacistWindow" @yes="addAnswer"></pharmacist-window>
    <edit-window v-if="showAddAnswerWindow" :data="addAnswerData" @close="closeAddAnswerWindow" @save="createAnswer"></edit-window>
    <alert-window v-if="showDeleteQuestionAlertWindow" :data="deleteQuestionAlertWindowData" @no="closeAlertWindow" @yes="deleteQuestion"></alert-window>
    <alert-window v-if="showDeleteAnswerAlertWindow" :data="deleteAnswerAlertWindowData" @no="closeAlertWindow" @yes="deleteAnswer"></alert-window>
    <option-window v-if="showAcceptQuestionAlertWindow" :data="acceptQuestionAlertWindowData" @no="closeAcceptQuestionAlertWindow" @yes="acceptQuestion"></option-window>

    `
    ,
    //emits: [],
    props: {
    },
    setup(props, context) {
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".forum-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.8}px;`);
            }, 100);
        };
        const Get_Data = () => {
            WebApi.get("Forum/Get_Data/").then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                bannerList.length = 0;
                categoryList.length = 0;
                questionList.length = 0;
                unCheckedQuestionList.length = 0;
                result.data.Data.BannerList.forEach(item => {
                    bannerList.push(item);
                });
                result.data.Data.CategoryList.forEach(item => {
                    categoryList.push(item);
                });
                result.data.Data.QuestionList.forEach(item => {
                    if (item.Acceptance) {
                        questionList.push(item);
                    }
                    if (!item.Acceptance) {
                        unCheckedQuestionList.push(item);
                    }
                });
            });
        }
        const bannerList = reactive([]);
        const editBannerData = reactive({
            table: [],
            img:
            {
                required: true,
                content: "",
            }
        })
        const showEditBannerWindow = ref(false);
        const closeEditBannerWindow = () => {
            showEditBannerWindow.value = false;
        }
        const clickEditBanner = (id) => {
            const banner = bannerList.find(item => item.Id === id);
            editBannerData.img.content = banner.FileName;
            editBannerData.id = id;
            showEditBannerWindow.value = true;
        }
        const updateBanner = (data) => {
            const updateData = {
                Id: data.id,
                FileName: data.img.content
            }
            WebApi.post("Forum/Update_Banner/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeEditBannerWindow();
            });
        }

        //

        const categoryList = reactive([]);
        const editCategoryData = reactive({
            table:[
                {
                    name: "分類名稱：",
                    content: "",
                    type: "text",
                    show: true
                }
            ],
            img: {
                required:false,
                content:"",
            }
        });
        const showEditCategoryWindow = ref(false);
        const closeEditCategoryWindow = () => {
            showEditCategoryWindow.value = false;
        }
        const category_id = ref(0);
        const clickEditCategory = () => {
            if (category_id.value === 0 || category_id.value === 1)return
            const category = categoryList.find(item => item.Id === category_id.value);
            editCategoryData.table[0].content = category.CategoryName;
            editCategoryData.id = category_id.value;
            showEditCategoryWindow.value = true;
        }
        const clickAddCategory = () => {
            editCategoryData.table[0].content = "";
            editCategoryData.id = 0;
            showEditCategoryWindow.value = true;
        }
        const updateCategory = (data) => {
            if (!data.id) {
                //create
                const createData = {
                    CategoryName: data.table[0].content
                }
                WebApi.post("Forum/Create_Category/", createData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditCategoryWindow();
                });
            }
            if (data.id) {
                //update
                const updateData = {
                    Id: data.id,
                    CategoryName: data.table[0].content
                }
                WebApi.post("Forum/Update_Category/", updateData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_Data();
                    closeEditCategoryWindow();
                });
            }
        }
        const showDeleteCategoryAlertWindow = ref(false);
        const deleteCategoryAlertWindowData = reactive({
            message: "確定要刪除此分類與分類下的所有問題嗎？",
            id: 0
        });
        const clickDeleteCategory = () => {
            if (category_id.value === 0 || category_id.value === 1) return
            deleteCategoryAlertWindowData.id = category_id.value;
            showDeleteCategoryAlertWindow.value = true;
        }
        const deleteCategory = (id) => {
            const deleteData = {
                Id: id
            }
            console.log(deleteData)
            WebApi.post("Forum/Delete_Category/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAlertWindow();
            });
        }

        const questionList = reactive([]);
        const unCheckedQuestionList = reactive([]);
        const showAcceptQuestionAlertWindow = ref(false);
        const acceptQuestionAlertWindowData = reactive({
            message: "請選擇問題分類：",
            id: 0,
            option: [],
            optionId: 0
        });
        const closeAcceptQuestionAlertWindow = () => {
            showAcceptQuestionAlertWindow.value = false;
        }
        const clickAcceptQuestion = (id) => {
            acceptQuestionAlertWindowData.id = id;
            acceptQuestionAlertWindowData.option.length = 0;
            categoryList.forEach((category) => {
                const item = {
                    id: category.Id,
                    name: category.CategoryName
                };
                acceptQuestionAlertWindowData.option.push(item);
            });
            showAcceptQuestionAlertWindow.value = true;
        }
        const acceptQuestion = (data) => {
            const updateData = {
                Id: data.id,
                Category_Id: data.optionId
            }
            WebApi.post("Forum/Accept_Question/", updateData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                setTimeout(() => {
                    switchCategory(-1);
                }, 100);
                closeAcceptQuestionAlertWindow();
            });
        }

        const showPharmacistWindow = ref(false);
        const closePharmacistWindow = () => {
            showPharmacistWindow.value = false;
        }
        const questionId = ref(0);
        const choosePharmacist = (id) => {
            questionId.value = id;
            showPharmacistWindow.value = true;
        }
        const switchCategory = (id) => {
            if (!id) {
                let questions = document.getElementsByClassName('question');
                for (let elQuestion of questions) {
                    elQuestion.style.display = 'flex';
                }
                let fitCategoryQuestions = document.getElementsByClassName(`unchecked`);
                for (let elQuestion of fitCategoryQuestions) {
                    elQuestion.style.display = 'none';
                }
            }
            if (id>0) {
                let questions = document.getElementsByClassName('question');
                for (let elQuestion of questions) {
                    elQuestion.style.display = 'none';
                }
                let fitCategoryQuestions = document.getElementsByClassName(`category-${id}`);
                for (let elQuestion of fitCategoryQuestions) {
                    elQuestion.style.display = 'flex';
                }
            }
            if (id == -1) {
                let questions = document.getElementsByClassName('question');
                for (let elQuestion of questions) {
                    elQuestion.style.display = 'none';
                }
                let fitCategoryQuestions = document.getElementsByClassName(`unchecked`);
                for (let elQuestion of fitCategoryQuestions) {
                    elQuestion.style.display = 'flex';
                }
            }
            const elBtns = document.getElementsByClassName('category-button');
            Array.from(elBtns).forEach(btn=> {
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                }
            });
            const elBtn = document.getElementById(`category-${id}`);
            elBtn.classList.add('active');
            category_id.value = id;
        }

        const addAnswerData = reactive({
            table: [
                {
                    name: "回答：",
                    content: "",
                    type: "textarea",
                    show: true
                }
            ],
            img:
            {
                required: false,
                content: "",
            },
            pharmacist: {
            },
            questionId: 0,
            pharmacistId: 0
        });
        const showAddAnswerWindow = ref(false);
        const addAnswer = (data) => {
            addAnswerData.table[0].content = "";
            addAnswerData.questionId = data.Id
            addAnswerData.pharmacistId = data.pharmacistId
            WebApi.get(`Pharmacist/Get_PharmacistData/${data.pharmacistId}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                const pharmacist=result.data.Data
                addAnswerData.pharmacist.Name = pharmacist.Name;
                addAnswerData.pharmacist.FileName = pharmacist.FileName;
                addAnswerData.pharmacist.Position = pharmacist.Position;
                addAnswerData.pharmacist.Pharmacy = pharmacist.Pharmacy;
                closePharmacistWindow();
                showAddAnswerWindow.value = true;
            });
        }
        const closeAddAnswerWindow = () => {
            showAddAnswerWindow.value = false;
        }
        const createAnswer = (data) => {
            const createData = {
                Question_Id: data.questionId,
                Pharmacist_Id: data.pharmacistId,
                Content: data.table[0].content
            };
            WebApi.post("Forum/Create_Answer_Official/", createData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAddAnswerWindow();
            });
        }

        const showDeleteQuestionAlertWindow = ref(false);
        const showDeleteAnswerAlertWindow = ref(false);
        const deleteQuestionAlertWindowData = reactive({
            message: "確定要刪除這則問題嗎？",
            id: 0
        });
        const deleteAnswerAlertWindowData = reactive({
            message: "確定要刪除這則回答嗎？",
            id: 0
        });
        const closeAlertWindow = () => {
            showDeleteQuestionAlertWindow.value = false;
            showDeleteAnswerAlertWindow.value = false;
            showDeleteCategoryAlertWindow.value = false;
        }
        const clickDeleteQuestion = (id) => {
            deleteQuestionAlertWindowData.id = id;
            showDeleteQuestionAlertWindow.value=true
        }
        const clickDeleteAnswer = (id) => {
            deleteAnswerAlertWindowData.id = id;
            showDeleteAnswerAlertWindow.value = true
        }
        const deleteQuestion = (id) => {
            const deleteData = {
                Id: id
            }
            WebApi.post("Forum/Delete_Question/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAlertWindow();
            });
        }
        const deleteAnswer = (id) => {
            const deleteData = {
                Id: id
            }
            WebApi.post("Forum/Delete_Answer/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                Get_Data();
                closeAlertWindow();
            });
        }
        onMounted(() => {
            Get_Data();
            Page_Setting();
        });

        return {
            bannerList,
            editBannerData,
            showEditBannerWindow,
            closeEditBannerWindow,
            clickEditBanner,
            updateBanner,

            categoryList,
            editCategoryData,
            showEditCategoryWindow,
            closeEditCategoryWindow,
            clickEditCategory,
            clickAddCategory,
            updateCategory,
            clickDeleteCategory,
            deleteCategoryAlertWindowData,
            deleteCategory,
            showDeleteCategoryAlertWindow,

            questionList,
            unCheckedQuestionList,
            showAcceptQuestionAlertWindow,
            acceptQuestionAlertWindowData,
            closeAcceptQuestionAlertWindow,
            clickAcceptQuestion,
            acceptQuestion,

            showPharmacistWindow,
            closePharmacistWindow,
            choosePharmacist,
            addAnswer,
            questionId,
            showAddAnswerWindow,
            addAnswerData,
            closeAddAnswerWindow,
            createAnswer,

            switchCategory,

            showDeleteQuestionAlertWindow,
            showDeleteAnswerAlertWindow,
            deleteQuestionAlertWindowData,
            deleteAnswerAlertWindowData,
            closeAlertWindow,
            clickDeleteQuestion,
            clickDeleteAnswer,

            deleteQuestion,
            deleteAnswer,

        };
    },
    components: {
        "edit-window": editWindow,
        "alert-window": alertWindow,
        "pharmacist-window": pharmacistWindow,
        "option-window": optionWindow
    }
};