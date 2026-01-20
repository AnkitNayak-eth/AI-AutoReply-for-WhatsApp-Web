console.log("WhatsApp AI Auto Reply loaded");

/* ================= CONFIG ================= */
const MIN_DELAY_MS = 3000; 
const MAX_DELAY_MS = 8000; 
const REPLY_COOLDOWN_MS = 12000; 
const BATCH_WAIT_MS = 10000; 

/* ================= STATE ================= */
let activeChat = null;
let cachedChatName = null;

let lastHandledText = "";
let lastBotReply = "";
let lastReplyTime = 0;

let replyTimeout = null;
let batchTimeout = null;

/* ================= UTIL ================= */
function randomDelay() {
    return (
        Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) +
        MIN_DELAY_MS
    );
}

/* ================= CHAT NAME ================= */
function getChatName() {
    if (cachedChatName) return cachedChatName;

    const titleSpan = document.querySelector('span[dir="auto"]');
    if (titleSpan) {
        cachedChatName = titleSpan.getAttribute("title").trim();
        return cachedChatName;
    }
    return null;
}

function resetChatCache() {
    cachedChatName = null;
    lastHandledText = "";
    lastBotReply = "";
    lastReplyTime = 0;

    if (replyTimeout) {
        clearTimeout(replyTimeout);
        replyTimeout = null;
    }

    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }
}

/* ================= ROLE-BASED CONTEXT (LAST 20) ================= */
function getConversationContext(limit = 20) {
    const spans = document.querySelectorAll(
        'span[data-testid="selectable-text"]'
    );

    const messages = [];

    spans.forEach(span => {
        const text = span.innerText.trim();
        if (!text) return;

        if (/^\d{1,2}:\d{2}\s?(am|pm)$/i.test(text)) return;

       
        const isMyMessage =
            span.closest("footer") !== null ||
            span.closest('div[contenteditable="true"]') !== null;

        messages.push({
            role: isMyMessage ? "assistant" : "user",
            content: text
        });
    });

    return messages.slice(-limit);
}

/* ================= INPUT + SEND ================= */
function insertReply(text) {
    const input = document.querySelector(
        'div[contenteditable="true"][data-tab="10"][role="textbox"]'
    );
    if (!input) return;

    input.focus();
    document.execCommand("insertText", false, text);
}

function sendMessage() {
    const btn = document.querySelector('button[aria-label="Send"]');
    if (btn && !btn.disabled) btn.click();
}

/* ================= BACKEND ================= */
async function getAIReply(chatName, context) {
    const res = await fetch("http://localhost:3000/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sender: chatName,
            messages: context
        })
    });

    const data = await res.json();
    return data.reply;
}

/* ================= BUTTON (CSS) ================= */
function ensureButton() {
    const header = document.querySelector("header");
    if (!header) return;

    if (document.getElementById("ai-toggle-btn")) return;

    const btn = document.createElement("button");
    btn.id = "ai-toggle-btn";
    btn.textContent = "🟢";

    Object.assign(btn.style, {
        width: "40px",
        height: "40px",
        padding: "0",
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: "#ffffff",
        color: "#fff",
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        flex: "0 0 auto",
        lineHeight: "1",
        position: "absolute",
        top: "16rem"
    });

    btn.onclick = () => {
        const name = getChatName();
        if (!name) return;

        if (activeChat === name) {
            activeChat = null;
            btn.textContent = "🟢";
            btn.style.background = "#1fa855";
            resetChatCache();
            console.log("AI disabled for:", name);
        } else {
            activeChat = name;
            resetChatCache();
            btn.textContent = "🔴";
            btn.style.background = "#0b8457";
            console.log("AI enabled for:", name);
        }
    };

    header.appendChild(btn);
}

/* ================= CHAT CHANGE WATCH ================= */
let lastTitle = "";
setInterval(() => {
    const titleSpan = document.querySelector("header span[title]");
    const title = titleSpan?.getAttribute("title") || "";

    if (title && title !== lastTitle) {
        lastTitle = title;
        resetChatCache();
        ensureButton();
    }
}, 800);

/* ================= MAIN LOOP ================= */
setInterval(() => {
    ensureButton();

    if (!activeChat) return;

    const chatName = getChatName();
    if (chatName !== activeChat) return;

    const spans = document.querySelectorAll(
        'span[data-testid="selectable-text"]'
    );
    if (!spans.length) return;

    const lastSpan = spans[spans.length - 1];
    const text = lastSpan.innerText.trim();

    if (!text) return;

   
    if (/^\d{1,2}:\d{2}\s?(am|pm)$/i.test(text)) return;

    
    if (text === lastBotReply) return;

    
    if (text === lastHandledText) return;

    lastHandledText = text;

    /* ---------- BATCH / DEBOUNCE ---------- */
    if (batchTimeout) clearTimeout(batchTimeout);

    batchTimeout = setTimeout(() => {
        const now = Date.now();
        if (now - lastReplyTime < REPLY_COOLDOWN_MS) return;

        lastReplyTime = now;

        const delay = randomDelay();
        console.log(`Batch ready. Replying in ${(delay / 1000).toFixed(1)}s`);

        if (replyTimeout) clearTimeout(replyTimeout);

        replyTimeout = setTimeout(async () => {
            try {
                const context = getConversationContext(20);
                const reply = await getAIReply(chatName, context);
                if (!reply) return;

                lastBotReply = reply;
                insertReply(reply);
                setTimeout(sendMessage, 800);
            } catch (e) {
                console.error("AI error:", e);
            }
        }, delay);
    }, BATCH_WAIT_MS);
}, 1200);
