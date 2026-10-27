(function() {
    
    // --- DOM Elements ---
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
    const cardWrapper = document.getElementById('card-wrapper');
    const resultCard = document.getElementById('result-card');
    const cardPfp = document.getElementById('card-pfp');
    const cardName = document.getElementById('card-name');
    const cardId = document.getElementById('card-id');
    const cardHash = document.getElementById('card-hash');
    const finalScoreEl = document.getElementById('final-score');
    const scoreProgress = document.getElementById('score-progress');
    const cardStatus = document.getElementById('card-status');
    const endgameStamp = document.getElementById('endgame-stamp');
    const prisonBars = document.getElementById('prison-bars');
    
    const downloadBtn = document.getElementById('download-btn');
    const shareXBtn = document.getElementById('share-x-btn');

    let currentQuestionIndex = 0;
    let score = 0;
    let timerReq;
    let typingInterval;
    let isTyping = false;
    let currentLineIndex = 0;
    let lightGlitchInterval;
    
    let playerName = "UNKNOWN";
    let playerPfpSrc = "images/rocky-normal.jpg"; 
    
    const TIME_PER_QUESTION_MS = 15000; 

    // Story Logic
    const introLines = [
        "ESTABLISHING SECURE CONNECTION...",
        "SYSTEM BREACH DETECTED IN SECTOR 7.",
        "INTERNAL AUDIT SUGGESTS A SPY INFILTRATION.",
        "DETECTIVE ROCKY HAS SUMMONED YOU FOR EVALUATION.",
        "WARNING: FAILURE RESULTS IN IMMEDIATE LOCKDOWN."
    ];

    const rulesLines = [
        "Take a seat.",
        "A critical breach has occurred at Seismic.",
        "My algorithm points to you.",
        "I have 8 questions. Answer them correctly.",
        "If you are loyal, you walk free.",
        "If you are a spy... well, you won't leave this room.",
        "Timer starts now. Do not lie to me."
    ];

    const correctReactions = [
        "LOG: Answer acceptable... Proceeding.",
        "LOG: Data verified. Next sequence.",
        "LOG: Lucky guess. Continuing scan."
    ];

    const wrongReactions = [
        "WARNING: Deception detected.",
        "WARNING: Invalid response. Profile flagged.",
        "WARNING: System anomaly. You are failing."
    ];

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
        randomHash.textContent = "AUTH: 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
    }, 1500);

    // FIX: Highly reliable Light Glitch Effect
    function startLightGlitches() {
        lightGlitchInterval = setInterval(() => {
            if(Math.random() > 0.6) { 
                triggerFlash();
            }
        }, 4000);
    }

    function triggerFlash() {
        glitchOverlay.classList.remove('flash-glitch');
        void glitchOverlay.offsetWidth; // trigger reflow
        glitchOverlay.classList.add('flash-glitch');
    }

    // Reliable Typewriter
    function typeWriterEffect(element, text, speed, onComplete) {
        isTyping = true;
        element.textContent = ''; 
        let i = 0;
        clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                isTyping = false;
                if(onComplete) onComplete();
            }
        }, speed);
    }

    // FIX: Bulletproof text injection for Questions and Buttons
    // Removed buggy scramble to ensure 100% visibility always.
    function safeInjectText(element, text) {
        element.textContent = text;
    }

    // Sequence 1: Intro
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
            
            typeWriterEffect(lineDiv, introLines[lineIndex], 50, () => {
                lineIndex++;
                if (lineIndex < introLines.length) {
                    introTimeout = setTimeout(showNextLine, 1200); 
                } else {
                    introTimeout = setTimeout(() => {
                        isIntroTyping = false;
                        readyBtn.classList.remove('hidden');
                        skipBtn.classList.add('hidden');
                    }, 800);
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
            div.textContent = line;
            storyTextContainer.appendChild(div);
        });
        readyBtn.classList.remove('hidden');
        skipBtn.classList.add('hidden');
    });

    readyBtn.addEventListener('click', () => {
        introScreen.classList.remove('active');
        introScreen.classList.add('hidden');
        identityScreen.classList.remove('hidden');
        identityScreen.classList.add('active');
    });

    submitIdentityBtn.addEventListener('click', () => {
        const nameVal = usernameInput.value.trim();
        const file = pfpInput.files[0];
        if (!nameVal || !file) {
            identityError.classList.remove('hidden');
            return;
        }
        identityError.classList.add('hidden');
        playerName = nameVal;
        cardId.textContent = generateAgentID(); 
        cardHash.textContent = Math.floor(Math.random()*999999).toString(16).toUpperCase();

        const reader = new FileReader();
        reader.onload = function(e) {
            playerPfpSrc = e.target.result;
            proceedToDialogue();
        }
        reader.readAsDataURL(file);
    });

    function proceedToDialogue() {
        identityScreen.classList.remove('active');
        identityScreen.classList.add('hidden');
        changeRockyImage('reading');
        dialogueScreen.classList.remove('hidden');
        dialogueScreen.classList.add('active');
        playNextDialogueLine();
        startLightGlitches(); 
    }

    dialogueScreen.addEventListener('click', () => {
        if (isTyping) {
            clearInterval(typingInterval);
            rockyDialogue.textContent = rulesLines[currentLineIndex];
            isTyping = false;
        } else {
            currentLineIndex++;
            if (currentLineIndex < rulesLines.length) {
                playNextDialogueLine();
            } else {
                startInterrogation();
            }
        }
    });

    function playNextDialogueLine() {
        typeWriterEffect(rockyDialogue, rulesLines[currentLineIndex], 30);
    }

    function startInterrogation() {
        dialogueScreen.classList.remove('active');
        dialogueScreen.classList.add('hidden');
        interrogationScreen.classList.remove('hidden');
        interrogationScreen.classList.add('active');
        
        changeRockyImage('normal');
        activeQuestions = shuffleArray([...questionsDatabase]).slice(0, 8);
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex >= activeQuestions.length) {
            triggerEndgame();
            return;
        }
        
        const currentQ = activeQuestions[currentQuestionIndex];
        
        // Immediate display to prevent bugs
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
            btn.onclick = () => handleAnswer(shuffledOptions[index], currentQ.ans);
            btn.disabled = false;
        });

        qContainer.classList.remove('fade-out');
        optContainer.classList.remove('fade-out');
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
                handleAnswer(null, activeQuestions[currentQuestionIndex].ans);
                return;
            }
            digitalTimer.textContent = formatTime(timeLeft);
            timerReq = requestAnimationFrame(update);
        }
        timerReq = requestAnimationFrame(update);
    }

    function handleAnswer(selectedText, encodedCorrectAnswer) {
        cancelAnimationFrame(timerReq);
        optionBtns.forEach(btn => btn.disabled = true);

        const decodedCorrect = atob(encodedCorrectAnswer);
        let isCorrect = (selectedText === decodedCorrect);

        if (isCorrect) {
            score++;
            changeRockyImage('smiling');
            safeInjectText(questionText, correctReactions[Math.floor(Math.random() * correctReactions.length)]);
        } else {
            changeRockyImage('angry');
            safeInjectText(questionText, wrongReactions[Math.floor(Math.random() * wrongReactions.length)]);
            triggerFlash(); 
        }

        setTimeout(() => {
            qContainer.classList.add('fade-out');
            optContainer.classList.add('fade-out');
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 300);
        }, 2000); 
    }

    function triggerEndgame() {
        clearInterval(lightGlitchInterval);
        interrogationScreen.classList.remove('active');
        interrogationScreen.classList.add('hidden');
        endgameScreen.classList.remove('hidden');
        endgameScreen.classList.add('active');
        
        cardPfp.src = playerPfpSrc;
        cardName.textContent = playerName.toUpperCase();
        finalScoreEl.textContent = `${score}/8`;
        
        // Progress bar calculation
        let percentage = (score / 8) * 100;
        scoreProgress.style.width = `${percentage}%`;
        
        cardWrapper.classList.remove('hidden');
        
        setTimeout(() => {
            if (score >= 4) {
                cardStatus.textContent = "THREAT MINIMAL";
                cardStatus.style.color = "var(--success-color)";
                scoreProgress.style.background = "var(--success-color)";
                endgameStamp.innerHTML = "CLEARED";
                endgameStamp.className = "dossier-stamp stamp-success show";
                bgElement.classList.add('bg-victory'); 
            } else {
                cardStatus.textContent = "CRITICAL THREAT";
                cardStatus.style.color = "var(--danger-color)";
                scoreProgress.style.background = "var(--danger-color)";
                prisonBars.classList.remove('hidden');
                setTimeout(() => prisonBars.classList.add('drop'), 50);
                
                setTimeout(() => {
                    endgameStamp.innerHTML = "SPY<br>DETECTED";
                    endgameStamp.className = "dossier-stamp stamp-danger show";
                    triggerFlash();
                }, 600);
            }
        }, 800);
    }

    downloadBtn.addEventListener('click', () => {
        html2canvas(resultCard, {
            backgroundColor: "#050505",
            scale: 2 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Seismic_Dossier_${playerName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    shareXBtn.addEventListener('click', () => {
        const isSpy = score < 4;
        let tweetText = `Subject Evaluated at Seismic HQ. 🕵️‍♂️\n\nAlias: ${playerName}\nAccuracy: ${score}/8\nVerdict: ${isSpy ? 'SPY DETECTED. Locked up! 🚨' : 'CLEARED. Loyal Member. ✅'}\n\nProve your loyalty: [YOUR_GAME_URL_HERE] @SeismicSystem`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    });

    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
