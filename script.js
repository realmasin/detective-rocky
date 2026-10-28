(function() {
    
    // DOM Initializations
    const transitionOverlay = document.getElementById('transition-overlay');
    const bgElement = document.getElementById('background');
    const randomHash = document.getElementById('random-hash');
    const glitchOverlay = document.getElementById('glitch-overlay');
    
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
    
    const TIME_PER_QUESTION_MS = 15000; 

    // Story Core
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
        "Take a seat.",
        "Our networks have been compromised.",
        "My profiling system flagged your signature.",
        "I have 8 encrypted fragments. Decode them correctly.",
        "If you are loyal, your clearance is reinstated.",
        "If you are a spy... this room will be your last stop.",
        "The timer is absolute. Do not lie to me."
    ];

    // --- NEW: Dynamic Phase Reactions ---
    const correctReactions = {
        start: [
            "LOG: Data accepted. Do not get comfortable yet.",
            "LOG: Signature verified. But I am still watching you.",
            "LOG: Acceptable. Let's see if it was just luck."
        ],
        mid: [
            "LOG: Intel matches our database. You might actually belong here.",
            "Hmm... You know your Seismic history. Next fragment.",
            "LOG: Correct. You are surviving... for now."
        ],
        end: [
            "LOG: Final fragment processed. Compiling your dossier...",
            "LOG: Interrogation complete. Calculating your threat level..."
        ]
    };

    const wrongReactions = {
        start: [
            "WARNING: Deception detected. You are digging your own grave.",
            "WARNING: Contradiction found. A real member wouldn't miss this.",
            "WARNING: A pathetic attempt at a lie. Strike marked."
        ],
        mid: [
            "WARNING: Your cover is slipping. That was completely wrong.",
            "Are you even trying? You are starting to look like a spy.",
            "Wrong. A real Seismic member would never miss that."
        ],
        end: [
            "WARNING: Critical failure on the final step. Preparing dossier...",
            "WARNING: Interrogation complete. Locking down final verdict..."
        ]
    };

    const questionsDatabase = [
        {
            q: "Identify this target:",
            img: "images/founder.jpg",
            opts: ["Founder of Seismic", "Leader", "Unknown Entity", "System Admin"],
            ans: "Rm91bmRlciBvZiBTZWlzbWlj"
        }
    ];

    for(let i = 2; i <= 8; i++) {
        questionsDatabase.push({
            q: `DATA FRAGMENT #${i} REQUIRED. SELECT OPTION 1.`,
            img: "", 
            opts: ["Option 1", "Option 2", "Option 3", "Option 4"],
            ans: "T3B0aW9uIDE="
        });
    }

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

    function changeRockyImage(state) {
        bgElement.style.backgroundImage = `url('images/rocky-${state}.jpg')`;
    }

    function generateAgentID() {
        return "SMC-" + Math.floor(10000 + Math.random() * 90000);
    }

    setInterval(() => {
        randomHash.textContent = "NODE: 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
    }, 1500);

    function startLightGlitches() {
        lightGlitchInterval = setInterval(() => {
            if(Math.random() > 0.65) triggerFlash();
        }, 4000);
    }

    function triggerFlash() {
        glitchOverlay.classList.remove('flash-glitch');
        void glitchOverlay.offsetWidth; 
        glitchOverlay.classList.add('flash-glitch');
    }

    // Advanced Cinematic Transition Overlay
    async function transitionScreen(fromElement, toElement, loadingText = "> SYSTEM_PROCESSING...", waitTime = 1200) {
        const transText = document.getElementById('trans-text');
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

    function typeWriterEffect(element, text, speed, onComplete) {
        isTyping = true;
        element.innerHTML = ''; 
        let i = 0;
        let isTag = false;
        let currentText = '';
        
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
                if(onComplete) onComplete();
            }
        }, speed);
    }

    function safeInjectText(element, text) {
        element.textContent = text;
    }

    // Sequence 1: Boot
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
        await transitionScreen(introScreen, identityScreen, "> ESTABLISHING_SECURE_LINK...", 1500);
    });

    // Sequence 2: Form
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
            changeRockyImage('reading');
            playNextDialogueLine();
            startLightGlitches(); 
        }
        reader.readAsDataURL(file);
    });

    dialogueScreen.addEventListener('click', async () => {
        if (isTyping) {
            clearInterval(typingInterval);
            rockyDialogue.textContent = rulesLines[currentLineIndex];
            isTyping = false;
        } else {
            currentLineIndex++;
            if (currentLineIndex < rulesLines.length) {
                playNextDialogueLine();
            } else {
                await transitionScreen(dialogueScreen, interrogationScreen, "> INITIALIZING_INTERROGATION...", 1500);
                changeRockyImage('normal');
                activeQuestions = shuffleArray([...questionsDatabase]).slice(0, 8);
                currentQuestionIndex = 0;
                score = 0;
                loadQuestion();
            }
        }
    });

    function playNextDialogueLine() {
        typeWriterEffect(rockyDialogue, rulesLines[currentLineIndex], 35);
    }

    // Sequence 3: Quiz
    function loadQuestion() {
        if (currentQuestionIndex >= activeQuestions.length) {
            triggerEndgame();
            return;
        }
        
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
        changeRockyImage('normal');
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

        await new Promise(r => setTimeout(r, 600)); 

        // --- INTELLIGENT REACTION LOGIC ---
        let phase = "start";
        if (currentQuestionIndex === activeQuestions.length - 1) {
            phase = "end"; // The very last question
        } else if (currentQuestionIndex >= 3) {
            phase = "mid"; // Questions 4, 5, 6, 7
        }

        let reactionPool = isCorrect ? correctReactions[phase] : wrongReactions[phase];
        let chosenReaction = reactionPool[Math.floor(Math.random() * reactionPool.length)];

        if (isCorrect) {
            score++;
            changeRockyImage('smiling');
            safeInjectText(questionText, chosenReaction);
        } else {
            changeRockyImage('angry');
            safeInjectText(questionText, chosenReaction);
            triggerFlash(); 
        }

        await new Promise(r => setTimeout(r, 2200)); 
        
        currentQuestionIndex++;
        
        if (currentQuestionIndex < activeQuestions.length) {
            await transitionScreen(interrogationScreen, interrogationScreen, "> FETCHING_NEXT_FRAGMENT...", 1000);
            loadQuestion();
        } else {
            loadQuestion(); // triggers endgame loop
        }
    }

    // Sequence 4: Endgame
    async function triggerEndgame() {
        clearInterval(lightGlitchInterval);
        
        const transText = document.getElementById('trans-text');
        if(transText) transText.textContent = "> ANALYZING_INTERROGATION_DATA...";
        transitionOverlay.classList.add('transition-active');
        await new Promise(r => setTimeout(r, 1500));
        
        if(transText) transText.textContent = "> CALCULATING_THREAT_LEVEL...";
        await new Promise(r => setTimeout(r, 1500));
        
        if(transText) transText.textContent = "> GENERATING_OFFICIAL_DOSSIER...";
        await new Promise(r => setTimeout(r, 1200));
        
        interrogationScreen.classList.remove('active');
        interrogationScreen.classList.add('hidden');
        endgameScreen.classList.remove('hidden');
        endgameScreen.classList.add('active');
        
        transitionOverlay.classList.remove('transition-active');
        
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
                bgElement.classList.add('bg-victory'); 
                isSpyTweetStatus = "Verified Elite Member! ✅";
            } else if (score >= 4) {
                cardStatus.textContent = "POTENTIAL SPY";
                cardStatus.style.color = "var(--warning-color)";
                scoreProgress.style.background = "var(--warning-color)";
                endgameStamp.innerHTML = "SUSPECT";
                endgameStamp.className = "tc-stamp stamp-warning show";
                triggerFlash();
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
            html2canvas(clone, {
                backgroundColor: "#080808",
                scale: 2,
                useCORS: true
            }).then(canvas => {
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

    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
