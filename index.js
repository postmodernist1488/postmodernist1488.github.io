var xhr= new XMLHttpRequest();
xhr.open('GET', 'sidebar.html', true);
xhr.onreadystatechange = function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return;
    document.getElementById('sidebar').innerHTML= this.responseText;
};
xhr.send();
