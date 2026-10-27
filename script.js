(function() {
    
    const bgElement = document.getElementById('background');
    const randomHash = document.getElementById('random-hash');
    
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
    const finalScoreEl = document.getElementById('final-score');
    const cardStatus = document.getElementById('card-status');
    const endgameStamp = document.getElementById('endgame-stamp');
    const prisonBars = document.getElementById('prison-bars');
    
    const downloadBtn = document.getElementById('download-btn');
    const shareXBtn = document.getElementById('share-x-btn');

    let currentQuestionIndex = 0;
    let score = 0;
    let timerReq;
    let typingInterval;
    let scrambleIntervals = [];
    let isTyping = false;
    let currentLineIndex = 0;
    let glitchInterval;
    
    let playerName = "UNKNOWN";
    let playerPfpSrc = "images/rocky-normal.jpg"; 
    
    const TIME_PER_QUESTION_MS = 15000; 

    // Enhanced Prologue Story
    const introLines = [
        "CONNECTION ESTABLISHED. ENCRYPTION PROTOCOL ALPHA INITIATED...",
        "UNAUTHORIZED DATA EXFILTRATION DETECTED IN SECTOR 7.",
        "INTERNAL AUDIT SUGGESTS A HIGH-LEVEL SPY IS AMONG US.",
        "DETECTIVE ROCKY HAS SUMMONED YOU FOR A CLEARANCE EVALUATION.",
        "WARNING: FAILURE TO VERIFY IDENTITY WILL RESULT IN IMMEDIATE LOCKDOWN."
    ];

    const rulesLines = [
        "Take a seat.",
        "A critical breach has occurred at Seismic Headquarters.",
        "My profiling algorithms suggest you might be the leak.",
        "I have 8 encrypted questions. Answer them correctly.",
        "If you are loyal, you walk free. If you are a spy...",
        "Well, let's just say you won't need your badge anymore.",
        "Timer starts now. Do not make a mistake."
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
        randomHash.textContent = "HASH: 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase();
    }, 2000);

    function startErraticGlitches() {
        glitchInterval = setInterval(() => {
            if(Math.random() > 0.6) { 
                bgElement.classList.add('erratic-glitch');
                setTimeout(() => bgElement.classList.remove('erratic-glitch'), 300);
            }
        }, 3500);
    }

    // Slower typing for readability
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

    // Sequence 1: Intro (Slower pacing)
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
            
            typeWriterEffect(lineDiv, introLines[lineIndex], 60, () => {
                lineIndex++;
                if (lineIndex < introLines.length) {
                    introTimeout = setTimeout(showNextLine, 1400); 
                } else {
                    introTimeout = setTimeout(() => {
                        isIntroTyping = false;
                        readyBtn.classList.remove('hidden');
                        skipBtn.classList.add('hidden');
                    }, 1000);
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
        startErraticGlitches(); 
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
        rockyDialogue.textContent = '';
        scrambleText(rockyDialogue, rulesLines[currentLineIndex], 500);
        isTyping = true;
        setTimeout(() => isTyping = false, 500); 
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
            scrambleText(btn, shuffledOptions[index], 1000 + (index*100));
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
            bgElement.classList.add('erratic-glitch'); 
            setTimeout(() => bgElement.classList.remove('erratic-glitch'), 300);
        }

        setTimeout(() => {
            qContainer.classList.add('fade-out');
            optContainer.classList.add('fade-out');
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 400);
        }, 2000); 
    }

    function triggerEndgame() {
        clearInterval(glitchInterval);
        interrogationScreen.classList.remove('active');
        interrogationScreen.classList.add('hidden');
        endgameScreen.classList.remove('hidden');
        endgameScreen.classList.add('active');
        
        cardPfp.src = playerPfpSrc;
        cardName.textContent = playerName;
        finalScoreEl.textContent = `${score}/8`;
        
        // Unified reveal animation triggered by class
        cardWrapper.classList.remove('hidden');
        
        setTimeout(() => {
            if (score >= 4) {
                // Victory Vibes
                cardStatus.textContent = "VERIFIED ELITE";
                cardStatus.style.color = "var(--success-color)";
                endgameStamp.innerHTML = "ACCESS<br>GRANTED";
                endgameStamp.className = "stamp stamp-success show";
                bgElement.classList.add('bg-victory'); // Changes background glow
            } else {
                // Spy Detected Vibes
                cardStatus.textContent = "SPY DETECTED";
                cardStatus.style.color = "var(--danger-color)";
                prisonBars.classList.remove('hidden');
                setTimeout(() => prisonBars.classList.add('drop'), 50);
                
                setTimeout(() => {
                    endgameStamp.innerHTML = "SPY<br>DETECTED";
                    endgameStamp.className = "stamp stamp-danger show";
                    bgElement.classList.add('erratic-glitch');
                    setTimeout(() => bgElement.classList.remove('erratic-glitch'), 300);
                }, 600);
            }
        }, 800);
    }

    downloadBtn.addEventListener('click', () => {
        html2canvas(resultCard, {
            backgroundColor: "#0c0c0c",
            scale: 2 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Seismic_Intel_${playerName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    shareXBtn.addEventListener('click', () => {
        const isSpy = score < 4;
        let tweetText = `Detective Rocky evaluated my clearance at Seismic HQ... 🕵️‍♂️\n\nAgent: ${playerName}\nIntel Score: ${score}/8\nStatus: ${isSpy ? 'Imprisoned as a SPY! 🚨' : 'Verified Elite Member! ✅'}\n\nDo you have what it takes? Play here: [YOUR_GAME_URL_HERE] @SeismicSystem`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
    });

    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
