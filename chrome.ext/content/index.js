console.log("this is index.js")
console.log(document)
console.log(location)

// const messageHtmlTemplate = `
//       <div class="text-block" id="message_###ID" onclick="playAudio(###starttime, ###endtime)">
//       <div class="time-block">###starttime_format</div>
//       <span>###message</span><br/>
//       <span>###translate</span>
//       </div>
// `;
const messageHtmlTemplate = `
    <div class="text-block">
        <span>###message</span><br/>
        <span>###translate</span>
    </div>
`;

const scrollableDiv = $(`
    <div id="cj_scrollable_div">

    </div>
`)


//创建页面函数
function createPage() {
    const page = $('<div id="cj_move_page"></div>')
    const h3 = $('<div style="border-bottom: darkgray 1px solid;height: 30px;"><h3 id="cj_move_h3"> ============= Recognizing... ============= </h3></div>')

    page.append(h3)
    page.append(scrollableDiv)
    page.append('<div id="current-message-en" style="background-color: #ffff0088"></div>')
    page.append('<div id="current-message-cn" style="background-color: #00ff0055"></div>')
    $('body').append(page)
    //拖拽
    drag(cj_move_h3)
}
createPage()

//拖拽
function drag(ele) {
    let oldX, oldY, newX, newY
    ele.onmousedown = function (e) {
        if (!cj_move_page.style.right && !cj_move_page.style.bottom) {
            cj_move_page.style.right = 0
            cj_move_page.style.bottom = 0
        }
        oldX = e.clientX
        oldY = e.clientY
        document.onmousemove = function (e) {
            newX = e.clientX
            newY = e.clientY
            cj_move_page.style.right = parseInt(cj_move_page.style.right) - newX + oldX + 'px'
            cj_move_page.style.bottom = parseInt(cj_move_page.style.bottom) - newY + oldY + 'px'
            oldX = newX
            oldY = newY
        }
        document.onmouseup = function () {
            document.onmousemove = null
            document.onmouseup = null
        }
    }
}

let lastMessage = {};

chrome.runtime.onMessage.addListener(async (message) => {
    console.log('Received message in content script:', message);
    const currentMessageEnDiv = document.getElementById('current-message-en');
    const currentMessageCnDiv = document.getElementById('current-message-cn');


    if (message.type === 'update-dom') {
        if (!message.content.text) {
            return;
        }
        
        currentMessageEnDiv.textContent = message.content.text;
        currentMessageCnDiv.textContent  = message.content.translatecn[0];
        lastMessage = message.content;

    } else if (message.type === 'create-dom') {
        const messageDiv = $(messageHtmlTemplate.replace('###message', lastMessage.text).replace('###translate', lastMessage.translatecn[0]))

        console.log('lastMessage:', lastMessage);
        console.log('cj_scrollable_div1:', $('#cj_scrollable_div'));
        
        $('#cj_scrollable_div').append(messageDiv)
        //cj_scrollable_div1.appendChild(messageDiv)
        currentMessageEnDiv.textContent = '';
        currentMessageCnDiv.textContent  = '';
        lastMessage = {};

        scrollToBottom(document.getElementById('cj_scrollable_div'))
    }
});


function scrollToBottom(divElement) {
    // div的滚动高度 + div的客户区高度 >= div的总高度,说明已经滚动到底部
    if (divElement.scrollTop + divElement.clientHeight >= divElement.scrollHeight) return

    divElement.scrollTop = divElement.scrollHeight  // 滚动到底部
}
