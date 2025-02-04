
const { ref, reactive, computed, onMounted, defineAsyncComponent } = Vue;

import { WebApi } from "../shared/shared.js";
let editWindow = defineAsyncComponent(() => import(`../window/editWindow.js`));

export default {
    template: `
    <div class="pharmacy-container pages-scale">
        <div class="area1">
            <div class="content">
                <div class="title">
                    <a @click="switchRegion(1)" :class="{ 'active': RegionButton === 1 }">北部</a>
                    <a @click="switchRegion(2)" :class="{ 'active': RegionButton === 2 }">中部</a>
                    <a @click="switchRegion(3)" :class="{ 'active': RegionButton === 3 }">南部</a>
                </div>
                <div class="store-container">
                    <div class="store-box" v-for="PharmacyBox in PharmacyData">
                        <div class="store" v-for="Pharmacy in PharmacyBox">
                            <div class="img-box">
                                <img :src="'../../../upload/images/' + Pharmacy.FileName" alt="" />
                            </div>
                            <p style="font-size: 20px; margin-top: 10px">{{Pharmacy.PharmacyName}}</p>
                            <p style="color: #676767; margin-top: 10px">{{Pharmacy.Address}}</p>
                            <p style="color: #676767">{{Pharmacy.PhoneNumber}}</p>
                            <div class="mask">
                                <button type="button" @click="changeRegion(Pharmacy)">變更區域</button>
                                <button type="button" @click="clickEditPharmacy(Pharmacy)">編輯</button>
                                <button type="button" @click="clickDeletePharmacy(Pharmacy.Id)">刪除</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

        
    <div class="window" v-if="Edit_Show" >
        <div class="box">
            <span>藥局名稱：</span>
            <input type="text" v-model="Edit_PharmacyName" />
        </div>
        <div class="box">
            <span>地址：</span>
            <input type="text"  v-model="Edit_Address" />
        </div>
        <div class="box">
            <span>電話號碼：</span>
            <input type="text"  v-model="Edit_PhoneNumber" />
        </div>
        <div class="box">
            <span>原本的圖片：</span>
            <img :src="'../../../upload/images/' + Edit_Before_Img" alt="" />
            <span>修改後圖片：</span>
            <img v-if = "selectedImage" :src="'../../../upload/images/' + Edit_After_Img " alt="" />
        </div>
        <div class="box">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="button-box">
            <button type="button" @click="close">關閉</button>
            <button type="button" @click="save">儲存</button>
        </div>
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

    <div class="btn">
        <button @click=clickCreatePharmacy()>新增</button>
    </div>
    <div class="alertWindow" v-if="showAlertWindow" >
        <div class="box">
            <span>確定要進行刪除嗎</span>
        </div>

        <div class="button-box">
            <button type="button" @click="deletePharmacy">是</button>
            <button type="button" @click="close">否</button>
        </div>
    </div>

    <edit-window v-if="showEditPharmacyWindow" :data="editPharmacyData"  @close="closeEditWindow" @save="updatePharmacy"></edit-window>
`,
    //emits: [],
    props: {


    },
    setup(props, context) {
        //畫面調短
        const Page_Setting = () => {
            setTimeout(() => {
                let dom = document.querySelector(".pharmacy-container");
                dom && (dom.style.cssText = `height: ${dom.offsetHeight * 0.7}px;`);
            }, 100);
        };
        const PharmacyData = reactive([]);
        const regionData = reactive([]);


        const Edit_Show = ref(false);
        const Edit_Id = ref(0);
        const Edit_Region = ref("");
        const Edit_PharmacyName = ref("");
        const Edit_Address = ref("");
        const Edit_PhoneNumber = ref("");
        const Edit_Before_Img = ref("");
        const Edit_After_Img = ref("");
        const selectedImage = ref(false);
        const Edit_Region_Show = ref(false);

        const getEditPharmacy = (Id) => {
            editWindowType.value = "edit";
            selectedImage.value = false;
            let Edit_Pharmacy = {};
            for (let PharmacyBox of PharmacyData) {
                for (let Pharmacy of PharmacyBox) {
                    if (Pharmacy.Id === Id) {
                        Edit_Pharmacy = Pharmacy;
                    }
                }
            }
            Edit_Id.value = Id;
            Edit_Region.value = Edit_Pharmacy.Region_Id;
            Edit_PharmacyName.value = Edit_Pharmacy.PharmacyName;  
            Edit_Address.value = Edit_Pharmacy.Address;
            Edit_PhoneNumber.value = Edit_Pharmacy.PhoneNumber;
            Edit_Before_Img.value = Edit_Pharmacy.FileName;

            Edit_Show.value = true;
        }
        const close = () => {
            Edit_Show.value = false;
            showAlertWindow.value = false;
        }
        const save = () => {
            if (editWindowType.value === "edit") {
                const data = {
                    Id: Edit_Id.value,
                    Region_Id: Edit_Region.value,
                    PharmacyName: Edit_PharmacyName.value,
                    Address: Edit_Address.value,
                    PhoneNumber: Edit_PhoneNumber.value,
                    FileName: selectedImage.value ? Edit_After_Img.value : Edit_Before_Img.value
                }
                WebApi.post("Pharmacy/Update_Data", data).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return; 
                    }
                    close()
                    Get_PharmacyData();
                });
            }
            if (editWindowType.value === "add") {
                const data = {
                    Region_Id: Edit_Region.value,
                    PharmacyName: Edit_PharmacyName.value,
                    Address: Edit_Address.value,
                    PhoneNumber: Edit_PhoneNumber.value,
                    FileName: selectedImage.value ? Edit_After_Img.value : Edit_Before_Img.value,
                    DisplayOrder: 0
                }
                WebApi.post("Pharmacy/Create_Data", data).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    close()
                    Get_PharmacyData();
                });
            }
        }
        const RegionButton = ref(1);
        const pharmacyId = ref(0);
        const regionId = ref(0);
        
        const Get_PharmacyData = () => {
            PharmacyData.length = 0;
            regionData.length = 0;
            WebApi.get(`Pharmacy/Get_Data/${RegionButton.value}`).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                
                let pharmacyBox = []
                for (let pharmacy of result.data.Data.PharmacyList) {
                    if (pharmacyBox.length === 3) {
                        PharmacyData.push(pharmacyBox);
                        pharmacyBox = []
                    } 
                    pharmacyBox.push(pharmacy)
                }
                PharmacyData.push(pharmacyBox);

                for (let region of result.data.Data.RegionList) {
                    regionData.push(region);
                }
            });
        };

        const switchRegion = (region) => {
            RegionButton.value = region;
            Get_PharmacyData();
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
        const editWindowType=ref("edit")
        const createNewPharmacy = () => {
            Edit_Region.value = RegionButton.value;
            Edit_PharmacyName.value = "";
            Edit_Address.value = "";
            Edit_PhoneNumber.value = "";
            Edit_Before_Img.value = "";
            selectedImage.value = false;
            editWindowType.value = "add";

            Edit_Show.value = true;
        }
        const clickDeletePharmacy = (id) => {
            deletePharmacyId.value = id;
            showAlertWindow.value = true;
        }
        const deletePharmacy = () => {
            const deleteData = { Id: deletePharmacyId.value }
            WebApi.post("Pharmacy/Delete_Data/", deleteData).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                close();
                Get_PharmacyData();
            });
        }

        const changeRegion = (pharmacy) => {
            pharmacyId.value = pharmacy.Id;
            regionId.value = pharmacy.Region_Id;
            Edit_Region_Show.value = true;
        }
        const closeChangeRegion = () => {
            Edit_Region_Show.value = false;
        }
        const saveChangeRegion = () => {
            //
            const data = {
                Id: pharmacyId.value,
                Region_Id : regionId.value
            }
            WebApi.post("Pharmacy/UpdatePharmacyRegion", data).then((result) => {
                if (result.data.HttpCode !== 200) {
                    console.error(result.data.Message);
                    return;
                }
                closeChangeRegion();
                Get_PharmacyData();
            });
        }
        const showAlertWindow = ref(false);
        const deletePharmacyId = ref(0);

        //
        const showEditPharmacyWindow = ref(false);
        const editPharmacyData = reactive({
            table: [
                {
                    type: "text",
                    name: "藥局名稱：",
                    content: "",
                    show: true,
                },
                {
                    type: "text",
                    name: "藥局地址：",
                    content: "",
                    show: true,
                },
                {
                    type: "text",
                    name: "電話號碼：",
                    content: "",
                    show: true,
                },

            ],
            img: {
                required: true,
                content: "",
            }
        })
        const closeEditWindow = () => {
            showEditPharmacyWindow.value = false;
        }

        const clickEditPharmacy = (pharmacy) => {
            editPharmacyData.table[0].content = pharmacy.PharmacyName;
            editPharmacyData.table[1].content = pharmacy.Address;
            editPharmacyData.table[2].content = pharmacy.PhoneNumber;
            editPharmacyData.img.content = pharmacy.FileName;
            editPharmacyData.id = pharmacy.Id;
            editPharmacyData.regionId = 0;
            showEditPharmacyWindow.value = true;
        }

        const updatePharmacy = (data) => {
            if (data.id) {
                const updateData = {
                    Id: data.id,
                    PharmacyName: data.table[0].content,
                    Address: data.table[1].content,
                    PhoneNumber: data.table[2].content,
                    FileName: data.img.content,
                }
                WebApi.post("Pharmacy/Update_Data", updateData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_PharmacyData();
                    closeEditWindow();
                });
            }
            if (!data.id) {
                const createData = {
                    Region_Id: data.regionId,
                    PharmacyName: data.table[0].content,
                    Address: data.table[1].content,
                    PhoneNumber: data.table[2].content,
                    FileName: data.img.content,
                    DisplayOrder: 0
                }
                WebApi.post("Pharmacy/Create_Data", createData).then((result) => {
                    if (result.data.HttpCode !== 200) {
                        console.error(result.data.Message);
                        return;
                    }
                    Get_PharmacyData();
                    closeEditWindow();

                });
            }
        }

        const clickCreatePharmacy = () => {
            editPharmacyData.table[0].content = "";
            editPharmacyData.table[1].content = "";
            editPharmacyData.table[2].content = "";
            editPharmacyData.img.content = "";
            editPharmacyData.id = 0;
            editPharmacyData.regionId = RegionButton.value;
            showEditPharmacyWindow.value = true;
        }
        onMounted(() => {
            Get_PharmacyData();
            Page_Setting();
        });

        return {
            PharmacyData,
            Edit_Show,
            Edit_Region,
            Edit_PharmacyName,
            Edit_Address,
            Edit_PhoneNumber,
            Edit_Before_Img,
            Edit_After_Img,
            selectedImage,

            getEditPharmacy,
            close,
            save,
            switchRegion,
            RegionButton,

            SelectFiles,

            createNewPharmacy,
            editWindowType,
            deletePharmacy,

            Edit_Region_Show,
            pharmacyId,
            regionId,
            regionData,
            changeRegion,
            closeChangeRegion,
            saveChangeRegion,

            clickDeletePharmacy,
            showAlertWindow,
            deletePharmacyId,

            showEditPharmacyWindow,
            editPharmacyData,
            closeEditWindow,
            clickEditPharmacy,
            updatePharmacy,

            clickCreatePharmacy,
        };
    },
    components: {
        "edit-window": editWindow
    }
};
