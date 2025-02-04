
let ctx = self;

ctx.addEventListener("message", ({ data }) => {
    let file = data.file;
    let fileName = data.Name;

    function Base64toFile(base64, name) {
        let arr = base64.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], name, { type: mime });
    };

    ctx.createImageBitmap(file).then((img) => {
        let canvas = new OffscreenCanvas(img.width, img.height);
        let context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.fillStyle = "rgba(255, 255, 255, 0)";
        context.fillRect(0, 0, img.width, img.height);
        context.drawImage(img, 0, 0, img.width, img.height);

        // OffscreenCanvas 沒有 toDataURL("image/webp") 方法
        // Webp-CanvasToBase64
        canvas.convertToBlob({ type: "image/webp", quality: 0.8 }).then((blob) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(Base64toFile(reader.result, fileName)); // toFile
                };
                reader.readAsDataURL(blob);
            });
        }).then((base64) => {
            context.clearRect(0, 0, img.width, img.height); // 清除
            canvas = null;
            ctx.postMessage(base64);
        });
    });
});