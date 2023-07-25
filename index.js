function set_content(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;
        document.getElementById('contents').innerHTML= this.responseText;
        scroll(0, 0)
    };
    xhr.send();
}
set_content('main.html')
