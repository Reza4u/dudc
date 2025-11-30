/**
 * Dashboard Verification - Complete 4-Section Inline Form
 * This overrides the renderVerification function to show the full verification form
 */

// Override renderVerification with complete 4-section inline form
window.renderVerification = function (user) {
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

    // Store current section
    let currentSection = 1;

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

    // Initial render
    function renderForm() {
        contentArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-slate-800">Complete Profile & Verify</h2>
                <span id="saveIndicator" class="text-sm text-green-600 font-medium opacity-0 transition-opacity duration-500">
                    <i data-lucide="save" class="w-4 h-4 inline mr-1"></i> Draft Saved
                </span>
            </div>
            
            <!-- Progress Indicator -->
            <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div class="text-center flex-1">
                        <div id="step1-indicator" class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300">1</div>
                        <p id="step1-text" class="text-xs font-medium text-primary transition-colors duration-300">Payment</p>
                    </div>
                    <div class="flex-1 h-1 bg-slate-200 mx-2 relative">
                        <div id="progress1" class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div class="text-center flex-1">
                        <div id="step2-indicator" class="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300">2</div>
                        <p id="step2-text" class="text-xs font-medium text-slate-500 transition-colors duration-300">Personal</p>
                    </div>
                    <div class="flex-1 h-1 bg-slate-200 mx-2 relative">
                        <div id="progress2" class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div class="text-center flex-1">
                        <div id="step3-indicator" class="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300">3</div>
                        <p id="step3-text" class="text-xs font-medium text-slate-500 transition-colors duration-300">Academic</p>
                    </div>
                    <div class="flex-1 h-1 bg-slate-200 mx-2 relative">
                        <div id="progress3" class="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div class="text-center flex-1">
                        <div id="step4-indicator" class="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300">4</div>
                        <p id="step4-text" class="text-xs font-medium text-slate-500 transition-colors duration-300">Identity</p>
                    </div>
                </div>
            </div>

            <form id="verificationForm">
                <!-- Section 1: Payment -->
                <div id="section1" class="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300">
                    <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="banknote" class="w-6 h-6 text-primary"></i>
                        Section 1: Verification Fee Payment
                    </h3>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-blue-900 mb-3">
                            <strong>Instructions:</strong> Pay <strong>100 BDT (non-refundable)</strong> verification fee to one of the numbers below.
                        </p>
                        <div class="flex gap-4">
                            <div class="bg-white rounded-lg p-3 flex-1">
                                <p class="text-xs text-slate-600">Bkash (Personal)</p>
                                <p class="font-bold text-pink-600">01712-345678</p>
                            </div>
                            <div class="bg-white rounded-lg p-3 flex-1">
                                <p class="text-xs text-slate-600">Nagad (Personal)</p>
                                <p class="font-bold text-orange-600">01812-345678</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Sender Mobile Number <span class="text-red-500">*</span></label>
                            <input type="tel" id="senderNumber" required pattern="01[0-9]{9}" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="01XXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID) <span class="text-red-500">*</span></label>
                            <input type="text" id="trxId" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="9J7X3YXXXX">
                        </div>
                    </div>

                    <button type="button" onclick="nextSection(2)" class="mt-6 w-full bg-primary hover:bg-secondary text-white py-3 rounded-lg font-semibold shadow-md transition">
                        Continue to Personal Information
                    </button>
                </div>

                <!-- Section 2: Personal Information -->
                <div id="section2" class="hidden bg-white rounded-2xl shadow-sm p-6 transition-all duration-300">
                    <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="user" class="w-6 h-6 text-primary"></i>
                        Section 2: Personal Information
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Gender <span class="text-red-500">*</span></label>
                            <select id="gender" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Father's Name <span class="text-red-500">*</span></label>
                            <input type="text" id="fatherName" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Mother's Name <span class="text-red-500">*</span></label>
                            <input type="text" id="motherName" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Your Mobile Number <span class="text-red-500">*</span></label>
                            <input type="tel" id="userMobile" required pattern="01[0-9]{9}" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="01XXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Family Mobile Number <span class="text-red-500">*</span></label>
                            <input type="tel" id="familyMobile" required pattern="01[0-9]{9}" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="01XXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span class="text-red-500">*</span></label>
                            <input type="date" id="dob" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Current Address <span class="text-red-500">*</span></label>
                            <textarea id="currentAddress" required rows="3" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Permanent Address <span class="text-red-500">*</span></label>
                            <textarea id="permanentAddress" required rows="3" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"></textarea>
                        </div>
                    </div>

                    <div class="flex gap-4 mt-6">
                        <button type="button" onclick="previousSection(1)" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition">Previous</button>
                        <button type="button" onclick="nextSection(3)" class="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-lg font-semibold shadow-md transition">Continue to Academic</button>
                    </div>
                </div>

                <!-- Section 3: Academic -->
                <div id="section3" class="hidden bg-white rounded-2xl shadow-sm p-6 transition-all duration-300">
                    <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="graduation-cap" class="w-6 h-6 text-primary"></i>
                        Section 3: Academic Information
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">DU Registration Number</label>
                            <input type="text" id="regNumber" readonly value="${regNo}" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Session</label>
                            <input type="text" id="session" readonly value="${session}" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Department <span class="text-red-500">*</span></label>
                            <select id="department" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                                <option value="">Select Department</option>
                                <option value="CSE">Computer Science</option>
                                <option value="EEE">Electrical Engineering</option>
                                <option value="English">English</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Program <span class="text-red-500">*</span></label>
                            <select id="program" required class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                                <option value="">Select Program</option>
                                <option value="hons1">Hon's 1st Year</option>
                                <option value="hons2">Hon's 2nd Year</option>
                                <option value="hons3">Hon's 3rd Year</option>
                                <option value="hons4">Hon's 4th Year</option>
                                <option value="masters">Masters</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Hall</label>
                            <input type="text" id="hall" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="Optional">
                        </div>
                    </div>

                    <div class="flex gap-4 mt-6">
                        <button type="button" onclick="previousSection(2)" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition">Previous</button>
                        <button type="button" onclick="nextSection(4)" class="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-lg font-semibold shadow-md transition">Continue to Identity</button>
                    </div>
                </div>

                <!-- Section 4: Identity -->
                <div id="section4" class="hidden bg-white rounded-2xl shadow-sm p-6 transition-all duration-300">
                    <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="shield-check" class="w-6 h-6 text-primary"></i>
                        Section 4: Identity Verification
                    </h3>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 mb-3">Do you have DU institutional email? <span class="text-red-500">*</span></label>
                        <div class="space-y-2">
                            <label class="flex items-center cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-primary transition">
                                <input type="radio" name="hasEmail" value="yes" required class="save-input w-4 h-4 text-primary">
                                <span class="ml-3">Yes, I have one</span>
                            </label>
                            <label class="flex items-center cursor-pointer p-3 border-2 border-slate-200 rounded-lg hover:border-primary transition">
                                <input type="radio" name="hasEmail" value="no" required class="save-input w-4 h-4 text-primary">
                                <span class="ml-3">No, I don't have one</span>
                            </label>
                        </div>
                    </div>

                    <!-- Email Verification Section -->
                    <div id="emailSection" class="hidden">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p class="text-sm text-green-800"><strong>Great!</strong> We'll send you an OTP code and verification link to your institutional email.</p>
                        </div>

                        <div class="space-y-4" id="emailInputSection">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Your Institutional Email Address</label>
                                <input type="email" id="instEmail" pattern=".+@.+\\.du\\.ac\\.bd" class="save-input w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="name-regno@dept.du.ac.bd">
                            </div>
                            <button type="button" id="sendOtpBtn" class="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-semibold transition">
                                <span class="flex items-center justify-center gap-2">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                    Send OTP
                                </span>
                            </button>
                        </div>

                        <div id="otpVerificationSection" class="hidden space-y-4 mt-4">
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p class="text-sm text-blue-800 mb-2"><strong>OTP Sent!</strong></p>
                                <p class="text-xs text-blue-700">Please check your email for the 6-digit verification code. It will expire in 10 minutes.</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Enter 6-Digit OTP Code</label>
                                <input type="text" id="otpCode" maxlength="6" pattern="[0-9]{6}" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-center text-2xl tracking-widest font-mono" placeholder="000000">
                            </div>

                            <div class="flex gap-3">
                                <button type="button" id="verifyOtpBtn" class="flex-1 bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-semibold transition">Verify Code</button>
                                <button type="button" id="resendOtpBtn" disabled class="flex-1 bg-slate-200 text-slate-400 py-2.5 rounded-lg font-semibold cursor-not-allowed">
                                    Resend (<span id="timer">60</span>s)
                                </button>
                            </div>
                        </div>

                        <div id="emailVerifiedSection" class="hidden mt-4">
                            <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
                                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                    <i data-lucide="check" class="w-6 h-6 text-white"></i>
                                </div>
                                <div>
                                    <p class="font-semibold text-green-900">Email Verified!</p>
                                    <p class="text-sm text-green-700">Your institutional email has been successfully verified.</p>
                                </div>
                            </div>

                            <div class="mt-4">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Upload Your Recent Photo <span class="text-red-500">*</span></label>
                                <input type="file" id="recentPhotoEmail" accept="image/*" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- Document Upload Section -->
                    <div id="docSection" class="hidden">
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <p class="text-sm text-amber-800"><strong>Note:</strong> Please upload clear photos of your university ID card and a recent photo of yourself for verification.</p>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">University ID Card (Front) <span class="text-red-500">*</span></label>
                                <input type="file" id="idFront" accept="image/*" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">University ID Card (Back) <span class="text-red-500">*</span></label>
                                <input type="file" id="idBack" accept="image/*" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Your Recent Photo <span class="text-red-500">*</span></label>
                                <input type="file" id="recentPhotoDoc" accept="image/*" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 outline-none">
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-4 mt-6">
                        <button type="button" onclick="previousSection(3)" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition">Previous</button>
                        <button type="submit" id="submitBtn" class="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold shadow-lg transition">Submit Verification</button>
                    </div>
                </div>
            </form>
        </div>
        `;

        lucide.createIcons();
        setupEvents();
        restoreDraft();
    }

    function updateProgress(section) {
        // Update indicators
        for (let i = 1; i <= 4; i++) {
            const indicator = document.getElementById(`step${i}-indicator`);
            const text = document.getElementById(`step${i}-text`);
            const progress = document.getElementById(`progress${i - 1}`);

            if (i < section) {
                // Completed
                indicator.className = 'w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300';
                indicator.innerHTML = '✓';
                text.className = 'text-xs font-medium text-green-500 transition-colors duration-300';
                if (progress) progress.style.width = '100%';
            } else if (i === section) {
                // Current
                indicator.className = 'w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300';
                indicator.innerHTML = i;
                text.className = 'text-xs font-medium text-primary transition-colors duration-300';
                if (progress) progress.style.width = '100%'; // Show line to current
            } else {
                // Future
                indicator.className = 'w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 font-bold transition-colors duration-300';
                indicator.innerHTML = i;
                text.className = 'text-xs font-medium text-slate-500 transition-colors duration-300';
                if (progress) progress.style.width = '0%';
            }
        }
    }

    function saveDraft() {
        const inputs = document.querySelectorAll('.save-input');
        const draft = {
            currentSection: currentSection // Save current section
        };
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) draft[input.name] = input.value;
            } else {
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

    function restoreDraft() {
        if (!savedDraft) return;

        Object.keys(savedDraft).forEach(key => {
            if (key === 'currentSection') return; // Handle separately

            const el = document.getElementById(key);
            if (el) {
                el.value = savedDraft[key];
            } else {
                // Handle radios
                const radios = document.querySelectorAll(`input[name="${key}"]`);
                radios.forEach(radio => {
                    if (radio.value === savedDraft[key]) {
                        radio.checked = true;
                        // Trigger change event to update UI
                        radio.dispatchEvent(new Event('change'));
                    }
                });
            }
        });

        // Auto-navigate to last saved section
        if (savedDraft.currentSection && savedDraft.currentSection > 1) {
            // Hide section 1
            const s1 = document.getElementById('section1');
            if (s1) s1.classList.add('hidden');

            // Show saved section
            const savedSec = document.getElementById(`section${savedDraft.currentSection}`);
            if (savedSec) savedSec.classList.remove('hidden');

            currentSection = savedDraft.currentSection;
            updateProgress(currentSection);

            // Show resume message
            const resumeMsg = document.createElement('div');
            resumeMsg.className = 'fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down';
            resumeMsg.innerHTML = '<i data-lucide="corner-down-right" class="inline w-4 h-4 mr-2"></i> Resumed where you left off';
            document.body.appendChild(resumeMsg);
            setTimeout(() => resumeMsg.remove(), 3000);
        }
    }

    function setupEvents() {
        let emailVerified = false;
        let otpSent = false;
        let generatedOtp = '';
        let timerInterval = null;

        // Auto-save on input
        document.querySelectorAll('.save-input').forEach(input => {
            input.addEventListener('input', saveDraft);
            input.addEventListener('change', saveDraft);
        });

        // Navigation
        window.nextSection = (section) => {
            // Validate current section before moving
            const currentDiv = document.getElementById(`section${currentSection}`);
            const inputs = currentDiv.querySelectorAll('input[required], select[required], textarea[required]');
            let valid = true;

            inputs.forEach(input => {
                if (!input.value) {
                    valid = false;
                    input.classList.add('ring-2', 'ring-red-500');
                } else {
                    input.classList.remove('ring-2', 'ring-red-500');
                }
            });

            if (!valid) {
                alert('Please fill in all required fields.');
                return;
            }

            // Hide current, Show next
            document.getElementById(`section${currentSection}`).classList.add('hidden');
            document.getElementById(`section${section}`).classList.remove('hidden');

            currentSection = section;
            updateProgress(section);
            saveDraft(); // Save progress on navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.previousSection = (section) => {
            document.getElementById(`section${currentSection}`).classList.add('hidden');
            document.getElementById(`section${section}`).classList.remove('hidden');

            currentSection = section;
            updateProgress(section);
            saveDraft(); // Save progress on navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Email/Doc toggle
        document.querySelectorAll('input[name="hasEmail"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const emailSection = document.getElementById('emailSection');
                const docSection = document.getElementById('docSection');
                if (e.target.value === 'yes') {
                    emailSection.classList.remove('hidden');
                    docSection.classList.add('hidden');
                    emailVerified = false;
                } else {
                    emailSection.classList.add('hidden');
                    docSection.classList.remove('hidden');
                    emailVerified = false;
                }
                saveDraft();
            });
        });

        // Send OTP Button
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        if (sendOtpBtn) {
            sendOtpBtn.addEventListener('click', () => {
                const email = document.getElementById('instEmail').value;
                if (!email || !email.includes('@') || !email.includes('.du.ac.bd')) {
                    alert('Please enter a valid DU institutional email address');
                    return;
                }

                // Generate Fixed OTP for testing
                generatedOtp = '123456';
                console.log('🔐 OTP Generated:', generatedOtp);

                // Alert the OTP for the user
                alert('🔐 TEST MODE: Your OTP is 123456');

                // Show OTP input section
                document.getElementById('emailInputSection').classList.add('hidden');
                document.getElementById('otpVerificationSection').classList.remove('hidden');

                // Start countdown timer
                let countdown = 60;
                const timerSpan = document.getElementById('timer');
                const resendBtn = document.getElementById('resendOtpBtn');

                timerInterval = setInterval(() => {
                    countdown--;
                    timerSpan.textContent = countdown;

                    if (countdown <= 0) {
                        clearInterval(timerInterval);
                        resendBtn.disabled = false;
                        resendBtn.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
                        resendBtn.classList.add('bg-primary', 'text-white', 'hover:bg-secondary', 'cursor-pointer');
                        resendBtn.textContent = 'Resend OTP';
                    }
                }, 1000);

                otpSent = true;
                lucide.createIcons();
            });
        }

        // Resend OTP Button
        const resendOtpBtn = document.getElementById('resendOtpBtn');
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => {
                if (!resendOtpBtn.disabled) {
                    // Resend OTP
                    document.getElementById('sendOtpBtn').click();
                }
            });
        }

        // Verify OTP Button
        const verifyOtpBtn = document.getElementById('verifyOtpBtn');
        if (verifyOtpBtn) {
            verifyOtpBtn.addEventListener('click', () => {
                const enteredOtp = document.getElementById('otpCode').value;

                if (enteredOtp.length !== 6) {
                    alert('Please enter a 6-digit OTP code');
                    return;
                }

                if (enteredOtp === generatedOtp) {
                    // OTP verified successfully
                    emailVerified = true;
                    clearInterval(timerInterval);

                    // Hide OTP section, show verified section
                    document.getElementById('otpVerificationSection').classList.add('hidden');
                    document.getElementById('emailVerifiedSection').classList.remove('hidden');

                    lucide.createIcons();
                    alert('✅ Email verified successfully!');
                } else {
                    alert('❌ Invalid OTP code. Please try again.');
                    document.getElementById('otpCode').value = '';
                }
            });
        }

        // Form submit
        const form = document.getElementById('verificationForm');
        form.setAttribute('novalidate', 'true'); // Disable browser validation for hidden fields

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('🚀 Form submission triggered');

            try {
                const hasEmailRadio = document.querySelector('input[name="hasEmail"]:checked');
                if (!hasEmailRadio) {
                    alert('Please select an identity verification method in Section 4.');
                    return;
                }

                // Check if email verification is required and completed
                if (hasEmailRadio.value === 'yes' && !emailVerified) {
                    alert('Please verify your institutional email before submitting.');
                    return;
                }

                // Check required files for document upload method
                if (hasEmailRadio.value === 'no') {
                    const idFront = document.getElementById('idFront').files.length;
                    const idBack = document.getElementById('idBack').files.length;
                    const recentPhoto = document.getElementById('recentPhotoDoc').files.length;

                    if (!idFront || !idBack || !recentPhoto) {
                        alert('⚠️ Missing Documents\n\nSince you reloaded the page, you must re-upload your documents for security reasons.\n\nPlease upload:\n- ID Card Front\n- ID Card Back\n- Recent Photo');
                        return;
                    }
                }

                // Check recent photo for email verification
                if (hasEmailRadio.value === 'yes') {
                    const recentPhoto = document.getElementById('recentPhotoEmail').files.length;
                    if (!recentPhoto) {
                        alert('⚠️ Missing Photo\n\nSince you reloaded the page, you must re-upload your recent photo.');
                        return;
                    }
                }

                // Collect Data
                const data = {
                    payment: {
                        senderNumber: document.getElementById('senderNumber').value,
                        transactionId: document.getElementById('trxId').value
                    },
                    personal: {
                        gender: document.getElementById('gender').value,
                        fatherName: document.getElementById('fatherName').value,
                        motherName: document.getElementById('motherName').value,
                        userMobile: document.getElementById('userMobile').value,
                        familyMobile: document.getElementById('familyMobile').value,
                        dob: document.getElementById('dob').value,
                        currentAddress: document.getElementById('currentAddress').value,
                        permanentAddress: document.getElementById('permanentAddress').value
                    },
                    academic: {
                        regNo: document.getElementById('regNumber').value,
                        session: document.getElementById('session').value,
                        department: document.getElementById('department').value,
                        program: document.getElementById('program').value,
                        hall: document.getElementById('hall').value
                    },
                    identity: {
                        method: hasEmailRadio.value === 'yes' ? 'email' : 'documents',
                        email: hasEmailRadio.value === 'yes' ? document.getElementById('instEmail').value : null,
                        emailVerified: hasEmailRadio.value === 'yes' ? emailVerified : false
                    },
                    status: 'pending',
                    submittedAt: new Date().toISOString()
                };

                // Manual Validation of All Sections
                const missingFields = [];
                if (!data.payment.senderNumber) missingFields.push('Sender Number');
                if (!data.payment.transactionId) missingFields.push('Transaction ID');
                if (!data.personal.gender) missingFields.push('Gender');
                if (!data.personal.fatherName) missingFields.push('Father Name');
                if (!data.personal.motherName) missingFields.push('Mother Name');
                if (!data.personal.userMobile) missingFields.push('User Mobile');
                if (!data.personal.familyMobile) missingFields.push('Family Mobile');
                if (!data.personal.dob) missingFields.push('Date of Birth');
                if (!data.personal.currentAddress) missingFields.push('Current Address');
                if (!data.personal.permanentAddress) missingFields.push('Permanent Address');
                if (!data.academic.department) missingFields.push('Department');
                if (!data.academic.program) missingFields.push('Program');

                if (missingFields.length > 0) {
                    alert(`⚠️ Missing Information\n\nPlease check the previous sections. The following fields are missing:\n\n${missingFields.join(', ')}`);
                    return;
                }

                console.log('✅ Submitting data:', data);

                // Update User
                if (window.db && window.db.updateUser) {
                    user.verificationData = data;
                    user.verificationStatus = 'pending';
                    window.db.updateUser(user);

                    // Clear draft
                    localStorage.removeItem('verification_draft_' + user.id);

                    alert('✅ Verification submitted successfully!\\n\\nWe will review your information within 24-48 hours.\\nYou will be notified via email once verified.');

                    // Force a reload or view update
                    if (typeof renderView === 'function') {
                        renderView('overview');
                    } else {
                        window.location.reload();
                    }
                } else {
                    throw new Error('Database connection failed (window.db not found)');
                }

            } catch (err) {
                console.error('Submission Error:', err);
                alert('❌ An error occurred during submission:\n' + err.message);
            }
        });
    }

    renderForm();
};
