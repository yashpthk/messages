let charismaLines = [];

let chaosLines = [];

const PASSWORD_HASH = 'a3ecbba54d84a5c73c49fc513c02b333b924ed64f79b02e572a38c9ddc1b8651';
const FIRST_UNLOCK_MESSAGE = 'Happy Birthday! ';
const STORAGE_KEY = 'messagesUnlocked';

let messages = [];

let dramaticLines = [];

let remaining = [];
let failedAttempts = 0;
let isRolling = false;

const dataLoaded = Promise.all([
    fetch('messages.json').then(r => r.json()).then(d => { messages = d; remaining = [...messages]; }),
    fetch('validation.json').then(r => r.json()).then(d => dramaticLines = d),
    fetch('chaos.json').then(r => r.json()).then(d => chaosLines = d),
    fetch('charisma.json').then(r => r.json()).then(d => charismaLines = d)
]).catch(e => console.error(e));

function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getDeckMessage() {
    if (remaining.length === 0) {
        remaining = [...messages];
    }
    const index = Math.floor(Math.random() * remaining.length);
    const messageData = remaining[index];
    return remaining.splice(index, 1)[0];
}

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    try {
        const entered = document.getElementById('passwordInput').value.trim();
        const enteredHash = await sha256(entered.toLowerCase());

        if (enteredHash === PASSWORD_HASH.toLowerCase()) {
            failedAttempts = 0;
            localStorage.setItem(STORAGE_KEY, 'true');
            document.getElementById('error').textContent = '';
            document.getElementById('hint').innerHTML = '';
            document.getElementById('passwordInput').value = '';
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('messagePage').style.display = 'block';
            showMessage(FIRST_UNLOCK_MESSAGE);
            return;
        }

        failedAttempts += 1;
        document.getElementById('error').textContent = '';
        document.getElementById('hint').textContent = 'Not quite.';

        if (failedAttempts >= 2) document.getElementById('hint').innerHTML = '<div>Think of a café.</div>';
        if (failedAttempts >= 3) document.getElementById('hint').innerHTML = '<div>Its not complicated.</div>';
        if (failedAttempts >= 4) document.getElementById('hint').innerHTML = '<div>You are definitely overthinking this.</div>';
        if (failedAttempts >= 5) document.getElementById('hint').innerHTML = '<div>Think of a café nearby.</div>';
        if (failedAttempts >= 6) document.getElementById('hint').innerHTML = '<div>I am running out of hints.</div>';
        if (failedAttempts >= 7) document.getElementById('hint').innerHTML = '<div>How have you not guessed it yet!</div>';
        if (failedAttempts >= 8) document.getElementById('hint').innerHTML = '<div>T_R_B_</div>';
    } catch (e) {
        document.getElementById('error').textContent = 'This page needs to be opened from a secure site like GitHub Pages, not as a local file.';
    }
}

function clearCardModes() {
    const card = document.getElementById('mainCard');
    card.classList.remove('specialCard', 'validationCard', 'charismaCard', 'chaosCard');
}

function applyCardMode(messageData) {
    const card = document.getElementById('mainCard');
    if (!messageData || typeof messageData !== 'object') return;

    if (messageData.style === 'special') card.classList.add('specialCard');

    if (messageData.actionType === 'validation') card.classList.add('validationCard');
    else if (messageData.actionType === 'charisma') card.classList.add('charismaCard');
    else if (messageData.actionType === 'chaos') card.classList.add('chaosCard');
}

function resetActionUi() {
    const actionBtn = document.getElementById('actionBtn');
    const linkActionBtn = document.getElementById('linkActionBtn');
    const actionLink = document.getElementById('actionLink');
    const rerollBtn = document.getElementById('rerollBtn');

    actionBtn.style.display = 'none';
    actionBtn.onclick = null;
    linkActionBtn.style.display = 'none';
    actionLink.style.display = 'none';
    actionLink.href = '#';
    rerollBtn.style.display = 'inline-block';
}

function showMessage(messageData, skipFade = false) {
    const el = document.getElementById('message');
    const actionBtn = document.getElementById('actionBtn');
    const linkActionBtn = document.getElementById('linkActionBtn');
    const actionLink = document.getElementById('actionLink');
    const isObjectMessage = typeof messageData === 'object' && messageData !== null;
    const text = typeof messageData === 'string' ? messageData : messageData.text;

    resetActionUi();

    if (!skipFade) el.style.opacity = '0';
    el.classList.remove('specialMessage');
    clearCardModes();

    window.setTimeout(() => {
        el.textContent = text;

        if (isObjectMessage && messageData.style === 'special') {
            el.classList.add('specialMessage');
        }

        applyCardMode(messageData);

        if (isObjectMessage && messageData.actionLabel) {

            if (messageData.actionType === 'quack') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = quackForAnotherOne;
            } else if (messageData.actionType === 'charisma') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = showCharismaUnlock;
            } else if (messageData.actionType === 'chaos') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = showChaos;
            } else if (messageData.actionType === 'validation') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = showDramaticValidation;
            } else if (messageData.actionUrl) {
                linkActionBtn.textContent = messageData.actionLabel;
                linkActionBtn.style.display = 'inline-block';
                actionLink.href = messageData.actionUrl;
                actionLink.style.display = 'inline-block';
            }
        }

        el.style.opacity = '1';
    }, skipFade ? 0 : 120);
}

function onReroll() {
    if (isRolling) return;
    
    const btn = document.getElementById('rerollBtn');
    if (btn) {
        btn.classList.remove('reroll-anim');
        void btn.offsetWidth;
        btn.classList.add('reroll-anim');
    }

    const el = document.getElementById('message');
    el.style.transition = 'none';
    el.style.opacity = '1';
    
    isRolling = true;
    let rolls = 0;
    const maxRolls = 15;
    
    el.classList.add('slot-machine-text');

    const rollInterval = setInterval(() => {
        let interim = messages[Math.floor(Math.random() * messages.length)];
        el.textContent = typeof interim === 'string' ? interim : interim.text;
        
        rolls++;
        if (rolls >= maxRolls) {
            clearInterval(rollInterval);
            el.classList.remove('slot-machine-text');
            el.style.transition = '';
            isRolling = false;
            showMessage(getDeckMessage(), true);
        }
    }, 45);
}

function showRandomMessage() {
    showMessage(getDeckMessage());
}

function showDramaticValidation() {
    document.getElementById('validationText').textContent = getRandomItem(dramaticLines);
    document.getElementById('validationOverlay').style.display = 'flex';
}

function closeValidation() {
    document.getElementById('validationOverlay').style.display = 'none';
}

function showCharismaUnlock() {
    const fill = document.getElementById('charismaFill');
    const percent = 92 + Math.floor(Math.random() * 9);

    document.getElementById('charismaText').textContent = getRandomItem(charismaLines);
    document.getElementById('charismaSub').textContent = 'Charisma level: ' + percent + '%';
    document.getElementById('charismaOverlay').style.display = 'flex';
    fill.style.width = '0%';

    window.setTimeout(() => {
        fill.style.width = percent + '%';
    }, 60);
}

function closeCharisma() {
    document.getElementById('charismaOverlay').style.display = 'none';
}

function showChaos() {
    const chaosItem = getRandomItem(chaosLines);
    document.getElementById('chaosText').textContent = chaosItem.text || chaosItem;
    document.getElementById('chaosSub').textContent = 'A little unnecessary chaos, as requested.';
    document.getElementById('chaosOverlay').style.display = 'flex';
    fillScreenWithEmoji(chaosItem.emoji || '🦆');
}

function closeChaos() {
    document.getElementById('chaosOverlay').style.display = 'none';
}

function quackForAnotherOne() {
    fillScreenWithEmoji('🦆');
}

function fillScreenWithEmoji(emoji) {
    const overlay = document.getElementById('duckOverlay');
    overlay.style.display = 'block';
    overlay.innerHTML = '';

    const useNewAnimation = Math.random() < 0.5;

    if (useNewAnimation) {
        for (let i = 0; i < 80; i += 1) {
            const popup = document.createElement('div');
            popup.className = 'emojiPop';
            popup.textContent = emoji;
            popup.style.left = Math.random() * 92 + 'vw';
            popup.style.top = Math.random() * 92 + 'vh';
            popup.style.animationDelay = (Math.random() * 5.0) + 's';
            popup.style.fontSize = 1.6 + Math.random() * 4.0 + 'rem';
            overlay.appendChild(popup);
        }

        window.setTimeout(() => {
            overlay.style.display = 'none';
            overlay.innerHTML = '';
        }, 6200);
    } else {
        for (let i = 0; i < 26; i += 1) {
            const duck = document.createElement('div');
            duck.className = 'duck';
            duck.textContent = emoji;
            duck.style.left = Math.random() * 100 + 'vw';
            duck.style.animationDelay = Math.random() * 0.8 + 's';
            duck.style.fontSize = 1.6 + Math.random() * 2.8 + 'rem';
            overlay.appendChild(duck);
        }

        window.setTimeout(() => {
            overlay.style.display = 'none';
            overlay.innerHTML = '';
        }, 4200);
    }
}

function lockPage() {
    localStorage.removeItem(STORAGE_KEY);
    failedAttempts = 0;
    document.getElementById('hint').innerHTML = '';
    document.getElementById('error').textContent = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('messagePage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('passwordInput').focus();
    clearCardModes();
    document.getElementById('message').classList.remove('specialMessage');
    resetActionUi();
}

function runSmokeTests() {
    console.assert(Array.isArray(messages) && messages.length > 0, 'messages should exist');

    console.assert(typeof PASSWORD_HASH === 'string' && PASSWORD_HASH.length === 64, 'password hash should look like sha256');
    console.assert(typeof clearCardModes === 'function', 'clearCardModes should exist');
    console.assert(typeof applyCardMode === 'function', 'applyCardMode should exist');
}

document.getElementById('passwordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

window.addEventListener('load', () => {
    dataLoaded.then(() => {
        runSmokeTests();

        const unlocked = localStorage.getItem(STORAGE_KEY) === 'true';
        if (unlocked) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('messagePage').style.display = 'block';
            showRandomMessage();
        } else {
            document.getElementById('passwordInput').focus();
        }
    });
});