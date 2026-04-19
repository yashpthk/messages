let charismaLines = [];

let fortuneLines = [];

let chaosLines = [];

let rareMessages = [];

const PASSWORD_HASH = 'a3ecbba54d84a5c73c49fc513c02b333b924ed64f79b02e572a38c9ddc1b8651';
const FIRST_UNLOCK_MESSAGE = 'You tapped. So now I get to remind you that you’re one of my favorite people.';
const STORAGE_KEY = 'messagesUnlocked';
const impatienceThreshold = 8;

let messages = [];

let impatienceMessages = [];

let dramaticLines = [];

let remaining = [];
let remainingImpatience = [];
let failedAttempts = 0;
let impatienceCount = 0;

const dataLoaded = Promise.all([
    fetch('messages.json').then(r => r.json()).then(d => { messages = d; remaining = [...messages]; }),
    fetch('fortunes.json').then(r => r.json()).then(d => fortuneLines = d),
    fetch('validation.json').then(r => r.json()).then(d => dramaticLines = d),
    fetch('chaos.json').then(r => r.json()).then(d => chaosLines = d),
    fetch('charisma.json').then(r => r.json()).then(d => charismaLines = d),
    fetch('rare.json').then(r => r.json()).then(d => rareMessages = d),
    fetch('impatience.json').then(r => r.json()).then(d => impatienceMessages = d)
]).catch(e => console.error(e));

function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getDeckMessage() {
    if (remaining.length === 0) {
        remaining = [...messages];
    }
    const index = Math.floor(Math.random() * remaining.length);
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
        document.getElementById('hint').textContent = 'Not quite. Try something we would go.';

        if (failedAttempts >= 2) document.getElementById('hint').innerHTML = '<div>Think of a café.</div>';
        if (failedAttempts >= 3) document.getElementById('hint').innerHTML = '<div>Its not complicated.</div>';
        if (failedAttempts >= 4) document.getElementById('hint').innerHTML = '<div>You are definitely overthinking this.</div>';
        if (failedAttempts >= 5) document.getElementById('hint').innerHTML = '<div>I am running out of hints.</div>';
        if (failedAttempts >= 6) document.getElementById('hint').innerHTML = '<div>How have you not guessed it yet!</div>';
        if (failedAttempts >= 7) document.getElementById('hint').innerHTML = '<div>Think of a café nearby.</div>';
        if (failedAttempts >= 8) document.getElementById('hint').innerHTML = '<div>T_R_B_</div>';
    } catch (e) {
        document.getElementById('error').textContent = 'This page needs to be opened from a secure site like GitHub Pages, not as a local file.';
    }
}

function updateImpatienceMeter() {
    const fill = document.getElementById('impatienceFill');
    const percentage = (impatienceCount / impatienceThreshold) * 100;
    fill.style.width = Math.min(percentage, 100) + '%';
}

function getImpatienceMessage() {
    if (remainingImpatience.length === 0) {
        remainingImpatience = [...impatienceMessages];
    }
    const index = Math.floor(Math.random() * remainingImpatience.length);
    return remainingImpatience.splice(index, 1)[0];
}

function showSpecialImpatienceMessage() {
    const message = getImpatienceMessage();
    showMessage({ ...message, style: message.style || 'special' });
}

function showRareMessage() {
    const message = getRandomItem(rareMessages);
    showMessage({ ...message, style: message.style || 'special' });
}

function clearCardModes() {
    const card = document.getElementById('mainCard');
    card.classList.remove('specialCard', 'validationCard', 'charismaCard', 'fortuneCard', 'chaosCard');
}

function applyCardMode(messageData) {
    const card = document.getElementById('mainCard');
    if (!messageData || typeof messageData !== 'object') return;

    if (messageData.style === 'special') card.classList.add('specialCard');
    if (messageData.style === 'rare') card.classList.add('validationCard');

    if (messageData.actionType === 'validation') card.classList.add('validationCard');
    else if (messageData.actionType === 'charisma') card.classList.add('charismaCard');
    else if (messageData.actionType === 'fortune') card.classList.add('fortuneCard');
    else if (messageData.actionType === 'chaos') card.classList.add('chaosCard');
}

function resetActionUi() {
    const actionBtn = document.getElementById('actionBtn');
    const linkActionBtn = document.getElementById('linkActionBtn');
    const actionLink = document.getElementById('actionLink');
    const nextBtn = document.getElementById('nextBtn');
    const buttonWrap = document.getElementById('buttonWrap');
    const refreshBtn = document.getElementById('refreshBtn');

    actionBtn.style.display = 'none';
    actionBtn.onclick = null;
    linkActionBtn.style.display = 'none';
    actionLink.style.display = 'none';
    actionLink.href = '#';
    nextBtn.style.display = 'inline-block';
    nextBtn.textContent = 'I am impatient';
    nextBtn.className = 'primaryBtn';
    nextBtn.onclick = showRandomMessage;
    buttonWrap.style.display = 'block';
    refreshBtn.style.display = 'none';
}

function showMessage(messageData) {
    const el = document.getElementById('message');
    const actionBtn = document.getElementById('actionBtn');
    const linkActionBtn = document.getElementById('linkActionBtn');
    const actionLink = document.getElementById('actionLink');
    const nextBtn = document.getElementById('nextBtn');
    const buttonWrap = document.getElementById('buttonWrap');
    const refreshBtn = document.getElementById('refreshBtn');
    const isObjectMessage = typeof messageData === 'object' && messageData !== null;
    const text = typeof messageData === 'string' ? messageData : messageData.text;

    resetActionUi();

    el.style.opacity = '0';
    el.classList.remove('specialMessage');
    clearCardModes();

    window.setTimeout(() => {
        el.textContent = text;

        if (isObjectMessage && messageData.style === 'special') {
            el.classList.add('specialMessage');
        }

        applyCardMode(messageData);

        if (isObjectMessage && messageData.actionLabel) {
            nextBtn.style.display = 'none';
            buttonWrap.style.display = 'none';
            if (messageData.style !== 'special') refreshBtn.style.display = 'inline-block';

            if (messageData.actionType === 'quack') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = quackForAnotherOne;
            } else if (messageData.actionType === 'charisma') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = showCharismaUnlock;
            } else if (messageData.actionType === 'fortune') {
                actionBtn.textContent = messageData.actionLabel;
                actionBtn.style.display = 'inline-block';
                actionBtn.onclick = showFortune;
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
    }, 120);
}

function showRandomMessage() {
    impatienceCount += 1;

    if (impatienceCount >= impatienceThreshold) {
        impatienceCount = 0;
        updateImpatienceMeter();
        showSpecialImpatienceMessage();
        return;
    }

    updateImpatienceMeter();

    if (Math.random() < 0.06) {
        showRareMessage();
        return;
    }

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

function showFortune() {
    document.getElementById('fortuneText').textContent = getRandomItem(fortuneLines);
    document.getElementById('fortuneOverlay').style.display = 'flex';
}

function closeFortune() {
    document.getElementById('fortuneOverlay').style.display = 'none';
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

function lockPage() {
    impatienceCount = 0;
    updateImpatienceMeter();
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
    console.assert(Array.isArray(impatienceMessages) && impatienceMessages.length > 0, 'impatienceMessages should exist');
    console.assert(Array.isArray(rareMessages) && rareMessages.length > 0, 'rareMessages should exist');
    console.assert(typeof PASSWORD_HASH === 'string' && PASSWORD_HASH.length === 64, 'password hash should look like sha256');
    console.assert(typeof impatienceThreshold === 'number' && impatienceThreshold > 0, 'impatience threshold should be positive');
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
        updateImpatienceMeter();

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
