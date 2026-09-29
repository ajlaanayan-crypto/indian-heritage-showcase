/**
 * Indian Heritage - Immersive Experience Engine (Saffron Mist Theme)
 * Handles automatic video autoplay, skip intro button, horizontal curtain split,
 * custom select dropdowns, multi-step e-Visa application form, and Saarthi AI chatbot.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const container = document.getElementById('experience-container');
    const audioPrompt = document.getElementById('audio-prompt');
    const audioControlBtn = document.getElementById('audio-control-btn');
    const audioControlIcon = document.getElementById('audio-control-icon');
    const videoWrapper = document.getElementById('video-wrapper');
    const introVideo = document.getElementById('intro-video');
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    const splitStage = document.getElementById('split-stage');
    const splitTop = document.getElementById('split-top');
    const splitBottom = document.getElementById('split-bottom');
    const greetingView = document.getElementById('greeting-view');

    // Selectors & Form Elements
    const selectionCard = document.getElementById('selection-card');
    const translationBox = document.getElementById('translation-box');
    const translationOutput = document.getElementById('translation-output');

    // Custom Dropdown Elements
    const countrySelect = document.getElementById('country-custom-select');
    const countryTrigger = document.getElementById('country-trigger');
    const countryOptions = document.getElementById('country-options');
    
    const languageSelect = document.getElementById('language-custom-select');
    const languageTrigger = document.getElementById('language-trigger');
    const languageOptions = document.getElementById('language-options');

    // Application Modal Elements
    const applyVisaBtn = document.getElementById('apply-visa-btn');
    const enquireVisaBtn = document.getElementById('enquire-visa-btn');
    const applyModal = document.getElementById('apply-modal');
    const modalClose = document.getElementById('modal-close');
    const stepNext = document.getElementById('step-next');
    const stepPrev = document.getElementById('step-prev');
    const stepContents = document.querySelectorAll('.step-content');
    const stepNodes = document.querySelectorAll('.step-node');

    // Saarthi AI Chatbox Elements
    const saarthiTrigger = document.getElementById('saarthi-trigger');
    const saarthiChatbox = document.getElementById('saarthi-chatbox');
    const chatboxClose = document.getElementById('chatbox-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chatbox-messages');
    const suggestedBtns = document.querySelectorAll('.suggest-btn');

    // --- State Variables ---
    let transitionTriggered = false;
    let animationFrameId = null;
    let userInteracted = false;

    // Selected Values State
    let selectedCountry = "";
    let selectedLanguage = "";

    // Time tracking physics
    let lastTime = 0;
    let totalPlaybackTime = 0; // accumulated active playback seconds

    // --- Translation Data ---
    const countryLanguageData = {
        IN: [
            { code: "hi", name: "Hindi (हिन्दी)", greeting: "अतिथि देवो भव" },
            { code: "sa", name: "Sanskrit (संस्कृतम्)", greeting: "अतिथिदेवो भव" },
            { code: "ta", name: "Tamil (தமிழ்)", greeting: "விருந்தினரே கடவுள்" },
            { code: "te", name: "Telugu (తెలుగు)", greeting: "అతిథి దేవోభవ" },
            { code: "bn", name: "Bengali (বাংলা)", greeting: "অতিথি দেবো ভব" }
        ],
        US: [
            { code: "en", name: "English", greeting: "The guest is god" }
        ],
        GB: [
            { code: "en", name: "English", greeting: "The guest is god" }
        ],
        FR: [
            { code: "fr", name: "French (Français)", greeting: "L'invité est Dieu" }
        ],
        DE: [
            { code: "de", name: "German (Deutsch)", greeting: "Der Gast ist Gott" }
        ],
        ES: [
            { code: "es", name: "Spanish (Español)", greeting: "El invitado es Dios" }
        ],
        JP: [
            { code: "ja", name: "Japanese (日本語)", greeting: "お客様は神様です" }
        ],
        IT: [
            { code: "it", name: "Italian (Italiano)", greeting: "L'ospite è Dio" }
        ],
        RU: [
            { code: "ru", name: "Russian (Русский)", greeting: "Гость — это Бог" }
        ],
        SA: [
            { code: "ar", name: "Arabic (العربية)", greeting: "الضيف هو الله" }
        ]
    };

    // --- Unmute User Interaction (Required for video audio) ---
    function unmuteAudio() {
        if (userInteracted) return;
        userInteracted = true;
        
        // Unmute video element
        introVideo.muted = false;
        
        // Hide audio prompt banner
        audioPrompt.classList.add('hidden');
        
        // Update floating mute button UI
        updateMuteButtonUI();
    }

    // --- Start Playback immediately ---
    function startIntro() {
        introVideo.play().then(() => {
            lastTime = performance.now();
            totalPlaybackTime = 0;
            monitorPlayback();
            
            if (!userInteracted) {
                audioPrompt.classList.remove('hidden');
            }
        }).catch(err => {
            console.error("Autoplay failed. Waiting for user interaction...", err);
        });
    }

    function monitorPlayback() {
        if (transitionTriggered) return;

        const now = performance.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        if (!introVideo.paused && !introVideo.seeking) {
            totalPlaybackTime += delta;
        }

        // Trigger horizontal split at 15.0 seconds of playback or if video ends
        if (introVideo.ended || introVideo.currentTime >= introVideo.duration - 0.1 || totalPlaybackTime >= 15.0) {
            triggerHorizontalSplit();
            return;
        }

        animationFrameId = requestAnimationFrame(monitorPlayback);
    }

    // --- Horizontal Curtain Split Transition ---
    function triggerHorizontalSplit() {
        if (transitionTriggered) return;
        transitionTriggered = true;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        // Grab video dimensions with safety fallbacks
        const videoW = introVideo.videoWidth || introVideo.clientWidth || window.innerWidth;
        const videoH = introVideo.videoHeight || introVideo.clientHeight || window.innerHeight;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Set dimensions for the two canvas halves
        splitTop.width = vw;
        splitTop.height = vh / 2;
        
        splitBottom.width = vw;
        splitBottom.height = vh / 2;

        const ctxTop = splitTop.getContext('2d');
        const ctxBottom = splitBottom.getContext('2d');

        try {
            // Draw top half of video onto splitTop canvas
            ctxTop.drawImage(
                introVideo, 
                0, 0, videoW, videoH / 2, // Source rect
                0, 0, vw, vh / 2         // Dest rect
            );

            // Draw bottom half of video onto splitBottom canvas
            ctxBottom.drawImage(
                introVideo, 
                0, videoH / 2, videoW, videoH / 2, // Source rect
                0, 0, vw, vh / 2                 // Dest rect
            );
        } catch (e) {
            console.error("Failed to capture video frame halves:", e);
        }

        // Show the split stage container (canvases + line)
        splitStage.classList.remove('hidden');

        // Trigger middle split line to scale and show
        const splitLine = splitStage.querySelector('.split-line');
        if (splitLine) {
            splitLine.classList.add('active');
        }

        // Elements for cinematic transitions
        const cinematicOverlay = document.getElementById('cinematic-overlay');
        const transContainer = document.getElementById('transition-logo-container');
        const navLogo = document.querySelector('.nav-logo');

        // Immediately hide actual navbar logo to prevent duplication
        if (navLogo) {
            navLogo.style.opacity = '0';
            navLogo.style.transition = 'opacity 0.3s ease';
        }

        // 1. Immediately activate off-white overlay and reveal greetingView (behind overlay)
        if (cinematicOverlay) {
            cinematicOverlay.classList.remove('hidden');
            cinematicOverlay.classList.add('active');
        }
        greetingView.classList.remove('hidden');

        // 2. Immediately start splitting canvases to reveal the off-white page
        videoWrapper.classList.add('as-background');
        requestAnimationFrame(() => {
            splitTop.classList.add('split-active');
            splitBottom.classList.add('split-active');
            if (splitLine) {
                splitLine.classList.add('split-active');
            }
        });

        // 3. After 500ms (curtains slid open, showing off-white screen), fade-in Namaste logo in center
        setTimeout(() => {
            if (transContainer) {
                transContainer.classList.remove('hidden-logo');
                transContainer.classList.add('fade-in-center');
            }
        }, 500);

        // 4. After 1.5s delay (2000ms total), translate logo to navbar and fade out off-white page to open website
        setTimeout(() => {
            // Animate transition logo to navigation logo coordinates
            if (transContainer && navLogo) {
                const navRect = navLogo.getBoundingClientRect();
                
                transContainer.classList.remove('fade-in-center');
                transContainer.classList.add('move-to-nav');
                
                // Set coordinates dynamically for pixel-perfect translation
                transContainer.style.top = `${navRect.top + navRect.height / 2}px`;
                transContainer.style.left = `${navRect.left + navRect.width / 2}px`;
                
                // Scale logo down from its big 120px height to exact navbar logo height
                const scaleFactor = navRect.height / 120;
                transContainer.style.transform = `translate(-50%, -50%) scale(${scaleFactor})`;
            }

            // Start fading out the off-white overlay screen
            if (cinematicOverlay) {
                cinematicOverlay.classList.remove('active');
            }

            // Trigger entrance stagger animations for main website components
            greetingView.classList.add('portal-ready');

            // 5. Once logo reaches navbar (1000ms transition), show navbar logo & cleanup overlay
            setTimeout(() => {
                if (navLogo) {
                    navLogo.style.opacity = '1';
                }
                if (transContainer) {
                    transContainer.classList.add('hidden-logo');
                }
                if (cinematicOverlay) {
                    cinematicOverlay.classList.add('hidden');
                }
                // Hide split canvases stage after curtain slide completes
                splitStage.classList.add('hidden');
                splitTop.classList.remove('split-active');
                splitBottom.classList.remove('split-active');
                if (splitLine) {
                    splitLine.classList.remove('active', 'split-active');
                }
            }, 1000); // matches the transition time for logo move (1.0s)

        }, 2000); // 500ms split slide + 1.5s freeze = 2000ms
    }

    // Skip Intro Button Event
    skipIntroBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHorizontalSplit();
    });

    // --- Premium Custom Select Dropdowns Logic ---
    
    // Toggle dropdown visibility
    countryTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllDropdowns(countrySelect);
        countrySelect.classList.toggle('open');
    });

    languageTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (languageSelect.classList.contains('disabled')) return;
        closeAllDropdowns(languageSelect);
        languageSelect.classList.toggle('open');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    function closeAllDropdowns(exceptSelect = null) {
        if (exceptSelect !== countrySelect) countrySelect.classList.remove('open');
        if (exceptSelect !== languageSelect) languageSelect.classList.remove('open');
    }

    // Click handler for Country options
    countryOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.custom-option');
        if (!option) return;

        countryOptions.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        selectedCountry = option.dataset.value;
        const countryName = option.textContent;

        countryTrigger.querySelector('.trigger-text').textContent = countryName;
        countrySelect.classList.remove('open');

        handleCountryChange(selectedCountry);
    });

    function handleCountryChange(countryCode) {
        const languages = countryLanguageData[countryCode];
        if (!languages) return;

        languageSelect.classList.remove('disabled');
        languageOptions.innerHTML = '';

        languages.forEach((lang, index) => {
            const opt = document.createElement('span');
            opt.className = 'custom-option';
            opt.dataset.value = lang.code;
            opt.textContent = lang.name;
            
            if (index === 0) {
                opt.classList.add('selected');
                selectedLanguage = lang.code;
                languageTrigger.querySelector('.trigger-text').textContent = lang.name;
                displayGreeting(lang.greeting);
            }

            languageOptions.appendChild(opt);
        });
    }

    // Click handler for Language options
    languageOptions.addEventListener('click', (e) => {
        const option = e.target.closest('.custom-option');
        if (!option) return;

        languageOptions.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        selectedLanguage = option.dataset.value;
        const languageName = option.textContent;

        languageTrigger.querySelector('.trigger-text').textContent = languageName;
        languageSelect.classList.remove('open');

        const languages = countryLanguageData[selectedCountry];
        const match = languages.find(l => l.code === selectedLanguage);
        if (match) {
            displayGreeting(match.greeting);
        }
    });

    function displayGreeting(greetingText) {
        translationBox.classList.remove('hidden');
        
        translationOutput.textContent = greetingText;
        translationOutput.style.animation = 'none';
        translationOutput.offsetHeight; // trigger reflow
        translationOutput.style.animation = '';
    }

    // --- Interactive e-Visa Application Modal (Stepper) ---
    let currentStep = 1;

    applyVisaBtn.addEventListener('click', () => {
        applyModal.classList.remove('hidden');
        currentStep = 1;
        updateStepper();
    });

    modalClose.addEventListener('click', () => {
        applyModal.classList.add('hidden');
    });

    stepNext.addEventListener('click', () => {
        if (currentStep < 3) {
            currentStep++;
            updateStepper();
        } else {
            // Mock submit
            alert("Application submitted successfully! Your tracking ID is IND-" + Math.floor(Math.random() * 900000 + 100000));
            applyModal.classList.add('hidden');
        }
    });

    stepPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepper();
        }
    });

    function updateStepper() {
        // Toggle step content pages
        stepContents.forEach(content => {
            if (parseInt(content.dataset.step) === currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Toggle step tracker circles
        stepNodes.forEach(node => {
            if (parseInt(node.dataset.step) <= currentStep) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        // Handle buttons
        if (currentStep === 1) {
            stepPrev.classList.add('hidden');
        } else {
            stepPrev.classList.remove('hidden');
        }

        if (currentStep === 3) {
            stepNext.textContent = "Submit Application";
        } else {
            stepNext.textContent = "Next";
        }
    }

    // --- Saarthi AI Chatbox Simulation ---
    saarthiTrigger.addEventListener('click', () => {
        saarthiChatbox.classList.remove('hidden');
        chatInput.focus();
    });

    chatboxClose.addEventListener('click', () => {
        saarthiChatbox.classList.add('hidden');
    });

    // Enquire application links to chat tracking prompt
    enquireVisaBtn.addEventListener('click', () => {
        saarthiChatbox.classList.remove('hidden');
        addChatMessage("user", "How can I track my status?");
        simulateBotResponse("How can I track my status?");
    });

    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addChatMessage("user", text);
        chatInput.value = "";
        simulateBotResponse(text);
    }

    suggestedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            addChatMessage("user", question);
            simulateBotResponse(question);
        });
    });

    function addChatMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerHTML = `<div class="chat-bubble">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function simulateBotResponse(userMsg) {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = "chat-msg bot";
        typingDiv.id = "chat-typing";
        typingDiv.innerHTML = `<div class="chat-bubble">Typing...</div>`;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Auto responses mapping
        let botText = "Thank you for your message! Our visa officers will review your query. You can also contact us at +91-11-24300606 for direct support.";
        const normalized = userMsg.toLowerCase();
        
        if (normalized.includes("requirement") || normalized.includes("documents")) {
            botText = "For an e-Visa, you need a scanned copy of your passport bio page (PDF), a recent digital photograph (JPEG), and depending on the visa type, a return or onward ticket.";
        } else if (normalized.includes("time") || normalized.includes("how long")) {
            botText = "Standard processing time for India e-Visa is 72 hours. We recommend applying at least 4 days before your expected arrival date.";
        } else if (normalized.includes("track") || normalized.includes("status") || normalized.includes("enquire")) {
            botText = "You can track your application status using your 12-digit Application ID and Passport number in the Enquire Application section. I can also lookup mock details if you have an ID!";
        } else if (normalized.includes("fee") || normalized.includes("cost")) {
            botText = "The e-Visa fees range from $10 to $80 depending on your nationality and the visa type chosen (e-Tourist, e-Business, e-Medical).";
        }

        setTimeout(() => {
            const typing = document.getElementById('chat-typing');
            if (typing) typing.remove();
            addChatMessage("bot", botText);
        }, 1200);
    }

    // --- Interactive Mouse-Move Glow Effect for Glass Cards ---
    document.querySelectorAll('.glass-panel').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Floating Mute/Unmute Controller Logic ---
    function updateMuteButtonUI() {
        if (introVideo.muted) {
            audioControlIcon.textContent = "🔇";
            audioControlBtn.setAttribute('title', 'Unmute Sound');
        } else {
            audioControlIcon.textContent = "🔊";
            audioControlBtn.setAttribute('title', 'Mute Sound');
        }
    }

    audioControlBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering global window unmute interaction
        
        introVideo.muted = !introVideo.muted;
        
        // Hide the introductory prompt if still showing
        if (!userInteracted) {
            userInteracted = true;
            audioPrompt.classList.add('hidden');
        }
        
        updateMuteButtonUI();
    });

    // --- Single Page Routing Logic ---
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const portalViews = document.querySelectorAll('.portal-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            const targetView = document.getElementById(targetId);

            if (!targetView || link.classList.contains('active')) return;

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Find currently active view
            const currentView = document.querySelector('.portal-view.active-view');
            if (currentView) {
                currentView.classList.remove('fade-in');
                setTimeout(() => {
                    currentView.classList.remove('active-view');
                    
                    // Show target view
                    targetView.classList.add('active-view');
                    targetView.offsetWidth; // trigger reflow
                    targetView.classList.add('fade-in');
                }, 300); // matches transition fade duration
            } else {
                targetView.classList.add('active-view');
                targetView.offsetWidth;
                targetView.classList.add('fade-in');
            }
        });
    });

    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQs first
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Toggle active state
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Interactive Event Listeners for Audio ---
    window.addEventListener('click', unmuteAudio);
    window.addEventListener('keydown', unmuteAudio);
    window.addEventListener('touchstart', unmuteAudio);

    // Initialize button state
    updateMuteButtonUI();

    // Start immediately on load
    startIntro();
});
