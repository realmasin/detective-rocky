(function() {
    
    const bgElement = document.getElementById('background');
    const introScreen = document.getElementById('intro-screen');
    const storyTextContainer = document.getElementById('story-text-container');
    const readyBtn = document.getElementById('ready-btn');
    const skipBtn = document.getElementById('skip-btn');
    
    const dialogueScreen = document.getElementById('dialogue-screen');
    const rockyDialogue = document.getElementById('rocky-dialogue');
    
    const interrogationScreen = document.getElementById('interrogation-screen');
    const qContainer = document.getElementById('q-container');
    const optContainer = document.getElementById('opt-container');
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const optionBtns = document.querySelectorAll('.option-btn');
    const timeLeftBar = document.getElementById('time-left');

    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let typingInterval;
    let isTyping = false;
    let currentLineIndex = 0;
    
    const TIME_PER_QUESTION = 15; 

    const introLines = [
        "Seismic Headquarters...",
        "System breached...",
        "Spies among us...",
        "Detective Rocky summoned you to room 7..."
    ];

    const rulesLines = [
        "Welcome... Have a seat.",
        "I would offer you coffee, but our machine is broken.",
        "Anyway, I am Rocky. I am on a special mission to catch spies in Seismic.",
        "During my investigation, I suspected you might be a spy.",
        "I brought you here today to ask you a few questions.",
        "Your answers will tell me if my suspicions were right or wrong.",
        "I will ask you 8 questions. Answer them correctly before time runs out.",
        "Let's begin. I have hundreds of spies waiting to be caught."
    ];

    const correctReactions = [
        "Hmm, smart answer... but we are not done yet.",
        "Point for you. Let's see the next one.",
        "You got lucky. Next."
    ];

    const wrongReactions = [
        "Did you really think you could lie to me?",
        "That answer will only dig you deeper... focus!",
        "Pathetic. Let's move on."
    ];

    const questionsDatabase = [
        {
            q: "Who is this person?",
            img: "images/founder.jpg",
            opts: ["Founder of Seismic", "Leader", "A random person", "Admin"],
            ans: "Rm91bmRlciBvZiBTZWlzbWlj"
        }
    ];

    for(let i = 2; i <= 8; i++) {
        questionsDatabase.push({
            q: `This is test question ${i}. The correct answer is Option 1.`,
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

    function changeRockyImage(state) {
        bgElement.style.backgroundImage = `url('images/rocky-${state}.jpg')`;
    }

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
                
                typeWriterEffect(lineDiv, introLines[lineIndex], 60, () => {
                    lineIndex++;
                    if (lineIndex < introLines.length) {
                        introTimeout = setTimeout(showNextLine, 1500); 
                    } else {
                        introTimeout = setTimeout(() => {
                            isIntroTyping = false;
                            readyBtn.classList.remove('hidden');
                            skipBtn.classList.add('hidden');
                        }, 1000);
                    }
                });
            }, 800); 
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
        
        bgElement.style.filter = "blur(12px) brightness(0.4)";
        changeRockyImage('reading');
        
        dialogueScreen.classList.remove('hidden');
        dialogueScreen.classList.add('active');
        
        playNextDialogueLine();
    });

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
        typeWriterEffect(rockyDialogue, rulesLines[currentLineIndex], 50);
    }

    function startInterrogation() {
        dialogueScreen.classList.remove('active');
        dialogueScreen.classList.add('hidden');
        
        interrogationScreen.classList.remove('hidden');
        interrogationScreen.classList.add('active');
        
        changeRockyImage('normal');
        bgElement.style.filter = "blur(0px) brightness(0.8)"; 

        activeQuestions = shuffleArray([...questionsDatabase]).slice(0, 8);
        currentQuestionIndex = 0;
        score = 0;
        
        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex >= activeQuestions.length) {
            endGame();
            return;
        }

        const currentQ = activeQuestions[currentQuestionIndex];
        questionText.textContent = currentQ.q;
        
        if (currentQ.img !== "") {
            questionImage.src = currentQ.img;
            questionImage.classList.remove('hidden');
        } else {
            questionImage.classList.add('hidden');
            questionImage.src = "";
        }

        const shuffledOptions = shuffleArray([...currentQ.opts]);
        optionBtns.forEach((btn, index) => {
            btn.textContent = shuffledOptions[index]; 
            btn.onclick = () => handleAnswer(btn.textContent, currentQ.ans);
            btn.disabled = false;
        });

        qContainer.classList.remove('fade-out');
        optContainer.classList.remove('fade-out');
        
        changeRockyImage('normal');
        startTimer();
    }

    function startTimer() {
        let timeLeft = TIME_PER_QUESTION;
        timeLeftBar.style.width = '100%';
        timeLeftBar.style.backgroundColor = 'var(--seismic-primary)';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            let percentage = (timeLeft / TIME_PER_QUESTION) * 100;
            timeLeftBar.style.width = `${percentage}%`;

            if (percentage < 30) {
                timeLeftBar.style.backgroundColor = 'var(--seismic-danger)'; 
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleAnswer(null, activeQuestions[currentQuestionIndex].ans); 
            }
        }, 100);
    }

    function handleAnswer(selectedText, encodedCorrectAnswer) {
        clearInterval(timerInterval);
        optionBtns.forEach(btn => btn.disabled = true);

        const decodedCorrect = atob(encodedCorrectAnswer);
        let isCorrect = (selectedText === decodedCorrect);

        if (isCorrect) {
            score++;
            changeRockyImage('smiling');
            questionText.textContent = correctReactions[Math.floor(Math.random() * correctReactions.length)];
        } else {
            changeRockyImage('angry');
            questionText.textContent = wrongReactions[Math.floor(Math.random() * wrongReactions.length)];
            bgElement.style.filter = "sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.6)";
        }

        setTimeout(() => {
            qContainer.classList.add('fade-out');
            optContainer.classList.add('fade-out');
            bgElement.style.filter = "blur(0px) brightness(0.8)"; 
            
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion();
            }, 500);
            
        }, 2500); 
    }

    function endGame() {
        interrogationScreen.classList.remove('active');
        interrogationScreen.classList.add('hidden');
        
        if (score >= 4) {
            alert(`Result: ${score}/8 - You are a REAL Seismic Member!`);
        } else {
            alert(`Result: ${score}/8 - You are a SPY! Off to prison.`);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
