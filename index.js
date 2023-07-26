var rainbow_checkbox;
function set_content(path) {
    rainbow_checkbox.checked = false;
    fetch(path)
    .then(response => response.text())
    .then(html => {
        document.getElementById('contents').innerHTML = html;
    });
}

function rainbowize_text(text) {
    res = '';
    for (let i = 0; i < text.length; i++) {
        const color = Math.floor(Math.random()*16777215).toString(16)
        res += `<span style='color:#${color}'>${text.charAt(i)}</span>`;
    }
    return res;
}

const initial_state = new Map();

function rainbow(element) {
    if (element.style && element.childNodes.length == 1) {
        initial_state.set(element, element.innerHTML)
        element.innerHTML = rainbowize_text(element.innerHTML)
    } else {
        element.childNodes.forEach(child => {
            rainbow(child)
        });
    }
}

function derainbow(element) {
    for (let [key, value] of initial_state) {
        key.innerHTML = value
    }
    initial_state.clear()
}

function wrap_text_in_spans(contents) {
    for (let i = 0; i < contents.childNodes.length; i++) {
        if (contents.childNodes[i].nodeType == Node.TEXT_NODE) {
            const text = contents.childNodes[i].data;
            contents.replaceChild(document.createElement('span'), contents.childNodes[i]);
            contents.childNodes[i].innerHTML = text;
        }
    }
}

window.onload = ()=> {
    rainbow_checkbox = document.getElementById('rainbow-toggle');
    set_content('main.html');

    const sidebar_checkbox = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    sidebar_checkbox.addEventListener('change', () => {
        sidebar.style.transform = sidebar_checkbox.checked ? 'translate(-100%, 0)' : 'none';
    });

    rainbow_checkbox.addEventListener('change', () => {
        const contents = document.getElementById('contents');
        if (rainbow_checkbox.checked) {
            if (contents.childNodes.length > 1) {
                wrap_text_in_spans(contents);
            }
            rainbow(contents);
        } else {
            derainbow(contents);
        }
    });

}
