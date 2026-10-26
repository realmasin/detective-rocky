// Wrap everything in an IIFE to prevent console cheating
(function() {
    // --- DOM Elements ---
    const bgElement = document.getElementById('background');
    const introScreen = document.getElementById('intro-screen');
    const storyText = document.getElementById('story-text');
    const readyBtn = document.getElementById('ready-btn');
    
    const dialogueScreen = document.getElementById('dialogue-screen');
    const rockyDialogue = document.getElementById('rocky-dialogue');
    
    const interrogationScreen = document.getElementById('interrogation-screen');
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const optionBtns = document.querySelectorAll('.option-btn');
    const timeLeftBar = document.getElementById('time-left');

    // --- Game Variables ---
    let currentQuestionIndex = 0;
    let score = 0;
    let timerInterval;
    let typingInterval;
    let isTyping = false;
    let currentLineIndex = 0;
    
    const TIME_PER_QUESTION = 15; // 15 seconds per question

    // --- Story & Dialogue Content ---
    const introLines = [
        "Seismic Headquarters...",
        "System breached...",
        "Spies among us...",
        "Detective Rocky summoned you to interrogation room 7..."
    ];

    const rulesLines = [
        "Welcome... Have a seat.",
        "I would offer you coffee, but our machine is broken.",
        "Anyway, I am Rocky. I am on a special mission to catch spies in Seismic.",
        "During my investigation, I suspected you might be a spy.",
        "I brought you here today to ask you a few questions.",
        "Your answers will tell me if my suspicions were right or wrong.",
        "I will ask you 8 questions. Answer them correctly before the time runs out.",
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

    // --- Questions Database ---
    const questionsDatabase = [
        {
            q: "Who is this person?",
            img: "images/founder.jpg",
            opts: ["Founder of Seismic", "Leader", "A random person with no relation to Seismic", "Admin in Seismic"],
            ans: "Rm91bmRlciBvZiBTZWlzbWlj"
        }
    ];

    // Generate 7 dummy questions for testing logic
    for(let i = 2; i <= 8; i++) {
        questionsDatabase.push({
            q: `This is test question ${i}. The correct answer is Option 1.`,
            img: "", 
            opts: ["Option 1", "Option 2", "Option 3", "Option 4"],
            ans: "T3B0aW9uIDE="
        });
    }

    let activeQuestions = [];

    // --- Utility Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function typeWriterEffect(element, text, speed, onComplete) {
        isTyping = true;
        element.textContent = ''; // Fixed HTML parsing bug
        element.style.whiteSpace = 'pre-wrap'; // Keeps line breaks working
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

    // --- Sequence: Intro ---
    function startIntro() {
        let fullIntroText = introLines.join("\n\n"); // Fixed newline bug
        typeWriterEffect(storyText, fullIntroText, 50, () => {
            readyBtn.classList.remove('hidden');
        });
    }

    // --- Sequence: Dialogue/Rules ---
    readyBtn.addEventListener('click', () => {
        introScreen.classList.remove('active');
        introScreen.classList.add('hidden');
        
        bgElement.style.filter = "blur(2px) brightness(0.6)";
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
        typeWriterEffect(rockyDialogue, rulesLines[currentLineIndex], 40);
    }

    // --- Sequence: Interrogation Gameplay ---
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
            btn.textContent = shuffledOptions[index]; // Secure text insertion
            btn.onclick = () => handleAnswer(btn.textContent, currentQ.ans);
            btn.disabled = false;
        });

        changeRockyImage('normal');
        startTimer();
    }

    function startTimer() {
        let timeLeft = TIME_PER_QUESTION;
        timeLeftBar.style.width = '100%';
        timeLeftBar.style.backgroundColor = '#00ff00';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            let percentage = (timeLeft / TIME_PER_QUESTION) * 100;
            timeLeftBar.style.width = `${percentage}%`;

            if (percentage < 30) {
                timeLeftBar.style.backgroundColor = '#ff0000'; 
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
            bgElement.style.filter = "blur(0px) brightness(0.8)"; 
            currentQuestionIndex++;
            loadQuestion();
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

    // --- Initialize safely ---
    document.addEventListener('DOMContentLoaded', () => {
        startIntro();
    });

})();
