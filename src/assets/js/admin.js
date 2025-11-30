/**
 * Admin Panel Logic
 */

const adminContent = document.getElementById('admin-content');
const pageTitle = document.getElementById('pageTitle');
const adminNavItems = document.querySelectorAll('.nav-item');

function setAdminActiveNav(viewName) {
    adminNavItems.forEach(item => {
        if (item.getAttribute('onclick').includes(viewName)) {
            item.classList.add('bg-slate-800', 'text-white');
            item.classList.remove('text-slate-300');
        } else {
            item.classList.remove('bg-slate-800', 'text-white');
            item.classList.add('text-slate-300');
        }
    });
}

function renderAdminView(viewName) {
    setAdminActiveNav(viewName);

    // Helper: Copy to Clipboard
    window.copyToClipboard = function (text, btnElement) {
        if (!text || text === 'N/A') return;

        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = btnElement.innerHTML;
            btnElement.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-green-600"></i>';
            lucide.createIcons();

            setTimeout(() => {
                btnElement.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i>';
                lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    };

    // Helper: Create Copy Button HTML
    window.createCopyButton = function (text) {
        if (!text || text === 'N/A') return '';
        return `
            <button onclick="copyToClipboard('${text}', this)" 
                class="ml-2 p-1 hover:bg-slate-200 rounded transition text-slate-400 hover:text-slate-600" 
                title="Copy to clipboard">
                <i data-lucide="copy" class="w-3 h-3"></i>
            </button>
        `;
    };

    // Clear content
    adminContent.innerHTML = '';
    adminContent.classList.add('animate-fade-in');
    setTimeout(() => adminContent.classList.remove('animate-fade-in'), 500);

    switch (viewName) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard Overview';
            renderAdminDashboard();
            break;
        case 'users':
            pageTitle.textContent = 'User Management';
            renderUserManagement();
            break;
        case 'loans':
            pageTitle.textContent = 'Loan Management';
            renderLoanManagement();
            break;
        case 'verifications':
            pageTitle.textContent = 'Student Verification Requests';
            renderVerificationManagement();
            break;
        case 'repayment-verify':
            pageTitle.textContent = 'Repayment Verification';
            renderRepaymentVerification();
            break;
        default:
            renderAdminDashboard();
    }
    lucide.createIcons();
}

// Helper to switch to detail view
function renderUserDetail(userId) {
    const user = window.db.getUsers().find(u => u.id === userId);
    if (!user) return;

    const data = user.verificationData || {};
    const personal = data.personal || {};
    const academic = data.academic || {};
    const payment = data.payment || {};
    const identity = data.identity || {};

    // Get user's loans
    const userLoans = window.db.getLoansByUserId(userId);
    
    // Build loan history section
    const loanHistoryHtml = userLoans.length > 0 
        ? userLoans.map(loan => {
            const statusColors = {
                pending: 'bg-amber-100 text-amber-700',
                approved: 'bg-blue-100 text-blue-700',
                disbursed: 'bg-green-100 text-green-700',
                partially_paid: 'bg-cyan-100 text-cyan-700',
                paid: 'bg-slate-100 text-slate-700',
                rejected: 'bg-red-100 text-red-700',
                defaulted: 'bg-red-200 text-red-800'
            };
            
            // Calculate repayment progress for disbursed/partially_paid loans
            let progressHtml = '';
            if (loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') {
                const repayments = window.db.getRepayments().filter(r => r.loanId === loan.id && r.status === 'verified');
                const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
                const progressPercent = Math.min((totalRepaid / parseInt(loan.amount)) * 100, 100);
                
                progressHtml = `
                    <div class="mt-3">
                        <div class="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Repaid: ৳${totalRepaid}</span>
                            <span>${Math.round(progressPercent)}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-primary transition cursor-pointer" onclick="renderLoanDetail('${loan.id}')">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-bold text-slate-900">৳${loan.amount}</p>
                            <p class="text-sm text-slate-500">${loan.purpose || 'No purpose specified'}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[loan.status] || 'bg-slate-100 text-slate-600'}">
                            ${loan.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div class="text-xs text-slate-500">
                        Applied: ${new Date(loan.appliedAt).toLocaleDateString()}
                    </div>
                    ${progressHtml}
                </div>
            `;
        }).join('')
        : '<p class="text-slate-500 text-center py-6">No loan applications yet</p>';

    // Calculate loan statistics
    const loanStats = {
        total: userLoans.length,
        active: userLoans.filter(l => l.status === 'disbursed' || l.status === 'partially_paid').length,
        completed: userLoans.filter(l => l.status === 'paid').length,
        totalAmount: userLoans.filter(l => l.status === 'disbursed' || l.status === 'partially_paid' || l.status === 'paid')
            .reduce((sum, l) => sum + parseInt(l.amount || 0), 0)
    };

    // Build notes section
    const notes = user.notes || [];
    const notesHtml = notes.length > 0
        ? notes.slice().reverse().map(note => `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-slate-800">${note.author}</span>
                    <span class="text-xs text-slate-500">${formatTimestamp(note.timestamp)}</span>
                </div>
                <p class="text-slate-700">${note.text}</p>
            </div>
        `).join('')
        : '<p class="text-slate-500 text-center py-4">No notes yet</p>';

    // Build call logs section
    const callLogs = user.callLogs || [];
    const callLogsHtml = callLogs.length > 0
        ? callLogs.slice().reverse().map(log => `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-semibold text-slate-800">${log.volunteer}</span>
                        <span class="ml-3 px-2 py-0.5 rounded text-xs font-medium ${log.outcome === 'Reached' ? 'bg-green-100 text-green-700' :
                log.outcome === 'Promised to Submit' ? 'bg-blue-100 text-blue-700' :
                    log.outcome === 'No Answer' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
            }">${log.outcome}</span>
                    </div>
                    <span class="text-xs text-slate-500">${formatTimestamp(log.timestamp)}</span>
                </div>
                ${log.details ? `<p class="text-slate-700">${log.details}</p>` : ''}
            </div>
        `).join('')
        : '<p class="text-slate-500 text-center py-4">No call logs yet</p>';

    pageTitle.textContent = 'User Details';
    adminContent.innerHTML = `
        <button onclick="renderAdminView('users')" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Users
        </button>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main User Details -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-primary to-secondary p-6 -m-8 mb-6 rounded-t-xl text-white">
                        <div class="flex items-start justify-between">
                            <div>
                                <h2 class="text-2xl font-bold mb-1">${user.name}</h2>
                                <p class="text-sm opacity-90">${user.email}</p>
                                <p class="text-sm opacity-75 mt-1">Reg No: ${user.regNo || 'N/A'}</p>
                            </div>
                            <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                                ${user.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    ${!user.verificationData ? `
                        <div class="bg-amber-50 p-6 rounded-lg border border-amber-200 text-amber-800">
                            <div class="flex items-center gap-3">
                                <i data-lucide="alert-circle" class="w-6 h-6"></i>
                                <div>
                                    <p class="font-semibold">No Verification Data</p>
                                    <p class="text-sm">This user has not submitted verification information yet.</p>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <!-- Verification Data Sections -->
                        <div class="space-y-6">
                            <!-- Section 1: Payment Information -->
                            <div class="border-b border-slate-200 pb-6">
                                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <i data-lucide="banknote" class="w-5 h-5 text-primary"></i>
                                    Payment Information
                                </h4>
                                <div class="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <p class="text-sm text-slate-600">Sender Mobile</p>
                                        <p class="font-medium text-slate-900 flex items-center">
                                            ${payment.senderNumber || 'N/A'}
                                            ${createCopyButton(payment.senderNumber)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Transaction ID</p>
                                        <p class="font-medium text-slate-900">${payment.transactionId || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 2: Personal Information -->
                            <div class="border-b border-slate-200 pb-6">
                                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <i data-lucide="user" class="w-5 h-5 text-primary"></i>
                                    Personal Information
                                </h4>
                                <div class="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p class="text-sm text-slate-600">Gender</p>
                                        <p class="font-medium text-slate-900">${personal.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Father's Name</p>
                                        <p class="font-medium text-slate-900">${personal.fatherName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Mother's Name</p>
                                        <p class="font-medium text-slate-900">${personal.motherName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Mobile Number</p>
                                        <p class="font-medium text-slate-900 flex items-center">
                                            ${personal.userMobile || 'N/A'}
                                            ${createCopyButton(personal.userMobile)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Family Mobile</p>
                                        <p class="font-medium text-slate-900 flex items-center">
                                            ${personal.familyMobile || 'N/A'}
                                            ${createCopyButton(personal.familyMobile)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Date of Birth</p>
                                        <p class="font-medium text-slate-900">${personal.dob || 'N/A'}</p>
                                    </div>
                                    <div class="md:col-span-3">
                                        <p class="text-sm text-slate-600">Current Address</p>
                                        <p class="font-medium text-slate-900">${personal.currentAddress || 'N/A'}</p>
                                    </div>
                                    <div class="md:col-span-3">
                                        <p class="text-sm text-slate-600">Permanent Address</p>
                                        <p class="font-medium text-slate-900">${personal.permanentAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Academic Information -->
                            <div class="border-b border-slate-200 pb-6">
                                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <i data-lucide="graduation-cap" class="w-5 h-5 text-primary"></i>
                                    Academic Information
                                </h4>
                                <div class="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <p class="text-sm text-slate-600">Registration Number</p>
                                        <p class="font-medium text-slate-900">${academic.regNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Session</p>
                                        <p class="font-medium text-slate-900">${academic.session || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Department</p>
                                        <p class="font-medium text-slate-900">${academic.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Program</p>
                                        <p class="font-medium text-slate-900">${academic.program || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-slate-600">Hall</p>
                                        <p class="font-medium text-slate-900">${academic.hall || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 4: Identity Verification -->
                            <div class="pb-6">
                                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <i data-lucide="shield-check" class="w-5 h-5 text-primary"></i>
                                    Identity Verification
                                </h4>
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <div class="flex items-center gap-3">
                                        <i data-lucide="${identity.method === 'email' ? 'mail' : 'file-text'}" class="w-5 h-5 text-blue-600"></i>
                                        <div>
                                            <p class="text-sm text-blue-800 font-medium">
                                                ${identity.method === 'email' ? 'Email Verification' : 'Document Upload'}
                                            </p>
                                            <p class="text-sm text-blue-700">
                                                ${identity.method === 'email' ? `Email: ${identity.email || 'N/A'}` : 'Documents uploaded for review'}
                                            </p>
                                            ${identity.emailVerified ? '<p class="text-xs text-green-700 mt-1">✓ Email verified</p>' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Submitted At -->
                            <div class="text-sm text-slate-500 flex items-center gap-2">
                                <i data-lucide="clock" class="w-4 h-4"></i>
                                Submitted: ${data.submittedAt ? formatTimestamp(data.submittedAt) : 'Unknown'}
                            </div>

                            <!-- Approval Actions -->
                            ${!user.isVerified && user.verificationStatus !== 'rejected' && user.verificationStatus !== 'blocked' ? `
                                <div class="flex gap-3 pt-4 border-t border-slate-200">
                                    <button onclick="approveUserVerification('${user.id}')" 
                                        class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                                        Approve Verification
                                    </button>
                                    <button onclick="showRejectUserVerificationModal('${user.id}')" 
                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                        <i data-lucide="x-circle" class="w-5 h-5"></i>
                                        Reject
                                    </button>
                                </div>
                            ` : ''}
                            
                            <!-- Rejection Reason Display -->
                            ${user.verificationStatus === 'rejected' && user.rejectionReason ? `
                                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div class="flex items-start gap-2">
                                        <i data-lucide="x-circle" class="w-5 h-5 text-red-600 mt-0.5"></i>
                                        <div class="flex-1">
                                            <h5 class="font-semibold text-red-900 mb-1">Verification Rejected</h5>
                                            <p class="text-sm text-red-700">${user.rejectionReason}</p>
                                            <p class="text-xs text-red-600 mt-2">Rejected on: ${formatTimestamp(user.rejectedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Block Reason Display -->
                            ${user.verificationStatus === 'blocked' && user.blockReason ? `
                                <div class="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                                    <div class="flex items-start gap-2">
                                        <i data-lucide="shield-ban" class="w-5 h-5 text-red-800 mt-0.5"></i>
                                        <div class="flex-1">
                                            <h5 class="font-semibold text-red-900 mb-1">Account Blocked</h5>
                                            <p class="text-sm text-red-800">${user.blockReason}</p>
                                            <p class="text-xs text-red-700 mt-2">Blocked on: ${formatTimestamp(user.blockedAt)} by ${user.blockedBy || 'Admin'}</p>
                                        </div>
                                    </div>
                                    <button onclick="unblockUserAccount('${user.id}')" 
                                        class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                        <i data-lucide="unlock" class="w-4 h-4"></i>
                                        Unblock User
                                    </button>
                                </div>
                            ` : ''}
                            
                            <!-- Block User Button (for verified users who are not blocked) -->
                            ${user.verificationStatus === 'verified' ? `
                                <button onclick="showBlockUserModal('${user.id}')" 
                                    class="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                    <i data-lucide="shield-ban" class="w-5 h-5"></i>
                                    Block User
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>

            <!-- Notes & Call Logs Sidebar -->
            <div class="lg:col-span-1">
                <!-- Notes Section -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="file-text" class="w-5 h-5"></i> Notes
                    </h3>
                    <div class="mb-4 max-h-64 overflow-y-auto">
                        ${notesHtml}
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <textarea id="userNoteText" rows="3" placeholder="Add a note..." 
                            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                        <button onclick="addNoteToUser('${user.id}')" 
                            class="mt-2 w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg font-semibold transition text-sm">
                            Add Note
                        </button>
                    </div>
                </div>

                <!-- Call Logs Section -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="phone" class="w-5 h-5"></i> Call Logs
                    </h3>
                    <div class="mb-4 max-h-64 overflow-y-auto">
                        ${callLogsHtml}
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <div class="space-y-2">
                            <input type="text" id="userCallVolunteer" placeholder="Volunteer name" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-sm">
                            <select id="userCallOutcome" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-sm">
                                <option value="">Select Outcome</option>
                                <option value="Reached">Reached</option>
                                <option value="No Answer">No Answer</option>
                                <option value="Promised to Submit">Promised to Submit</option>
                                <option value="Other">Other</option>
                            </select>
                            <textarea id="userCallDetails" rows="2" placeholder="Call details (optional)" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                            <button onclick="addCallLogToUser('${user.id}')" 
                                class="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg font-semibold transition text-sm">
                                Log Call
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- User's Loan History Section -->
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="wallet" class="w-5 h-5 text-primary"></i>
                    Loan History
                </h3>
                <div class="flex gap-4 text-sm">
                    <div class="text-center px-3 py-1 bg-slate-100 rounded-lg">
                        <span class="font-bold text-slate-900">${loanStats.total}</span>
                        <span class="text-slate-600 ml-1">Total</span>
                    </div>
                    <div class="text-center px-3 py-1 bg-green-100 rounded-lg">
                        <span class="font-bold text-green-700">${loanStats.active}</span>
                        <span class="text-green-600 ml-1">Active</span>
                    </div>
                    <div class="text-center px-3 py-1 bg-blue-100 rounded-lg">
                        <span class="font-bold text-blue-700">${loanStats.completed}</span>
                        <span class="text-blue-600 ml-1">Completed</span>
                    </div>
                    <div class="text-center px-3 py-1 bg-amber-100 rounded-lg">
                        <span class="font-bold text-amber-700">৳${loanStats.totalAmount}</span>
                        <span class="text-amber-600 ml-1">Disbursed</span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                ${loanHistoryHtml}
            </div>
        </div>

        <!-- Reject Modal -->
        <div id="reject-user-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div id="reject-user-modal-content" class="bg-white rounded-xl shadow-xl max-w-md w-full"></div>
        </div>
    `;
    lucide.createIcons();
}

function renderLoanDetail(loanId) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) return;

    pageTitle.textContent = 'Loan Details';

    // Get expiry status
    const expiryStatus = getLoanExpiryStatus(loan.dueDate, loan.status);

    // Build due date section if loan is disbursed
    let dueDateSection = '';
    if (loan.status === 'disbursed' && loan.dueDate) {
        dueDateSection = `
            <div class="bg-${expiryStatus.color}-50 p-6 rounded-xl border border-${expiryStatus.color}-200 mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-${expiryStatus.color}-900 mb-2">Due Date Status</h4>
                        <p class="text-2xl font-bold text-${expiryStatus.color}-900">${formatDate(loan.dueDate)}</p>
                        <p class="text-${expiryStatus.color}-700 mt-1">${expiryStatus.message || ''}</p>
                    </div>
                    <div class="text-center">
                        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-${expiryStatus.color}-100 text-${expiryStatus.color}-800">
                            <i data-lucide="${expiryStatus.color === 'red' ? 'alert-circle' : expiryStatus.color === 'amber' ? 'clock' : 'check-circle'}" class="w-4 h-4 mr-2"></i>
                            ${expiryStatus.label}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // Build disbursement info section if exists
    let disbursementInfo = '';
    if ((loan.status === 'disbursed' || loan.status === 'partially_paid') && loan.disbursementInfo) {
        disbursementInfo = `
            <div class="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6">
                <h4 class="font-bold text-blue-900 mb-4">Disbursement Information</h4>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <p class="text-sm text-blue-700 mb-1">Payment Method</p>
                        <p class="font-medium text-blue-900">${loan.disbursementInfo.mfsType || loan.disbursementInfo.method}</p>
                    </div>
                    <div>
                        <p class="text-sm text-blue-700 mb-1">Account Number</p>
                        <p class="font-medium text-blue-900">${loan.disbursementInfo.accountNo}</p>
                    </div>
                    <div>
                        <p class="text-sm text-blue-700 mb-1">Transaction ID</p>
                        <p class="font-medium text-blue-900">${loan.disbursementInfo.transactionId}</p>
                    </div>
                </div>
                <div class="mt-3 text-sm text-blue-700">
                    Disbursed on: ${formatTimestamp(loan.disbursementInfo.disbursedAt)}
                </div>
            </div>
        `;
    }

    // Build duration tracking section
    let durationTrackingSection = '';
    if ((loan.status === 'disbursed' || loan.status === 'partially_paid') && loan.disbursementInfo) {
        const durationInfo = window.calculateDurationInfo ? window.calculateDurationInfo(loan) : null;
        const scoreBadge = durationInfo && window.getScoreBadge ? window.getScoreBadge(durationInfo.score) : { bg: 'bg-slate-100', text: 'text-slate-700', label: 'N/A' };
        
        if (durationInfo) {
            durationTrackingSection = `
                <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-bold text-indigo-900 flex items-center gap-2">
                            <i data-lucide="calendar-clock" class="w-5 h-5"></i>
                            Duration Tracking
                        </h4>
                        <span class="px-3 py-1.5 rounded-full text-sm font-bold ${scoreBadge.bg} ${scoreBadge.text}">
                            Score: ${durationInfo.score}/100
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-4 gap-3 mb-4">
                        <div class="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                            <p class="text-xs text-indigo-600 mb-1">Days Active</p>
                            <p class="text-xl font-bold text-indigo-900">${durationInfo.daysSinceDisbursement || 0}</p>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                            <p class="text-xs text-indigo-600 mb-1">Original Due</p>
                            <p class="text-sm font-medium text-indigo-900">${durationInfo.originalDueDate ? formatDate(durationInfo.originalDueDate) : 'N/A'}</p>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                            <p class="text-xs text-indigo-600 mb-1">Current Due</p>
                            <p class="text-sm font-medium text-indigo-900">${durationInfo.currentDueDate ? formatDate(durationInfo.currentDueDate) : 'N/A'}</p>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                            <p class="text-xs text-indigo-600 mb-1">Extensions</p>
                            <p class="text-xl font-bold ${durationInfo.totalExtensions > 0 ? 'text-amber-600' : 'text-indigo-900'}">${durationInfo.totalExtensions}/2</p>
                        </div>
                    </div>

                    ${durationInfo.isOverdue ? `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p class="text-red-700 font-medium flex items-center gap-2">
                                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                                This loan is ${durationInfo.daysOverdue} days overdue!
                            </p>
                        </div>
                    ` : `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p class="text-green-700 font-medium flex items-center gap-2">
                                <i data-lucide="clock" class="w-4 h-4"></i>
                                ${durationInfo.daysRemaining > 0 ? `${durationInfo.daysRemaining} days remaining` : 'Due today'}
                            </p>
                        </div>
                    `}

                    ${durationInfo.extensions && durationInfo.extensions.length > 0 ? `
                        <div class="mt-4">
                            <p class="text-sm font-semibold text-indigo-800 mb-2">Extension History:</p>
                            <div class="space-y-2">
                                ${durationInfo.extensions.map((ext, index) => `
                                    <div class="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                                        <div>
                                            <span class="text-xs font-medium text-indigo-600">Extension #${index + 1}</span>
                                            <p class="text-sm text-slate-700">
                                                ${formatDate(ext.previousDueDate)} → ${formatDate(ext.newDueDate)}
                                                <span class="text-amber-600 font-medium">(+${ext.daysExtended} days)</span>
                                            </p>
                                            ${ext.reason ? `<p class="text-xs text-slate-500 mt-1">Reason: ${ext.reason}</p>` : ''}
                                        </div>
                                        <span class="text-xs text-slate-400">${formatDate(ext.extendedAt)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }

    // Build rejection info section if exists
    let rejectionInfo = '';
    if (loan.status === 'rejected' && loan.rejectionReason) {
        rejectionInfo = `
            <div class="bg-red-50 p-6 rounded-xl border border-red-200 mb-6">
                <h4 class="font-bold text-red-900 mb-2">Rejection Reason</h4>
                <p class="text-red-700">${loan.rejectionReason}</p>
            </div>
        `;
    }

    // Build notes section
    const notes = loan.notes || [];
    const notesHtml = notes.length > 0
        ? notes.slice().reverse().map(note => `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-slate-800">${note.author}</span>
                    <span class="text-xs text-slate-500">${formatTimestamp(note.timestamp)}</span>
                </div>
                <p class="text-slate-700">${note.text}</p>
            </div>
        `).join('')
        : '<p class="text-slate-500 text-center py-4">No notes yet</p>';

    // Build call logs section
    const callLogs = loan.callLogs || [];
    const callLogsHtml = callLogs.length > 0
        ? callLogs.slice().reverse().map(log => `
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-semibold text-slate-800">${log.volunteer}</span>
                        <span class="ml-3 px-2 py-0.5 rounded text-xs font-medium ${log.outcome === 'Reached' ? 'bg-green-100 text-green-700' :
                log.outcome === 'Promised Payment' ? 'bg-blue-100 text-blue-700' :
                    log.outcome === 'No Answer' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
            }">${log.outcome}</span>
                    </div>
                    <span class="text-xs text-slate-500">${formatTimestamp(log.timestamp)}</span>
                </div>
                ${log.details ? `<p class="text-slate-700">${log.details}</p>` : ''}
            </div>
        `).join('')
        : '<p class="text-slate-500 text-center py-4">No call logs yet</p>';

    // Build action buttons based on status
    let actionButtons = '';
    if (loan.status === 'pending') {
        actionButtons = `
            <div class="border-t border-slate-200 pt-6">
                <h4 class="font-bold text-slate-800 mb-4">Admin Actions</h4>
                <div class="grid grid-cols-3 gap-3">
                    <button onclick="showApproveModal('${loan.id}')" 
                        class="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                        <i data-lucide="check-circle" class="w-5 h-5"></i> Approve
                    </button>
                    <button onclick="showDisburseModal('${loan.id}', true)" 
                        class="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                        <i data-lucide="arrow-right-circle" class="w-5 h-5"></i> Disburse
                    </button>
                    <button onclick="showRejectModal('${loan.id}')" 
                        class="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                        <i data-lucide="x-circle" class="w-5 h-5"></i> Reject
                    </button>
                </div>
            </div>
        `;
    } else if (loan.status === 'approved') {
        actionButtons = `
            <div class="border-t border-slate-200 pt-6">
                <h4 class="font-bold text-slate-800 mb-4">Disburse Loan</h4>
                <button onclick="showDisburseModal('${loan.id}', false)" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <i data-lucide="arrow-right-circle" class="w-5 h-5"></i> Confirm Disbursement
                </button>
            </div>
        `;
    } else if (loan.status === 'disbursed' || loan.status === 'partially_paid') {
        // Get extensions info
        const extensions = loan.extensions || [];
        const canExtend = extensions.length < 2;
        
        // Check if loan is overdue
        const daysUntilDue = loan.dueDate ? calculateDaysUntilDue(loan.dueDate) : null;
        const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

        actionButtons = `
            <div class="border-t border-slate-200 pt-6">
                <h4 class="font-bold text-slate-800 mb-4">Loan Actions</h4>
                
                ${canExtend ? `
                    <button onclick="showExtendDurationModal('${loan.id}')" 
                        class="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 mb-3">
                        <i data-lucide="calendar-plus" class="w-5 h-5"></i> Extend Duration
                    </button>
                ` : `
                    <div class="w-full bg-slate-100 text-slate-500 py-3 rounded-lg font-semibold text-center mb-3">
                        <i data-lucide="calendar-x" class="w-5 h-5 inline mr-2"></i> Max Extensions Reached (2/2)
                    </div>
                `}

                ${isOverdue ? `
                    <button onclick="markLoanAsDefaulted('${loan.id}')" 
                        class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                        <i data-lucide="alert-triangle" class="w-5 h-5"></i> Mark as Defaulted
                    </button>
                ` : ''}
                
                <div class="mt-3 text-center">
                    <p class="text-xs text-slate-400">Extensions used: ${extensions.length}/2</p>
                </div>
            </div>
        `;
    }

    adminContent.innerHTML = `
        <button onclick="renderAdminView('loans')" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Loans
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Loan Details -->
            <div class="lg:col-span-2">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900">Loan Request #${loan.id.slice(-4)}</h2>
                            <p class="text-slate-500">
                                Applied by 
                                <button onclick="renderUserDetail('${loan.userId}')" class="text-primary hover:text-secondary font-semibold hover:underline transition">
                                    ${loan.userName}
                                </button>
                            </p>
                            ${(() => {
            const applicant = window.db.getUsers().find(u => u.id === loan.userId);
            if (applicant && applicant.regNo) {
                return `<p class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                        Reg No: ${applicant.regNo}
                                        ${createCopyButton(applicant.regNo)}
                                    </p>`;
            }
            return '';
        })()}
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-medium 
                            ${loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                loan.status === 'disbursed' ? 'bg-green-100 text-green-700' :
                    loan.status === 'partially_paid' ? 'bg-purple-100 text-purple-700' :
                        loan.status === 'defaulted' ? 'bg-red-100 text-red-700' :
                            loan.status === 'rejected' ? 'bg-slate-100 text-slate-700' :
                                loan.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}">
                            ${loan.status.toUpperCase()}
                        </span>
                    </div>

                    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-slate-600">Amount Requested</span>
                            <span class="text-3xl font-bold text-slate-900">৳${loan.amount}</span>
                        </div>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-slate-600">Expected Repayment</span>
                            <span class="font-medium text-slate-900">${loan.currentDueDate ? formatDate(loan.currentDueDate) : (loan.dueDate ? formatDate(loan.dueDate) : loan.expectedDate)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600">Duration to Pay</span>
                            <span class="text-xl font-bold">
                                ${(() => {
            if (loan.status === 'paid' && loan.paymentDuration) {
                const dr = loan.paymentDuration.daysRemaining;
                if (dr > 0) return `<span class="text-green-600">${dr} day${dr !== 1 ? 's' : ''} early</span>`;
                if (dr === 0) return '<span class="text-green-600">On Time</span>';
                return `<span class="text-red-600">${Math.abs(dr)} day${Math.abs(dr) !== 1 ? 's' : ''} late</span>`;
            }
            if ((loan.status !== 'disbursed' && loan.status !== 'partially_paid') || !loan.disbursementInfo || !loan.disbursementInfo.disbursedAt) {
                return '<span class="text-slate-500">N/A</span>';
            }
            // Use currentDueDate (after extensions) or fallback to dueDate/expectedDate
            const currentDue = loan.currentDueDate || loan.dueDate || loan.expectedDate;
            if (!currentDue) {
                return '<span class="text-slate-500">N/A</span>';
            }
            const dueDate = new Date(currentDue);
            const today = new Date();
            dueDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const dr = Math.floor((dueDate - today) / 86400000);
            if (dr > 7) return `<span class="text-green-600">${dr} day${dr !== 1 ? 's' : ''} left</span>`;
            if (dr > 0) return `<span class="text-amber-600">${dr} day${dr !== 1 ? 's' : ''} left</span>`;
            if (dr === 0) return '<span class="text-amber-600">Due Today</span>';
            return `<span class="text-red-600">${Math.abs(dr)} day${Math.abs(dr) !== 1 ? 's' : ''} overdue</span>`;
        })()}
                            </span>
                        </div>
                    </div>

                    <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                        <h4 class="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                            <i data-lucide="credit-card" class="w-4 h-4"></i> Receiving Account Details
                        </h4>
                        ${(() => {
            // Support both old and new format
            if (loan.paymentMethods && Array.isArray(loan.paymentMethods)) {
                return loan.paymentMethods.map((pm, idx) => `
                                    <div class="${idx > 0 ? 'mt-3 pt-3 border-t border-indigo-200' : ''}">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="px-2 py-0.5 ${pm.type === 'primary' ? 'bg-indigo-600' : 'bg-slate-600'} text-white rounded text-xs font-semibold">
                                                ${pm.type === 'primary' ? 'PRIMARY' : 'BACKUP'}
                                            </span>
                                        </div>
                                        <div class="flex gap-8">
                                            <div>
                                                <p class="text-xs text-indigo-600 uppercase font-bold">Method</p>
                                                <p class="text-indigo-900 font-medium">${pm.method}</p>
                                            </div>
                                            <div>
                                                <p class="text-xs text-indigo-600 uppercase font-bold">Account Number</p>
                                                <p class="text-indigo-900 font-medium flex items-center gap-1">
                                                    ${pm.accountNumber}
                                                    ${createCopyButton(pm.accountNumber)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('');
            } else {
                // Old format compatibility
                return `
                                    <div class="flex gap-8">
                                        <div>
                                            <p class="text-xs text-indigo-600 uppercase font-bold">Method</p>
                                            <p class="text-indigo-900 font-medium">${loan.paymentMethod || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-indigo-600 uppercase font-bold">Account Number</p>
                                            <p class="text-indigo-900 font-medium flex items-center gap-1">
                                                ${loan.accountNumber || 'N/A'}
                                                ${createCopyButton(loan.accountNumber)}
                                            </p>
                                        </div>
                                    </div>
                                `;
            }
        })()}
                    </div>

                    <!-- Witness Information -->
                    <div class="mb-6">
                        <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4"></i> Witness Information
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            ${loan.witnesses && loan.witnesses.length > 0 ? loan.witnesses.map(w => `
                                <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                                    <p class="font-bold text-slate-800">${w.name} <span class="text-slate-500 font-normal">(${w.relation})</span></p>
                                    <p class="text-slate-600 mt-1 flex items-center gap-1">
                                        <i data-lucide="phone" class="w-3 h-3"></i> 
                                        ${w.phone}
                                        ${createCopyButton(w.phone)}
                                    </p>
                                </div>
                            `).join('') : '<p class="text-slate-500 italic">No witness information provided.</p>'}
                        </div>
                    </div>

                    <!-- Loan History -->
                    <div class="mb-6 border-t border-slate-100 pt-6">
                        <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="history" class="w-4 h-4"></i> Applicant History
                        </h4>
                        ${(() => {
            const userLoans = window.db.getLoansByUserId(loan.userId).filter(l => l.id !== loan.id);
            if (userLoans.length === 0) return '<p class="text-slate-500 italic">No previous history.</p>';

            return `
                                <div class="overflow-hidden rounded-lg border border-slate-200">
                                    <table class="w-full text-sm text-left">
                                        <thead class="bg-slate-50 text-slate-500 font-semibold">
                                            <tr>
                                                <th class="px-4 py-2">Date</th>
                                                <th class="px-4 py-2">Amount</th>
                                                <th class="px-4 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            ${userLoans.map(l => `
                                                <tr class="hover:bg-slate-50">
                                                    <td class="px-4 py-2 text-slate-600">${new Date(l.appliedAt).toLocaleDateString()}</td>
                                                    <td class="px-4 py-2 font-medium text-slate-900">৳${l.amount}</td>
                                                    <td class="px-4 py-2">
                                                        <span class="px-2 py-0.5 rounded-full text-xs font-medium 
                                                            ${l.status === 'paid' ? 'bg-green-100 text-green-700' :
                    l.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'}">
                                                            ${l.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;
        })()}
                    </div>

                    ${(() => {
            // Repayment Section - show if disbursed, partially_paid, or paid
            if (loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') {
                const loanRepayments = window.db.getRepayments().filter(r => r.loanId === loan.id && r.status === 'verified');
                // Calculate from verified repayments to ensure accuracy
                const totalRepaid = loanRepayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
                const remaining = parseInt(loan.amount) - totalRepaid;
                const progressPercent = (totalRepaid / parseInt(loan.amount)) * 100;

                let repaymentsHtml = '';
                if (loanRepayments.length > 0) {
                    repaymentsHtml = loanRepayments.map(rep => `
                                    <div class="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                        <div>
                                            <p class="font-semibold text-slate-900">৳${rep.amount}</p>
                                            <p class="text-xs text-slate-500">${new Date(rep.date).toLocaleDateString()} • ${rep.method}</p>
                                            <p class="text-xs text-slate-600">TrxID: ${rep.trxId}</p>
                                        </div>
                                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                            ${rep.paymentType === 'full' ? 'FULL' : 'PARTIAL'}
                                        </span>
                                    </div>
                                `).join('');
                } else {
                    repaymentsHtml = '<p class="text-slate-500 italic text-center py-4">No payments received yet</p>';
                }

                return `
                                <div class="border-t border-slate-200 pt-6 mt-6">
                                    <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <i data-lucide="wallet" class="w-5 h-5 text-blue-600"></i>
                                        Repayment Status
                                    </h4>
                                    
                                    <!-- Payment Progress -->
                                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-4">
                                        <div class="flex justify-between items-start mb-3">
                                            <div>
                                                <p class="text-sm text-slate-600 mb-1">Total Loan Amount</p>
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

                                    <!-- Payment History -->
                                    ${loanRepayments.length > 0 ? `
                                        <div class="mb-4">
                                            <h5 class="font-semibold text-slate-800 mb-3 text-sm">Payment History (${loanRepayments.length})</h5>
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

                    ${dueDateSection}
                    ${disbursementInfo}
                    ${durationTrackingSection}
                    ${rejectionInfo}
                    ${actionButtons}
                </div>
            </div>

            <!-- Notes & Call Logs Sidebar -->
            <div class="lg:col-span-1">
                <!-- Notes Section -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="file-text" class="w-5 h-5"></i> Notes
                    </h3>
                    <div class="mb-4 max-h-64 overflow-y-auto">
                        ${notesHtml}
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <textarea id="noteText" rows="3" placeholder="Add a note..." 
                            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                        <button onclick="addNoteToLoan('${loan.id}')" 
                            class="mt-2 w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg font-semibold transition text-sm">
                            Add Note
                        </button>
                    </div>
                </div>

                <!-- Call Logs Section -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="phone" class="w-5 h-5"></i> Call Logs
                    </h3>
                    <div class="mb-4 max-h-64 overflow-y-auto">
                        ${callLogsHtml}
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <div class="space-y-2">
                            <input type="text" id="callVolunteer" placeholder="Volunteer name" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-sm">
                            <select id="callOutcome" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none text-sm">
                                <option value="">Select Outcome</option>
                                <option value="Reached">Reached</option>
                                <option value="No Answer">No Answer</option>
                                <option value="Promised Payment">Promised Payment</option>
                                <option value="Other">Other</option>
                            </select>
                            <textarea id="callDetails" rows="2" placeholder="Call details (optional)" 
                                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                            <button onclick="addCallLogToLoan('${loan.id}')" 
                                class="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg font-semibold transition text-sm">
                                Log Call
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Admin Messages to Student -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="message-square" class="w-5 h-5"></i> Messages to Student
                    </h3>
                    <div class="mb-4 max-h-64 overflow-y-auto">
                        ${(() => {
            const msgs = loan.adminMessages || [];
            if (msgs.length === 0) return '<p class="text-slate-500 text-center py-4">No messages sent yet</p>';
            return msgs.slice().reverse().map(msg => `
                                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
                                    <div class="flex justify-between items-start mb-1">
                                        <span class="text-xs font-semibold text-blue-900">${msg.author}</span>
                                        <span class="text-xs text-blue-600">${formatTimestamp(msg.timestamp)}</span>
                                    </div>
                                    <p class="text-sm text-blue-800">${msg.text}</p>
                                </div>
                            `).join('');
        })()}
                    </div>
                    <div class="border-t border-slate-200 pt-4">
                        <textarea id="adminMessageText" rows="3" placeholder="Type a message to the student..." 
                            class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"></textarea>
                        <button onclick="sendAdminMessage('${loan.id}')" 
                            class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2">
                            <i data-lucide="send" class="w-4 h-4"></i> Send Message
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <div id="modal-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div id="modal-content" class="bg-white rounded-xl shadow-xl max-w-md w-full"></div>
        </div>
    `;
    lucide.createIcons();
}

let repaymentFilterState = {
    search: '',
    status: 'all',
    sort: 'newest'
};

function renderRepaymentVerification() {
    const repayments = window.db.getRepayments();

    // Apply Filters and Sort
    let filteredRepayments = repayments.filter(rep => {
        const matchesSearch = (rep.userName || '').toLowerCase().includes(repaymentFilterState.search.toLowerCase()) ||
            (rep.trxId || '').toLowerCase().includes(repaymentFilterState.search.toLowerCase());
        const matchesStatus = repaymentFilterState.status === 'all' || rep.status === repaymentFilterState.status;
        return matchesSearch && matchesStatus;
    });

    // Apply Sort
    filteredRepayments.sort((a, b) => {
        // Assuming repayments have a timestamp, if not we might need to rely on ID or add a timestamp field
        // For now, let's assume newer IDs are newer
        if (repaymentFilterState.sort === 'newest') return b.id.localeCompare(a.id);
        if (repaymentFilterState.sort === 'oldest') return a.id.localeCompare(b.id);
        if (repaymentFilterState.sort === 'amount_high') return b.amount - a.amount;
        if (repaymentFilterState.sort === 'amount_low') return a.amount - b.amount;
        return 0;
    });

    const rows = filteredRepayments.map(rep => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">${rep.userName || 'Unknown'}</td>
            <td class="px-6 py-4">৳${rep.amount}</td>
            <td class="px-6 py-4 text-slate-600">
                <div>${rep.senderAccount || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">${rep.method} (${rep.trxId})</td>
            <td class="px-6 py-4">
                ${rep.status === 'pending' ? `
                    <button onclick="verifyRepayment('${rep.id}')" class="text-green-600 hover:text-green-700 font-medium text-sm">Confirm</button>
                ` : `
                    <span class="text-green-600 font-medium text-sm flex items-center gap-1">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Verified
                    </span>
                `}
            </td>
        </tr>
    `).join('');

    adminContent.innerHTML = `
        <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input type="text" placeholder="Search by user or TrxID..." value="${repaymentFilterState.search}"
                    oninput="repaymentFilterState.search = this.value; renderRepaymentVerification()"
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
            </div>
            <div class="flex gap-3">
                <select onchange="repaymentFilterState.status = this.value; renderRepaymentVerification()" 
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="all" ${repaymentFilterState.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="pending" ${repaymentFilterState.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="verified" ${repaymentFilterState.status === 'verified' ? 'selected' : ''}>Verified</option>
                </select>
                <select onchange="repaymentFilterState.sort = this.value; renderRepaymentVerification()"
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="newest" ${repaymentFilterState.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${repaymentFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="amount_high" ${repaymentFilterState.sort === 'amount_high' ? 'selected' : ''}>Amount (High-Low)</option>
                    <option value="amount_low" ${repaymentFilterState.sort === 'amount_low' ? 'selected' : ''}>Amount (Low-High)</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Sender Account</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method & TrxID</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No repayment records found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    // Re-focus search input if it was focused
    const searchInput = document.querySelector('input[placeholder="Search by user or TrxID..."]');
    if (searchInput && document.activeElement.tagName === 'INPUT') {
        searchInput.focus();
        // Move cursor to end
        const val = searchInput.value;
        searchInput.value = '';
        searchInput.value = val;
    }

    lucide.createIcons();
}

function verifyRepayment(repaymentId) {
    const repayment = window.db.getRepayments().find(r => r.id === repaymentId);
    if (repayment) {
        repayment.status = 'verified';
        window.db.updateRepayment(repayment);

        // Update loan status
        const loan = window.db.getLoans().find(l => l.id === repayment.loanId);
        if (loan) {
            // Calculate total repaid amount (including this one) - use parseInt to ensure numbers
            const allRepayments = window.db.getRepayments().filter(r => r.loanId === loan.id && r.status === 'verified');
            const totalRepaid = allRepayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);

            loan.repaid = totalRepaid;

            if (totalRepaid >= parseInt(loan.amount)) {
                loan.status = 'paid';

                // Calculate and save the final duration for behavior tracking
                if (loan.disbursementInfo && loan.disbursementInfo.disbursedAt) {
                    const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
                    const paidDate = new Date(); // Current date when marking as paid
                    disbursedDate.setHours(0, 0, 0, 0);
                    paidDate.setHours(0, 0, 0, 0);

                    const daysSinceDisbursement = Math.floor((paidDate - disbursedDate) / (1000 * 60 * 60 * 24));
                    const daysRemaining = 60 - daysSinceDisbursement;

                    // Save payment duration (negative means late, positive means early)
                    loan.paymentDuration = {
                        daysTaken: daysSinceDisbursement,
                        daysRemaining: daysRemaining,
                        paidAt: paidDate.toISOString()
                    };
                }
            } else {
                loan.status = 'partially_paid';
            }

            window.db.updateLoan(loan);
        }

        alert('Repayment verified successfully!');
        renderAdminView('repayment-verify');
    }
}

function renderAdminDashboard() {
    const users = window.db.getUsers().filter(u => u.role !== 'admin');
    const loans = window.db.getLoans();
    const repayments = window.db.getRepayments();

    const pendingVerifications = users.filter(u => u.verificationStatus === 'pending').length;
    const pendingLoans = loans.filter(l => l.status === 'pending').length;
    const approvedLoans = loans.filter(l => l.status === 'approved').length;
    const activeLoans = loans.filter(l => l.status === 'disbursed').length;
    const pendingRepayments = repayments.filter(r => r.status === 'pending').length;
    const totalDisbursed = loans.filter(l => l.status === 'disbursed' || l.status === 'paid')
        .reduce((sum, l) => sum + l.amount, 0);

    // Create task notifications
    const tasks = [];

    if (pendingVerifications > 0) {
        tasks.push({
            title: 'New Member Verification Requests',
            count: pendingVerifications,
            description: `${pendingVerifications} student${pendingVerifications > 1 ? 's' : ''} waiting for verification`,
            icon: 'user-check',
            color: 'amber',
            action: () => renderAdminView('verifications')
        });
    }

    if (pendingLoans > 0) {
        tasks.push({
            title: 'Loan Requests Need Review',
            count: pendingLoans,
            description: `${pendingLoans} loan request${pendingLoans > 1 ? 's' : ''} pending approval`,
            icon: 'clipboard-list',
            color: 'blue',
            action: () => { loanFilterState.status = 'pending'; renderAdminView('loans'); }
        });
    }

    if (approvedLoans > 0) {
        tasks.push({
            title: 'Waiting for Disbursement',
            count: approvedLoans,
            description: `${approvedLoans} approved loan${approvedLoans > 1 ? 's' : ''} ready to disburse`,
            icon: 'banknote',
            color: 'green',
            action: () => { loanFilterState.status = 'approved'; renderAdminView('loans'); }
        });
    }

    if (pendingRepayments > 0) {
        tasks.push({
            title: 'Repayment Verification Pending',
            count: pendingRepayments,
            description: `${pendingRepayments} repayment${pendingRepayments > 1 ? 's' : ''} waiting for confirmation`,
            icon: 'check-circle',
            color: 'purple',
            action: () => { repaymentFilterState.status = 'pending'; renderAdminView('repayment-verify'); }
        });
    }

    const tasksHtml = tasks.length > 0 ? tasks.map((task, index) => `
        <div onclick="(${task.action.toString()})()" 
            class="bg-white p-5 rounded-xl border-l-4 border-${task.color}-500 shadow-sm hover:shadow-md cursor-pointer transition-all group">
            <div class="flex items-start justify-between">
                <div class="flex items-start gap-4 flex-1">
                    <div class="p-3 bg-${task.color}-50 rounded-lg text-${task.color}-600 group-hover:bg-${task.color}-100 transition">
                        <i data-lucide="${task.icon}" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-slate-900">${task.title}</h4>
                            <span class="px-2.5 py-0.5 bg-${task.color}-100 text-${task.color}-700 rounded-full text-xs font-semibold">${task.count}</span>
                        </div>
                        <p class="text-sm text-slate-600">${task.description}</p>
                    </div>
                </div>
                <i data-lucide="chevron-right" class="w-5 h-5 text-slate-400 group-hover:text-${task.color}-500 transition"></i>
            </div>
        </div>
    `).join('') : `
        <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="check-circle-2" class="w-8 h-8 text-green-600"></i>
            </div>
            <h4 class="font-bold text-slate-900 mb-2">All Caught Up! 🎉</h4>
            <p class="text-slate-600 text-sm">No pending tasks at the moment. Great work!</p>
        </div>
    `;

    adminContent.innerHTML = `
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div onclick="renderAdminView('verifications')" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-slate-500 text-sm font-medium">Pending Verifications</h3>
                    <div class="p-2 bg-amber-50 rounded-lg text-amber-600"><i data-lucide="user-check" class="w-5 h-5"></i></div>
                </div>
                <p class="text-3xl font-bold text-slate-900">${pendingVerifications}</p>
                <p class="text-xs text-slate-400 mt-2">Click to view →</p>
            </div>
            <div onclick="loanFilterState.status = 'pending'; renderAdminView('loans')" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-slate-500 text-sm font-medium">Loan Requests</h3>
                    <div class="p-2 bg-blue-50 rounded-lg text-blue-600"><i data-lucide="file-text" class="w-5 h-5"></i></div>
                </div>
                <p class="text-3xl font-bold text-slate-900">${pendingLoans}</p>
                <p class="text-xs text-slate-400 mt-2">Click to view →</p>
            </div>
            <div onclick="loanFilterState.status = 'disbursed'; renderAdminView('loans')" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-slate-500 text-sm font-medium">Active Loans</h3>
                    <div class="p-2 bg-green-50 rounded-lg text-green-600"><i data-lucide="activity" class="w-5 h-5"></i></div>
                </div>
                <p class="text-3xl font-bold text-slate-900">${activeLoans}</p>
                <p class="text-xs text-slate-400 mt-2">Click to view →</p>
            </div>
            <div onclick="renderAdminView('loans')" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-slate-500 text-sm font-medium">Total Disbursed</h3>
                    <div class="p-2 bg-purple-50 rounded-lg text-purple-600"><i data-lucide="wallet" class="w-5 h-5"></i></div>
                </div>
                <p class="text-3xl font-bold text-slate-900">৳${totalDisbursed}</p>
                <p class="text-xs text-slate-400 mt-2">Click to view all →</p>
            </div>
        </div>

        <!-- Pending Tasks / Notifications -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="bell" class="w-5 h-5 text-primary"></i>
                    Pending Tasks
                </h3>
                ${tasks.length > 0 ? `<span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">${tasks.length} Action${tasks.length > 1 ? 's' : ''} Required</span>` : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${tasksHtml}
            </div>
        </div>
    `;
}

let userFilterState = {
    search: '',
    status: 'all',
    sort: 'newest'
};

function renderUserManagement() {
    const users = window.db.getUsers().filter(u => u.role !== 'admin');

    // Apply Filters and Sort
    let filteredUsers = users.filter(user => {
        const matchesSearch = (user.name.toLowerCase().includes(userFilterState.search.toLowerCase()) ||
            user.email.toLowerCase().includes(userFilterState.search.toLowerCase()));

        // Updated status filter to include all statuses
        let matchesStatus = true;
        if (userFilterState.status === 'verified') {
            matchesStatus = user.verificationStatus === 'verified';
        } else if (userFilterState.status === 'pending') {
            matchesStatus = user.verificationStatus === 'pending';
        } else if (userFilterState.status === 'incomplete') {
            matchesStatus = user.verificationStatus === 'incomplete';
        } else if (userFilterState.status === 'rejected') {
            matchesStatus = user.verificationStatus === 'rejected';
        } else if (userFilterState.status === 'blocked') {
            matchesStatus = user.verificationStatus === 'blocked';
        }

        return matchesSearch && matchesStatus;
    });

    // Apply Sort
    filteredUsers.sort((a, b) => {
        if (userFilterState.sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (userFilterState.sort === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (userFilterState.sort === 'name_asc') return a.name.localeCompare(b.name);
        if (userFilterState.sort === 'name_desc') return b.name.localeCompare(a.name);
        return 0;
    });

    const rows = filteredUsers.map(user => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-6 py-4">
                <div class="font-medium text-slate-900">${user.name}</div>
                <div class="text-sm text-slate-500">${user.email}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">${user.regNo || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${(() => {
            const status = user.verificationStatus || (user.isVerified ? 'verified' : 'incomplete');
            if (status === 'verified') return 'bg-green-100 text-green-700';
            if (status === 'pending') return 'bg-blue-100 text-blue-700';
            if (status === 'incomplete') return 'bg-slate-100 text-slate-600';
            if (status === 'blocked') return 'bg-red-200 text-red-900';
            if (status === 'rejected') return 'bg-red-100 text-red-700';
            return 'bg-slate-100 text-slate-600';
        })()}">
                    ${(() => {
            const status = user.verificationStatus || (user.isVerified ? 'verified' : 'incomplete');
            return status.charAt(0).toUpperCase() + status.slice(1);
        })()}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="renderUserDetail('${user.id}')" class="text-primary hover:text-secondary font-medium text-sm">View Details</button>
            </td>
        </tr>
        `).join('');

    adminContent.innerHTML = `
        <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input type="text" placeholder="Search users..." value="${userFilterState.search}"
                    oninput="userFilterState.search = this.value; renderUserManagement()"
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
            </div>
            <div class="flex gap-3">
                <select onchange="userFilterState.status = this.value; renderUserManagement()" 
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="all" ${userFilterState.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="incomplete" ${userFilterState.status === 'incomplete' ? 'selected' : ''}>Incomplete</option>
                    <option value="pending" ${userFilterState.status === 'pending' ? 'selected' : ''}>Pending Review</option>
                    <option value="verified" ${userFilterState.status === 'verified' ? 'selected' : ''}>Verified</option>
                    <option value="rejected" ${userFilterState.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="blocked" ${userFilterState.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                </select>
                <select onchange="userFilterState.sort = this.value; renderUserManagement()"
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="newest" ${userFilterState.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${userFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="name_asc" ${userFilterState.sort === 'name_asc' ? 'selected' : ''}>Name (A-Z)</option>
                    <option value="name_desc" ${userFilterState.sort === 'name_desc' ? 'selected' : ''}>Name (Z-A)</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reg No</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows : '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500">No users found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    // Re-focus search input if it was focused
    const searchInput = document.querySelector('input[placeholder="Search users..."]');
    if (searchInput && document.activeElement.tagName === 'INPUT') {
        searchInput.focus();
        // Move cursor to end
        const val = searchInput.value;
        searchInput.value = '';
        searchInput.value = val;
    }
}

// Helper Functions
function verifyUser(userId) {
    const user = window.db.getUsers().find(u => u.id === userId);
    if (user) {
        user.isVerified = true;
        user.verificationStatus = 'verified';
        window.db.updateUser(user);
        alert('User verified successfully!');
        renderUserDetail(userId);
    }
}

let loanFilterState = {
    search: '',
    status: 'all',
    sort: 'newest'
};

function renderLoanManagement() {
    const loans = window.db.getLoans();

    // Apply Filters and Sort
    let filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.userName.toLowerCase().includes(loanFilterState.search.toLowerCase());
        const matchesStatus = loanFilterState.status === 'all' || loan.status === loanFilterState.status;
        return matchesSearch && matchesStatus;
    });

    // Apply Sort
    filteredLoans.sort((a, b) => {
        if (loanFilterState.sort === 'newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
        if (loanFilterState.sort === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
        if (loanFilterState.sort === 'amount_high') return b.amount - a.amount;
        if (loanFilterState.sort === 'amount_low') return a.amount - b.amount;
        return 0;
    });

    const rows = filteredLoans.map(loan => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-6 py-4">
                <button onclick="renderUserDetail('${loan.userId}')" class="font-medium text-primary hover:text-secondary hover:underline transition text-left">
                    ${loan.userName}
                </button>
                <div class="text-sm text-slate-500">৳${loan.amount}</div>
            </td>
            <td class="px-6 py-4">
                ${(() => {
            // Check if loan has saved payment duration (for paid loans)
            if (loan.status === 'paid' && loan.paymentDuration) {
                const daysRemaining = loan.paymentDuration.daysRemaining;
                if (daysRemaining > 0) {
                    return `<span class="font-medium text-green-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} early</span>`;
                } else if (daysRemaining === 0) {
                    return '<span class="font-medium text-green-600">On Time</span>';
                } else {
                    return `<span class="font-medium text-red-600">${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} late</span>`;
                }
            }

            // Defaulted loans
            if (loan.status === 'defaulted') {
                return '<span class="font-medium text-red-700">Defaulted</span>';
            }

            // Rejected/Pending/Approved loans - N/A
            if (loan.status === 'rejected' || loan.status === 'pending' || loan.status === 'approved') {
                return '<span class="text-slate-500">N/A</span>';
            }

            // Calculate duration for disbursed/partially_paid loans
            if (!loan.disbursementInfo || !loan.disbursementInfo.disbursedAt) {
                return '<span class="text-slate-500">N/A</span>';
            }

            const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
            const today = new Date();
            disbursedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const daysSinceDisbursement = Math.floor((today - disbursedDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = 60 - daysSinceDisbursement;

            if (daysRemaining > 7) {
                return `<span class="font-medium text-green-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
            } else if (daysRemaining > 0) {
                return `<span class="font-medium text-amber-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
            } else if (daysRemaining === 0) {
                return '<span class="font-medium text-amber-600">Due Today</span>';
            } else {
                return `<span class="font-medium text-red-600">${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue</span>`;
            }
        })()}
            </td>
            <td class="px-6 py-4 text-slate-600">${new Date(loan.appliedAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium 
                    ${loan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            loan.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                loan.status === 'disbursed' ? 'bg-green-100 text-green-700' :
                    loan.status === 'partially_paid' ? 'bg-cyan-100 text-cyan-700' :
                        loan.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            loan.status === 'rejected' ? 'bg-slate-100 text-slate-700' :
                                loan.status === 'defaulted' ? 'bg-red-200 text-red-800' :
                                    'bg-slate-100 text-slate-600'}">
                    ${loan.status.replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="renderLoanDetail('${loan.id}')" class="text-primary hover:text-secondary font-medium text-sm">View Details</button>
            </td>
        </tr>
        `).join('');

    adminContent.innerHTML = `
        <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div class="relative flex-1 max-w-md">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                <input type="text" placeholder="Search by applicant name..." value="${loanFilterState.search}"
                    oninput="loanFilterState.search = this.value; renderLoanManagement()"
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
            </div>
            <div class="flex gap-3">
                <select onchange="loanFilterState.status = this.value; renderLoanManagement()" 
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="all" ${loanFilterState.status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="pending" ${loanFilterState.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="approved" ${loanFilterState.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="disbursed" ${loanFilterState.status === 'disbursed' ? 'selected' : ''}>Disbursed</option>
                    <option value="paid" ${loanFilterState.status === 'paid' ? 'selected' : ''}>Paid</option>
                    <option value="partially_paid" ${loanFilterState.status === 'partially_paid' ? 'selected' : ''}>Partially Paid</option>
                    <option value="defaulted" ${loanFilterState.status === 'defaulted' ? 'selected' : ''}>Defaulted</option>
                    <option value="rejected" ${loanFilterState.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <select onchange="loanFilterState.sort = this.value; renderLoanManagement()"
                    class="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="newest" ${loanFilterState.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${loanFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="amount_high" ${loanFilterState.sort === 'amount_high' ? 'selected' : ''}>Amount (High-Low)</option>
                    <option value="amount_low" ${loanFilterState.sort === 'amount_low' ? 'selected' : ''}>Amount (Low-High)</option>
                </select>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Applicant</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Duration to Pay</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                        <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length > 0 ? rows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No loans found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    // Re-focus search input if it was focused
    const searchInput = document.querySelector('input[placeholder="Search by applicant name..."]');
    if (searchInput && document.activeElement.tagName === 'INPUT') {
        searchInput.focus();
        // Move cursor to end
        const val = searchInput.value;
        searchInput.value = '';
        searchInput.value = val;
    }
}

function updateLoanStatus(loanId, status) {
    const loans = window.db.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
        loan.status = status;
        if (status === 'approved') {
            // Set due date to 60 days from now
            const date = new Date();
            date.setDate(date.getDate() + 60);
            loan.dueDate = date.toLocaleDateString();
        }
        window.db.updateLoan(loan);
        renderLoanManagement();
    }
}

// ===== ENHANCED LOAN MODAL FUNCTIONS =====

function showApproveModal(loanId) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Approve Loan Request</h3>
            <p class="text-slate-600 mb-6">Are you sure you want to approve this loan request? The student will be notified and the loan will be marked as approved.</p>
            <div class="flex gap-3">
                <button onclick="approveLoan('${loanId}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition">
                    Confirm Approval
                </button>
                <button onclick="closeModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition">
                    Cancel
                </button>
            </div>
        </div>
        `;

    modal.classList.remove('hidden');
}

function showRejectModal(loanId) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Reject Loan Request</h3>
            <p class="text-slate-600 mb-4">Please provide a reason for rejecting this loan:</p>
            
            <form id="rejectForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                    <textarea id="rejectionReason" required rows="4" placeholder="Explain why this loan cannot be approved..." 
                        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
                </div>
                
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition">
                        Confirm Rejection
                    </button>
                    <button type="button" onclick="closeModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        `;

    modal.classList.remove('hidden');

    document.getElementById('rejectForm').addEventListener('submit', (e) => {
        e.preventDefault();
        rejectLoan(loanId, document.getElementById('rejectionReason').value);
    });
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Click outside modal to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-overlay');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// Loan Action Handlers
function approveLoan(loanId) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (loan) {
        loan.status = 'approved';
        window.db.updateLoan(loan);
        closeModal();
        alert('✅ Loan approved successfully!');
        renderLoanDetail(loanId);
    }
}

function disburseLoan(loanId, mfsType, accountNo, transactionId, autoApprove = false) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (loan) {
        loan.status = 'disbursed';
        loan.disbursementInfo = {
            mfsType,
            accountNo,
            transactionId,
            disbursedAt: new Date().toISOString()
        };

        // Set due date to 60 days from disbursement
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 60);
        loan.dueDate = dueDate.toISOString();

        window.db.updateLoan(loan);
        closeModal();
        const message = autoApprove
            ? '✅ Loan approved and disbursed successfully!'
            : '✅ Loan disbursed successfully!';
        alert(message);
        renderLoanDetail(loanId);
    }
}

function rejectLoan(loanId, reason) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (loan) {
        loan.status = 'rejected';
        loan.rejectionReason = reason;
        window.db.updateLoan(loan);
        closeModal();
        alert('❌ Loan rejected.');
        renderLoanDetail(loanId);
    }
}

function markLoanAsDefaulted(loanId) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) return;

    const notes = prompt('Add notes about why this loan is being marked as defaulted (optional):');

    if (!confirm('Are you sure you want to mark this loan as DEFAULTED? This indicates the borrower has failed to repay after significant delay.')) {
        return;
    }

    loan.status = 'defaulted';
    loan.defaultedAt = new Date().toISOString();

    if (notes) {
        if (!loan.notes) loan.notes = [];
        loan.notes.push({
            text: `[DEFAULTED] ${notes} `,
            addedBy: 'Admin',
            addedAt: new Date().toISOString()
        });
    }

    window.db.updateLoan(loan);
    alert('⚠️ Loan marked as defaulted.');
    renderLoanDetail(loanId);
}

function extendLoanDuration(loanId) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) return;

    const extensionCount = loan.extensionCount || 0;
    if (extensionCount >= 2) {
        alert('Maximum extension limit (2 times) reached for this loan.');
        return;
    }

    const daysStr = prompt('Enter number of days to extend (e.g., 7):', '7');
    if (daysStr === null) return; // Cancelled

    const days = parseInt(daysStr);
    if (isNaN(days) || days <= 0) {
        alert('Please enter a valid positive number of days.');
        return;
    }

    // Update due date
    const currentDueDate = new Date(loan.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + days);
    loan.dueDate = currentDueDate.toISOString();

    // Increment extension count
    loan.extensionCount = extensionCount + 1;

    // Add a note about the extension
    if (!loan.notes) loan.notes = [];
    loan.notes.push({
        author: 'System',
        text: `Loan duration extended by ${days} days.New due date: ${currentDueDate.toLocaleDateString()}.(Extension ${loan.extensionCount}/2)`,
        timestamp: new Date().toISOString()
    });

    window.db.updateLoan(loan);
    alert(`Loan extended successfully! New due date: ${currentDueDate.toLocaleDateString()} `);
    renderLoanDetail(loanId);
}

// ===== LOAN TRACKING HELPER FUNCTIONS =====

// Calculate days until due date (negative if overdue)
function calculateDaysUntilDue(dueDate) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get expiry status object with color, label, and message
function getLoanExpiryStatus(dueDate, status) {
    if (status !== 'disbursed' || !dueDate) {
        return { color: 'slate', label: 'N/A', message: '' };
    }

    const daysLeft = calculateDaysUntilDue(dueDate);

    if (daysLeft < 0) {
        return {
            color: 'red',
            label: 'Overdue',
            message: `Overdue by ${Math.abs(daysLeft)} days`
        };
    } else if (daysLeft <= 7) {
        return {
            color: 'amber',
            label: 'Due Soon',
            message: `Due in ${daysLeft} days`
        };
    } else {
        return {
            color: 'green',
            label: 'On Time',
            message: `${daysLeft} days remaining`
        };
    }
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format timestamp helper
function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Add note to loan
function addNoteToLoan(loanId) {
    const noteText = document.getElementById('noteText').value.trim();
    if (!noteText) {
        alert('Please enter a note');
        return;
    }

    if (window.db.addLoanNote(loanId, noteText)) {
        alert('✅ Note added successfully!');
        renderLoanDetail(loanId);
    } else {
        alert('❌ Failed to add note');
    }
}

// Add call log to loan
function addCallLogToLoan(loanId) {
    const volunteer = document.getElementById('callVolunteer').value.trim();
    const outcome = document.getElementById('callOutcome').value;
    const details = document.getElementById('callDetails').value.trim();

    if (!volunteer || !outcome) {
        alert('Please fill in all required fields');
        return;
    }

    if (window.db.addCallLog(loanId, { volunteer, outcome, details })) {
        alert('✅ Call log added successfully!');
        renderLoanDetail(loanId);
    } else {
        alert('❌ Failed to add call log');
    }
}

// ===== VERIFICATION MANAGEMENT =====

function renderVerificationManagement() {
    const pendingVerifications = window.db.getPendingVerifications();

    if (pendingVerifications.length === 0) {
        adminContent.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="check-circle" class="w-10 h-10 text-slate-400"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                <p class="text-slate-600">No pending verification requests at the moment.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const cards = pendingVerifications.map(user => {
        const data = user.verificationData || {};
        const payment = data.payment || {};
        const personal = data.personal || {};
        const academic = data.academic || {};
        const identity = data.identity || {};

        return `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-4">
                            <img src="${user.profileImage || user.verificationData?.identity?.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random'}" 
                                alt="${user.name}" 
                                class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-white">
                            <div>
                                <h3 class="text-xl font-bold mb-1">${user.name}</h3>
                                <p class="text-sm opacity-90">${user.email}</p>
                                <p class="text-sm opacity-75 mt-1">Reg No: ${user.regNo || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                            Pending Review
                        </span>
                    </div>
                </div>

                <!-- Verification Data -->
        <div class="p-6 space-y-6">
            <!-- Section 1: Payment Information -->
            <div class="border-b border-slate-200 pb-6">
                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i data-lucide="banknote" class="w-5 h-5 text-primary"></i>
                    Payment Information
                </h4>
                <div class="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <p class="text-sm text-slate-600">Sender Mobile</p>
                        <p class="font-medium text-slate-900">${payment.senderNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Transaction ID</p>
                        <p class="font-medium text-slate-900">${payment.transactionId || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <!-- Section 2: Personal Information -->
            <div class="border-b border-slate-200 pb-6">
                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i data-lucide="user" class="w-5 h-5 text-primary"></i>
                    Personal Information
                </h4>
                <div class="grid md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-sm text-slate-600">Gender</p>
                        <p class="font-medium text-slate-900">${personal.gender || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Father's Name</p>
                        <p class="font-medium text-slate-900">${personal.fatherName || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Mother's Name</p>
                        <p class="font-medium text-slate-900">${personal.motherName || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Mobile Number</p>
                        <p class="font-medium text-slate-900">${personal.userMobile || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Family Mobile</p>
                        <p class="font-medium text-slate-900">${personal.familyMobile || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Date of Birth</p>
                        <p class="font-medium text-slate-900">${personal.dob || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-3">
                        <p class="text-sm text-slate-600">Current Address</p>
                        <p class="font-medium text-slate-900">${personal.currentAddress || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-3">
                        <p class="text-sm text-slate-600">Permanent Address</p>
                        <p class="font-medium text-slate-900">${personal.permanentAddress || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <!-- Section 3: Academic Information -->
            <div class="border-b border-slate-200 pb-6">
                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i data-lucide="graduation-cap" class="w-5 h-5 text-primary"></i>
                    Academic Information
                </h4>
                <div class="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <p class="text-sm text-slate-600">Registration Number</p>
                        <p class="font-medium text-slate-900">${academic.regNo || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Session</p>
                        <p class="font-medium text-slate-900">${academic.session || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Department</p>
                        <p class="font-medium text-slate-900">${academic.department || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Program</p>
                        <p class="font-medium text-slate-900">${academic.program || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-sm text-slate-600">Hall</p>
                        <p class="font-medium text-slate-900">${academic.hall || 'Not specified'}</p>
                    </div>
                </div>
            </div>

            <!-- Section 4: Identity Verification -->
            <div class="pb-6">
                <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i data-lucide="shield-check" class="w-5 h-5 text-primary"></i>
                    Identity Verification
                </h4>
                <div class="bg-blue-50 p-4 rounded-lg mb-4">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${identity.method === 'email' ? 'mail' : 'file-text'}" class="w-5 h-5 text-blue-600"></i>
                        <div>
                            <p class="text-sm text-blue-800 font-medium">
                                ${identity.method === 'email' ? 'Email Verification' : 'Document Upload'}
                            </p>
                            <p class="text-sm text-blue-700">
                                ${identity.method === 'email' ? `Email: ${identity.email || 'N/A'}` : 'Documents uploaded for review'}
                            </p>
                            ${identity.emailVerified ? '<p class="text-xs text-green-700 mt-1">✓ Email verified</p>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Verification Images -->
                <div>
                    <p class="text-sm font-medium text-slate-700 mb-3">Uploaded Documents</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- ID Card Front -->
                        <div>
                            <p class="text-xs text-slate-600 mb-2 font-medium">ID Card (Front)</p>
                            ${identity.idCardFrontUrl ?
                `<div class="relative group">
                                    <img src="${identity.idCardFrontUrl}" alt="ID Card Front" 
                                        class="w-full h-40 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-95 transition" 
                                        onclick="window.open('${identity.idCardFrontUrl}', '_blank')">
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                        <span class="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">Click to View</span>
                                    </div>
                                </div>` :
                `<div class="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <i data-lucide="image-off" class="w-6 h-6 mb-1 opacity-50"></i>
                                    <span class="text-xs">Not Uploaded</span>
                                </div>`
            }
                        </div>

                        <!-- ID Card Back -->
                        <div>
                            <p class="text-xs text-slate-600 mb-2 font-medium">ID Card (Back)</p>
                            ${identity.idCardBackUrl ?
                `<div class="relative group">
                                    <img src="${identity.idCardBackUrl}" alt="ID Card Back" 
                                        class="w-full h-40 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-95 transition" 
                                        onclick="window.open('${identity.idCardBackUrl}', '_blank')">
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                        <span class="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">Click to View</span>
                                    </div>
                                </div>` :
                `<div class="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <i data-lucide="image-off" class="w-6 h-6 mb-1 opacity-50"></i>
                                    <span class="text-xs">Not Uploaded</span>
                                </div>`
            }
                        </div>

                        <!-- Recent Photo -->
                        <div>
                            <p class="text-xs text-slate-600 mb-2 font-medium">Recent Photo</p>
                            ${identity.recentPhotoUrl ?
                `<div class="relative group">
                                    <img src="${identity.recentPhotoUrl}" alt="Recent Photo" 
                                        class="w-full h-40 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-95 transition" 
                                        onclick="window.open('${identity.recentPhotoUrl}', '_blank')">
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                        <span class="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">Click to View</span>
                                    </div>
                                </div>` :
                `<div class="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <i data-lucide="image-off" class="w-6 h-6 mb-1 opacity-50"></i>
                                    <span class="text-xs">Not Uploaded</span>
                                </div>`
            }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Submitted At -->
            <div class="text-sm text-slate-500 flex items-center gap-2">
                <i data-lucide="clock" class="w-4 h-4"></i>
                Submitted: ${data.submittedAt ? formatTimestamp(data.submittedAt) : 'Unknown'}
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t border-slate-200">
                <button onclick="approveUserVerification('${user.id}')"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <i data-lucide="check-circle" class="w-5 h-5"></i>
                    Approve Verification
                </button>
                <button onclick="showRejectVerificationModal('${user.id}')"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <i data-lucide="x-circle" class="w-5 h-5"></i>
                    Reject
                </button>
            </div>
        </div>
            </div>
        `;
    }).join('');

    adminContent.innerHTML = `
        <div class="mb-6">
            <p class="text-slate-600">
                <span class="font-semibold text-primary">${pendingVerifications.length}</span>
                student${pendingVerifications.length !== 1 ? 's' : ''} awaiting verification review
            </p>
        </div>
        <div class="space-y-6">
            ${cards}
        </div>

        <!-- Reject Modal -->
        <div id="reject-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div id="reject-modal-content" class="bg-white rounded-xl shadow-xl max-w-md w-full"></div>
        </div>
    `;

    lucide.createIcons();
}

function approveUserVerification(userId) {
    if (!confirm('Are you sure you want to approve this verification? The student will be able to apply for loans.')) {
        return;
    }

    const result = window.db.approveVerification(userId);
    if (result.success) {
        alert('✅ Verification approved successfully!');
        renderVerificationManagement();
    } else {
        alert('❌ ' + result.message);
    }
}

function showRejectVerificationModal(userId) {
    const modal = document.getElementById('reject-modal');
    const modalContent = document.getElementById('reject-modal-content');

    modalContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Reject Verification</h3>
            <p class="text-slate-600 mb-4">Please provide a reason for rejecting this verification request:</p>
            
            <form id="rejectVerifyForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                    <textarea id="rejectVerifyReason" required rows="4" 
                        placeholder="Explain why this verification cannot be approved..." 
                        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
                </div>
                
                <div class="flex gap-3">
                    <button type="submit" 
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition">
                        Confirm Rejection
                    </button>
                    <button type="button" onclick="closeRejectVerificationModal()" 
                        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        `;

    modal.classList.remove('hidden');

    document.getElementById('rejectVerifyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = document.getElementById('rejectVerifyReason').value;
        rejectUserVerification(userId, reason);
    });
}

function rejectUserVerification(userId, reason) {
    const result = window.db.rejectVerification(userId, reason);
    if (result.success) {
        closeRejectVerificationModal();
        alert('❌ Verification rejected. The student has been notified.');
        renderVerificationManagement();
    } else {
        alert('❌ ' + result.message);
    }
}

function closeRejectVerificationModal() {
    document.getElementById('reject-modal').classList.add('hidden');
}

// ===== USER DETAIL VIEW HELPERS =====

// Add note to user
function addNoteToUser(userId) {
    const noteText = document.getElementById('userNoteText').value.trim();
    if (!noteText) {
        alert('Please enter a note');
        return;
    }

    if (window.db.addUserNote(userId, noteText)) {
        alert('✅ Note added successfully!');
        renderUserDetail(userId);
    } else {
        alert('❌ Failed to add note');
    }
}

// Add call log to user
function addCallLogToUser(userId) {
    const volunteer = document.getElementById('userCallVolunteer').value.trim();
    const outcome = document.getElementById('userCallOutcome').value;
    const details = document.getElementById('userCallDetails').value.trim();

    if (!volunteer || !outcome) {
        alert('Please fill in all required fields');
        return;
    }

    if (window.db.addUserCallLog(userId, { volunteer, outcome, details })) {
        alert('✅ Call log added successfully!');
        renderUserDetail(userId);
    } else {
        alert('❌ Failed to add call log');
    }
}

// Show reject user verification modal
function showRejectUserVerificationModal(userId) {
    const modal = document.getElementById('reject-user-modal');
    const modalContent = document.getElementById('reject-user-modal-content');

    modalContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Reject Verification</h3>
            <p class="text-slate-600 mb-4">Please provide a reason for rejecting this verification request:</p>
            
            <form id="rejectUserVerifyForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                    <textarea id="rejectUserVerifyReason" required rows="4" 
                        placeholder="Explain why this verification cannot be approved..." 
                        class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
                </div>
                
                <div class="flex gap-3">
                    <button type="submit" 
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition">
                        Confirm Rejection
                    </button>
                    <button type="button" onclick="closeRejectUserVerificationModal()" 
                        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        `;

    modal.classList.remove('hidden');

    document.getElementById('rejectUserVerifyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = document.getElementById('rejectUserVerifyReason').value;
        rejectUserVerificationFromDetail(userId, reason);
    });
}

// Reject user verification from detail view
function rejectUserVerificationFromDetail(userId, reason) {
    const result = window.db.rejectVerification(userId, reason);
    if (result.success) {
        closeRejectUserVerificationModal();
        alert('❌ Verification rejected. The student has been notified.');
        renderAdminView('users'); // Go back to users list
    } else {
        alert('❌ ' + result.message);
    }
}

// Close reject user verification modal
function closeRejectUserVerificationModal() {
    document.getElementById('reject-user-modal').classList.add('hidden');
}

// Send admin message to student
function sendAdminMessage(loanId) {
    const messageText = document.getElementById('adminMessageText');
    if (!messageText || !messageText.value.trim()) {
        alert('Please enter a message');
        return;
    }

    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) return;

    if (!loan.adminMessages) loan.adminMessages = [];
    loan.adminMessages.push({
        text: messageText.value.trim(),
        author: 'Admin',
        timestamp: new Date().toISOString()
    });

    window.db.updateLoan(loan);
    messageText.value = '';
    alert('✅ Message sent to student!');
    renderLoanDetail(loanId);
}

// Show Disburse Modal
function showDisburseModal(loanId, autoApprove = false) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) return;

    // Get payment methods
    const paymentMethods = loan.paymentMethods && Array.isArray(loan.paymentMethods)
        ? loan.paymentMethods
        : [{ type: 'primary', method: loan.paymentMethod || '', accountNumber: loan.accountNumber || '' }];

    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="p-6">
            <h3 class="text-2xl font-bold text-slate-900 mb-2">${autoApprove ? 'Approve & Disburse Loan' : 'Disburse Loan'}</h3>
            <p class="text-slate-600 mb-6">${autoApprove ? 'This will approve and immediately disburse the loan.' : ''} Please provide disbursement details:</p>
            
            <form id="disburseForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Payment Method (MFS)</label>
                    <select id="disburseMethod" required class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none">
                        <option value="">Select Method</option>
                        ${paymentMethods.map(pm => `
                            <option value="${pm.method}|${pm.accountNumber}">
                                ${pm.method} - ${pm.accountNumber} ${pm.type === 'primary' ? '(Primary)' : '(Backup)'}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                    <input type="text" id="disburseAccountNo" readonly
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 outline-none" 
                        placeholder="Select method first">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Transaction ID</label>
                    <input type="text" id="disburseTrxId" required 
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="Enter TrxID">
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
                        ${autoApprove ? 'Approve & Disburse' : 'Confirm Disbursement'}
                    </button>
                    <button type="button" onclick="closeDisburseModal()" 
                        class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        `;

    modal.classList.remove('hidden');

    // Handle method selection change
    document.getElementById('disburseMethod').addEventListener('change', (e) => {
        const selected = e.target.value;
        if (selected) {
            const [method, accountNo] = selected.split('|');
            document.getElementById('disburseAccountNo').value = accountNo;
        } else {
            document.getElementById('disburseAccountNo').value = '';
        }
    });

    // Handle form submission
    document.getElementById('disburseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const methodValue = document.getElementById('disburseMethod').value;
        if (!methodValue) {
            alert('Please select a payment method');
            return;
        }

        const [method, accountNo] = methodValue.split('|');
        const trxId = document.getElementById('disburseTrxId').value;

        // Update loan status
        if (autoApprove && loan.status === 'pending') {
            loan.status = 'approved';
        }

        loan.status = 'disbursed';
        loan.disbursementInfo = {
            method: method,
            accountNo: accountNo,
            transactionId: trxId,
            disbursedAt: new Date().toISOString()
        };

        // Calculate due date (60 days from disbursement)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 60);
        loan.dueDate = dueDate.toISOString();

        window.db.updateLoan(loan);
        closeDisburseModal();
        alert(`✅ Loan disbursed successfully via ${method} !`);
        renderLoanDetail(loanId);
    });
}

function closeDisburseModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Block User Modal
function showBlockUserModal(userId) {
    const user = window.db.getUsers().find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i data-lucide="shield-ban" class="w-6 h-6 text-red-600"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-slate-900">Block User</h3>
                    <p class="text-sm text-slate-500">Block ${user.name}</p>
                </div>
            </div>
            
            <form id="blockUserForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Reason for Blocking</label>
                    <textarea id="blockReason" required rows="4"
                        class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        placeholder="Enter reason for blocking this user..."></textarea>
                </div>
                
                <div class="flex gap-3 pt-4">
                    <button type="submit" 
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition">
                        Block User
                    </button>
                    <button type="button" onclick="closeBlockModal()" 
                        class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        `;

    modal.classList.remove('hidden');
    lucide.createIcons();

    document.getElementById('blockUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const reason = document.getElementById('blockReason').value.trim();
        if (reason) {
            blockUserAccount(userId, reason);
        }
    });
}

function blockUserAccount(userId, reason) {
    const currentUser = window.db.getCurrentUser();
    const result = window.db.blockUser(userId, reason, currentUser?.id || 'admin');

    if (result.success) {
        closeBlockModal();
        alert('✅ User has been blocked successfully.');
        renderUserDetail(userId);
    } else {
        alert('❌ Failed to block user: ' + result.message);
    }
}

function unblockUserAccount(userId) {
    if (!confirm('Are you sure you want to unblock this user? They will regain access to their account.')) {
        return;
    }

    const result = window.db.unblockUser(userId);

    if (result.success) {
        alert('✅ User has been unblocked successfully.');
        renderUserDetail(userId);
    } else {
        alert('❌ Failed to unblock user: ' + result.message);
    }
}

function closeBlockModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ==================== EXTEND DURATION MODAL ====================

function showExtendDurationModal(loanId) {
    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) {
        alert('Loan not found!');
        return;
    }

    // Check if already has 2 extensions
    const extensions = loan.extensions || [];
    if (extensions.length >= 2) {
        alert('⚠️ Maximum 2 extensions allowed per loan. This loan has already been extended 2 times.');
        return;
    }

    // Get current due date
    const currentDueDate = loan.currentDueDate || loan.dueDate || loan.expectedDate;
    const durationInfo = window.calculateDurationInfo ? window.calculateDurationInfo(loan) : { totalExtensions: extensions.length };

    document.getElementById('modal-overlay').innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <h3 class="text-xl font-bold text-white flex items-center gap-3">
                    <i data-lucide="calendar-plus" class="w-6 h-6"></i>
                    Extend Loan Duration
                </h3>
                <p class="text-amber-100 mt-1">Loan #${loan.id.slice(-4)} - ৳${loan.amount}</p>
            </div>
            
            <div class="p-6">
                <!-- Current Status -->
                <div class="bg-slate-50 rounded-xl p-4 mb-6">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-slate-500">Current Due Date</p>
                            <p class="font-bold text-slate-900">${currentDueDate ? window.formatDate(currentDueDate) : 'Not set'}</p>
                        </div>
                        <div>
                            <p class="text-slate-500">Extensions Used</p>
                            <p class="font-bold ${durationInfo.totalExtensions > 0 ? 'text-amber-600' : 'text-slate-900'}">
                                ${durationInfo.totalExtensions}/2
                            </p>
                        </div>
                    </div>
                </div>

                ${extensions.length > 0 ? `
                    <div class="mb-6">
                        <p class="text-sm font-semibold text-slate-700 mb-2">Previous Extensions:</p>
                        <div class="space-y-2">
                            ${extensions.map((ext, i) => `
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                                    <span class="font-medium text-amber-800">#${i + 1}:</span>
                                    ${window.formatDate(ext.previousDueDate)} → ${window.formatDate(ext.newDueDate)}
                                    <span class="text-amber-600">(+${ext.daysExtended} days)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <form id="extendDurationForm" class="space-y-4">
                    <input type="hidden" id="extendLoanId" value="${loanId}">
                    <input type="hidden" id="currentDueDate" value="${currentDueDate || ''}">
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Extend By (Days) <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-4 gap-2 mb-3">
                            <button type="button" onclick="setExtendDays(7)" class="extend-day-btn px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium">
                                7 days
                            </button>
                            <button type="button" onclick="setExtendDays(14)" class="extend-day-btn px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium">
                                14 days
                            </button>
                            <button type="button" onclick="setExtendDays(21)" class="extend-day-btn px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium">
                                21 days
                            </button>
                            <button type="button" onclick="setExtendDays(30)" class="extend-day-btn px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-sm font-medium">
                                30 days
                            </button>
                        </div>
                        <input type="number" id="extendDays" min="1" max="60" required
                               class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                               placeholder="Or enter custom days (1-60)">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            New Due Date (Preview)
                        </label>
                        <div id="newDueDatePreview" class="px-4 py-3 bg-slate-100 rounded-xl text-slate-700 font-medium">
                            Enter days to see new due date
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">
                            Reason for Extension
                        </label>
                        <textarea id="extendReason" rows="2"
                                  class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Optional: Why is this extension needed?"></textarea>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="closeExtendModal()"
                                class="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit"
                                class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition">
                            <i data-lucide="calendar-plus" class="w-4 h-4 inline mr-2"></i>
                            Extend Duration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');
    lucide.createIcons();

    // Add event listener for days input
    document.getElementById('extendDays').addEventListener('input', updateNewDueDatePreview);

    // Form submit
    document.getElementById('extendDurationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        extendLoanDuration();
    });
}

function setExtendDays(days) {
    document.getElementById('extendDays').value = days;
    
    // Update button styles
    document.querySelectorAll('.extend-day-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-white', 'border-amber-500');
        btn.classList.add('border-slate-300');
    });
    event.target.classList.add('bg-amber-500', 'text-white', 'border-amber-500');
    event.target.classList.remove('border-slate-300');
    
    updateNewDueDatePreview();
}

function updateNewDueDatePreview() {
    const days = parseInt(document.getElementById('extendDays').value) || 0;
    const currentDueDateStr = document.getElementById('currentDueDate').value;
    
    if (days > 0 && currentDueDateStr) {
        const currentDueDate = new Date(currentDueDateStr);
        const newDueDate = new Date(currentDueDate);
        newDueDate.setDate(newDueDate.getDate() + days);
        
        document.getElementById('newDueDatePreview').innerHTML = `
            <span class="text-green-600 font-bold">${window.formatDate(newDueDate.toISOString())}</span>
            <span class="text-slate-500 text-sm ml-2">(+${days} days from current)</span>
        `;
    } else if (days > 0) {
        const today = new Date();
        const newDueDate = new Date(today);
        newDueDate.setDate(newDueDate.getDate() + days);
        
        document.getElementById('newDueDatePreview').innerHTML = `
            <span class="text-green-600 font-bold">${window.formatDate(newDueDate.toISOString())}</span>
            <span class="text-slate-500 text-sm ml-2">(+${days} days from today)</span>
        `;
    } else {
        document.getElementById('newDueDatePreview').textContent = 'Enter days to see new due date';
    }
}

function extendLoanDuration() {
    const loanId = document.getElementById('extendLoanId').value;
    const days = parseInt(document.getElementById('extendDays').value);
    const reason = document.getElementById('extendReason').value.trim();
    const currentDueDateStr = document.getElementById('currentDueDate').value;

    if (!days || days < 1 || days > 60) {
        alert('Please enter a valid number of days (1-60)');
        return;
    }

    const loan = window.db.getLoans().find(l => l.id === loanId);
    if (!loan) {
        alert('Loan not found!');
        return;
    }

    // Calculate new due date
    const previousDueDate = currentDueDateStr ? new Date(currentDueDateStr) : new Date();
    const newDueDate = new Date(previousDueDate);
    newDueDate.setDate(newDueDate.getDate() + days);

    // Create extension record
    const extension = {
        previousDueDate: previousDueDate.toISOString(),
        newDueDate: newDueDate.toISOString(),
        daysExtended: days,
        reason: reason || 'No reason provided',
        extendedAt: new Date().toISOString(),
        extendedBy: window.db.getCurrentUser()?.id || 'admin'
    };

    // Update loan
    if (!loan.extensions) loan.extensions = [];
    loan.extensions.push(extension);
    loan.currentDueDate = newDueDate.toISOString();
    
    // Also update dueDate for backward compatibility
    loan.dueDate = newDueDate.toISOString();

    window.db.updateLoan(loan);

    closeExtendModal();
    alert(`✅ Loan duration extended by ${days} days.\nNew due date: ${window.formatDate(newDueDate.toISOString())}`);

    // Refresh loan detail view
    renderLoanDetail(loanId);
}

function closeExtendModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Make functions global
window.showDisburseModal = showDisburseModal;
window.closeDisburseModal = closeDisburseModal;
window.showBlockUserModal = showBlockUserModal;
window.blockUserAccount = blockUserAccount;
window.unblockUserAccount = unblockUserAccount;
window.closeBlockModal = closeBlockModal;
window.showExtendDurationModal = showExtendDurationModal;
window.setExtendDays = setExtendDays;
window.updateNewDueDatePreview = updateNewDueDatePreview;
window.extendLoanDuration = extendLoanDuration;
window.closeExtendModal = closeExtendModal;
