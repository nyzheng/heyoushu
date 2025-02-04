
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { Version } from "../shared/shared.js";

let home = defineAsyncComponent(() => import(`../home/home.js${Version.value}`)); // 首頁
let about = defineAsyncComponent(() => import(`../about/about.js${Version.value}`)); // 關於荷友舒
let articlePage = defineAsyncComponent(() => import(`../article/article.js${Version.value}`)); // 荷友舒聊百病
let imageManage = defineAsyncComponent(() => import(`../image-manage/image-manage.js${Version.value}`)); 
let pharmacy = defineAsyncComponent(() => import(`../pharmacy/pharmacy.js${Version.value}`)); 
let pharmacist = defineAsyncComponent(() => import(`../pharmacist/pharmacist.js${Version.value}`)); 
let order = defineAsyncComponent(() => import(`../order/order.js${Version.value}`)); 
let footerPage = defineAsyncComponent(() => import(`../footer/footer.js${Version.value}`)); 
let news = defineAsyncComponent(() => import(`../news/news.js${Version.value}`)); 
let forum = defineAsyncComponent(() => import(`../forum/forum.js${Version.value}`)); 
let product = defineAsyncComponent(() => import(`../product/product.js${Version.value}`)); 
let banner = defineAsyncComponent(() => import(`../banner/banner.js${Version.value}`)); 



export default {
    template: `
<div class="default-container">
    <div class="area1">
        <nav>
            <ul>
                <li v-for="item in LeftMenu" :key="item.Id" :class="{ active: item.Show }" @click="LeftMenu_Click(item.Id)">
                    <span>{{ item.Name }}</span>
                </li>
            </ul>
        </nav>
    </div>
    <div class="area2">
        <div class="up">
           
        </div>
        <div class="down">
            <home v-if = "LeftMenu_GetShow(1)" :editBanner="editBanner" :editPharmacist="editPharmacist" :editArticle="editArticle"></home>
            <about v-if = "LeftMenu_GetShow(2)"></about>
            <article-page v-if = "LeftMenu_GetShow(6)"></article-page>
            <pharmacy v-if = "LeftMenu_GetShow(4)"></pharmacy>
            <pharmacist v-if = "LeftMenu_GetShow(3)"></pharmacist>
            <order v-if="LeftMenu_GetShow(5)"></order>
            <footer-page v-if="LeftMenu_GetShow(7)"></footer-page>
            <news v-if="LeftMenu_GetShow(8)"></news>
            <forum v-if="LeftMenu_GetShow(9)"></forum>
            <product v-if="LeftMenu_GetShow(10)"></product>
            <banner v-if="showBanner"></banner>
        </div>
    </div>
</div>
`,
    //emits: [],
    props: {
    },
    setup(props, context) {

        // Menu Start
        const LeftMenu = reactive([
            { Id: 1, Name: "首頁", Show: false },
            { Id: 2, Name: "關於荷友舒", Show: false },
            { Id: 3, Name: "藥師檔案庫", Show: false },
            { Id: 4, Name: "荷友舒藥局位置", Show: false },
            { Id: 6, Name: "荷友舒聊百病", Show: false },
            { Id: 8, Name: "最新消息", Show: false },
            { Id: 9, Name: "藥品即時問", Show: false },
            { Id: 10, Name: "藥師優品推薦", Show: false },
            { Id: 5, Name: "排序", Show: false },
            { Id: 7, Name: "頁尾", Show: false },
        ]);

        const LeftMenu_Click = (MyId) => {
            showBanner.value = false;
            for (let item of LeftMenu) {
                item.Id === MyId ? item.Show = true : item.Show = false;
            }
        };

        const LeftMenu_GetShow = computed(() => (val) => {
            return LeftMenu.find(item => item.Id === val).Show;
        });
        // Menu End

        const editPharmacist = () => {
            LeftMenu_Click(3);
        }
        const editArticle = () => {
            LeftMenu_Click(6);
        }
        const editBanner = () => {
            showBanner.value = true;
            for (let item of LeftMenu) {
                item.Show = false;
            }
        }
        const showBanner = ref(false);
        onMounted(() => {

        });

        return {
            LeftMenu,
            LeftMenu_Click,
            LeftMenu_GetShow,
            editPharmacist,
            editArticle,
            showBanner,
            editBanner,
        };
    },
    components: {
        "home": home,
        "about": about,
        "article-page": articlePage,
        "image-manage": imageManage,
        "pharmacy": pharmacy,
        "pharmacist": pharmacist,
        "order": order,
        "footer-page": footerPage,
        "news": news,
        "forum": forum,
        "product": product,
        "banner": banner,

    }
};
