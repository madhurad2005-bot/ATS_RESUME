
/* ==================== ATS RESUME ANALYZER - MAIN APPLICATION ==================== */

// ==================== GLOBAL STATE MANAGEMENT ====================

/**
 * Application state object
 * Maintains all data throughout the application lifecycle
 */
const appState = {
    resumeText: '',
    jobDescription: '',
    analysisResult: null,
    isAnalyzing: false,
    chart: null,
    userLoggedIn: false,
    userName: null,
    userEmail: null,
    greetingPlayed: false
};

// ==================== DOM REFERENCES ====================

// File upload elements
const resumeFile = document.getElementById('resumeFile');
const dropZone = document.getElementById('dropZone');
const fileSelectBtn = document.getElementById('fileSelectBtn');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const resumePreview = document.getElementById('resumePreview');
const resumeText = document.getElementById('resumeText');

// Analyzer elements
const jobDescription = document.getElementById('jobDescription');
const analyzeBtn = document.getElementById('analyzeBtn');

// Results elements
const atsChart = document.getElementById('atsChart');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreValue = document.getElementById('scoreValue');
const scoreInterpretation = document.getElementById('scoreInterpretation');
const scoreLoading = document.getElementById('scoreLoading');
const scoreEmpty = document.getElementById('scoreEmpty');
const skillsList = document.getElementById('skillsList');
const missingKeywordsList = document.getElementById('missingKeywordsList');

// Auth elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.getElementById('authButtons');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// ==================== FILE UPLOAD FUNCTIONALITY ====================

/**
 * Initialize file upload event listeners
 * Sets up drag-and-drop and click-to-upload functionality
 */
function initializeFileUpload() {
    // Prevent default drag behaviors
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-purple-400', 'bg-purple-500/20');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-purple-400', 'bg-purple-500/20');
    });

    // Handle file drop
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-purple-400', 'bg-purple-500/20');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input click
    fileSelectBtn.addEventListener('click', () => {
        resumeFile.click();
    });

    // File input change
    resumeFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Click on drop zone to select file
    dropZone.addEventListener('click', () => {
        resumeFile.click();
    });
}

/**
 * Handle selected file processing
 * Supports .txt and .pdf file formats
 * @param {File} file - The selected file
 */
async function handleFileSelect(file) {
    const validTypes = ['text/plain', 'application/pdf'];
    
    // Validate file type
    if (!validTypes.includes(file.type)) {
        showNotification('error', 'Invalid file type. Please upload a .txt or .pdf file.');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'File size exceeds 5MB limit.');
        return;
    }

    try {
        // Display file preview
        filePreview.classList.remove('hidden');
        fileName.textContent = `✓ ${file.name}`;

        // Process file based on type
        if (file.type === 'text/plain') {
            await readTextFile(file);
        } else if (file.type === 'application/pdf') {
            await readPdfFile(file);
        }

        // Show resume preview
        resumePreview.classList.remove('hidden');
        analyzeBtn.disabled = false;
    } catch (error) {
        console.error('File processing error:', error);
        showNotification('error', 'Error processing file. Please try again.');
        filePreview.classList.add('hidden');
        resumePreview.classList.add('hidden');
    }
}

/**
 * Read text file using FileReader API
 * @param {File} file - The text file to read
 */
async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            appState.resumeText = e.target.result;
            resumeText.textContent = appState.resumeText;
            resolve();
        };

        reader.onerror = () => {
            reject(new Error('Failed to read text file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Stub function for reading PDF files
 * Implements PDF.js for actual PDF text extraction
 * @param {File} file - The PDF file to read
 */
async function readPdfFile(file) {
    try {
        // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        appState.resumeText = fullText;
        resumeText.textContent = appState.resumeText;
    } catch (error) {
        console.error('PDF reading error:', error);
        // Fallback message for PDF processing
        appState.resumeText = `[PDF Content - File: ${file.name}]\nNote: Full PDF text extraction is in stub mode. Please use a .txt file for best results.`;
        resumeText.textContent = appState.resumeText;
    }
}

// ==================== AI SCORING ENGINE ====================

/**
 * Main analyze function
 * Orchestrates the AI analysis process
 */
async function analyzeResume() {
    // Validate inputs
    if (!appState.resumeText.trim()) {
        showNotification('error', 'Please upload a resume file.');
        return;
    }

    if (!jobDescription.value.trim()) {
        showNotification('error', 'Please provide a job description.');
        return;
    }

    appState.jobDescription = jobDescription.value;
    appState.isAnalyzing = true;
    analyzeBtn.disabled = true;

    // Show loading state
    scoreEmpty.classList.add('hidden');
    scoreDisplay.classList.add('hidden');
    scoreLoading.classList.remove('hidden');

    try {
        // Call AI analysis function
        appState.analysisResult = await getAIAnalysis(appState.resumeText, appState.jobDescription);

        // Display results
        displayResults(appState.analysisResult);
        showNotification('success', 'Analysis complete!');
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('error', 'Error during analysis. Please try again.');
        scoreLoading.classList.add('hidden');
        scoreEmpty.classList.remove('hidden');
    } finally {
        appState.isAnalyzing = false;
        analyzeBtn.disabled = false;
    }
}

/**
 * Get AI analysis using fetch or Puter.js
 * Returns ATS score, identified skills, and missing keywords
 * @param {string} resume - Resume text content
 * @param {string} jobDesc - Job description text
 * @returns {Promise<Object>} Analysis result with score, skills, and keywords
 */
async function getAIAnalysis(resume, jobDesc) {
    // ==================== METHOD 1: OPENAI API (RECOMMENDED) ====================
    // Uncomment and add your OpenAI API key to use this method
    /*
    const apiKey = 'your-openai-api-key-here';
    const prompt = `Analyze the following resume against the job description and provide a JSON response with:
    1. "atsScore": a number from 0-100
    2. "identifiedSkills": array of skills found in resume that match job description
    3. "missingKeywords": array of important keywords from job description missing in resume

    Resume:
    ${resume}

    Job Description:
    ${jobDesc}

    Respond only with valid JSON, no additional text.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
    */

    // ==================== METHOD 2: LOCAL AI SIMULATION (DEMO) ====================
    // This simulates AI analysis for demonstration purposes
    // In production, replace with actual OpenAI or Puter.js API call

    return new Promise((resolve) => {
        // Simulate processing delay
        setTimeout(() => {
            const analysis = performLocalAnalysis(resume, jobDesc);
            resolve(analysis);
        }, 2000);
    });
}

/**
 * Local AI simulation for analysis
 * Performs keyword matching and skill extraction
 * @param {string} resume - Resume text
 * @param {string} jobDesc - Job description text
 * @returns {Object} Analysis result
 */
function performLocalAnalysis(resume, jobDesc) {
    const resumeText = resume.toLowerCase();
    const jobDescText = jobDesc.toLowerCase();

    // Common technical and soft skills
    const commonSkills = [
        'javascript', 'python', 'java', 'c++', 'react', 'angular', 'vue', 'node.js',
        'sql', 'mongodb', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git',
        'html', 'css', 'typescript', 'rest api', 'graphql', 'microservices',
        'agile', 'scrum', 'communication', 'leadership', 'problem-solving',
        'project management', 'data analysis', 'machine learning', 'ai', 'tensorflow'
    ];

    // Extract identified skills from resume
    const identifiedSkills = [];
    const skillsSet = new Set();
    
    commonSkills.forEach(skill => {
        if (resumeText.includes(skill) && !skillsSet.has(skill)) {
            identifiedSkills.push(skill);
            skillsSet.add(skill);
        }
    });

    // Extract job description keywords
    const jobKeywords = jobDescText.split(/\s+/).filter(word => word.length > 4);

    // Find missing keywords
    const missingKeywords = [];
    const missingSet = new Set();

    jobKeywords.forEach(keyword => {
        if (!resumeText.includes(keyword) && !missingSet.has(keyword)) {
            missingKeywords.push(keyword);
            missingSet.add(keyword);
        }
    });

    // Calculate ATS score based on skill and keyword matches
    const skillMatch = identifiedSkills.length;
    const keywordMatch = jobKeywords.length - missingKeywords.length;
    const totalJobKeywords = jobKeywords.length;

    let atsScore = 0;
    if (identifiedSkills.length > 0) {
        atsScore += Math.min((skillMatch / 20) * 40, 40); // Skills up to 40%
    }
    if (totalJobKeywords > 0) {
        atsScore += (keywordMatch / totalJobKeywords) * 60; // Keywords up to 60%
    }

    // Add resume length bonus (more content = potentially better match)
    if (resumeText.length > 500) {
        atsScore = Math.min(atsScore + 5, 100);
    }

    return {
        atsScore: Math.round(atsScore),
        identifiedSkills: identifiedSkills.slice(0, 10), // Top 10 skills
        missingKeywords: missingKeywords.slice(0, 10), // Top 10 missing keywords
    };
}

// ==================== RESULTS DISPLAY ====================

/**
 * Display analysis results on the UI
 * Updates charts and lists with analysis data
 * @param {Object} result - Analysis result from AI engine
 */
function displayResults(result) {
    // Hide loading state
    scoreLoading.classList.add('hidden');
    scoreEmpty.classList.add('hidden');

    // Display and update chart
    displayAtsChart(result.atsScore);

    // Display score
    scoreDisplay.classList.remove('hidden');
    scoreValue.textContent = result.atsScore;
    scoreInterpretation.textContent = getScoreInterpretation(result.atsScore);

    // Display identified skills
    displaySkills(result.identifiedSkills);

    // Display missing keywords
    displayMissingKeywords(result.missingKeywords);
}

/**
 * Create and update ATS score doughnut chart using Chart.js
 * @param {number} score - ATS score (0-100)
 */
function displayAtsChart(score) {
    const ctx = atsChart.getContext('2d');

    // Destroy existing chart if it exists
    if (appState.chart) {
        appState.chart.destroy();
    }

    // Determine color based on score
    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981'; // Green
        if (score >= 50) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    appState.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Match', 'Gap'],
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [
                    getScoreColor(score),
                    'rgba(100, 116, 139, 0.3)'
                ],
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Get interpretation text based on ATS score
 * @param {number} score - ATS score (0-100)
 * @returns {string} Interpretation message
 */
function getScoreInterpretation(score) {
    if (score >= 85) return '🎉 Excellent! Your resume is highly optimized for this position.';
    if (score >= 75) return '✨ Great! Your resume matches well with the job requirements.';
    if (score >= 60) return '👍 Good! Your resume has relevant skills but could be improved.';
    if (score >= 40) return '⚠️ Fair. Consider adding more relevant keywords and skills.';
    return '❌ Needs improvement. Review missing skills and optimize your resume.';
}

/**
 * Display identified skills as badges
 * @param {Array<string>} skills - Array of identified skills
 */
function displaySkills(skills) {
    skillsList.innerHTML = '';

    if (skills.length === 0) {
        skillsList.innerHTML = '<p class="text-gray-400 text-sm">No common skills identified</p>';
        return;
    }

    skills.forEach(skill => {
        const badge = document.createElement('div');
        badge.className = 'inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2';
        badge.textContent = `✓ ${skill.charAt(0).toUpperCase() + skill.slice(1)}`;
        skillsList.appendChild(badge);
    });
}

/**
 * Display missing keywords as badges
 * @param {Array<string>} keywords - Array of missing keywords
 */
function displayMissingKeywords(keywords) {
    missingKeywordsList.innerHTML = '';

    if (keywords.length === 0) {
        missingKeywordsList.innerHTML = '<p class="text-gray-400 text-sm">No missing keywords detected</p>';
        return;
    }

    keywords.forEach(keyword => {
        const badge = document.createElement('div');
        badge.className = 'inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2';
        badge.textContent = `⚠️ ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
        missingKeywordsList.appendChild(badge);
    });
}

// ==================== AUTHENTICATION UI ====================

/**
 * Initialize authentication modal event listeners
 */
function initializeAuthModals() {
    // Login modal
    loginBtn.addEventListener('click', openLoginModal);
    closeLoginModal.addEventListener('click', closeAllModals);
    switchToSignup.addEventListener('click', () => {
        closeAllModals();
        openSignupModal();
    });
    loginForm.addEventListener('submit', handleLoginSubmit);

    // Signup modal
    signupBtn.addEventListener('click', openSignupModal);
    closeSignupModal.addEventListener('click', closeAllModals);
    switchToLogin.addEventListener('click', () => {
        closeAllModals();
        openLoginModal();
    });
    signupForm.addEventListener('submit', handleSignupSubmit);

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Close modals on background click
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeAllModals();
    });
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) closeAllModals();
    });

    console.log('✓ Authentication modals initialized');
}

/**
 * Open login modal
 */
function openLoginModal() {
    loginModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Open signup modal
 */
function openSignupModal() {
    signupModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Close all modals
 */
function closeAllModals() {
    loginModal.classList.add('hidden');
    signupModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Handle login form submission
 * @param {Event} e - Form submission event
 */
function handleLoginSubmit(e) {
    e.preventDefault();

    // Get form inputs
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validation
    if (!email || !password) {
        showNotification('error', 'Please fill in all fields.');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('error', 'Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        showNotification('error', 'Password must be at least 6 characters.');
        return;
    }

    // Log credentials for testing (in production, send to secure backend)
    console.log('🔐 Login Attempt:', {
        email: email,
        password: password,
        timestamp: new Date().toISOString()
    });

    // Simulate login (in production, send to backend)
    appState.userLoggedIn = true;
    appState.userEmail = email;
    
    // Update UI
    updateAuthUI();
    
    showNotification('success', `Welcome back, ${email}!`);
    closeAllModals();
    loginForm.reset();
    
    console.log('✓ Login successful for:', email);
}

/**
 * Handle signup form submission
 * @param {Event} e - Form submission event
 */
function handleSignupSubmit(e) {
    e.preventDefault();

    // Get form inputs
    const nameInput = signupForm.querySelector('input[type="text"]');
    const emailInput = signupForm.querySelector('input[type="email"]');
    const passwordInputs = signupForm.querySelectorAll('input[type="password"]');
    const termsCheckbox = signupForm.querySelector('input[type="checkbox"]');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInputs[0].value.trim();
    const confirmPassword = passwordInputs[1].value.trim();

    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('error', 'Please fill in all fields.');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('error', 'Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        showNotification('error', 'Password must be at least 6 characters.');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('error', 'Passwords do not match.');
        return;
    }

    if (!termsCheckbox.checked) {
        showNotification('error', 'Please agree to the Terms of Service.');
        return;
    }

    // Log credentials for testing (in production, send to secure backend)
    console.log('📝 Signup Attempt:', {
        name: name,
        email: email,
        password: password,
        timestamp: new Date().toISOString()
    });

    // Simulate signup (in production, send to backend)
    appState.userLoggedIn = true;
    appState.userEmail = email;
    appState.userName = name;
    
    // Update UI
    updateAuthUI();
    
    showNotification('success', `Welcome, ${name}! Your account has been created.`);
    closeAllModals();
    signupForm.reset();
    
    console.log('✓ Account created for:', email);
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Update authentication UI based on login state
 * Shows/hides auth buttons and logout button
 */
function updateAuthUI() {
    if (appState.userLoggedIn) {
        // Hide login/signup buttons
        authButtons.classList.add('hidden');
        // Show logout button
        logoutBtn.classList.remove('hidden');
        console.log('📱 UI updated: Showing Logout button');
    } else {
        // Show login/signup buttons
        authButtons.classList.remove('hidden');
        // Hide logout button
        logoutBtn.classList.add('hidden');
        console.log('📱 UI updated: Showing Auth buttons');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    appState.userLoggedIn = false;
    appState.userEmail = null;
    appState.userName = null;
    appState.greetingPlayed = false; // Allow greeting again on next session
    
    updateAuthUI();
    
    showNotification('success', 'You have been logged out. Goodbye!');
    console.log('🚪 User logged out');
}

// ==================== WEB SPEECH API - VOICE GREETING ====================

/**
 * Initialize voice greeting on first user interaction
 * Uses Web Speech API to welcome users with a professional voice
 * Plays only once per session
 */
function initializeVoiceGreeting() {
    // Check if browser supports Web Speech API
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    
    if (!SpeechSynthesisUtterance) {
        console.warn('Web Speech API is not supported in this browser');
        return;
    }

    // Event handler for first user interaction
    const handleFirstInteraction = () => {
        // Only play greeting if not already played this session
        if (appState.greetingPlayed) {
            return;
        }

        try {
            // Create greeting utterance
            const greeting = new SpeechSynthesisUtterance('Hello! Welcome to the ATS website');
            
            // Configure voice properties for professional tone
            greeting.pitch = 1;           // Normal pitch
            greeting.rate = 0.9;          // Slightly slower for clarity
            greeting.volume = 1;          // Full volume

            // Handle completion
            greeting.onend = () => {
                console.log('✓ Greeting completed');
            };

            // Handle errors
            greeting.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
            };

            // Play the greeting
            window.speechSynthesis.cancel();  // Clear any existing utterances
            window.speechSynthesis.speak(greeting);

            // Mark greeting as played
            appState.greetingPlayed = true;

            // Remove event listeners after first interaction
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('mousemove', handleFirstInteraction);
            
            console.log('🎤 Voice greeting triggered');
        } catch (error) {
            console.error('Error playing greeting:', error);
        }
    };

    // Listen for first click or mousemove on the document
    // Using passive listeners for better performance
    document.addEventListener('click', handleFirstInteraction, { once: false, passive: true });
    document.addEventListener('mousemove', handleFirstInteraction, { once: false, passive: true });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Show notification toast message
 * @param {string} type - Notification type ('success', 'error', 'info')
 * @param {string} message - Message to display
 */
function showNotification(type, message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg font-medium text-white z-40 animate-slide-in';

    // Set background color based on type
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    toast.classList.add(bgColors[type] || bgColors.info);
    toast.textContent = message;

    document.body.appendChild(toast);

    // Add animation class to Tailwind
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .animate-slide-in {
            animation: slideIn 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== APPLICATION INITIALIZATION ====================

/**
 * Initialize all event listeners and setup
 */
function initializeApp() {
    console.log('🚀 ATS Resume Analyzer initialized');

    // Initialize file upload
    initializeFileUpload();

    // Initialize analyze button
    analyzeBtn.addEventListener('click', analyzeResume);

    // Initialize authentication
    initializeAuthModals();

    // Initialize voice greeting
    initializeVoiceGreeting();

    // Initial UI state
    analyzeBtn.disabled = true;
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
