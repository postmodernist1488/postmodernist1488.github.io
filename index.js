function load_html(path, id) {
    var xhr=new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;
        document.getElementById(id).innerHTML= this.responseText;
    };
    xhr.send();
}
load_html('sidebar.html', 'sidebar')
