(function() {
    
    // --- DOM Elements ---
    const bgElement = document.getElementById('background');
    
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
    const resultCard = document.getElementById('result-card');
    const cardPfp = document.getElementById('card-pfp');
    const cardName = document.getElementById('card-name');
    const cardId = document.getElementById('card-id');
    const finalScoreEl = document.getElementById('final-score');
    const cardStatus = document.getElementById('card-status');
    const endgameStamp = document.getElementById('endgame-stamp');
    const prisonBars = document.getElementById('prison-bars');
    
    const actionButtons = document.getElementById('action-buttons');
    const downloadBtn = document.getElementById('download-btn');
    const shareXBtn = document.getElementById('share-x-btn');

    // --- State Variables ---
    let currentQuestionIndex = 0;
    let score = 0;
    let timerReq;
    let typingInterval;
    let scrambleIntervals = [];
    let isTyping = false;
    let currentLineIndex = 0;
    
    let playerName = "UNKNOWN";
    let playerPfpSrc = "images/rocky-normal.jpg"; 
    
    const TIME_PER_QUESTION_MS = 15000; 

    // --- Data ---
    const introLines = [
        "ESTABLISHING SECURE CONNECTION...",
        "SYSTEM BREACH DETECTED...",
        "SPIES INFILTRATION SUSPECTED...",
        "DETECTIVE ROCKY AWAITING IN ROOM 7..."
    ];

    const rulesLines = [
        "Welcome... Have a seat.",
        "I am Rocky. I am on a special mission to catch spies in Seismic.",
        "During my investigation, I suspected you might be a spy.",
        "I brought you here today to ask you a few questions.",
        "Your answers will tell me if my suspicions were right or wrong.",
        "I will ask you 8 questions. Answer correctly before time runs out.",
        "Let's begin. I have hundreds of spies waiting to be caught."
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

    // --- Helpers ---
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
        return "SMC-" + Math.floor(1000 + Math.random() * 9000);
    }

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

    function scrambleText(element, finalString, duration) {
        const chars = '!<>-_\\/[]{}—=+*^?#_';
        let frame = 0;
        const maxFrames = duration / 30;
        let queue = [];
        for(let i=0; i<finalString.length; i++) {
            queue.push({
                char: finalString[i],
                start: Math.floor(Math.random() * (maxFrames/2)),
                end: Math.floor(Math.random() * (maxFrames/2)) + (maxFrames/2)
            });
        }
        const scrambleTimer = setInterval(() => {
            let output = '';
            let complete = 0;
            for(let i=0; i<queue.length; i++) {
                let {char, start, end} = queue[i];
                if(frame >= end) {
                    output += char;
                    complete++;
                } else if(frame >= start) {
                    if(char === ' ') output += ' ';
                    else output += chars[Math.floor(Math.random() * chars.length)];
                } else {
                    output += ' ';
                }
            }
            element.textContent = output;
            if(complete === queue.length) {
                clearInterval(scrambleTimer);
            }
            frame++;
        }, 30);
        scrambleIntervals.push(scrambleTimer);
    }

    function clearScrambles() {
        scrambleIntervals.forEach(clearInterval);
        scrambleIntervals = [];
    }

    // --- Sequence 1: Intro ---
    function startIntro() {
        skipBtn.classList.remove('hidden');
        storyTextContainer.innerHTML = '';
        let lineIndex = 0;
        isIntroTyping = true;

        function showNextLine() {
            if (!isIntroTyping) return;
            storyTextContainer.style.opacity = '0';
            setTimeout(() => {
                if (!isIntroTyping) return;
                storyTextContainer.innerHTML = '';
                const lineDiv = document.createElement('div');
                lineDiv.className = 'intro-line';
                storyTextContainer.appendChild(lineDiv);
                storyTextContainer.style.opacity = '1';
                
                typeWriterEffect(lineDiv, introLines[lineIndex], 40, () => {
                    lineIndex++;
                    if (lineIndex < introLines.length) {
                        introTimeout = setTimeout(showNextLine, 1000); 
                    } else {
                        introTimeout = setTimeout(() => {
                            isIntroTyping = false;
                            readyBtn.classList.remove('hidden');
                            skipBtn.classList.add('hidden');
                        }, 800);
                    }
                });
            }, 500); 
        }
        showNextLine();
    }

    skipBtn.addEventListener('click', () => {
        isIntroTyping = false;
        clearInterval(typingInterval);
        clearTimeout(introTimeout);
        storyTextContainer.style.opacity = '1';
        storyTextContainer.innerHTML = `<div class="intro-line">${introLines[introLines.length - 1]}</div>`;
        readyBtn.classList.remove('hidden');
        skipBtn.classList.add('hidden');
    });

    readyBtn.addEventListener('click', () => {
        introScreen.classList.remove('active');
        introScreen.classList.add('hidden');
        identityScreen.classList.remove('hidden');
        identityScreen.classList.add('active');
    });

    // --- Sequence 2: Identity Form ---
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
    }

    // --- Sequence 3: Dialogue ---
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
        rockyDialogue.textContent = '';
        scrambleText(rockyDialogue, rulesLines[currentLineIndex], 600);
        isTyping = true;
        setTimeout(() => isTyping = false, 600); 
    }

    // --- Sequence 4: Interrogation Gameplay ---
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

        clearScrambles();
        const currentQ = activeQuestions[currentQuestionIndex];
        
        scrambleText(questionText, currentQ.q, 800);
        
        if (currentQ.img !== "") {
            questionImage.src = currentQ.img;
            imageWrapper.classList.remove('hidden');
        } else {
            imageWrapper.classList.add('hidden');
            questionImage.src = "";
        }

        const shuffledOptions = shuffleArray([...currentQ.opts]);
        optionBtns.forEach((btn, index) => {
            btn.textContent = ""; 
            scrambleText(btn, shuffledOptions[index], 1000 + (index*200));
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
            
            if (timeLeft <= 4000) {
                digitalTimer.classList.add('timer-danger');
            }
            
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
        clearScrambles();

        const decodedCorrect = atob(encodedCorrectAnswer);
        let isCorrect = (selectedText === decodedCorrect);

        if (isCorrect) {
            score++;
            changeRockyImage('smiling');
            scrambleText(questionText, correctReactions[Math.floor(Math.random() * correctReactions.length)], 500);
        } else {
            changeRockyImage('angry');
            scrambleText(questionText, wrongReactions[Math.floor(Math.random() * wrongReactions.length)], 500);
        }

        setTimeout(() => {
            qContainer.classList.add('fade-out');
            optContainer.classList.add('fade-out');
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 400);
        }, 2500); 
    }

    // --- Sequence 5: Endgame & Card Generation ---
    function triggerEndgame() {
        interrogationScreen.classList.remove('active');
        interrogationScreen.classList.add('hidden');
        endgameScreen.classList.remove('hidden');
        endgameScreen.classList.add('active');
        
        cardPfp.src = playerPfpSrc;
        cardName.textContent = playerName;
        finalScoreEl.textContent = `${score}/8`;
        
        setTimeout(() => {
            if (score >= 4) {
                cardStatus.textContent = "VERIFIED";
                cardStatus.style.color = "var(--success-color)";
                endgameStamp.innerHTML = "ACCESS<br>GRANTED";
                endgameStamp.className = "stamp stamp-success show";
            } else {
                cardStatus.textContent = "SPY DETECTED";
                cardStatus.style.color = "var(--danger-color)";
                
                prisonBars.classList.remove('hidden');
                setTimeout(() => prisonBars.classList.add('drop'), 50);
                
                setTimeout(() => {
                    endgameStamp.innerHTML = "SPY<br>DETECTED";
                    endgameStamp.className = "stamp stamp-danger show";
                }, 800);
            }
            
            setTimeout(() => {
                actionButtons.classList.remove('hidden');
                actionButtons.classList.remove('fade-out');
            }, 1500);

        }, 500);
    }

    // --- Share and Download Handlers ---
    downloadBtn.addEventListener('click', () => {
        html2canvas(resultCard, {
            backgroundColor: "#050505",
            scale: 2 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Seismic_Report_${playerName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    shareXBtn.addEventListener('click', () => {
        const isSpy = score < 4;
        let tweetText = `Detective Rocky interrogated me at the Seismic Headquarters... 🕵️‍♂️\n\nAgent: ${playerName}\nScore: ${score}/8\nResult: ${isSpy ? 'Imprisoned as a SPY! 🚨' : 'Verified Elite Member! ✅'}\n\nCan you survive the interrogation? Play here: [YOUR_GAME_URL_HERE] @SeismicSystem`;
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    });

    // --- Init ---
    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
