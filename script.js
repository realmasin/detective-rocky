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
    // Answers are Base64 encoded to prevent easy cheating via inspect element
    // btoa("Founder of Seismic") = "Rm91bmRlciBvZiBTZWlzbWlj"
    // btoa("Option 1") = "T3B0aW9uIDE="
    const questionsDatabase = [
        {
            q: "Who is this person?",
            img: "images/founder.jpg",
            opts: ["Founder of Seismic", "Leader", "A random person with no relation to Seismic", "Admin in Seismic"],
            ans: "Rm91bmRlciBvZiBTZWlzbWlj"
        }
    ];

    // Generate 7 dummy questions for testing logic
    for(

