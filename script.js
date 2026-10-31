(function() {
    
    const transitionOverlay = document.getElementById('transition-overlay');
    const transText = document.getElementById('trans-text');
    
    const bgElement = document.getElementById('background');
    const randomHash = document.getElementById('random-hash');
    const glitchOverlay = document.getElementById('glitch-overlay');
    
    const startOverlay = document.getElementById('start-overlay');
    const startGameBtn = document.getElementById('start-game-btn');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');

    const introScreen = document.getElementById('intro-screen');
    const storyTextContainer = document.getElementById('story-text-container');
    const readyBtn = document.getElementById('ready-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    const identityScreen = document.getElementById('identity-screen');
    const usernameInput = document.getElementById('username-input');
    const pfpInput = document.getElementById('pfp-input');
    const submitIdentityBtn = document.getElementById('submit-identity-btn');
    const identityError = document.getElementById('identity-error');
    
    const dialogueScreen = document.getElementById('dialogue-screen');
    const rockyDialogue = document.getElementById('rocky-dialogue');
    
    const interrogationScreen = document.getElementById('interrogation-screen');
    const qContainer = document.getElementById('q-container');
    const optContainer = document.getElementById('opt-container');
    const imageWrapper = document.getElementById('image-wrapper');
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    const digitalTimer = document.getElementById('digital-timer');
    
    const endgameScreen = document.getElementById('endgame-screen');
    const cardScaleWrapper = document.getElementById('card-scale-wrapper');
    const resultCard = document.getElementById('result-card');
    const cardPfp = document.getElementById('card-pfp');
    const cardName = document.getElementById('card-name');
    const cardId = document.getElementById('card-id');
    const tcHash = document.getElementById('tc-hash');
    const finalScoreEl = document.getElementById('final-score');
    const scoreProgress = document.getElementById('score-progress');
    const cardStatus = document.getElementById('card-status');
    const endgameStamp = document.getElementById('endgame-stamp');
    const prisonBars = document.getElementById('prison-bars');
    
    const downloadBtn = document.getElementById('download-btn');
    const shareXBtn = document.getElementById('share-x-btn');
    const exportContainer = document.getElementById('export-container');

    let currentQuestionIndex = 0;
    let score = 0;
    let timerReq;
    let typingInterval;
    let isTyping = false;
    let currentLineIndex = 0;
    let lightGlitchInterval;
    
    let playerName = "UNKNOWN";
    let playerPfpSrc = "images/rocky-normal.jpg"; 
    let isSpyTweetStatus = ""; 
    let isBgmPlaying = true; 
    
    const TIME_PER_QUESTION_MS = 15000; 

    const audioPath = 'audio/';
    const sfx = {
        bgm: new Audio(audioPath + 'bgm.mp3'),
        typing: new Audio(audioPath + 'typing.mp3'),
        hover: new Audio(audioPath + 'hover.mp3'),
        click: new Audio(audioPath + 'click.mp3'),
        correct: new Audio(audioPath + 'correct.mp3'),
        wrong: new Audio(audioPath + 'wrong.mp3'),
        glitch: new Audio(audioPath + 'glitch.mp3'),
        stamp: new Audio(audioPath + 'stamp.mp3')
    };

    sfx.bgm.loop = true;
    sfx.bgm.volume = 0.3;
    sfx.typing.loop = true;
    sfx.typing.volume = 0.6;
    sfx.wrong.volume = 0.3; 
    sfx.stamp.volume = 0.4; 

    function playSfx(name) {
        if(!sfx[name]) return;
        const sound = sfx[name].cloneNode();
        sound.volume = sfx[name].volume || 1;
        sound.play().catch(e => console.log('Audio play blocked:', e));
    }

    function stopTypingSound() {
        sfx.typing.pause();
        sfx.typing.currentTime = 0;
    }

    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => playSfx('hover'));
        btn.addEventListener('click', () => playSfx('click'));
    });
    
    audioToggleBtn.addEventListener('click', () => {
        isBgmPlaying = !isBgmPlaying;
        if(isBgmPlaying) {
            sfx.bgm.play();
            audioToggleBtn.innerHTML = "[ AUDIO: <span class='success-text'>ON</span> ]";
        } else {
            sfx.bgm.pause();
            audioToggleBtn.innerHTML = "[ AUDIO: <span class='danger-text'>OFF</span> ]";
        }
    });

    startGameBtn.addEventListener('click', () => {
        if(isBgmPlaying) sfx.bgm.play().catch(e => console.log('BGM blocked:', e));
        startOverlay.classList.remove('active');
        startOverlay.classList.add('hidden');
        introScreen.classList.remove('hidden');
        introScreen.classList.add('active');
        startIntro(); 
    });

    const introLines = [
        "> INITIALIZING SEISMIC KERNEL V9.4...",
        "> MEMORY CHECK: OK.",
        "> DECRYPTING AUDIO LOGS...",
        "<span class='system-alert'>[!] WARNING: CRITICAL BREACH DETECTED IN SECTOR 7.</span>",
        "> ALGORITHM SUGGESTS INTERNAL INSURGENT ACTIVITY.",
        "> DETECTIVE ROCKY DEMANDS IMMEDIATE CLEARANCE EVALUATION.",
        "> PROCEED WITH CAUTION."
    ];

    const rulesLines = [
        "Sit down. Don't make any sudden moves.",
        "Lately, we've had impostors claiming to be Seismic members.",
        "Fake members... Spies trying to blend in.",
        "My job is to weed them out.",
        "You say you belong here? We will see about that.",
        "I will ask you 8 questions about Seismic.",
        "Only a true member knows the answers.",
        "The timer is absolute. Do not lie to me."
    ];

    const questionsDatabase = [
        { q: "On which day is the poker tournament usually held?", img: "images/poker.jpg", opts: ["Thursday", "Friday", "Wednesday", "Monday"], ans: "RnJpZGF5" },
        { q: "What is this person's role in the Seismic community?", img: "images/xealist.jpg", opts: ["Leader", "Admin", "Not part of Seismic", "Seismic Founder"], ans: "QWRtaW4=" },
        { q: "Who is this person?", img: "images/noxx.jpg", opts: ["Xealist", "Noxx", "Heathcliff", "Lyron"], ans: "Tm94eA==" },
        { q: "Zella is known for hosting which event?", img: "images/zella.jpg", opts: ["Karaoke", "Drawing", "Cooking", "Shark Tank"], ans: "S2FyYW9rZQ==" },
        { q: "What is the name of Seismic's mascot?", img: "images/mascot.jpg", opts: ["Rocky", "Mochi", "Ricky", "Rin"], ans: "Um9ja3k=" },
        { q: "Who is this person?", img: "images/lyron.jpg", opts: ["Founder of Seismic", "Leader in Seismic", "Not part of Seismic", "Regional Assistant"], ans: "Rm91bmRlciBvZiBTZWlzbWlj" },
        { q: "In which month does Seismic celebrate its anniversary?", img: "", opts: ["February", "March", "June", "January"], ans: "TWFyY2g=" },
        { q: "What is the requirement to unlock the Magnitude channel in the Seismic Discord?", img: "", opts: ["Mag 4 and above", "Mag 6 and above", "Being a developer", "Mag 1 and above"], ans: "TWFnIDEgYW5kIGFib3Zl" },
        { q: "Who is this person in the picture?", img: "images/heathcliff.jpg", opts: ["Heathcliff", "Noxx", "Xealist", "K2S"], ans: "SGVhdGhjbGlmZg==" },
        { q: "How many Magnitude levels are there in the Seismic Discord promotion system?", img: "", opts: ["4", "7", "9", "8"], ans: "OQ==" },
        { q: "On which day of the week are promotions usually distributed to eligible members in Discord?", img: "", opts: ["Wednesday", "Sunday", "Friday", "Monday"], ans: "RnJpZGF5" },
        { q: "How many anniversaries has the Seismic community celebrated so far?", img: "", opts: ["1", "2", "3", "4"], ans: "MQ==" },
        { q: "Who is responsible for organizing the Poker and Chess events?", img: "", opts: ["Heathcliff", "Noxx", "DZ", "Haziq"], ans: "SGVhdGhjbGlmZg==" },
        { q: "Where is Seismic's headquarters located?", img: "", opts: ["New York City", "Istanbul", "New Delhi", "Jakarta"], ans: "TmV3IFlvcmsgQ2l0eQ==" },
        { q: "What is the special greeting used by Seismic community members?", img: "", opts: ["Gmic", "Gmc", "Gsmc", "Gsmic"], ans: "R21pYw==" },
        { q: "Which of these phrases is correct?", img: "", opts: ["Magnitude is the key", "Magnitude is the future", "Magnitude is the goal", "Magnitude is the way"], ans: "TWFnbml0dWRlIGlzIHRoZSBrZXk=" },
        { q: "Which of these projects does NOT belong to the Seismic ecosystem?", img: "", opts: ["Brookwell", "Via", "Blend", "Antseed"], ans: "QW50c2VlZA==" },
        { q: "Members whose work is shared in the spotlight channel receive which role?", img: "", opts: ["Seismic Artist", "Art Creator", "They don't receive any role", "Neurocreative"], ans: "VGhleSBkb24ndCByZWNlaXZlIGFueSByb2xl" },
        { q: "How many questions are in the Seismic quiz?", img: "images/quiz.jpg", opts: ["10", "15", "8", "12"], ans: "MTA=" },
        { q: "What is Seismic's handle on X?", img: "images/handle.jpg", opts: ["SeismicSys", "SeismicSmc", "SeismicHQ", "Seismic_Xyz"], ans: "U2Vpc21pY1N5cw==" },
        { q: "What was the theme/title of the SEISCREAT #2 event?", img: "images/seiscreat.jpg", opts: ["IMAGINE SEISMIC", "DRAW SEISMIC", "SEISMIC, YOUR WAY", "DRAW ROCKY"], ans: "SU1BR0lORSBTRUlTTUlD" },
        { q: "What type of content is required to start the Magnitude journey?", img: "", opts: ["Reposting official Seismic announcements", "Sharing original content about Seismic", "Inviting new members to Discord", "Completing daily community tasks"], ans: "U2hhcmluZyBvcmlnaW5hbCBjb250ZW50IGFib3V0IFNlaXNtaWM=" },
        { q: "Where should members submit their X posts to apply for Mag1?", img: "images/join.jpg", opts: ["#general", "#community-events", "#join-magnitude", "#announcements"], ans: "I2pvaW4tbWFnbml0dWRl" },
        { q: "Who evaluates Mag1-3 roles?", img: "", opts: ["Moderators", "Community members", "Leaders", "Project developers"], ans: "TGVhZGVycw==" },
        { q: "What matters more during Magnitude evaluation?", img: "", opts: ["Number of posts", "Number of followers", "Quality of contributions", "Account activity"], ans: "UXVhbGl0eSBvZiBjb250cmlidXRpb25z" },
        { q: "Are fully AI-generated posts accepted for Magnitude evaluation?", img: "", opts: ["Yes, without restrictions", "Only for Mag1", "Only for higher levels", "No"], ans: "Tm8=" },
        { q: "How often can Mag1 be granted?", img: "images/mag1.jpg", opts: ["Every Friday", "Every 2-3 weeks", "Every 5-7 weeks", "At any time"], ans: "QXQgYW55IHRpbWU=" },
        { q: "What is the promotion schedule for Mag2-4?", img: "images/mag2-4.jpg", opts: ["Every 2-3 weeks", "Every 5-7 weeks", "Every 8-10 weeks", "Once every month"], ans: "RXZlcnkgMi0zIHdlZWtz" },
        { q: "What happens to the roles of long-term inactive members?", img: "", opts: ["They are automatically deleted", "They may be adjusted downward", "They are permanently frozen", "They are automatically promoted"], ans: "VGhleSBtYXkgYmUgYWRqdXN0ZWQgZG93bndhcmQ=" },
        { q: "What level of responsibility is associated with Mag7 and above?", img: "", opts: ["Event participation only", "Leadership-level responsibility", "Content creation only", "Community recruitment"], ans: "TGVhZGVyc2hpcC1sZXZlbCByZXNwb25zaWJpbGl0eQ==" },
        { q: "What are the main factors considered when assigning Magnitude roles?", img: "", opts: ["Followers and account age", "Originality, quality, effort and community contribution", "Daily messages and server invitations", "Number of reactions and reposts"], ans: "T3JpZ2luYWxpdHksIHF1YWxpdHksIGVmZm9ydCBhbmQgY29tbXVuaXR5IGNvbnRyaWJ1dGlvbg==" },
        { q: "How often are Mag8-9 promotions scheduled?", img: "", opts: ["Every 2-3 weeks", "Every 5-7 weeks", "Every 8-10 weeks", "Every 12-15 weeks"], ans: "RXZlcnkgOC0xMCB3ZWVrcw==" }
    ];

    let activeQuestions = [];
    let isIntroTyping = false;
    let introTimeout;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateAgentID() { return "SMC-" + Math.floor(10000 + Math.random() * 90000); }

    setInterval(() => { randomHash.textContent = "NODE: 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase(); }, 1500);

    function startLightGlitches() { lightGlitchInterval = setInterval(() => { if(Math.random() > 0.65) triggerFlash(); }, 4000); }

    function triggerFlash() {
        playSfx('glitch');
        glitchOverlay.classList.remove('flash-glitch');
        void glitchOverlay.offsetWidth; 
        glitchOverlay.classList.add('flash-glitch');
    }

    // UPDATED: Slower transition time to make it feel natural and deliberate
    async function transitionScreen(fromElement, toElement, loadingText = "> SYSTEM_PROCESSING...", waitTime = 1600) {
        if(transText) transText.textContent = loadingText;
        transitionOverlay.classList.add('transition-active');
        await new Promise(r => setTimeout(r, waitTime)); 
        fromElement.classList.remove('active');
        fromElement.classList.add('hidden');
        toElement.classList.remove('hidden');
        toElement.classList.add('active');
        transitionOverlay.classList.remove('transition-active');
        await new Promise(r => setTimeout(r, 600)); 
    }

    // ORIGINAL CLEAN TYPING FUNCTION (Cursor is now handled by CSS ::after or inline flex, no spamming DOM)
    function typeWriterEffect(element, text, speed, onComplete) {
        isTyping = true;
        element.innerHTML = ''; 
        let i = 0;
        let isTag = false;
        let currentText = '';
        sfx.typing.play().catch(()=>{}); 
        
        clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (i < text.length) {
                let char = text.charAt(i);
                currentText += char;
                element.innerHTML = currentText;
                if(char === '<') isTag = true;
                if(char === '>') isTag = false;
                if(!isTag) i++; else i++;
            } else {
                clearInterval(typingInterval);
                isTyping = false;
                stopTypingSound(); 
                if(onComplete) onComplete();
            }
        }, speed);
    }

    function safeInjectText(element, text) { element.textContent = text; }

    function startIntro() {
        skipBtn.classList.remove('hidden');
        storyTextContainer.innerHTML = '';
        let lineIndex = 0;
        isIntroTyping = true;

        function showNextLine() {
            if (!isIntroTyping) return;
            const lineDiv = document.createElement('div');
            lineDiv.className = 'intro-line';
            storyTextContainer.appendChild(lineDiv);
            
            typeWriterEffect(lineDiv, introLines[lineIndex], 30, () => {
                lineIndex++;
                if (lineIndex < introLines.length) {
                    introTimeout = setTimeout(showNextLine, 600); 
                } else {
                    introTimeout = setTimeout(() => {
                        isIntroTyping = false;
                        readyBtn.classList.remove('hidden');
                        readyBtn.classList.add('decode-reveal'); 
                        skipBtn.classList.add('hidden');
                    }, 500);
                }
            });
        }
        showNextLine();
    }

    skipBtn.addEventListener('click', () => {
        isIntroTyping = false;
        clearInterval(typingInterval);
        clearTimeout(introTimeout);
        stopTypingSound();
        storyTextContainer.innerHTML = '';
        introLines.forEach(line => {
            const div = document.createElement('div');
            div.className = 'intro-line';
            div.innerHTML = line; 
            storyTextContainer.appendChild(div);
        });
        readyBtn.classList.remove('hidden');
        readyBtn.classList.add('decode-reveal');
        skipBtn.classList.add('hidden');
    });

    readyBtn.addEventListener('click', async () => {
        readyBtn.classList.add('processing');
        await transitionScreen(introScreen, identityScreen, "> ESTABLISHING_SECURE_LINK...", 1600);
    });

    submitIdentityBtn.addEventListener('click', async () => {
        const nameVal = usernameInput.value.trim();
        const file = pfpInput.files[0];
        if (!nameVal || !file) {
            identityError.classList.remove('hidden');
            return;
        }
        identityError.classList.add('hidden');
        playerName = nameVal;
        cardId.textContent = generateAgentID(); 
        tcHash.textContent = "UID: " + Math.floor(Math.random()*999999).toString(16).toUpperCase();

        const reader = new FileReader();
        reader.onload = async function(e) {
            playerPfpSrc = e.target.result;
            submitIdentityBtn.classList.add('processing');
            await transitionScreen(identityScreen, dialogueScreen, "> ENCRYPTING_BIOMETRICS...", 1800);
            playNextDialogueLine();
            startLightGlitches(); 
        }
        reader.readAsDataURL(file);
    });

    dialogueScreen.addEventListener('click', async () => {
        if (isTyping) {
            clearInterval(typingInterval);
            stopTypingSound();
            rockyDialogue.innerHTML = rulesLines[currentLineIndex];
            isTyping = false;
        } else {
            currentLineIndex++;
            if (currentLineIndex < rulesLines.length) {
                playNextDialogueLine();
            } else {
                await transitionScreen(dialogueScreen, interrogationScreen, "> INITIALIZING_INTERROGATION...", 1600);
                activeQuestions = shuffleArray([...questionsDatabase]).slice(0, 8);
                currentQuestionIndex = 0;
                score = 0;
                loadQuestion();
            }
        }
    });

    function playNextDialogueLine() { typeWriterEffect(rockyDialogue, rulesLines[currentLineIndex], 35); }

    function loadQuestion() {
        if (currentQuestionIndex >= activeQuestions.length) {
            triggerEndgame();
            return;
        }
        
        bgElement.classList.add('bg-heavy-blur');
        
        const currentQ = activeQuestions[currentQuestionIndex];
        safeInjectText(questionText, currentQ.q);
        
        if (currentQ.img !== "") {
            questionImage.src = currentQ.img;
            imageWrapper.classList.remove('hidden');
        } else {
            imageWrapper.classList.add('hidden');
            questionImage.src = "";
        }

        const shuffledOptions = shuffleArray([...currentQ.opts]);
        optionBtns.forEach((btn, index) => {
            safeInjectText(btn, shuffledOptions[index]);
            btn.className = 'option-btn hud-panel cyber-hover'; 
            btn.disabled = false;
            btn.onclick = () => handleAnswer(btn, shuffledOptions[index], currentQ.ans);
        });

        digitalTimer.classList.remove('timer-danger');
        startDigitalTimer();
    }

    function formatTime(ms) {
        if(ms <= 0) return "00:00:00";
        let totalSeconds = ms / 1000;
        let seconds = Math.floor(totalSeconds);
        let hundreths = Math.floor((totalSeconds - seconds) * 100);
        let strSec = seconds < 10 ? "0"+seconds : seconds;
        let strHun = hundreths < 10 ? "0"+hundreths : hundreths;
        return `00:${strSec}:${strHun}`;
    }

    function startDigitalTimer() {
        let startTime = Date.now();
        cancelAnimationFrame(timerReq);
        function update() {
            let elapsed = Date.now() - startTime;
            let timeLeft = TIME_PER_QUESTION_MS - elapsed;
            
            if (timeLeft <= 4000) digitalTimer.classList.add('timer-danger');
            
            if(timeLeft <= 0) {
                digitalTimer.textContent = "00:00:00";
                handleAnswer(null, null, activeQuestions[currentQuestionIndex].ans);
                return;
            }
            digitalTimer.textContent = formatTime(timeLeft);
            timerReq = requestAnimationFrame(update);
        }
        timerReq = requestAnimationFrame(update);
    }

    async function handleAnswer(clickedBtn, selectedText, encodedCorrectAnswer) {
        cancelAnimationFrame(timerReq);
        optionBtns.forEach(btn => btn.disabled = true);

        const decodedCorrect = atob(encodedCorrectAnswer);
        let isCorrect = (selectedText === decodedCorrect);

        if(clickedBtn) {
            if(isCorrect) clickedBtn.classList.add('selected-correct');
            else clickedBtn.classList.add('selected-wrong');
        }

        // NEW: Removed Rocky's text reactions entirely. Just Sounds and Button Highlight.
        if (isCorrect) {
            score++;
            playSfx('correct');
        } else {
            playSfx('wrong');
            triggerFlash(); 
        }

        await new Promise(r => setTimeout(r, 1200)); 
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex < activeQuestions.length) {
            await transitionScreen(interrogationScreen, interrogationScreen, "> DECRYPTING_NEXT_NODE...", 1200);
            loadQuestion();
        } else {
            triggerEndgame(); 
        }
    }

    async function triggerEndgame() {
        clearInterval(lightGlitchInterval);
        
        await transitionScreen(interrogationScreen, endgameScreen, "> ANALYZING_THREAT_LEVEL...", 2000);
        bgElement.classList.remove('bg-heavy-blur');
        
        cardPfp.src = playerPfpSrc;
        cardName.textContent = playerName.toUpperCase();
        finalScoreEl.textContent = `${score}/8`;
        
        let percentage = (score / 8) * 100;
        scoreProgress.style.width = `${percentage}%`;
        
        await new Promise(r => setTimeout(r, 600));
        cardScaleWrapper.classList.remove('hidden');
        cardScaleWrapper.classList.add('show-card-anim');
        
        setTimeout(() => {
            if (score >= 6) {
                cardStatus.textContent = "VERIFIED ELITE";
                cardStatus.style.color = "var(--success-color)";
                scoreProgress.style.background = "var(--success-color)";
                endgameStamp.innerHTML = "CLEARED";
                endgameStamp.className = "tc-stamp stamp-success show";
                playSfx('stamp');
                bgElement.classList.add('bg-victory'); 
                isSpyTweetStatus = "Verified Elite Member! ✅";
            } else if (score >= 4) {
                cardStatus.textContent = "POTENTIAL SPY";
                cardStatus.style.color = "var(--warning-color)";
                scoreProgress.style.background = "var(--warning-color)";
                endgameStamp.innerHTML = "SUSPECT";
                endgameStamp.className = "tc-stamp stamp-warning show";
                triggerFlash();
                playSfx('stamp');
                isSpyTweetStatus = "Under Suspicion! ⚠️";
            } else {
                cardStatus.textContent = "CRITICAL THREAT";
                cardStatus.style.color = "var(--danger-color)";
                scoreProgress.style.background = "var(--danger-color)";
                prisonBars.classList.remove('hidden');
                setTimeout(() => prisonBars.classList.add('drop'), 50);
                setTimeout(() => {
                    endgameStamp.innerHTML = "SPY<br>DETECTED";
                    endgameStamp.className = "tc-stamp stamp-danger show";
                    triggerFlash();
                    playSfx('stamp');
                }, 600);
                isSpyTweetStatus = "Imprisoned as a SPY! 🚨";
            }
        }, 1200);
    }

    downloadBtn.addEventListener('click', () => {
        downloadBtn.textContent = 'GENERATING...';
        downloadBtn.classList.add('processing');
        exportContainer.innerHTML = '';
        const clone = resultCard.cloneNode(true);
        clone.classList.add('export-mode');
        exportContainer.appendChild(clone);
        
        setTimeout(() => {
            html2canvas(clone, { backgroundColor: "#080808", scale: 2, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Seismic_Dossier_${playerName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                exportContainer.innerHTML = ''; 
                downloadBtn.textContent = 'EXTRACT_FILE';
                downloadBtn.classList.remove('processing');
            });
        }, 100);
    });

    shareXBtn.addEventListener('click', () => {
        let tweetText = `I just faced Detective Rocky to prove my loyalty to the Seismic family! 🕵️‍♂️🔥\n\nAgent: ${playerName}\nScore: ${score}/8\nVerdict: ${isSpyTweetStatus}\n\nAre you a true member or a SPY? Take the test: https://detective-rocky.vercel.app @SeismicSystem`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    });

})();
