/**
 * Dashboard Logic
 * Handles dynamic view rendering
 */

/**
 * Dashboard Logic
 * Handles dynamic view rendering
 */

let contentArea;
const navItems = document.querySelectorAll('.nav-item');

function setActiveNav(viewName) {
    navItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(viewName)) {
            item.classList.add('bg-slate-50', 'text-primary');
            item.classList.remove('text-slate-600');
        } else {
            item.classList.remove('bg-slate-50', 'text-primary');
            item.classList.add('text-slate-600');
        }
    });
}

function renderView(viewName) {
    if (!contentArea) {
        console.error('Content area not found!');
        return;
    }

    setActiveNav(viewName);

    let user;
    try {
        user = window.db.getCurrentUser();
    } catch (e) {
        console.error('Error getting user:', e);
        return;
    }

    // Clear content
    contentArea.innerHTML = '';
    contentArea.classList.add('animate-fade-in');
    setTimeout(() => contentArea.classList.remove('animate-fade-in'), 500);

    try {
        switch (viewName) {
            case 'overview':
                renderOverview(user);
                break;
            case 'verification':
                renderVerification(user);
                break;
            case 'loan-request':
                renderLoanRequest(user);
                break;
            case 'loan-detail':
                renderStudentLoanDetail(user);
                break;
            case 'repayment':
                renderRepayment(user);
                break;
            case 'history':
                renderHistory(user);
                break;
            case 'settings':
                renderSettings(user);
                break;
            default:
                renderOverview(user);
        }
    } catch (e) {
        console.error('Error rendering view:', e);
        contentArea.innerHTML = `<div class="p-4 text-red-500">Error loading content: ${e.message}</div>`;
    }

    try {
        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (e) {
        console.warn('Lucide icons failed to load:', e);
    }
}

function renderSettings(user) {
    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
            
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <button class="text-primary font-medium hover:underline">Change Photo</button>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" value="${user.name}" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" value="${user.email}" disabled class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input type="text" value="${user.phone || ''}" placeholder="Add phone number" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Registration No</label>
                        <input type="text" value="${user.regNo || ''}" disabled class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none">
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-100">
                    <h3 class="font-bold text-slate-800 mb-4">Security</h3>
                    <button class="text-primary font-medium hover:underline">Change Password</button>
                </div>

                <div class="pt-4">
                    <button class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Save Changes</button>
                </div>
            </div>
        </div>
    `;
}

function renderProfileCompletion(user) {
    // Hide sidebar for this view
    const aside = document.querySelector('aside');
    const header = document.querySelector('header');
    if (aside) aside.classList.add('hidden');
    if (header) header.classList.add('hidden');

    contentArea.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <i data-lucide="user-plus" class="w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">One Last Step!</h2>
                <p class="text-slate-600 mb-6">Please provide your Dhaka University Registration Number to complete your profile.</p>
                
                <form id="completionForm" class="text-left">
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
                        <input type="text" id="completeRegNo" required
                            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="2020XXXXXX">
                    </div>
                    <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    `;

    try {
        if (window.lucide) lucide.createIcons();
    } catch (e) { }

    document.getElementById('completionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const regNo = document.getElementById('completeRegNo').value;

        // Update user
        user.regNo = regNo;
        window.db.updateUser(user);

        // Reload to show dashboard
        window.location.reload();
    });
}

// --- Views ---

function renderOverview(user) {
    console.log('🚀 renderOverview called for user:', user.id, 'Time:', new Date().toISOString());
    const loans = window.db.getLoansByUserId(user.id);
    console.log('Loans found for user:', loans);
    const activeLoan = loans.find(l => l.status === 'approved' || l.status === 'disbursed' || l.status === 'partially_paid');
    console.log('Active Loan found:', activeLoan);
    const pendingLoan = loans.find(l => l.status === 'pending');

    let statusCard = '';
    const verificationStatus = user.verificationStatus || (user.isVerified ? 'verified' : 'unverified');

    if (verificationStatus === 'verified') {
        statusCard = `
            <div class="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i data-lucide="check-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-green-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-green-700">Verified</h3>
                </div>
            </div>`;
    } else if (verificationStatus === 'blocked') {
        statusCard = `
            <div class="bg-red-100 border border-red-300 p-6 rounded-2xl">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center text-red-800 flex-shrink-0">
                        <i data-lucide="shield-ban" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-red-800 font-medium">Account Status</p>
                        <h3 class="text-xl font-bold text-red-900 mb-2">Account Blocked</h3>
                        ${user.blockReason ? `
                            <div class="bg-red-50 p-3 rounded-lg border border-red-200 mb-3">
                                <p class="text-sm font-semibold text-red-900 mb-1">Reason:</p>
                                <p class="text-sm text-red-800">${user.blockReason}</p>
                            </div>
                        ` : ''}
                        <p class="text-sm text-red-700">Your account has been temporarily blocked. You can still make repayments on existing loans. Contact admin for more information.</p>
                    </div>
                </div>
            </div>`;
    } else if (verificationStatus === 'rejected') {
        statusCard = `
            <div class="bg-red-50 border border-red-200 p-6 rounded-2xl">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                        <i data-lucide="x-circle" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-red-600 font-medium">Account Status</p>
                        <h3 class="text-xl font-bold text-red-700 mb-2">Verification Rejected</h3>
                        ${user.rejectionReason ? `
                            <div class="bg-white p-3 rounded-lg border border-red-200 mb-3">
                                <p class="text-sm font-semibold text-red-900 mb-1">Reason:</p>
                                <p class="text-sm text-red-700">${user.rejectionReason}</p>
                            </div>
                        ` : ''}
                        <p class="text-sm text-red-600 mb-3">Your verification request was not approved. You can review the reason and resubmit your verification.</p>
                        <button onclick="renderView('verification')" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
                            Resubmit Verification
                        </button>
                    </div>
                </div>
            </div>`;
    } else {
        statusCard = `
            <div class="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <i data-lucide="alert-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-amber-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-amber-700">${verificationStatus === 'pending' ? 'Verification Pending' : 'Unverified'}</h3>
                </div>
                <button onclick="renderView('verification')" class="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">Verify Now</button>
            </div>`;
    }

    let loanCard = '';
    if (activeLoan) {
        const isDisbursed = activeLoan.status === 'disbursed' || activeLoan.status === 'partially_paid';

        // Calculate total repaid dynamically - use parseInt to ensure numbers
        const repayments = window.db.getRepayments().filter(r => r.loanId === activeLoan.id && r.status === 'verified');
        const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
        const remaining = parseInt(activeLoan.amount) - totalRepaid;

        console.log('Debug Partial Payment:', {
            activeLoanId: activeLoan.id,
            activeLoanStatus: activeLoan.status,
            repaymentsFound: repayments.length,
            repaymentsData: repayments,
            totalRepaid: totalRepaid,
            remaining: remaining,
            isPartiallyPaid: totalRepaid > 0 && remaining > 0
        });

        // Determine effective status for UI
        const isPartiallyPaid = totalRepaid > 0 && remaining > 0;

        // Format due date and calculate status for disbursed loans
        let dueDateDisplay = 'TBD';
        let statusIndicator = '';

        if (isDisbursed && activeLoan.dueDate) {
            const dueDate = new Date(activeLoan.dueDate);
            dueDateDisplay = dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            // Calculate days remaining
            const now = new Date();
            const diffTime = dueDate - now;
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Determine status color and message
            let statusColor, statusText;
            if (daysRemaining < 0) {
                statusColor = 'red';
                statusText = `${Math.abs(daysRemaining)} days overdue`;
            } else if (daysRemaining <= 7) {
                statusColor = 'amber';
                statusText = `${daysRemaining} days remaining`;
            } else {
                statusColor = 'green';
                statusText = `${daysRemaining} days remaining`;
            }

            statusIndicator = `
                <div class="mt-2 flex items-center gap-2 text-sm">
                    <span class="inline-flex items-center px-2 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-700 font-medium">
                        <i data-lucide="${statusColor === 'red' ? 'alert-circle' : statusColor === 'amber' ? 'clock' : 'check-circle'}" class="w-3 h-3 mr-1"></i>
                        ${statusText}
                    </span>
                </div>
            `;
        }

        loanCard = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer" onclick="window.currentLoanId='${activeLoan.id}'; renderView('loan-detail');">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Active Loan
                    <span class="text-xs text-slate-400 font-normal">Click to view details</span>
                </h3>
                
                ${isPartiallyPaid ? `
                    <!-- Partially Paid Status Badge -->
                    <div class="mb-4 inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                        <i data-lucide="info" class="w-4 h-4 mr-1.5"></i>
                        Partially Paid
                    </div>
                    
                    <!-- Payment Breakdown -->
                    <div class="grid grid-cols-3 gap-3 mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <div>
                            <p class="text-xs text-slate-500 mb-1">Total Loan</p>
                            <p class="text-lg font-bold text-slate-900">৳${activeLoan.amount}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 mb-1">Paid</p>
                            <p class="text-lg font-bold text-green-600">৳${totalRepaid}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-slate-500 mb-1">Remaining</p>
                            <p class="text-lg font-bold text-amber-600">৳${remaining}</p>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs text-slate-600 font-medium">Repayment Progress</span>
                            <span class="text-xs text-slate-600 font-bold">${Math.round((totalRepaid / activeLoan.amount) * 100)}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" style="width: ${(totalRepaid / activeLoan.amount) * 100}%"></div>
                        </div>
                    </div>
                    
                    <!-- Due Date Info -->
                    ${activeLoan.dueDate ? `
                        <div class="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                            <div>
                                <p class="text-xs text-blue-600 font-medium">Due Date</p>
                                <p class="text-sm font-bold text-blue-900">${new Date(activeLoan.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div class="text-right">
                                ${(() => {
                        const dueDate = new Date(activeLoan.dueDate);
                        const now = new Date();
                        const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                        if (daysRemaining < 0) {
                            return `
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                <i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i>
                                                ${Math.abs(daysRemaining)} days overdue
                                            </span>
                                        `;
                        } else if (daysRemaining <= 7) {
                            return `
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                                ${daysRemaining} days left
                                            </span>
                                        `;
                        } else {
                            return `
                                            <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                <i data-lucide="check-circle" class="w-3 h-3 mr-1"></i>
                                                ${daysRemaining} days left
                                            </span>
                                        `;
                        }
                    })()}
                            </div>
                        </div>
                    ` : ''}
                ` : `
                    <div class="w-full">
                        <div class="flex justify-between items-end mb-2">
                            <div>
                                <p class="text-sm text-slate-500">Amount Due</p>
                                <p class="text-3xl font-bold text-slate-900">৳${activeLoan.amount}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-slate-500">Due Date</p>
                                <p class="text-lg font-medium text-primary">${dueDateDisplay}</p>
                            </div>
                        </div>
                    </div>
                    ${statusIndicator}
                    <div class="w-full bg-slate-100 rounded-full h-2.5 mb-4 mt-4">
                        <div class="bg-primary h-2.5 rounded-full" style="width: ${(totalRepaid / activeLoan.amount) * 100}%"></div>
                    </div>
                `}
                
                ${isDisbursed ? `
                    <button onclick="event.stopPropagation(); renderView('repayment');" class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5">
                        ${isPartiallyPaid ? `Pay Remaining ৳${remaining}` : 'Repay Now'}
                    </button>
                ` : `
                    <button disabled class="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium cursor-not-allowed">
                        <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i> Waiting for Disbursement
                    </button>
                    <p class="text-xs text-center text-slate-500 mt-2">Admin will confirm when money is sent.</p>
                `}
            </div>`;
    } else if (pendingLoan) {
        loanCard = `
            <div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center hover:shadow-md transition cursor-pointer" onclick="window.currentLoanId='${pendingLoan.id}'; renderView('loan-detail');">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
                    <i data-lucide="clock" class="w-6 h-6"></i>
                </div>
                <h3 class="text-lg font-bold text-blue-900">Application Pending</h3>
                <p class="text-blue-600 mt-1">Your loan request for ৳${pendingLoan.amount} is being reviewed.</p>
                <p class="text-xs text-blue-500 mt-2">Click to view details</p>
            </div>`;
    } else {
        // Check if there's a partially paid loan
        const partiallyPaidLoan = loans.find(l => l.status === 'partially_paid');

        if (partiallyPaidLoan) {
            // Calculate remaining amount
            const repayments = window.db.getRepayments().filter(r => r.loanId === partiallyPaidLoan.id && r.status === 'verified');
            const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
            const remaining = parseInt(partiallyPaidLoan.amount) - totalRepaid;

            loanCard = `
                <div class="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col items-center justify-center h-full">
                    <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                        <i data-lucide="alert-circle" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-lg font-bold text-amber-900">Existing Loan Partially Paid</h3>
                    <p class="text-amber-700 mt-2 mb-3 text-center">You have an outstanding balance of <strong>৳${remaining.toLocaleString()}</strong> on your current loan.</p>
                    <p class="text-sm text-amber-600 mb-4">Please complete payment before applying for a new loan.</p>
                    <button onclick="renderView('repayment')" class="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition">
                        Pay Now
                    </button>
                </div>`;
        } else {
            const isBlocked = user.verificationStatus === 'blocked';
            const isRejected = user.verificationStatus === 'rejected';
            const canApply = user.isVerified && !isBlocked && !isRejected;
            const disableTitle = isBlocked ? 'Account is blocked' : isRejected ? 'Verification rejected' : 'Verify account first';

            loanCard = `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center h-full">
                    <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                        <i data-lucide="hand-coins" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800">No Active Loan</h3>
                    <p class="text-slate-500 mt-1 mb-4">Need financial support?</p>
                    <button onclick="renderView('loan-request')" class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed" ${!canApply ? `disabled title="${disableTitle}"` : ''}>Apply for Loan</button>
                </div>`;
        }
    }

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Welcome, ${user.name.split(' ')[0]} 👋</h2>
        <div class="grid md:grid-cols-2 gap-6 mb-8">
            ${statusCard}
            ${loanCard}
        </div>
    `;
}

function renderVerification(user) {
    if (user.verificationStatus === 'blocked') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                    <i data-lucide="shield-ban" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Account Blocked</h2>
                <p class="text-slate-600 mb-4">Your account has been temporarily blocked.</p>
                ${user.blockReason ? `<p class="text-red-600 font-medium bg-red-50 p-3 rounded-lg inline-block">Reason: ${user.blockReason}</p>` : ''}
                <p class="text-slate-500 mt-4">Please contact the administrator for more information.</p>
            </div>`;
        return;
    }

    if (user.isVerified && user.verificationStatus !== 'rejected') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <i data-lucide="shield-check" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">You are Verified!</h2>
                <p class="text-slate-600">Your account is fully verified. You can now apply for loans.</p>
            </div>`;
        return;
    }

    if (user.verificationStatus === 'pending') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                    <i data-lucide="clock" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Verification Pending</h2>
                <p class="text-slate-600">We are reviewing your submission. This usually takes 24 hours.</p>
            </div>`;
        return;
    }

    contentArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            ${user.verificationStatus === 'rejected' ? `
                <div class="bg-red-50 border border-red-200 p-6 rounded-2xl mb-6 flex items-start gap-4">
                    <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-red-900 text-lg">Verification Rejected</h3>
                        <p class="text-red-700 mt-1">Your previous verification request was rejected.</p>
                        ${user.rejectionReason ? `<p class="text-red-800 font-medium mt-2 bg-white p-3 rounded-lg border border-red-100">Reason: ${user.rejectionReason}</p>` : ''}
                        <p class="text-red-600 text-sm mt-3">Please correct the issues and submit the form again.</p>
                    </div>
                </div>
            ` : ''}
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Complete Profile & Verify</h2>
            
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h3 class="font-bold text-lg mb-4">Step 1: Pay Verification Fee</h3>
                <p class="text-slate-600 mb-4">Please send <span class="font-bold text-slate-900">100 BDT</span> (Non-refundable) to one of the numbers below.</p>
                <div class="flex gap-4 mb-6">
                    <div class="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-medium">Bkash: 01671-XXXXXX</div>
                    <div class="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">Nagad: 01671-XXXXXX</div>
                </div>
            </div>

            <form id="verificationForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <h3 class="font-bold text-lg">Step 2: Submit Details</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Session</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 2019-20">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" id="verifyTrxId" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="Enter the TrxID of 100 BDT payment">
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit for Verification</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('verificationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // Update user status
        user.verificationStatus = 'pending';
        // Save extra details if this was a real DB
        window.db.updateUser(user);
        alert('Verification submitted successfully!');
        renderView('overview');
    });
}

function renderLoanRequest(user) {
    console.log('🔥 renderLoanRequest called - NEW VERSION with 3 sections');

    if (!user.isVerified) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="lock" class="w-12 h-12 text-slate-300 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">Account Not Verified</h2>
                <p class="text-slate-500 mt-2">You must verify your account before applying for a loan.</p>
                <button onclick="renderView('verification')" class="mt-6 px-6 py-2 bg-primary text-white rounded-lg">Go to Verification</button>
            </div>`;
        lucide.createIcons();
        return;
    }

    // Check if already has active loan
    const loans = window.db.getLoansByUserId(user.id);
    const activeLoan = loans.find(l => l.status !== 'paid' && l.status !== 'rejected');

    if (activeLoan) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="alert-circle" class="w-12 h-12 text-amber-500 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">Active Loan Exists</h2>
                <p class="text-slate-500 mt-2">You cannot apply for a new loan while you have an active or pending loan.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    // Calculate max date (60 days from now)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    const minDateStr = new Date().toISOString().split('T')[0];

    contentArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Apply for Qarze Hasana</h2>
            
            <form id="loanForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                
                <!-- Loan Details -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Reason for Loan *</label>
                    <textarea id="loanReason" required rows="4" 
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Please describe why you need this loan..."></textarea>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Amount Needed (BDT) *</label>
                        <input type="number" id="loanAmount" min="500" max="3000" required 
                            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="Min 500, Max 3000">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Estimated Repayment Date *</label>
                        <input type="date" id="loanDate" min="${minDateStr}" max="${maxDateStr}" required 
                            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <p class="text-xs text-slate-500 mt-1">Max 60 days from today</p>
                    </div>
                </div>

                <!-- Payment Method Section -->
                <div class="border-t border-slate-200 pt-6 mt-6">
                    <h4 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <i data-lucide="wallet" class="w-5 h-5 text-primary"></i>
                        Payment Account Details
                    </h4>
                    <p class="text-sm text-slate-600 mb-4">Provide your mobile banking details. Having a backup account ensures we can disburse even if one method is unavailable.</p>
                    
                    <!-- Primary Payment Method -->
                    <div class="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
                        <h5 class="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <span class="px-2 py-0.5 bg-primary text-white rounded text-xs">Primary</span>
                            Payment Method 1
                        </h5>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Method *</label>
                                <select id="paymentMethod1" required class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                                    <option value="">Select Method</option>
                                    <option value="Bkash">Bkash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
                                <input type="tel" id="accountNumber1" pattern="01[0-9]{9}" required 
                                    class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="01XXXXXXXXX">
                            </div>
                        </div>
                    </div>

                    <!-- Backup Payment Method -->
                    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h5 class="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <span class="px-2 py-0.5 bg-slate-600 text-white rounded text-xs">Backup</span>
                            Payment Method 2 (Optional)
                        </h5>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Method</label>
                                <select id="paymentMethod2" class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                                    <option value="">Select Method</option>
                                    <option value="Bkash">Bkash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                <input type="tel" id="accountNumber2" pattern="01[0-9]{9}" 
                                    class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="01XXXXXXXXX">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-slate-200 my-6"></div>

                <!-- Witness Information -->
                <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                    <p class="mb-2"><strong>Note:</strong> After submission, a representative from "Dhaka University Dawah Circle" will verify your application. They will act as your institutional witness.</p>
                    <p>You must provide a personal witness (1 male or 2 females) who is aware of this loan.</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-3">Select Witness Type *</label>
                    <div class="flex gap-6">
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="witnessType" value="male" checked class="w-4 h-4 text-primary focus:ring-primary">
                            <span class="ml-2 text-slate-700">One Male Witness</span>
                        </label>
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="witnessType" value="female" class="w-4 h-4 text-primary focus:ring-primary">
                            <span class="ml-2 text-slate-700">Two Female Witnesses</span>
                        </label>
                    </div>
                </div>

                <!-- Male Witness Form -->
                <div id="maleWitnessForm" class="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 class="font-semibold text-slate-800">Witness Details</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input type="text" id="maleWitnessName" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Relationship *</label>
                            <input type="text" id="maleWitnessRelation" placeholder="e.g. Brother, Friend" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                            <input type="tel" id="maleWitnessPhone" pattern="01[0-9]{9}" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                        </div>
                    </div>
                    <label class="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" id="maleWitnessConsent" class="mt-1 text-primary focus:ring-primary rounded">
                        <span>My witness is fully aware of this loan and is over 18 years old.</span>
                    </label>
                </div>

                <!-- Female Witnesses Form -->
                <div id="femaleWitnessForm" class="hidden space-y-6">
                    <!-- Female Witness 1 -->
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <h4 class="font-semibold text-slate-800">First Witness</h4>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                <input type="text" id="femaleWitness1Name" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Relationship *</label>
                                <input type="text" id="femaleWitness1Relation" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                                <input type="tel" id="femaleWitness1Phone" pattern="01[0-9]{9}" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                        </div>
                        <label class="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" id="femaleWitness1Consent" class="mt-1 text-primary focus:ring-primary rounded">
                            <span>My witness is fully aware of this loan and is over 18 years old.</span>
                        </label>
                    </div>

                    <!-- Female Witness 2 -->
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <h4 class="font-semibold text-slate-800">Second Witness</h4>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                                <input type="text" id="femaleWitness2Name" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Relationship *</label>
                                <input type="text" id="femaleWitness2Relation" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                                <input type="tel" id="femaleWitness2Phone" pattern="01[0-9]{9}" class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none">
                            </div>
                        </div>
                        <label class="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" id="femaleWitness2Consent" class="mt-1 text-primary focus:ring-primary rounded">
                            <span>My witness is fully aware of this loan and is over 18 years old.</span>
                        </label>
                    </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-slate-200 my-6"></div>

                <!-- Declaration -->
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" id="declaration" required class="mt-1 w-5 h-5 text-primary focus:ring-primary rounded">
                        <span class="text-sm text-slate-800 font-medium leading-relaxed">
                            I pledge in the name of Allah that I will be bound to repay the full loan within the stipulated time and all information provided by me is correct and accurate.
                        </span>
                    </label>
                </div>

                <div class="pt-4">
                    <button type="submit" id="submitLoanBtn" disabled class="w-full bg-slate-300 text-slate-500 py-3 rounded-xl font-semibold shadow-none cursor-not-allowed transition-all">
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    `;

    lucide.createIcons();

    // Toggle Witness Forms
    const maleForm = document.getElementById('maleWitnessForm');
    const femaleForm = document.getElementById('femaleWitnessForm');
    const radios = document.getElementsByName('witnessType');

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'male') {
                maleForm.classList.remove('hidden');
                femaleForm.classList.add('hidden');
                // Toggle required attributes
                toggleRequired(maleForm, true);
                toggleRequired(femaleForm, false);
            } else {
                maleForm.classList.add('hidden');
                femaleForm.classList.remove('hidden');
                // Toggle required attributes
                toggleRequired(maleForm, false);
                toggleRequired(femaleForm, true);
            }
        });
    });

    // Helper to toggle required
    function toggleRequired(container, isRequired) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (isRequired) input.setAttribute('required', 'true');
            else input.removeAttribute('required');
        });
    }

    // Initial required set
    toggleRequired(maleForm, true);
    toggleRequired(femaleForm, false);

    // Enable submit on declaration
    const declaration = document.getElementById('declaration');
    const submitBtn = document.getElementById('submitLoanBtn');

    declaration.addEventListener('change', (e) => {
        if (e.target.checked) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'shadow-none');
            submitBtn.classList.add('bg-primary', 'hover:bg-secondary', 'text-white', 'shadow-md', 'cursor-pointer');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'shadow-none');
            submitBtn.classList.remove('bg-primary', 'hover:bg-secondary', 'text-white', 'shadow-md', 'cursor-pointer');
        }
    });

    // Auto-fill payment details if saved
    if (user.savedPaymentMethods) {
        const primary = user.savedPaymentMethods.find(pm => pm.type === 'primary');
        const backup = user.savedPaymentMethods.find(pm => pm.type === 'backup');

        if (primary) {
            setTimeout(() => {
                const pm1 = document.getElementById('paymentMethod1');
                const acc1 = document.getElementById('accountNumber1');
                if (pm1) pm1.value = primary.method;
                if (acc1) acc1.value = primary.accountNumber;
            }, 0);
        }

        if (backup) {
            setTimeout(() => {
                const pm2 = document.getElementById('paymentMethod2');
                const acc2 = document.getElementById('accountNumber2');
                if (pm2) pm2.value = backup.method;
                if (acc2) acc2.value = backup.accountNumber;
            }, 0);
        }
    }

    // Form Submit
    document.getElementById('loanForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const witnessType = document.querySelector('input[name="witnessType"]:checked').value;
        let witnesses = [];

        if (witnessType === 'male') {
            witnesses.push({
                type: 'male',
                name: document.getElementById('maleWitnessName').value,
                relation: document.getElementById('maleWitnessRelation').value,
                phone: document.getElementById('maleWitnessPhone').value
            });
        } else {
            witnesses.push({
                type: 'female1',
                name: document.getElementById('femaleWitness1Name').value,
                relation: document.getElementById('femaleWitness1Relation').value,
                phone: document.getElementById('femaleWitness1Phone').value
            });
            witnesses.push({
                type: 'female2',
                name: document.getElementById('femaleWitness2Name').value,
                relation: document.getElementById('femaleWitness2Relation').value,
                phone: document.getElementById('femaleWitness2Phone').value
            });
        }

        // Collect payment methods
        const paymentMethods = [{
            type: 'primary',
            method: document.getElementById('paymentMethod1').value,
            accountNumber: document.getElementById('accountNumber1').value
        }];

        // Add backup method if provided
        const backupMethod = document.getElementById('paymentMethod2').value;
        const backupAccount = document.getElementById('accountNumber2').value;
        if (backupMethod && backupAccount) {
            paymentMethods.push({
                type: 'backup',
                method: backupMethod,
                accountNumber: backupAccount
            });
        }

        // Save payment methods to user profile for future auto-fill
        user.savedPaymentMethods = paymentMethods;
        window.db.updateUser(user);

        const newLoan = {
            id: 'loan-' + Date.now(),
            userId: user.id,
            userName: user.name,
            amount: parseInt(document.getElementById('loanAmount').value),
            reason: document.getElementById('loanReason').value,
            expectedDate: document.getElementById('loanDate').value,
            paymentMethods: paymentMethods, // Array of payment methods
            witnesses: witnesses,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };

        window.db.addLoan(newLoan);
        alert('✅ Loan application submitted successfully! Payment details saved for next time.');
        renderView('overview');
    });
}

function renderRepayment(user) {
    console.log('💳 [REPAYMENT] renderRepayment called for user:', user.id, user.name);

    const loans = window.db.getLoansByUserId(user.id);
    console.log('📋 [REPAYMENT] User loans:', loans.map(l => ({ id: l.id, status: l.status, amount: l.amount })));

    const activeLoan = loans.find(l => l.status === 'disbursed' || l.status === 'partially_paid');

    if (!activeLoan) {
        console.log('❌ [REPAYMENT] No active loan found for repayment');
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">No Active Loan to Repay</h2>
                <p class="text-slate-500 mt-2">You don't have any disbursed loans pending repayment.</p>
            </div>`;
        return;
    }

    console.log('✅ [REPAYMENT] Active loan found:', {
        id: activeLoan.id,
        status: activeLoan.status,
        amount: activeLoan.amount
    });

    // Calculate total repaid dynamically - use parseInt to ensure numbers
    const repayments = window.db.getRepayments().filter(r => r.loanId === activeLoan.id && r.status === 'verified');
    const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
    const remaining = parseInt(activeLoan.amount) - totalRepaid;
    const isPartiallyPaid = totalRepaid > 0 && remaining > 0;

    console.log('💰 [REPAYMENT] Payment calculation:', {
        loanAmount: activeLoan.amount,
        totalRepaid: totalRepaid,
        remaining: remaining,
        isPartiallyPaid: isPartiallyPaid,
        numberOfPayments: repayments.length,
        payments: repayments.map(r => ({ id: r.id, amount: r.amount, status: r.status }))
    });

    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Repay Loan</h2>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                ${isPartiallyPaid ? `
                    <div class="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div class="text-center">
                            <p class="text-sm text-slate-500 mb-1">Total Loan</p>
                            <p class="text-xl font-bold text-slate-900">৳${activeLoan.amount}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm text-slate-500 mb-1">Paid So Far</p>
                            <p class="text-xl font-bold text-green-600">৳${totalRepaid}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm text-slate-500 mb-1">Remaining</p>
                            <p class="text-xl font-bold text-amber-600">৳${remaining}</p>
                        </div>
                    </div>
                ` : `
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-slate-500">Total Due</span>
                        <span class="text-2xl font-bold text-slate-900">৳${activeLoan.amount}</span>
                    </div>
                `}
                <div class="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                    Send money to <strong>01671-XXXXXX</strong> (Bkash/Nagad Personal)
                </div>
            </div>

            <form id="repayForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
                    <input type="number" id="repayAmount" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" value="${remaining}" placeholder="e.g. ${remaining}">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                    <select class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <option>Bkash</option>
                        <option>Nagad</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit Repayment Info</button>
            </form>
        </div>
    `;

    document.getElementById('repayForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('repayAmount').value;
        const method = document.querySelector('#repayForm select').value;
        const trxId = document.querySelector('#repayForm input[type="text"]').value;

        const newRepayment = {
            id: 'rep-' + Date.now(),
            userId: user.id,
            userName: user.name,
            loanId: activeLoan.id,
            amount: parseInt(amount),
            method,
            trxId,
            status: 'pending',
            date: new Date().toISOString()
        };

        window.db.addRepayment(newRepayment);
        alert('Repayment info submitted! Please wait for Admin verification.');
        renderView('overview');
    });
}

function renderHistory(user) {
    const loans = window.db.getLoansByUserId(user.id);

    if (loans.length === 0) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <p class="text-slate-500">No history found.</p>
            </div>`;
        return;
    }

    const rows = loans.map(loan => `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
            <td class="px-6 py-4 text-sm text-slate-900 font-medium">৳${loan.amount}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${new Date(loan.appliedAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${loan.reason}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${loan.status === 'approved' ? 'bg-green-100 text-green-700' :
            loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                loan.status === 'disbursed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}">
                    ${loan.status.toUpperCase()}
                </span>
            </td>
        </tr>
    `).join('');

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Loan History</h2>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard: DOMContentLoaded');

    // Get content area reference safely
    contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error('Dashboard: Content area not found in DOM!');
        return;
    }

    // Check if auth is defined
    if (!window.auth) {
        console.error('Dashboard: Auth module not found!');
        contentArea.innerHTML = '<div class="p-4 text-red-500">Error: Authentication module failed to load.</div>';
        return;
    }

    // Check if user is logged in
    let user;
    try {
        user = auth.checkAuth();
    } catch (e) {
        console.error('Dashboard: Error checking auth:', e);
        contentArea.innerHTML = `<div class="p-4 text-red-500">Error: ${e.message}</div>`;
        return;
    }

    console.log('Dashboard: User checked', user);

    if (user) {
        // Check if profile needs completion (for Google logins)
        if (!user.regNo || user.regNo.trim() === '') {
            console.log('Dashboard: Rendering profile completion');
            renderProfileCompletion(user);
        } else {
            // Render default view
            console.log('Dashboard: Rendering overview');
            renderView('overview');
        }
    } else {
        console.warn('Dashboard: No user found, should have redirected');
    }
});

function renderSettings(user) {
    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
            
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <button class="text-primary font-medium hover:underline">Change Photo</button>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" value="${user.name}" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" value="${user.email}" disabled class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input type="text" value="${user.phone || ''}" placeholder="Add phone number" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Registration No</label>
                        <input type="text" value="${user.regNo || ''}" disabled class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none">
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-100">
                    <h3 class="font-bold text-slate-800 mb-4">Security</h3>
                    <button class="text-primary font-medium hover:underline">Change Password</button>
                </div>

                <div class="pt-4">
                    <button class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Save Changes</button>
                </div>
            </div>
        </div>
    `;
}

function renderProfileCompletion(user) {
    // Hide sidebar for this view
    document.querySelector('aside').classList.add('hidden');
    document.querySelector('header').classList.add('hidden');

    contentArea.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <i data-lucide="user-plus" class="w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">One Last Step!</h2>
                <p class="text-slate-600 mb-6">Please provide your Dhaka University Registration Number to complete your profile.</p>
                
                <form id="completionForm" class="text-left">
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
                        <input type="text" id="completeRegNo" required
                            class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="2020XXXXXX">
                    </div>
                    <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();

    document.getElementById('completionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const regNo = document.getElementById('completeRegNo').value;

        // Update user
        user.regNo = regNo;
        window.db.updateUser(user);

        // Reload to show dashboard
        window.location.reload();
    });
}

// --- Views ---

function renderOverview(user) {
    const loans = window.db.getLoansByUserId(user.id);
    const activeLoan = loans.find(l => l.status === 'approved' || l.status === 'disbursed');
    const pendingLoan = loans.find(l => l.status === 'pending');

    let statusCard = '';
    if (user.isVerified) {
        statusCard = `
            <div class="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i data-lucide="check-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-green-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-green-700">Verified</h3>
                </div>
            </div>`;
    } else {
        statusCard = `
            <div class="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <i data-lucide="alert-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-amber-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-amber-700">${user.verificationStatus === 'pending' ? 'Verification Pending' : 'Unverified'}</h3>
                </div>
                <button onclick="renderView('verification')" class="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">Verify Now</button>
            </div>`;
    }

    let loanCard = '';
    if (activeLoan) {
        const isDisbursed = activeLoan.status === 'disbursed' || activeLoan.status === 'partially_paid';

        loanCard = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Active Loan</h3>
                <div class="flex justify-between items-end mb-2">
                    <div>
                        <p class="text-sm text-slate-500">Amount Due</p>
                        <p class="text-3xl font-bold text-slate-900">৳${activeLoan.amount}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-slate-500">Due Date</p>
                        <p class="text-lg font-medium text-primary">${activeLoan.dueDate ? activeLoan.dueDate.split('T')[0] : 'TBD'}</p>
                    </div>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                    <div class="bg-primary h-2.5 rounded-full" style="width: ${activeLoan.repaid ? (activeLoan.repaid / activeLoan.amount) * 100 : 0}%"></div>
                </div>
                
                ${isDisbursed ? `
                    <button onclick="renderView('repayment')" class="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition">Repay Now</button>
                ` : `
                    <button disabled class="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium cursor-not-allowed">
                        <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i> Waiting for Disbursement
                    </button>
                    <p class="text-xs text-center text-slate-500 mt-2">Admin will confirm when money is sent.</p>
                `}
            </div>`;
    } else if (pendingLoan) {
        loanCard = `
            <div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
                    <i data-lucide="clock" class="w-6 h-6"></i>
                </div>
                <h3 class="text-lg font-bold text-blue-900">Application Pending</h3>
                <p class="text-blue-600 mt-1">Your loan request for ৳${pendingLoan.amount} is being reviewed.</p>
            </div>`;
    } else {
        loanCard = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center h-full">
                <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                    <i data-lucide="hand-coins" class="w-6 h-6"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-800">No Active Loan</h3>
                <p class="text-slate-500 mt-1 mb-4">Need financial support?</p>
                <button onclick="renderView('loan-request')" class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition" ${!user.isVerified ? 'disabled title="Verify account first"' : ''}>Apply for Loan</button>
            </div>`;
    }

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Welcome, ${user.name.split(' ')[0]} 👋</h2>
        <div class="grid md:grid-cols-2 gap-6 mb-8">
            ${statusCard}
            ${loanCard}
        </div>
    `;
}

function renderVerification(user) {
    if (user.isVerified) {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <i data-lucide="shield-check" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">You are Verified!</h2>
                <p class="text-slate-600">Your account is fully verified. You can now apply for loans.</p>
            </div>`;
        return;
    }

    if (user.verificationStatus === 'pending') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                    <i data-lucide="clock" class="w-10 h-10"></i>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-2">Verification Pending</h2>
                <p class="text-slate-600">We are reviewing your submission. This usually takes 24 hours.</p>
            </div>`;
        return;
    }

    contentArea.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Complete Profile & Verify</h2>
            
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h3 class="font-bold text-lg mb-4">Step 1: Pay Verification Fee</h3>
                <p class="text-slate-600 mb-4">Please send <span class="font-bold text-slate-900">100 BDT</span> (Non-refundable) to one of the numbers below.</p>
                <div class="flex gap-4 mb-6">
                    <div class="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-medium">Bkash: 01671-XXXXXX</div>
                    <div class="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">Nagad: 01671-XXXXXX</div>
                </div>
            </div>

            <form id="verificationForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <h3 class="font-bold text-lg">Step 2: Submit Details</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Department</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Session</label>
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 2019-20">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" id="verifyTrxId" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="Enter the TrxID of 100 BDT payment">
                </div>

                <!-- Image Uploads -->
                <div class="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                    <!-- ID Card Front -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">University ID Card (Front) <span class="text-red-500">*</span></label>
                        <input type="file" id="idCardFront" accept="image/*" required class="hidden" onchange="previewImage(this, 'preview-front')">
                        <div class="relative" id="preview-front" onclick="document.getElementById('idCardFront').click()" style="cursor: pointer;">
                            <div class="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:bg-slate-200 transition">
                                <i data-lucide="upload" class="w-8 h-8 text-slate-400 mb-2"></i>
                                <span class="text-xs text-slate-500">Click to upload</span>
                            </div>
                        </div>
                    </div>

                    <!-- ID Card Back -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">University ID Card (Back) <span class="text-red-500">*</span></label>
                        <input type="file" id="idCardBack" accept="image/*" required class="hidden" onchange="previewImage(this, 'preview-back')">
                        <div class="relative" id="preview-back" onclick="document.getElementById('idCardBack').click()" style="cursor: pointer;">
                            <div class="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:bg-slate-200 transition">
                                <i data-lucide="upload" class="w-8 h-8 text-slate-400 mb-2"></i>
                                <span class="text-xs text-slate-500">Click to upload</span>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Photo -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Your Recent Photo <span class="text-red-500">*</span></label>
                        <input type="file" id="recentPhoto" accept="image/*" required class="hidden" onchange="previewImage(this, 'preview-photo')">
                        <div class="relative" id="preview-photo" onclick="document.getElementById('recentPhoto').click()" style="cursor: pointer;">
                            <div class="w-full h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:bg-slate-200 transition">
                                <i data-lucide="upload" class="w-8 h-8 text-slate-400 mb-2"></i>
                                <span class="text-xs text-slate-500">Click to upload</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-4">
                    <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit for Verification</button>
                </div>
            </form>
        </div>
    `;

    // Image preview function
    window.previewImage = function (input, previewId) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const previewDiv = document.getElementById(previewId);
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-40 object-cover rounded-lg" onclick="document.getElementById('${input.id}').click()">`;
                // Store base64 in  the input's data attribute for later use
                input.dataset.base64 = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    document.getElementById('verificationForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // Get image data
        const idCardFront = document.getElementById('idCardFront');
        const idCardBack = document.getElementById('idCardBack');
        const recentPhoto = document.getElementById('recentPhoto');

        // Update user with verification data
        user.verificationStatus = 'pending';
        user.verificationData = {
            payment: {
                senderNumber: user.phone || '01700000000',
                transactionId: document.getElementById('verifyTrxId').value
            },
            personal: {
                fatherName: document.querySelector('input[type="text"]').value || '',
                motherName: document.querySelectorAll('input[type="text"]')[1].value || '',
                userMobile: user.phone || '',
                gender: 'Not Provided',
                dob: '2000-01-01',
                currentAddress: 'Dhaka University',
                permanentAddress: 'N/A'
            },
            academic: {
                regNo: user.regNo,
                department: document.querySelectorAll('input[type="text"]')[2].value || '',
                session: document.querySelectorAll('input[type="text"]')[3].value || '',
                program: 'B.Sc',
                hall: 'N/A'
            },
            identity: {
                method: 'document',
                idCardFrontUrl: idCardFront.dataset.base64 || '',
                idCardBackUrl: idCardBack.dataset.base64 || '',
                recentPhotoUrl: recentPhoto.dataset.base64 || ''
            },
            submittedAt: new Date().toISOString()
        };

        window.db.updateUser(user);
        alert('Verification submitted successfully!');
        renderView('overview');
    });
}



function renderRepayment(user) {
    const loans = window.db.getLoansByUserId(user.id);
    const activeLoan = loans.find(l => l.status === 'disbursed');

    if (!activeLoan) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">No Active Loan to Repay</h2>
                <p class="text-slate-500 mt-2">You don't have any disbursed loans pending repayment.</p>
            </div>`;
        return;
    }

    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Repay Loan</h2>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-slate-500">Total Due</span>
                    <span class="text-2xl font-bold text-slate-900">৳${activeLoan.amount}</span>
                </div>
                <div class="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                    Send money to <strong>01671-XXXXXX</strong> (Bkash/Nagad Personal)
                </div>
            </div>

            <form id="repayForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
                    <input type="number" id="repayAmount" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. ${activeLoan.amount}">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                    <select class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <option>Bkash</option>
                        <option>Nagad</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit Repayment Info</button>
            </form>
        </div>
    `;

    document.getElementById('repayForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('repayAmount').value;
        const method = document.querySelector('#repayForm select').value;
        const trxId = document.querySelector('#repayForm input[type="text"]').value;

        const newRepayment = {
            id: 'rep-' + Date.now(),
            userId: user.id,
            userName: user.name,
            loanId: activeLoan.id,
            amount: parseInt(amount),
            method,
            trxId,
            status: 'pending',
            date: new Date().toISOString()
        };

        window.db.addRepayment(newRepayment);
        alert('Repayment info submitted! Please wait for Admin verification.');
        renderView('overview');
    });
}

function renderHistory(user) {
    const loans = window.db.getLoansByUserId(user.id);

    if (loans.length === 0) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <p class="text-slate-500">No history found.</p>
            </div>`;
        return;
    }

    const rows = loans.map(loan => `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
            <td class="px-6 py-4 text-sm text-slate-900 font-medium">৳${loan.amount}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${new Date(loan.appliedAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${loan.reason}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${loan.status === 'approved' ? 'bg-green-100 text-green-700' :
            loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                loan.status === 'disbursed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}">
                    ${loan.status.toUpperCase()}
                </span>
            </td>
        </tr>
    `).join('');

    contentArea.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Loan History</h2>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
            
            <form id="loanForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                    <p class="font-bold mb-1">Important:</p>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Maximum loan amount: 3000 BDT</li>
                        <li>Repayment period: Max 60 days</li>
                        <li>Two witnesses required</li>
                    </ul>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Amount Needed (BDT)</label>
                    <input type="number" id="loanAmount" min="500" max="3000" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="500 - 3000">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Reason for Loan</label>
                    <textarea id="loanReason" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows="3"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Expected Repayment Date</label>
                    <input type="date" id="loanDate" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Receive Money Via</label>
                    <select class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <option>Bkash</option>
                        <option>Nagad</option>
                        <option>Rocket</option>
                    </select>
                </div>

                <div class="border-t border-slate-100 pt-4">
                    <h4 class="font-bold text-slate-800 mb-4">Witness Information</h4>
                    <div class="space-y-4">
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none" placeholder="Witness Name">
                        <input type="text" required class="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none" placeholder="Witness Phone">
                        <label class="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" required class="text-primary focus:ring-primary">
                            I promise to repay this loan within the stipulated time.
                        </label>
                    </div>
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit Application</button>
            </form>
        </div>
    `;

    document.getElementById('loanForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('loanAmount').value;
        const reason = document.getElementById('loanReason').value;
        const date = document.getElementById('loanDate').value;

        const newLoan = {
            id: 'loan-' + Date.now(),
            userId: user.id,
            userName: user.name,
            amount: parseInt(amount),
            reason,
            expectedDate: date,
            status: 'pending', // pending, approved, disbursed, paid
            appliedAt: new Date().toISOString()
        };

        window.db.addLoan(newLoan);
        alert('Loan application submitted!');
        renderView('overview');
    });
}

function renderRepayment(user) {
    const loans = window.db.getLoansByUserId(user.id);
    const activeLoan = loans.find(l => l.status === 'disbursed');

    if (!activeLoan) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">No Active Loan to Repay</h2>
                <p class="text-slate-500 mt-2">You don't have any disbursed loans pending repayment.</p>
            </div>`;
        return;
    }

    const dueAmount = activeLoan.amount;

    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Repay Loan</h2>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-slate-500">Total Due Amount</span>
                    <span class="text-2xl font-bold text-slate-900">৳${dueAmount}</span>
                </div>
                <div class="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                    Send money to <strong>01671-XXXXXX</strong> (Bkash/Nagad Personal)
                </div>
            </div>

            <form id="repayForm" class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <!-- Payment Type Selection -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-3">Payment Type</label>
                    <div class="grid grid-cols-2 gap-4">
                        <label class="relative cursor-pointer">
                            <input type="radio" name="paymentType" value="full" checked class="peer sr-only">
                            <div class="p-4 border-2 border-slate-300 rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-semibold text-slate-900">Full Payment</span>
                                    <i data-lucide="check-circle" class="w-5 h-5 text-primary hidden peer-checked:block"></i>
                                </div>
                                <p class="text-sm text-slate-600">Pay entire amount</p>
                                <p class="text-lg font-bold text-primary mt-2">৳${dueAmount}</p>
                            </div>
                        </label>
                        <label class="relative cursor-pointer">
                            <input type="radio" name="paymentType" value="partial" class="peer sr-only">
                            <div class="p-4 border-2 border-slate-300 rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-semibold text-slate-900">Partial Payment</span>
                                    <i data-lucide="check-circle" class="w-5 h-5 text-primary hidden peer-checked:block"></i>
                                </div>
                                <p class="text-sm text-slate-600">Pay custom amount</p>
                                <p class="text-xs text-slate-500 mt-2">Min: ৳500</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Amount Input -->
                <div id="amountContainer">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Amount to Pay</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">৳</span>
                        <input type="number" id="repayAmount" required 
                            value="${dueAmount}"
                            min="500" 
                            max="${dueAmount}"
                            readonly
                            class="w-full pl-8 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none font-semibold text-lg" 
                            placeholder="Enter amount">
                    </div>
                    <p id="amountHint" class="text-sm text-slate-500 mt-2">Paying full amount: ৳${dueAmount}</p>
                    <p id="amountError" class="text-sm text-red-600 mt-2 hidden"></p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                    <select id="paymentMethod" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <option>Bkash</option>
                        <option>Nagad</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Sender Account Number</label>
                    <input type="text" id="senderAccount" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 01XXXXXXXXX">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" id="trxId" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 9A2B3C4D5E">
                </div>

                <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">Submit Repayment Info</button>
            </form>
        </div>
    `;

    // Handle payment type change
    const paymentTypeInputs = document.querySelectorAll('input[name="paymentType"]');
    const amountInput = document.getElementById('repayAmount');
    const amountHint = document.getElementById('amountHint');
    const amountError = document.getElementById('amountError');

    paymentTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'full') {
                amountInput.value = dueAmount;
                amountInput.readOnly = true;
                amountInput.classList.add('bg-slate-50');
                amountHint.textContent = `Paying full amount: ৳${dueAmount}`;
                amountError.classList.add('hidden');
            } else {
                amountInput.value = '';
                amountInput.readOnly = false;
                amountInput.classList.remove('bg-slate-50');
                amountInput.focus();
                amountHint.textContent = `Enter amount between ৳500 and ৳${dueAmount}`;
            }
        });
    });

    // Validate amount input for partial payment
    amountInput.addEventListener('input', () => {
        const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
        if (paymentType === 'partial') {
            const amount = parseInt(amountInput.value);
            if (amount < 500) {
                amountError.textContent = 'Minimum payment amount is ৳500';
                amountError.classList.remove('hidden');
            } else if (amount > dueAmount) {
                amountError.textContent = `Maximum payment amount is ৳${dueAmount}`;
                amountError.classList.remove('hidden');
            } else {
                amountError.classList.add('hidden');
            }
        }
    });

    document.getElementById('repayForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('repayAmount').value);
        const method = document.getElementById('paymentMethod').value;
        const trxId = document.getElementById('trxId').value;
        const senderAccount = document.getElementById('senderAccount').value;
        const paymentType = document.querySelector('input[name="paymentType"]:checked').value;

        // Validation
        if (paymentType === 'partial') {
            if (amount < 500) {
                alert('Minimum payment amount is ৳500');
                return;
            }
            if (amount > dueAmount) {
                alert(`Payment amount cannot exceed ৳${dueAmount}`);
                return;
            }
        }

        const newRepayment = {
            id: 'rep-' + Date.now(),
            userId: user.id,
            userName: user.name,
            loanId: activeLoan.id,
            amount: amount,
            paymentType: paymentType,
            method,
            trxId,
            senderAccount,
            status: 'pending',
            date: new Date().toISOString()
        };

        window.db.addRepayment(newRepayment);
        alert(`Repayment info submitted! Amount: ৳${amount} (${paymentType === 'full' ? 'Full Payment' : 'Partial Payment'})\nPlease wait for Admin verification.`);
        renderView('overview');
    });

    lucide.createIcons();
}

// Student Loan Detail View
window.currentLoanId = null; // Store current loan ID

function renderStudentLoanDetail(user) {
    if (!window.currentLoanId) {
        renderView('overview');
        return;
    }

    const loan = window.db.getLoans().find(l => l.id === window.currentLoanId);
    if (!loan || loan.userId !== user.id) {
        alert('Loan not found');
        renderView('overview');
        return;
    }

    // Status badge colors
    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-blue-100 text-blue-700',
        disbursed: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        paid: 'bg-slate-100 text-slate-700'
    };

    // Admin messages
    const messages = loan.adminMessages || [];
    const messagesHtml = messages.length > 0
        ? messages.map(msg => `
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-blue-900 flex items-center gap-2">
                        <i data-lucide="user" class="w-4 h-4"></i> ${msg.author}
                    </span>
                    <span class="text-xs text-blue-600">${new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <p class="text-blue-800">${msg.text}</p>
            </div>
        `).join('')
        : '<p class="text-slate-500 italic text-center py-4">No messages from admin yet.</p>';

    contentArea.innerHTML = `
        <button onclick="renderView('overview')" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Overview
        </button>

        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900">Loan Request #${loan.id.slice(-4)}</h2>
                        <p class="text-slate-500 mt-1">Applied on ${new Date(loan.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span class="px-4 py-2 rounded-full text-sm font-medium ${statusColors[loan.status]}">
                        ${loan.status.toUpperCase()}
                    </span>
                </div>

                <!-- Amount and Date -->
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                    <div class="grid md:grid-cols-3 gap-6">
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Amount Requested</p>
                            <p class="text-3xl font-bold text-slate-900">৳${loan.amount}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Expected Repayment</p>
                            <p class="text-xl font-medium text-primary">${loan.expectedDate || loan.dueDate || 'TBD'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Duration to Pay</p>
                            <p class="text-xl font-bold">
                                ${(() => {
            if (loan.status === 'paid' && loan.paymentDuration) {
                const dr = loan.paymentDuration.daysRemaining;
                if (dr > 0) return `<span class="text-green-600">${dr} day${dr !== 1 ? 's' : ''} early</span>`;
                if (dr === 0) return '<span class="text-green-600">On Time</span>';
                return `<span class="text-red-600">${Math.abs(dr)} day${Math.abs(dr) !== 1 ? 's' : ''} late</span>`;
            }
            // Include partially_paid status to show duration
            if ((loan.status !== 'disbursed' && loan.status !== 'partially_paid') || !loan.disbursementInfo || !loan.disbursementInfo.disbursedAt) {
                return '<span class="text-slate-500">N/A</span>';
            }
            const disDate = new Date(loan.disbursementInfo.disbursedAt);
            const today = new Date();
            disDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const dr = 60 - Math.floor((today - disDate) / 86400000);
            if (dr > 7) return `<span class="text-green-600">${dr} day${dr !== 1 ? 's' : ''} left</span>`;
            if (dr > 0) return `<span class="text-amber-600">${dr} day${dr !== 1 ? 's' : ''} left</span>`;
            if (dr === 0) return '<span class="text-amber-600">Due Today</span>';
            return `<span class="text-red-600">${Math.abs(dr)} day${Math.abs(dr) !== 1 ? 's' : ''} overdue</span>`;
        })()}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Reason -->
                <div class="mb-6">
                    <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i> Reason for Loan
                    </h4>
                    <p class="text-slate-600 leading-relaxed">${loan.reason}</p>
                </div>

                <!-- Payment Details -->
                <div class="mb-6 pb-6 border-b border-slate-100">
                    <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <i data-lucide="credit-card" class="w-4 h-4"></i> Receiving Account Details
                    </h4>
                    ${(() => {
            if (loan.paymentMethods && Array.isArray(loan.paymentMethods)) {
                return loan.paymentMethods.map((pm, idx) => `
                                <div class="${idx > 0 ? 'mt-3 pt-3 border-t border-indigo-200' : ''} bg-indigo-50 p-4 rounded-lg">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="px-2 py-0.5 ${pm.type === 'primary' ? 'bg-indigo-600' : 'bg-slate-600'} text-white rounded text-xs font-semibold">
                                            ${pm.type === 'primary' ? 'PRIMARY' : 'BACKUP'}
                                        </span>
                                    </div>
                                    <div class="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p class="text-xs text-indigo-600 uppercase font-bold mb-1">Method</p>
                                            <p class="text-indigo-900 font-medium">${pm.method}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-indigo-600 uppercase font-bold mb-1">Account Number</p>
                                            <p class="text-indigo-900 font-medium">${pm.accountNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('');
            } else {
                return `
                                <div class="grid md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg">
                                    <div>
                                        <p class="text-xs text-indigo-600 uppercase font-bold mb-1">Payment Method</p>
                                        <p class="text-indigo-900 font-medium">${loan.paymentMethod || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-indigo-600 uppercase font-bold mb-1">Account Number</p>
                                        <p class="text-indigo-900 font-medium">${loan.accountNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            `;
            }
        })()}
                </div>

                <!-- Witnesses -->
                ${loan.witnesses && loan.witnesses.length > 0 ? `
                    <div class="mb-6 pb-6 border-b border-slate-100">
                        <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4"></i> Witness Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${loan.witnesses.map(w => `
                                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <p class="font-bold text-slate-800 mb-1">${w.name}</p>
                                    <p class="text-sm text-slate-600">${w.relation}</p>
                                    <p class="text-sm text-slate-700 mt-2 flex items-center gap-1">
                                        <i data-lucide="phone" class="w-3 h-3"></i> ${w.phone}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Rejection Reason -->
                ${loan.status === 'rejected' && loan.rejectionReason ? `
                    <div class="bg-red-50 p-6 rounded-xl border border-red-200 mb-6">
                        <h4 class="font-bold text-red-900 mb-2 flex items-center gap-2">
                            <i data-lucide="x-circle" class="w-4 h-4"></i> Rejection Reason
                        </h4>
                        <p class="text-red-700">${loan.rejectionReason}</p>
                    </div>
                ` : ''}

                <!-- Disbursement Info -->
                ${loan.status === 'disbursed' && loan.disbursementInfo ? `
                    <div class="bg-green-50 p-6 rounded-xl border border-green-200 mb-6">
                        <h4 class="font-bold text-green-900 mb-4 flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-4 h-4"></i> Disbursement Information
                        </h4>
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <p class="text-sm text-green-700 mb-1">Method</p>
                                <p class="font-medium text-green-900">${loan.disbursementInfo.method || loan.disbursementInfo.mfsType}</p>
                            </div>
                            <div>
                                <p class="text-sm text-green-700 mb-1">Account</p>
                                <p class="font-medium text-green-900">${loan.disbursementInfo.accountNo}</p>
                            </div>
                            <div>
                                <p class="text-sm text-green-700 mb-1">Transaction ID</p>
                                <p class="font-medium text-green-900">${loan.disbursementInfo.transactionId}</p>
                            </div>
                        </div>
                        <p class="text-sm text-green-700 mt-3">Disbursed on: ${new Date(loan.disbursementInfo.disbursedAt).toLocaleString()}</p>
                    </div>
                ` : ''}

                <!-- Repayment Status -->
                ${(() => {
            if (loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') {
                const loanRepayments = window.db.getRepayments().filter(r => r.loanId === loan.id && r.status === 'verified');
                // Dynamic calculation of total repaid - use parseInt to ensure numbers
                const totalRepaid = loanRepayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
                const remaining = parseInt(loan.amount) - totalRepaid;
                const progressPercent = Math.min((totalRepaid / parseInt(loan.amount)) * 100, 100);

                let repaymentsHtml = '';
                if (loanRepayments.length > 0) {
                    repaymentsHtml = loanRepayments.map(rep => `
                                <div class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p class="font-semibold text-slate-900">৳${rep.amount}</p>
                                        <p class="text-xs text-slate-500">${new Date(rep.date).toLocaleDateString()} • ${rep.method}</p>
                                    </div>
                                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                        ${rep.paymentType === 'full' ? 'FULL' : 'PARTIAL'}
                                    </span>
                                </div>
                            `).join('');
                } else {
                    repaymentsHtml = '<p class="text-slate-500 italic text-center py-4">No verified payments yet.</p>';
                }

                return `
                            <div class="mb-6 pb-6 border-b border-slate-100">
                                <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <i data-lucide="wallet" class="w-5 h-5 text-blue-600"></i>
                                    Repayment Status
                                </h4>
                                
                                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-4">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <p class="text-sm text-slate-600 mb-1">Total Loan</p>
                                            <p class="text-2xl font-bold text-slate-900">৳${loan.amount}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-sm text-slate-600 mb-1">Total Repaid</p>
                                            <p class="text-2xl font-bold text-green-600">৳${totalRepaid}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="w-full bg-slate-200 rounded-full h-3 mb-2">
                                        <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                                    </div>
                                    
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}">
                                            Remaining: ৳${remaining}
                                        </span>
                                        <span class="text-sm font-medium text-slate-600">
                                            ${Math.round(progressPercent)}% Paid
                                        </span>
                                    </div>
                                </div>

                                ${loanRepayments.length > 0 ? `
                                    <div class="mb-4">
                                        <h5 class="font-semibold text-slate-800 mb-3 text-sm">Payment History</h5>
                                        <div class="space-y-2 max-h-64 overflow-y-auto">
                                            ${repaymentsHtml}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
            }
            return '';
        })()}

                <!-- Admin Messages -->
                <div>
                    <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i data-lucide="message-square" class="w-4 h-4"></i> Admin Messages
                    </h4>
                    <div class="max-h-96 overflow-y-auto">
                        ${messagesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
}

let historyFilterState = {
    status: 'all',
    sort: 'newest'
};

function renderHistory(user) {
    const loans = window.db.getLoansByUserId(user.id);

    // Apply Filters and Sort
    let filteredLoans = loans.filter(loan => {
        return historyFilterState.status === 'all' || loan.status === historyFilterState.status;
    });

    filteredLoans.sort((a, b) => {
        if (historyFilterState.sort === 'newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
        if (historyFilterState.sort === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
        if (historyFilterState.sort === 'amount_high') return b.amount - a.amount;
        if (historyFilterState.sort === 'amount_low') return a.amount - b.amount;
        return 0;
    });

    if (loans.length === 0) {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <p class="text-slate-500">No history found.</p>
            </div>`;
        return;
    }

    const rows = filteredLoans.map(loan => {
        // Calculate Duration (60 days max - days since disbursement)
        let durationDisplay = '-';

        // Check if loan has saved payment duration (for paid loans)
        if (loan.status === 'paid' && loan.paymentDuration) {
            const daysRemaining = loan.paymentDuration.daysRemaining;
            if (daysRemaining > 0) {
                durationDisplay = `<span class="font-medium text-green-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} early</span>`;
            } else if (daysRemaining === 0) {
                durationDisplay = '<span class="font-medium text-green-600">On Time</span>';
            } else {
                durationDisplay = `<span class="font-medium text-red-600">${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} late</span>`;
            }
        } else if (loan.status === 'disbursed' && loan.disbursementInfo && loan.disbursementInfo.disbursedAt) {
            const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
            const now = new Date();
            disbursedDate.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);

            const daysSinceDisbursement = Math.floor((now - disbursedDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = 60 - daysSinceDisbursement;

            if (daysRemaining > 7) {
                durationDisplay = `<span class="font-medium text-green-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
            } else if (daysRemaining > 0) {
                durationDisplay = `<span class="font-medium text-amber-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
            } else if (daysRemaining === 0) {
                durationDisplay = '<span class="font-medium text-amber-600">Due Today</span>';
            } else {
                durationDisplay = `<span class="font-medium text-red-600">${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue</span>`;
            }
        } else if (loan.status === 'rejected') {
            durationDisplay = '<span class="text-red-600">Rejected</span>';
        } else {
            durationDisplay = '<span class="text-slate-500">N/A</span>';
        }

        return `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
            <td class="px-6 py-4 text-sm text-slate-900 font-medium">৳${loan.amount}</td>
            <td class="px-6 py-4 text-sm text-slate-600">${new Date(loan.appliedAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm">${durationDisplay}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    loan.status === 'disbursed' ? 'bg-blue-100 text-blue-700' :
                        loan.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}">
                    ${loan.status.toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="window.currentLoanId='${loan.id}'; renderView('loan-detail')" 
                    class="text-primary hover:text-secondary font-medium text-sm flex items-center gap-1 transition">
                    View Details <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `}).join('');

    contentArea.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 class="text-2xl font-bold text-slate-800">Loan History</h2>
            <div class="flex gap-3">
                <select onchange="historyFilterState.status = this.value; renderHistory(window.db.getCurrentUser())" 
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white text-sm">
                    <option value="all" ${historyFilterState.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="pending" ${historyFilterState.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="approved" ${historyFilterState.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="disbursed" ${historyFilterState.status === 'disbursed' ? 'selected' : ''}>Disbursed</option>
                    <option value="paid" ${historyFilterState.status === 'paid' ? 'selected' : ''}>Paid</option>
                    <option value="rejected" ${historyFilterState.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <select onchange="historyFilterState.sort = this.value; renderHistory(window.db.getCurrentUser())"
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white text-sm">
                    <option value="newest" ${historyFilterState.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${historyFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="amount_high" ${historyFilterState.sort === 'amount_high' ? 'selected' : ''}>Amount (High-Low)</option>
                    <option value="amount_low" ${historyFilterState.sort === 'amount_low' ? 'selected' : ''}>Amount (Low-High)</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Applied Date</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No loans found matching filter.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    lucide.createIcons();
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard: DOMContentLoaded');

    // Check if auth is defined
    if (!window.auth) {
        console.error('Dashboard: Auth module not found!');
        return;
    }

    // Check if user is logged in
    const user = auth.checkAuth();
    console.log('Dashboard: User checked', user);

    if (user) {
        // Check if profile needs completion (for Google logins)
        if (!user.regNo || user.regNo.trim() === '') {
            console.log('Dashboard: Rendering profile completion');
            renderProfileCompletion(user);
        } else {
            // Render default view
            console.log('Dashboard: Rendering overview');
            renderView('overview');
        }
    } else {
        console.warn('Dashboard: No user found, should have redirected');
    }
});
