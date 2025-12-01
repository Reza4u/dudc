/**
 * Dashboard Verification - Complete 2-Step Process with Real-time Validation
 * Updated with all DU Halls and Departments
 * This overrides the renderVerification function to show the full verification form
 */

// Override renderVerification with improved 2-step form
window.renderVerification = function (user) {
    // ===== DU HALLS LIST =====
    const duHalls = [
        { value: '', label: 'Select your Hall' },
        { value: 'fazlul-huq', label: 'Fazlul Huq Muslim Hall' },
        { value: 'salimullah', label: 'Salimullah Muslim Hall' },
        { value: 'shahidullah', label: 'Shahidullah Hall' },
        { value: 'jagannath', label: 'Jagannath Hall' },
        { value: 'haji-muhammad-mohsin', label: 'Haji Muhammad Mohsin Hall' },
        { value: 'surja-sen', label: 'Surja Sen Hall' },
        { value: 'muktijoddha-ziaur-rahman', label: 'Muktijoddha Ziaur Rahman Hall' },
        { value: 'bangabandhu-sheikh-mujibur-rahman', label: 'Bangabandhu Sheikh Mujibur Rahman Hall' },
        { value: 'amar-ekushey', label: 'Amar Ekushey Hall' },
        { value: 'kabi-jasimuddin', label: 'Kabi Jasimuddin Hall' },
        { value: 'af-rahman', label: 'A.F. Rahman Hall' },
        { value: 'sir-pj-hartog', label: 'Sir P.J. Hartog International Hall' },
        { value: 'rokeya', label: 'Rokeya Hall (Female)' },
        { value: 'shamsunnahar', label: 'Shamsunnahar Hall (Female)' },
        { value: 'kabi-sufia-kamal', label: 'Kabi Sufia Kamal Hall (Female)' },
        { value: 'bangamata-sheikh-fazilatunnesa', label: 'Bangamata Sheikh Fazilatunnesa Mujib Hall (Female)' },
        { value: 'bijoy-ekattor', label: 'Bijoy Ekattor Hall' },
        { value: 'non-residential', label: 'Non-Residential (Attached)' }
    ];

    // ===== DU DEPARTMENTS LIST =====
    const duDepartments = [
        { value: '', label: 'Select your Department' },
        // Faculty of Science
        { value: 'physics', label: 'Physics' },
        { value: 'mathematics', label: 'Mathematics' },
        { value: 'chemistry', label: 'Chemistry' },
        { value: 'statistics', label: 'Statistics' },
        { value: 'theoretical-physics', label: 'Theoretical Physics' },
        { value: 'applied-mathematics', label: 'Applied Mathematics' },
        { value: 'biomedical-physics', label: 'Biomedical Physics & Technology' },
        // Faculty of Engineering & Technology
        { value: 'cse', label: 'Computer Science & Engineering' },
        { value: 'eee', label: 'Electrical & Electronic Engineering' },
        { value: 'applied-chemistry', label: 'Applied Chemistry & Chemical Engineering' },
        { value: 'nuclear-engineering', label: 'Nuclear Engineering' },
        { value: 'robotics', label: 'Robotics & Mechatronics Engineering' },
        // Faculty of Arts
        { value: 'english', label: 'English' },
        { value: 'bangla', label: 'Bangla' },
        { value: 'philosophy', label: 'Philosophy' },
        { value: 'history', label: 'History' },
        { value: 'islamic-studies', label: 'Islamic Studies' },
        { value: 'arabic', label: 'Arabic' },
        { value: 'persian', label: 'Persian Language & Literature' },
        { value: 'urdu', label: 'Urdu' },
        { value: 'sanskrit', label: 'Sanskrit & Pali' },
        { value: 'linguistics', label: 'Linguistics' },
        { value: 'theatre', label: 'Theatre & Performance Studies' },
        { value: 'music', label: 'Music' },
        { value: 'world-religions', label: 'World Religions & Culture' },
        { value: 'information-science', label: 'Information Science & Library Management' },
        // Faculty of Social Sciences
        { value: 'economics', label: 'Economics' },
        { value: 'political-science', label: 'Political Science' },
        { value: 'sociology', label: 'Sociology' },
        { value: 'public-administration', label: 'Public Administration' },
        { value: 'mass-communication', label: 'Mass Communication & Journalism' },
        { value: 'anthropology', label: 'Anthropology' },
        { value: 'population-sciences', label: 'Population Sciences' },
        { value: 'peace-conflict', label: 'Peace & Conflict Studies' },
        { value: 'dev-studies', label: 'Development Studies' },
        { value: 'international-relations', label: 'International Relations' },
        { value: 'criminology', label: 'Criminology' },
        { value: 'women-gender', label: 'Women & Gender Studies' },
        { value: 'television-film', label: 'Television, Film & Photography' },
        { value: 'printing-publication', label: 'Printing & Publication Studies' },
        { value: 'communication-disorders', label: 'Communication Disorders' },
        { value: 'japanese-studies', label: 'Japanese Studies' },
        // Faculty of Biological Sciences
        { value: 'botany', label: 'Botany' },
        { value: 'zoology', label: 'Zoology' },
        { value: 'biochemistry', label: 'Biochemistry & Molecular Biology' },
        { value: 'microbiology', label: 'Microbiology' },
        { value: 'fisheries', label: 'Fisheries' },
        { value: 'genetic-engineering', label: 'Genetic Engineering & Biotechnology' },
        { value: 'psychology', label: 'Psychology' },
        { value: 'soil-environment', label: 'Soil, Water & Environment' },
        { value: 'clinical-psychology', label: 'Clinical Psychology' },
        { value: 'educational-psychology', label: 'Educational & Counselling Psychology' },
        // Faculty of Business Studies
        { value: 'accounting', label: 'Accounting & Information Systems' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'management', label: 'Management' },
        { value: 'finance', label: 'Finance' },
        { value: 'banking-insurance', label: 'Banking & Insurance' },
        { value: 'mis', label: 'Management Information Systems' },
        { value: 'international-business', label: 'International Business' },
        { value: 'tourism-hospitality', label: 'Tourism & Hospitality Management' },
        { value: 'organization-strategy', label: 'Organization Strategy & Leadership' },
        // Faculty of Earth & Environmental Sciences
        { value: 'geography', label: 'Geography & Environment' },
        { value: 'geology', label: 'Geology' },
        { value: 'oceanography', label: 'Oceanography' },
        { value: 'disaster-science', label: 'Disaster Science & Climate Resilience' },
        { value: 'meteorology', label: 'Meteorology' },
        // Faculty of Law
        { value: 'law', label: 'Law' },
        // Faculty of Pharmacy
        { value: 'pharmacy', label: 'Pharmacy' },
        { value: 'clinical-pharmacy', label: 'Clinical Pharmacy & Pharmacology' },
        { value: 'pharma-technology', label: 'Pharmaceutical Technology' },
        // Faculty of Fine Arts
        { value: 'drawing-painting', label: 'Drawing & Painting' },
        { value: 'printmaking', label: 'Printmaking' },
        { value: 'sculpture', label: 'Sculpture' },
        { value: 'crafts', label: 'Crafts' },
        { value: 'ceramics-glass', label: 'Ceramics & Glass' },
        { value: 'graphic-design', label: 'Graphic Design' },
        { value: 'oriental-art', label: 'Oriental Art' },
        { value: 'art-history', label: 'History of Art' },
        // Faculty of Education
        { value: 'education', label: 'Education & Research (IER)' },
        // Others
        { value: 'other', label: 'Other' }
    ];

    if (user.isVerified) {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <i data-lucide="shield-check" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">You are Verified!</h2>
                <p class="text-slate-600">Your account is fully verified. You can now apply for loans.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    if (user.verificationStatus === 'pending') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                    <i data-lucide="clock" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Verification In Progress</h2>
                <p class="text-slate-600 mb-4">We are reviewing your submission. This usually takes 24-48 hours.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    // Current step (1 or 2)
    let currentStep = 1;

    // Load saved draft if available
    const savedDraft = JSON.parse(localStorage.getItem('verification_draft_' + user.id) || '{}');

    // Pre-fill registration number and session
    const regNo = user.regNo || '';
    let session = '';
    if (regNo.length >= 4) {
        const year = regNo.substring(0, 4);
        const nextYear = (parseInt(year) + 1).toString().substring(2);
        session = `${year}-${nextYear}`;
    }

    // Generate Hall Options
    function getHallOptions() {
        return duHalls.map(h => `<option value="${h.value}">${h.label}</option>`).join('');
    }

    // Generate Department Options  
    function getDeptOptions() {
        return duDepartments.map(d => `<option value="${d.value}">${d.label}</option>`).join('');
    }

    // Main render function
    function renderForm() {
        contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-6">
                <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Complete Your Verification</h2>
                <p class="text-slate-600 mt-2">Fill out all required information to verify your DU student status</p>
            </div>

            <!-- Progress Steps -->
            <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
                <div class="flex items-center justify-center">
                    <!-- Step 1 -->
                    <div class="flex items-center">
                        <div id="step1-circle" class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <span id="step1-label" class="ml-2 text-sm font-medium text-primary hidden sm:block">Personal & Academic</span>
                    </div>
                    <!-- Connector -->
                    <div class="w-16 sm:w-24 h-1 mx-2 sm:mx-4 bg-slate-200 relative">
                        <div id="progress-bar" class="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <!-- Step 2 -->
                    <div class="flex items-center">
                        <div id="step2-circle" class="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <span id="step2-label" class="ml-2 text-sm font-medium text-slate-500 hidden sm:block">Identity & Payment</span>
                    </div>
                </div>
            </div>

            <form id="verificationForm" novalidate>
                <!-- ===== STEP 1: Personal & Academic Info ===== -->
                <div id="step1-content" class="space-y-4">
                    <!-- Personal Information Card -->
                    <div class="bg-white rounded-2xl shadow-sm p-5">
                        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="user" class="w-5 h-5 text-primary"></i>
                            Personal Information
                        </h3>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <!-- Full Name -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Full Name (as per ID) <span class="text-red-500">*</span></label>
                                <input type="text" id="fullName" required 
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="Enter your full name"
                                    value="${user.name || ''}">
                                <p id="fullName-error" class="text-red-500 text-xs mt-1 hidden">Full name is required</p>
                            </div>
                            
                            <!-- Gender -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Gender <span class="text-red-500">*</span></label>
                                <select id="gender" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                <p id="gender-error" class="text-red-500 text-xs mt-1 hidden">Please select your gender</p>
                            </div>
                            
                            <!-- Date of Birth -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span class="text-red-500">*</span></label>
                                <input type="date" id="dob" required 
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                                <p id="dob-error" class="text-red-500 text-xs mt-1 hidden">Date of birth is required</p>
                            </div>
                            
                            <!-- Father's Name -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Father's Name <span class="text-red-500">*</span></label>
                                <input type="text" id="fatherName" required 
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="Father's full name">
                                <p id="fatherName-error" class="text-red-500 text-xs mt-1 hidden">Father's name is required</p>
                            </div>
                            
                            <!-- Mother's Name -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Mother's Name <span class="text-red-500">*</span></label>
                                <input type="text" id="motherName" required 
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="Mother's full name">
                                <p id="motherName-error" class="text-red-500 text-xs mt-1 hidden">Mother's name is required</p>
                            </div>
                            
                            <!-- Mobile Number -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Your Mobile Number <span class="text-red-500">*</span></label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 text-sm text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">+88</span>
                                    <input type="tel" id="userMobile" required pattern="01[0-9]{9}"
                                        class="save-input flex-1 px-4 py-2.5 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                        placeholder="01XXXXXXXXX" maxlength="11">
                                </div>
                                <p id="userMobile-error" class="text-red-500 text-xs mt-1 hidden">Valid BD mobile number required</p>
                            </div>
                            
                            <!-- Family Mobile -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Family Contact Number <span class="text-red-500">*</span></label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 text-sm text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">+88</span>
                                    <input type="tel" id="familyMobile" required pattern="01[0-9]{9}"
                                        class="save-input flex-1 px-4 py-2.5 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                        placeholder="01XXXXXXXXX" maxlength="11">
                                </div>
                                <p id="familyMobile-error" class="text-red-500 text-xs mt-1 hidden">Valid family contact number required</p>
                            </div>
                            
                            <!-- Current Address -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Current Address <span class="text-red-500">*</span></label>
                                <textarea id="currentAddress" required rows="2"
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                                    placeholder="Your current living address (Hall room or off-campus)"></textarea>
                                <p id="currentAddress-error" class="text-red-500 text-xs mt-1 hidden">Current address is required</p>
                            </div>
                            
                            <!-- Permanent Address -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Permanent Address <span class="text-red-500">*</span></label>
                                <textarea id="permanentAddress" required rows="2"
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                                    placeholder="Your permanent home address"></textarea>
                                <p id="permanentAddress-error" class="text-red-500 text-xs mt-1 hidden">Permanent address is required</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Academic Information Card -->
                    <div class="bg-white rounded-2xl shadow-sm p-5">
                        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="graduation-cap" class="w-5 h-5 text-primary"></i>
                            Academic Information
                        </h3>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <!-- Registration Number (readonly) -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">DU Registration Number</label>
                                <input type="text" id="regNumber" readonly value="${regNo}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed">
                            </div>
                            
                            <!-- Session (readonly) -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Session</label>
                                <input type="text" id="session" readonly value="${session}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed">
                            </div>
                            
                            <!-- Department -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Department <span class="text-red-500">*</span></label>
                                <select id="department" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                                    ${getDeptOptions()}
                                </select>
                                <p id="department-error" class="text-red-500 text-xs mt-1 hidden">Please select your department</p>
                            </div>
                            
                            <!-- Hall -->
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Hall <span class="text-red-500">*</span></label>
                                <select id="hall" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                                    ${getHallOptions()}
                                </select>
                                <p id="hall-error" class="text-red-500 text-xs mt-1 hidden">Please select your hall</p>
                            </div>
                            
                            <!-- Program/Year -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Current Program/Year <span class="text-red-500">*</span></label>
                                <select id="program" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                                    <option value="">Select Program/Year</option>
                                    <option value="honours-1">Honours 1st Year</option>
                                    <option value="honours-2">Honours 2nd Year</option>
                                    <option value="honours-3">Honours 3rd Year</option>
                                    <option value="honours-4">Honours 4th Year</option>
                                    <option value="masters-1">Masters 1st Year</option>
                                    <option value="masters-2">Masters 2nd Year (Final)</option>
                                    <option value="mphil">M.Phil</option>
                                    <option value="phd">PhD</option>
                                </select>
                                <p id="program-error" class="text-red-500 text-xs mt-1 hidden">Please select your program/year</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Continue Button -->
                    <button type="button" id="goToStep2Btn" 
                        class="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2">
                        Continue to Step 2
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <!-- ===== STEP 2: Identity & Payment ===== -->
                <div id="step2-content" class="space-y-4 hidden">
                    <!-- Back Button -->
                    <button type="button" id="backToStep1Btn" 
                        class="flex items-center gap-2 text-slate-600 hover:text-primary font-medium transition mb-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        Back to Step 1
                    </button>
                    
                    <!-- Identity Verification Card -->
                    <div class="bg-white rounded-2xl shadow-sm p-5">
                        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="shield-check" class="w-5 h-5 text-primary"></i>
                            Identity Verification
                        </h3>
                        
                        <!-- Verification Method Selection -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-slate-700 mb-3">Do you have a DU institutional email? <span class="text-red-500">*</span></label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label class="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition group">
                                    <input type="radio" name="verifyMethod" value="email" class="w-4 h-4 text-primary focus:ring-primary">
                                    <div class="ml-3">
                                        <span class="font-medium text-slate-800 group-hover:text-primary">Yes, I have one</span>
                                        <p class="text-xs text-slate-500">Faster verification via email OTP</p>
                                    </div>
                                </label>
                                <label class="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition group">
                                    <input type="radio" name="verifyMethod" value="document" class="w-4 h-4 text-primary focus:ring-primary">
                                    <div class="ml-3">
                                        <span class="font-medium text-slate-800 group-hover:text-primary">No, upload documents</span>
                                        <p class="text-xs text-slate-500">Upload ID card for manual review</p>
                                    </div>
                                </label>
                            </div>
                            <p id="verifyMethod-error" class="text-red-500 text-xs mt-2 hidden">Please select a verification method</p>
                        </div>
                        
                        <!-- Email Verification Section -->
                        <div id="emailVerifySection" class="hidden">
                            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p class="text-sm text-green-800">
                                    <strong>Great!</strong> We'll send a verification code to your DU institutional email.
                                </p>
                            </div>
                            
                            <div id="emailInputArea">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Institutional Email <span class="text-red-500">*</span></label>
                                    <input type="email" id="instEmail" 
                                        class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                        placeholder="yourname-regno@dept.du.ac.bd">
                                    <p id="instEmail-error" class="text-red-500 text-xs mt-1 hidden">Please enter a valid DU email</p>
                                </div>
                                <button type="button" id="sendOtpBtn"
                                    class="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                    Send Verification Code
                                </button>
                            </div>
                            
                            <div id="otpInputArea" class="hidden">
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p class="text-sm text-blue-800"><strong>Code Sent!</strong> Check your email for the 6-digit code.</p>
                                    <p class="text-xs text-blue-600 mt-1">Expires in 10 minutes</p>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Enter 6-Digit Code</label>
                                    <input type="text" id="otpCode" maxlength="6"
                                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-center text-2xl tracking-[0.5em] font-mono"
                                        placeholder="000000">
                                </div>
                                
                                <div class="flex gap-3">
                                    <button type="button" id="verifyOtpBtn"
                                        class="flex-1 bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-semibold transition">
                                        Verify Code
                                    </button>
                                    <button type="button" id="resendOtpBtn" disabled
                                        class="flex-1 bg-slate-200 text-slate-400 py-2.5 rounded-lg font-semibold cursor-not-allowed">
                                        Resend (<span id="otpTimer">60</span>s)
                                    </button>
                                </div>
                            </div>
                            
                            <div id="emailVerifiedArea" class="hidden">
                                <div class="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
                                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <i data-lucide="check" class="w-6 h-6 text-white"></i>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-green-900">Email Verified!</p>
                                        <p class="text-sm text-green-700">Your institutional email has been confirmed.</p>
                                    </div>
                                </div>
                                
                                <div class="mt-4">
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Upload Your Recent Photo <span class="text-red-500">*</span></label>
                                    <input type="file" id="recentPhotoEmail" accept="image/*"
                                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium">
                                    <p class="text-xs text-slate-500 mt-1">Clear passport-size photo for verification</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Document Upload Section -->
                        <div id="docVerifySection" class="hidden">
                            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <p class="text-sm text-amber-800">
                                    <strong>Note:</strong> Please upload clear photos of your university ID card and a recent photo.
                                </p>
                            </div>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">ID Card (Front) <span class="text-red-500">*</span></label>
                                    <input type="file" id="idFront" accept="image/*"
                                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">ID Card (Back) <span class="text-red-500">*</span></label>
                                    <input type="file" id="idBack" accept="image/*"
                                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-700 mb-1">Your Recent Photo <span class="text-red-500">*</span></label>
                                    <input type="file" id="recentPhotoDoc" accept="image/*"
                                        class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium">
                                    <p class="text-xs text-slate-500 mt-1">Clear passport-size photo for verification</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Information Card -->
                    <div class="bg-white rounded-2xl shadow-sm p-5">
                        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="banknote" class="w-5 h-5 text-primary"></i>
                            Verification Fee Payment
                        </h3>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p class="text-sm text-blue-900 mb-3">
                                <strong>Instructions:</strong> Pay <strong>100 BDT (non-refundable)</strong> verification fee to one of the numbers below.
                            </p>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white rounded-lg p-3 text-center">
                                    <p class="text-xs text-slate-600">Bkash (Personal)</p>
                                    <p class="font-bold text-pink-600">01712-345678</p>
                                </div>
                                <div class="bg-white rounded-lg p-3 text-center">
                                    <p class="text-xs text-slate-600">Nagad (Personal)</p>
                                    <p class="font-bold text-orange-600">01812-345678</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Sender Mobile Number <span class="text-red-500">*</span></label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 text-sm text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg">+88</span>
                                    <input type="tel" id="senderNumber" required pattern="01[0-9]{9}"
                                        class="save-input flex-1 px-4 py-2.5 rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                        placeholder="01XXXXXXXXX" maxlength="11">
                                </div>
                                <p id="senderNumber-error" class="text-red-500 text-xs mt-1 hidden">Valid sender number required</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID) <span class="text-red-500">*</span></label>
                                <input type="text" id="trxId" required
                                    class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="e.g., 9J7X3YXXXX">
                                <p id="trxId-error" class="text-red-500 text-xs mt-1 hidden">Transaction ID is required</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Submit Button -->
                    <button type="submit" id="submitBtn"
                        class="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white py-3.5 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-5 h-5"></i>
                        Submit Verification
                    </button>
                </div>
            </form>
            
            <!-- Draft Save Indicator -->
            <div id="saveIndicator" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity duration-500 flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                Draft Saved
            </div>
        </div>
        `;

        lucide.createIcons();
        setupEvents();
        restoreDraft();
    }

    // Update progress indicator
    function updateProgress(step) {
        const step1Circle = document.getElementById('step1-circle');
        const step1Label = document.getElementById('step1-label');
        const step2Circle = document.getElementById('step2-circle');
        const step2Label = document.getElementById('step2-label');
        const progressBar = document.getElementById('progress-bar');

        if (step === 1) {
            step1Circle.className = 'w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm';
            step1Circle.innerHTML = '1';
            step1Label?.classList.remove('text-green-500');
            step1Label?.classList.add('text-primary');
            step2Circle.className = 'w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm';
            step2Circle.innerHTML = '2';
            step2Label?.classList.remove('text-primary');
            step2Label?.classList.add('text-slate-500');
            progressBar.style.width = '0%';
        } else if (step === 2) {
            step1Circle.className = 'w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm';
            step1Circle.innerHTML = '✓';
            step1Label?.classList.remove('text-primary');
            step1Label?.classList.add('text-green-500');
            step2Circle.className = 'w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm';
            step2Circle.innerHTML = '2';
            step2Label?.classList.remove('text-slate-500');
            step2Label?.classList.add('text-primary');
            progressBar.style.width = '100%';
        }
    }

    // Save draft to localStorage
    function saveDraft() {
        const inputs = document.querySelectorAll('.save-input');
        const draft = { currentStep: currentStep };
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) draft[input.name] = input.value;
            } else if (input.id) {
                draft[input.id] = input.value;
            }
        });
        
        localStorage.setItem('verification_draft_' + user.id, JSON.stringify(draft));

        // Show saved indicator
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.classList.remove('opacity-0');
            setTimeout(() => indicator.classList.add('opacity-0'), 2000);
        }
    }

    // Restore draft from localStorage
    function restoreDraft() {
        if (!savedDraft || Object.keys(savedDraft).length === 0) return;

        Object.keys(savedDraft).forEach(key => {
            if (key === 'currentStep') return;

            const el = document.getElementById(key);
            if (el) {
                el.value = savedDraft[key];
            } else {
                // Handle radio buttons
                const radios = document.querySelectorAll(`input[name="${key}"]`);
                radios.forEach(radio => {
                    if (radio.value === savedDraft[key]) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change'));
                    }
                });
            }
        });

        // Restore to saved step
        if (savedDraft.currentStep === 2) {
            document.getElementById('step1-content').classList.add('hidden');
            document.getElementById('step2-content').classList.remove('hidden');
            currentStep = 2;
            updateProgress(2);
        }
    }

    // Setup all event listeners
    function setupEvents() {
        let emailVerified = false;
        let generatedOtp = '';
        let timerInterval = null;

        // Auto-save on input
        document.querySelectorAll('.save-input').forEach(input => {
            input.addEventListener('input', saveDraft);
            input.addEventListener('change', saveDraft);
        });

        // Real-time validation for text inputs
        const validateField = (input, errorEl, pattern = null) => {
            const value = input.value.trim();
            let isValid = true;

            if (input.hasAttribute('required') && !value) {
                isValid = false;
            } else if (pattern && value && !pattern.test(value)) {
                isValid = false;
            }

            if (isValid) {
                input.classList.remove('border-red-500', 'ring-red-500');
                input.classList.add('border-slate-300');
                errorEl?.classList.add('hidden');
            } else {
                input.classList.remove('border-slate-300');
                input.classList.add('border-red-500');
                errorEl?.classList.remove('hidden');
            }

            return isValid;
        };

        // Add real-time validation to required fields
        const requiredFields = ['fullName', 'gender', 'dob', 'fatherName', 'motherName', 'userMobile', 'familyMobile', 'currentAddress', 'permanentAddress', 'department', 'hall', 'program'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorEl = document.getElementById(fieldId + '-error');
            if (field) {
                field.addEventListener('blur', () => {
                    const pattern = field.pattern ? new RegExp(field.pattern) : null;
                    validateField(field, errorEl, pattern);
                });
            }
        });

        // Go to Step 2
        const goToStep2Btn = document.getElementById('goToStep2Btn');
        if (goToStep2Btn) {
            goToStep2Btn.addEventListener('click', () => {
                // Validate Step 1 fields
                let isValid = true;
                const step1Fields = ['fullName', 'gender', 'dob', 'fatherName', 'motherName', 'userMobile', 'familyMobile', 'currentAddress', 'permanentAddress', 'department', 'hall', 'program'];
                
                step1Fields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    const errorEl = document.getElementById(fieldId + '-error');
                    if (field) {
                        const pattern = field.pattern ? new RegExp(field.pattern) : null;
                        if (!validateField(field, errorEl, pattern)) {
                            isValid = false;
                        }
                    }
                });

                if (!isValid) {
                    // Scroll to first error
                    const firstError = document.querySelector('.border-red-500');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                    return;
                }

                // Switch to Step 2
                document.getElementById('step1-content').classList.add('hidden');
                document.getElementById('step2-content').classList.remove('hidden');
                currentStep = 2;
                updateProgress(2);
                saveDraft();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                lucide.createIcons();
            });
        }

        // Back to Step 1
        const backToStep1Btn = document.getElementById('backToStep1Btn');
        if (backToStep1Btn) {
            backToStep1Btn.addEventListener('click', () => {
                document.getElementById('step2-content').classList.add('hidden');
                document.getElementById('step1-content').classList.remove('hidden');
                currentStep = 1;
                updateProgress(1);
                saveDraft();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                lucide.createIcons();
            });
        }

        // Verification method toggle
        document.querySelectorAll('input[name="verifyMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const emailSection = document.getElementById('emailVerifySection');
                const docSection = document.getElementById('docVerifySection');
                
                if (e.target.value === 'email') {
                    emailSection.classList.remove('hidden');
                    docSection.classList.add('hidden');
                } else {
                    emailSection.classList.add('hidden');
                    docSection.classList.remove('hidden');
                }
                saveDraft();
                lucide.createIcons();
            });
        });

        // Send OTP
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        if (sendOtpBtn) {
            sendOtpBtn.addEventListener('click', () => {
                const email = document.getElementById('instEmail').value;
                const errorEl = document.getElementById('instEmail-error');
                
                if (!email || !email.includes('@') || !email.includes('.du.ac.bd')) {
                    errorEl?.classList.remove('hidden');
                    return;
                }
                errorEl?.classList.add('hidden');

                // Generate OTP
                generatedOtp = '123456';
                console.log('🔐 OTP Generated:', generatedOtp);
                alert('🔐 TEST MODE: Your OTP is 123456');

                // Show OTP input
                document.getElementById('emailInputArea').classList.add('hidden');
                document.getElementById('otpInputArea').classList.remove('hidden');

                // Start countdown
                let countdown = 60;
                const timerSpan = document.getElementById('otpTimer');
                const resendBtn = document.getElementById('resendOtpBtn');

                if (timerInterval) clearInterval(timerInterval);
                timerInterval = setInterval(() => {
                    countdown--;
                    if (timerSpan) timerSpan.textContent = countdown;

                    if (countdown <= 0) {
                        clearInterval(timerInterval);
                        if (resendBtn) {
                            resendBtn.disabled = false;
                            resendBtn.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
                            resendBtn.classList.add('bg-primary', 'text-white', 'hover:bg-secondary', 'cursor-pointer');
                            resendBtn.textContent = 'Resend OTP';
                        }
                    }
                }, 1000);

                lucide.createIcons();
            });
        }

        // Verify OTP
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', () => {
                const enteredOtp = document.getElementById('otpCode').value;

                if (enteredOtp.length !== 6) {
                    alert('Please enter a 6-digit code');
                    return;
                }

                if (enteredOtp === generatedOtp) {
                    emailVerified = true;
                    if (timerInterval) clearInterval(timerInterval);

                    document.getElementById('otpInputArea').classList.add('hidden');
                    document.getElementById('emailVerifiedArea').classList.remove('hidden');
                    lucide.createIcons();
                    alert('✅ Email verified successfully!');
                } else {
                    alert('❌ Invalid OTP code. Please try again.');
                    document.getElementById('otpCode').value = '';
                }
            });
        }

        // Resend OTP
        const resendOtpBtn = document.getElementById('resendOtpBtn');
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => {
                if (!resendOtpBtn.disabled) {
                    document.getElementById('otpInputArea').classList.add('hidden');
                    document.getElementById('emailInputArea').classList.remove('hidden');
                    lucide.createIcons();
                }
            });
        }

        // Form Submit
        const form = document.getElementById('verificationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('🚀 Form submission triggered');

                try {
                    // Validate verification method
                    const verifyMethod = document.querySelector('input[name="verifyMethod"]:checked');
                    if (!verifyMethod) {
                        document.getElementById('verifyMethod-error')?.classList.remove('hidden');
                        alert('Please select a verification method');
                        return;
                    }

                    // Check email verification
                    if (verifyMethod.value === 'email' && !emailVerified) {
                        alert('Please verify your institutional email before submitting.');
                        return;
                    }

                    // Check document uploads
                    if (verifyMethod.value === 'document') {
                        const idFront = document.getElementById('idFront')?.files.length || 0;
                        const idBack = document.getElementById('idBack')?.files.length || 0;
                        const recentPhoto = document.getElementById('recentPhotoDoc')?.files.length || 0;

                        if (!idFront || !idBack || !recentPhoto) {
                            alert('Please upload all required documents (ID Card front, back, and your photo)');
                            return;
                        }
                    }

                    // Check photo for email verification
                    if (verifyMethod.value === 'email') {
                        const recentPhoto = document.getElementById('recentPhotoEmail')?.files.length || 0;
                        if (!recentPhoto) {
                            alert('Please upload your recent photo');
                            return;
                        }
                    }

                    // Validate payment
                    const senderNumber = document.getElementById('senderNumber')?.value;
                    const trxId = document.getElementById('trxId')?.value;

                    if (!senderNumber || !trxId) {
                        alert('Please fill in the payment information');
                        return;
                    }

                    // Collect all data
                    const data = {
                        personal: {
                            fullName: document.getElementById('fullName')?.value,
                            gender: document.getElementById('gender')?.value,
                            dob: document.getElementById('dob')?.value,
                            fatherName: document.getElementById('fatherName')?.value,
                            motherName: document.getElementById('motherName')?.value,
                            userMobile: document.getElementById('userMobile')?.value,
                            familyMobile: document.getElementById('familyMobile')?.value,
                            currentAddress: document.getElementById('currentAddress')?.value,
                            permanentAddress: document.getElementById('permanentAddress')?.value
                        },
                        academic: {
                            regNo: document.getElementById('regNumber')?.value,
                            session: document.getElementById('session')?.value,
                            department: document.getElementById('department')?.value,
                            hall: document.getElementById('hall')?.value,
                            program: document.getElementById('program')?.value
                        },
                        identity: {
                            method: verifyMethod.value,
                            email: verifyMethod.value === 'email' ? document.getElementById('instEmail')?.value : null,
                            emailVerified: verifyMethod.value === 'email' ? emailVerified : false
                        },
                        payment: {
                            senderNumber: senderNumber,
                            transactionId: trxId
                        },
                        status: 'pending',
                        submittedAt: new Date().toISOString()
                    };

                    console.log('✅ Submitting data:', data);

                    // Update user
                    if (window.db && window.db.updateUser) {
                        user.verificationData = data;
                        user.verificationStatus = 'pending';
                        window.db.updateUser(user);

                        // Clear draft
                        localStorage.removeItem('verification_draft_' + user.id);

                        alert('✅ Verification submitted successfully!\n\nWe will review your information within 24-48 hours.\nYou will be notified once verified.');

                        // Reload
                        if (typeof renderView === 'function') {
                            renderView('overview');
                        } else {
                            window.location.reload();
                        }
                    } else {
                        throw new Error('Database not available');
                    }

                } catch (err) {
                    console.error('Submission Error:', err);
                    alert('❌ An error occurred: ' + err.message);
                }
            });
        }
    }

    renderForm();
};
