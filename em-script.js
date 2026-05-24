const PASSWORD_HASH = '8156126c0dd2672e7cf9b979908147fbab77f24f2e333c69fd4b75fcba400691';
const PASSWORD_HASH2 = '21d5bb9c510603248dcb1fa738a47537985014047819518f4f0b12b8f0a9f6cc';

let failedAttempts = 0;
let isWishMode = false;
let hasCompletedWish = false;

async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword() {
    const inputEl = document.getElementById('passwordInput');
    const hintEl = document.getElementById('hint');
    const entered = inputEl.value.trim();

    // 1. If we are in Wish Mode, any entry (that isn't just the prefix) triggers the end
    if (isWishMode) {
        // If they didn't type anything beyond "I wish", don't let them proceed
        if (entered.toLowerCase() === "i wish" || entered === "") {
            hintEl.textContent = "Don't be shy, tell the stars...";
            return;
        }
        triggerEndgameTransition(entered);
        return;
    }

    // 2. Standard Password Logic
    const enteredHash = await sha256(entered.toLowerCase());
    if (enteredHash === PASSWORD_HASH) {
        localStorage.setItem('hasUnlockedAdventures', 'true');
        showAdventures();
        return;
    }

    // 3. Failed Attempt Progression
    if (hasCompletedWish) {
        hintEl.textContent = 'Waiting for your order.';
        return;
    }

    failedAttempts += 1;

    if (failedAttempts < 8) {
        const hints = [
            'You have found all the cards... but this one is hidden.',
            'And not easy.',
            'Not a cafe.',
            'Waiting for your order.',
            'Last try or this locks forever.',
            'You were bold with choosing to guess. And I was kidding.',
            'Actually... let’s try something else.'
        ];
        hintEl.textContent = hints[failedAttempts - 1] || 'Almost there...';
    }
    else {
        // 4. PIVOT: Activate Wish Mode
        localStorage.setItem('hasUnlockedWish', 'true'); // Save for next time
        activateWishMode();
    }
}

// HELPER: This transforms the UI
function activateWishMode() {
    isWishMode = true;
    failedAttempts = 8;
    const inputEl = document.getElementById('passwordInput');
    const hintEl = document.getElementById('hint');

    hintEl.style.color = "#ffccaa";
    hintEl.textContent = 'The stars are listening now. Make a wish...';

    inputEl.type = 'text';
    inputEl.value = 'I wish ';
    inputEl.placeholder = 'I wish...';
    inputEl.focus(); // Auto-focus so they can start typing immediately
}

// ON PAGE LOAD: Check if they've been here before
window.addEventListener('DOMContentLoaded', () => {
    const savedWish = localStorage.getItem('hasUnlockedWish');
    if (savedWish) {
        if (savedWish !== 'true') {
            hasCompletedWish = true;
            const uranusBtn = document.getElementById('uranusBtn');
            if (uranusBtn) uranusBtn.style.display = 'inline-block';
        } else {
            activateWishMode();
        }
    }
});


document.getElementById('passwordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

function triggerEndgameTransition(wishText) {
    if (wishText === "adventure") {
        // Fade out main card
        const mainCard = document.getElementById('mainCard');
        mainCard.style.transition = 'opacity 2s ease-in-out';
        mainCard.style.opacity = '0';
        return;
    }
    else if (wishText === "wishmode") {
        // Clean up the input: remove "I wish" if they typed it to avoid "Your wish I wish..."
        let cleanWish = localStorage.getItem('hasUnlockedWish');

        const finalMsg = document.getElementById('finalText');
        finalMsg.innerHTML = `As chaos drifts away, your wish for <strong>${cleanWish}</strong> will find its place among the stars.`;

        // Fade out text container
        const finalTextContainer = document.getElementById('finalTextContainer');
        finalTextContainer.style.transition = 'opacity 1s ease';
        finalTextContainer.style.opacity = '0';

        // Clear previous elements so they can be re-drawn
        setTimeout(() => {
            document.getElementById('starsContainer').innerHTML = '';
            document.getElementById('lines').innerHTML = '';
            document.getElementById('stars').innerHTML = '';

            const uranus = document.getElementById('uranus');
            uranus.style.transition = 'none';
            uranus.style.opacity = '0';
            uranus.classList.remove('drift');

            finalTextContainer.style.transition = '';
        }, 1000);
    }
    else {

        // Clean up the input: remove "I wish" if they typed it to avoid "Your wish I wish..."
        let cleanWish = wishText.replace(/^(i wish for|i wish to|i wish)\s+/i, "");

        // Store in localStorage for the this page
        localStorage.setItem('hasUnlockedWish', cleanWish);

        const finalMsg = document.getElementById('finalText');
        finalMsg.innerHTML = `As chaos drifts away, your wish for <strong>${cleanWish}</strong> will find its place among the stars.`;
    }

    // Fade out main card
    const mainCard = document.getElementById('mainCard');
    mainCard.style.transition = 'opacity 2s ease-in-out';
    mainCard.style.opacity = '0';

    setTimeout(() => {
        mainCard.style.display = 'none';

        // Show and fade in sky scene
        const skyScene = document.getElementById('skyScene');
        skyScene.style.display = 'block';
        setTimeout(() => {
            skyScene.style.opacity = '1';
            generateStars();
            animateConstellation();
        }, 100);
    }, 2000);
}

function generateStars() {
    const container = document.getElementById('starsContainer');
    const numStars = 150;
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${3 + Math.random() * 4}s`;
        container.appendChild(star);
    }
}

function animateConstellation() {
    const linesGroup = document.getElementById('lines');
    const starsGroup = document.getElementById('stars');
    const svg = document.getElementById('constellationSvg');

    // 1. Get dynamic dimensions
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;

    // 2. Establish a scale factor (80% of the smaller dimension)
    // This prevents the "too big" problem on mobile.
    const scale = Math.min(svgWidth, svgHeight) * 0.8;

    // 3. Center point
    const cx = svgWidth * 0.5;
    const cy = svgHeight * 0.45; // Slightly above true center to account for the "body"

    // 4. Points mapped as fractions of 'scale'
    const points = [
        { x: cx - (scale * 0.35), y: cy - (scale * 0.25), r: 6, color: "#ffffff" }, // 0: Elnath (Top Horn)
        { x: cx - (scale * 0.42), y: cy + (scale * 0.05), r: 4, color: "#ffffff" }, // 1: Lower Horn Tip
        { x: cx - (scale * 0.10), y: cy - (scale * 0.05), r: 4, color: "#ffffff" }, // 2: Horn Mid
        { x: cx - (scale * 0.02), y: cy + (scale * 0.08), r: 4, color: "#ffffff" }, // 3: Hyades Top
        { x: cx - (scale * 0.05), y: cy + (scale * 0.20), r: 7, color: "#ffccaa" }, // 4: Aldebaran
        { x: cx + (scale * 0.05), y: cy + (scale * 0.21), r: 4, color: "#ffffff" }, // 5: V Point
        { x: cx + (scale * 0.18), y: cy + (scale * 0.32), r: 4, color: "#ffffff" }, // 6: Hyades Bot
        { x: cx + (scale * 0.40), y: cy + (scale * 0.42), r: 4, color: "#ffffff" }, // 7: Body Rear
        { x: cx + (scale * 0.43), y: cy + (scale * 0.47), r: 3, color: "#ffffff" }, // 8: Leg Tip
        { x: cx + (scale * 0.23), y: cy - (scale * 0.15), r: 2, color: "#ffffff" }, // 9: Pleiades 1
        { x: cx + (scale * 0.27), y: cy - (scale * 0.12), r: 3, color: "#ccddff" }  // 10: Pleiades 2
    ];

    // Draw stars
    points.forEach((p, i) => {
        setTimeout(() => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", p.r); // Use the radius from our points array
            circle.setAttribute("fill", p.color); // Use the specific color
            circle.style.opacity = '0';
            circle.style.transition = 'opacity 2s ease';
            starsGroup.appendChild(circle);

            void circle.offsetWidth;
            circle.style.opacity = '1';
        }, i * 300);
    });

    // Connections following the EarthSky layout
    const connections = [
        [0, 2], [2, 3],         // Upper horn
        [1, 4],                 // Lower horn
        [3, 5], [4, 5], [5, 6], // The Hyades V
        [6, 7], [7, 8]          // The Body extension
    ];

    setTimeout(() => {
        connections.forEach((conn, i) => {
            const p1 = points[conn[0]];
            const p2 = points[conn[1]];

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", p1.x);
            line.setAttribute("y1", p1.y);
            line.setAttribute("x2", p2.x);
            line.setAttribute("y2", p2.y);
            line.classList.add('constellation-line');
            linesGroup.appendChild(line);

            const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;

            setTimeout(() => {
                line.style.transition = 'stroke-dashoffset 2s ease-in-out';
                line.style.strokeDashoffset = '0';
            }, i * 400);
        });

        // Trigger Uranus after drawing starts
        setTimeout(showUranus, 3000);

    }, points.length * 300);
}

function showUranus() {
    const uranus = document.getElementById('uranus');
    // Restore transition so it can fade in and drift
    uranus.style.transition = '';
    // Force reflow
    void uranus.offsetWidth;

    // Set initial position near the constellation
    const svgWidth = document.getElementById('constellationSvg').clientWidth;
    const svgHeight = document.getElementById('constellationSvg').clientHeight;
    const startX = svgWidth * 0.5 - 40;
    const startY = svgHeight * 0.5 - 30;

    uranus.setAttribute('cx', startX);
    uranus.setAttribute('cy', startY);


    // Fade in
    uranus.style.opacity = '1';

    // Wait a moment, then drift away
    setTimeout(() => {
        uranus.classList.add('drift');
        // fade out as it drifts

        // After drifting starts, show final text
        setTimeout(() => {
            document.getElementById('finalTextContainer').style.opacity = '1';
        }, 4000);
    }, 2000);
}

function showAdventures() {

    const overlay =
        document.getElementById(
            'adventuresOverlay'
        );

    const content =
        document.getElementById(
            'adventuresContent'
        );

    overlay.style.display = 'flex';

    content.innerHTML = `
        <div class="adventure-scene">
            <img
                src="PICT0055.jpg"
                alt="Adventures"
                class="adventure-image"
            />

            <div class="adventure-text">
                To more adventures!
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';

        const text =
            document.querySelector(
                '.adventure-text'
            );

        setTimeout(() => {
            text.classList.add('visible');
        }, 1200);
    });
}