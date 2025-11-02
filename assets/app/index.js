// Funkcja konwersji zdjęcia na czarno-białe
function convertToGrayscale(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageElement.width || imageElement.naturalWidth;
    canvas.height = imageElement.height || imageElement.naturalHeight;
    
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
}

var selector = document.querySelector(".selector_box");
selector.addEventListener('click', () => {
    if (selector.classList.contains("selector_open")){
        selector.classList.remove("selector_open")
    }else{
        selector.classList.add("selector_open")
    }
})

document.querySelectorAll(".date_input").forEach((element) => {
    element.addEventListener('click', () => {
        document.querySelector(".date").classList.remove("error_shown")
    })
})

var sex = "m"

document.querySelectorAll(".selector_option").forEach((option) => {
    option.addEventListener('click', () => {
        sex = option.id;
        document.querySelector(".selected_text").innerHTML = option.innerHTML;
        selector.classList.remove("selector_open");
    })
})

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";

document.querySelectorAll(".input_holder").forEach((element) => {
    var input = element.querySelector(".input");
    input.addEventListener('click', () => {
        element.classList.remove("error_shown");
    })
});

upload.addEventListener('click', () => {
    imageInput.click();
    upload.classList.remove("error_shown")
});

imageInput.addEventListener('change', (event) => {
    upload.classList.remove("upload_loaded");
    upload.classList.add("upload_loading");
    upload.removeAttribute("selected")

    var file = imageInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            // Konwertuj na czarno-białe
            var grayscaleBase64 = convertToGrayscale(img);
            
            // Spróbuj przesłać do Imgur
            var formData = new FormData();
            formData.append("image", dataURLtoBlob(grayscaleBase64));

            fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Client-ID ec67bcef2e19c08'
                },
                body: formData
            })
            .then(result => result.json())
            .then(response => {
                if (response.success && response.data && response.data.link) {
                    var url = response.data.link;
                    upload.classList.remove("error_shown")
                    upload.setAttribute("selected", url);
                    upload.classList.add("upload_loaded");
                    upload.classList.remove("upload_loading");
                    upload.querySelector(".upload_uploaded").src = url;
                } else {
                    // Fallback - użyj base64
                    upload.classList.remove("error_shown")
                    upload.setAttribute("selected", grayscaleBase64);
                    upload.classList.add("upload_loaded");
                    upload.classList.remove("upload_loading");
                    upload.querySelector(".upload_uploaded").src = grayscaleBase64;
                }
            })
            .catch(error => {
                // Fallback - użyj base64
                upload.classList.remove("error_shown")
                upload.setAttribute("selected", grayscaleBase64);
                upload.classList.add("upload_loaded");
                upload.classList.remove("upload_loading");
                upload.querySelector(".upload_uploaded").src = grayscaleBase64;
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
})

// Funkcja konwersji dataURL na Blob
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

document.querySelector(".go").addEventListener('click', () => {
    var empty = [];
    var params = new URLSearchParams();

    params.set("sex", sex)
    
    if (!upload.hasAttribute("selected")){
        empty.push(upload);
        upload.classList.add("error_shown")
    }else{
        params.set("image", upload.getAttribute("selected"))
    }

    var birthday = "";
    var dateEmpty = false;
    document.querySelectorAll(".date_input").forEach((element) => {
        birthday = birthday + "." + element.value
        if (isEmpty(element.value)){
            dateEmpty = true;
        }
    })

    birthday = birthday.substring(1);

    if (dateEmpty){
        var dateElement = document.querySelector(".date");
        dateElement.classList.add("error_shown");
        empty.push(dateElement);
    }else{
        params.set("birthday", birthday)
    }

    document.querySelectorAll(".input_holder").forEach((element) => {
        var input = element.querySelector(".input");

        if (isEmpty(input.value)){
            empty.push(element);
            element.classList.add("error_shown");
        }else{
            // Użyj poprawnej nazwy dla adresów (adress1, adress2 zamiast address1, address2)
            var paramName = input.id;
            if (input.id === 'adress1' || input.id === 'adress2') {
                paramName = input.id; // już jest poprawne
            }
            params.set(paramName, input.value)
        }
    })

    if (empty.length != 0){
        empty[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }else{
        forwardToDocuments(params);
    }
});

function isEmpty(value){
    let pattern = /^\s*$/
    return pattern.test(value);
}

function forwardToDocuments(params){
    // Przekieruj do documents.html z parametrami, a następnie automatycznie do card.html
    location.href = "/dowodplska/documents.html?" + params.toString()
}

var guide = document.querySelector(".guide_holder");
guide.addEventListener('click', () => {
    if (guide.classList.contains("unfolded")){
        guide.classList.remove("unfolded")
    }else{
        guide.classList.add("unfolded")
    }
})

