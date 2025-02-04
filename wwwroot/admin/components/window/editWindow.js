const { ref, reactive, onMounted } = Vue;
import { WebApi } from "../shared/shared.js";

export default {
    template: `
    <div class="edit-window">
        <div class="box edit-title" v-if="data.option">
            <label>選擇編輯類型：</label>
            <select v-model="data.typeSetting" @change="changeOption">
                <option v-for="option in data.option" :value="option.content">{{option.name}}</option>
            </select>
        </div>
        <template v-for="table in data.table">
            <div class="box" v-if="table.show">
                <span v-if="table.type === 'text' || table.type === 'textarea'">{{table.name}}</span>
                <input type="text" v-if="table.type === 'text'" v-model="table.content" />
                <textarea v-if="table.type === 'textarea'" v-model="table.content"/>
            </div>
        </template>
        <div class="box">
            <template v-if="data.img.required" class= "img-container">
                <div class="img-box" v-if="data.img.content.length > 0">
                    <span>原本的圖片：</span>
                    <img :src="'/upload/images/' + data.img.content" alt=""/>
                </div>
                <div class="img-box" v-if="data.img.content.length > 0">
                    <span>修改後圖片：</span>
                    <img v-if = "selectedImage" :src="'/upload/images/' + windowAfterImg" alt="" />
                </div>
                <div class="img-box" v-if="data.img.content.length == 0">
                    <span>圖片：</span>
                    <img v-if = "selectedImage" :src="'/upload/images/' + windowAfterImg" alt="" />
                </div>
            </template>
        </div>
        <div class="box" v-if="data.img.required">
            <span>選擇圖片：</span>
            <input type="file" accept="image/jpeg,image/png,image/x-icon,image/svg+xml,image/webp,image/gif" @change="SelectFiles($event)"/>
        </div>
        <div class="button-box" v-if="data.addButton">
            <button type="button" @click="add">{{data.addButton}}</button>
            <button type="button" @click="remove">{{data.removeButton}}</button>
        </div>
        <div class="button-box">
            <button type="button" @click="close">關閉</button>
            <button type="button" @click="save">儲存</button>
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
`,
    emits: ["close", "save"],
    props: {
        "data": { type: Object, required: true },
    },
    setup(props, context) {

        //圖片上傳
        const selectedImage = ref(false);
        const windowAfterImg = ref(""); 
        const SelectFiles = (event) => {
            console.log('0')

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
        const overwrite = async () => {
            await ImageToBase64(existFile.value);
            closeExistenceWindow();
        }

        const data = props.data;
        const windowType = ref("");
        const close = () => {
            context.emit("close");
        };
        const save = () => {
            if (data.allowEmpty) {
                if (selectedImage.value) {
                    data.img.content = windowAfterImg;
                }
                context.emit("save", data);
                return
            }
            if (data.table.some((item) => {
                return item.content.length === 0
            }) && data.typeSetting!=="img" ) {
                return
            }
            if (selectedImage.value) {
                data.img.content = windowAfterImg;
            }
            context.emit("save", data);
        };
        const changeOption = () => {
            if (data.typeSetting === "img") {
                data.table[0].show = false;
                data.img.required = true;
            }
            else if (data.typeSetting === "p") {
                data.table[0].type = "textarea";
                data.table[0].show = true;
                data.img.required = false;
            }
            else if (data.typeSetting === "h4" || data.typeSetting === "h5") {
                data.table[0].type = "text";
                data.table[0].show = true;
                data.img.required = false;
            }
            else if (data.typeSetting === "text1" || data.typeSetting === "text2") {
                data.table[0].type = "textarea";
                data.table[0].show = true;
                data.img.required = true;
            }
            else if (data.typeSetting === "text3") {
                data.table[0].type = "textarea";
                data.table[0].show = true;
                data.img.required = false;
            }
        }

        const getData = () => {

        }
        const add = () => {
            const item = {
                content: "",
                name: data.addName,
                show: true,
                type: "text",
            }
            data.table.push(item);
        }
        const remove = () => {
            data.table.pop();
        }

        onMounted(() => {
            getData();
        });

        return {
            close,
            save,
            SelectFiles,
            existFile,
            showExistence,
            closeExistenceWindow,
            overwrite,
            windowType,
            selectedImage,
            windowAfterImg,
            changeOption,
            add,
            remove,
        };
    },
    components: {
    }
};
