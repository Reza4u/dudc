/**
 * Unified Loan Detail Renderer
 * Mobile-friendly, user-friendly view for loan details
 * Updated: December 2025
 */

// Main unified loan detail renderer
function renderUnifiedLoanDetail(loan, userId, role) {
    const badge = getStatusBadge(loan.status);
    const durationInfo = calculateDurationInfo(loan);
    const daysRemaining = durationInfo.daysRemaining;
    const scoreBadge = getScoreBadge(durationInfo.score);

    // Get user's loan history (last 5 loans)
    const allUserLoans = window.db.getLoans().filter(l => l.userId === userId && l.id !== loan.id);
    const loanHistory = allUserLoans
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);

    let html = `
        <!-- Back Button -->
        <button onclick="${role === 'admin' ? 'renderLoanManagement()' : "renderView('overview')"}" 
                class="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> 
            Back to ${role === 'admin' ? 'Loans' : 'Overview'}
        </button>

        <div class="max-w-3xl mx-auto">
            <!-- ===== HEADER CARD ===== -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <!-- Status Banner -->
                <div class="px-4 py-3 ${badge.bg} flex items-center justify-between">
                    <span class="font-semibold ${badge.text} flex items-center gap-2">
                        <i data-lucide="${getStatusIcon(loan.status)}" class="w-4 h-4"></i>
                        ${badge.label}
                    </span>
                    ${(loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') ? `
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${scoreBadge.bg} ${scoreBadge.text}">
                            Score: ${durationInfo.score}
                        </span>
                    ` : ''}
                </div>
                
                <!-- Loan ID & Date -->
                <div class="p-4 border-b border-slate-100">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-lg font-bold text-slate-900">Loan #${loan.id.slice(-4)}</h2>
                            <p class="text-xs text-slate-500 mt-0.5">Applied: ${formatDate(loan.appliedAt)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-primary">৳${loan.amount.toLocaleString()}</p>
                            <p class="text-xs text-slate-500">Requested Amount</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats Grid -->
                <div class="grid grid-cols-2 divide-x divide-slate-100">
                    <div class="p-4 text-center">
                        <p class="text-xs text-slate-500 mb-1">Due Date</p>
                        <p class="text-sm font-semibold text-slate-800">
                            ${durationInfo.currentDueDate ? formatDate(durationInfo.currentDueDate) : (loan.expectedDate ? formatDate(loan.expectedDate) : 'TBD')}
                        </p>
                    </div>
                    <div class="p-4 text-center">
                        <p class="text-xs text-slate-500 mb-1">Time Status</p>
                        <p class="text-sm font-semibold">${formatDaysRemaining(daysRemaining)}</p>
                    </div>
                </div>
            </div>
    `;

    // ===== DURATION TRACKING (for disbursed loans) =====
    if ((loan.status === 'disbursed' || loan.status === 'partially_paid') && loan.disbursementInfo) {
        html += `
            <!-- Duration Tracking Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-blue-50 border-b border-blue-100">
                    <h3 class="font-semibold text-blue-900 flex items-center gap-2">
                        <i data-lucide="calendar-clock" class="w-4 h-4"></i>
                        Duration Tracking
                    </h3>
                </div>
                
                <div class="p-4">
                    <!-- Timeline Stats -->
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div class="bg-slate-50 p-3 rounded-xl text-center">
                            <p class="text-2xl font-bold text-slate-900">${durationInfo.daysSinceDisbursement}</p>
                            <p class="text-xs text-slate-500">Days Since Disbursed</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-xl text-center">
                            <p class="text-2xl font-bold ${durationInfo.isOverdue ? 'text-red-600' : 'text-green-600'}">
                                ${durationInfo.isOverdue ? durationInfo.daysOverdue : Math.abs(daysRemaining)}
                            </p>
                            <p class="text-xs text-slate-500">${durationInfo.isOverdue ? 'Days Overdue' : 'Days Remaining'}</p>
                        </div>
                    </div>
                    
                    <!-- Due Date Details -->
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between items-center py-2 border-b border-slate-100">
                            <span class="text-sm text-slate-600">Original Due Date</span>
                            <span class="text-sm font-medium text-slate-800">${durationInfo.originalDueDate ? formatDate(durationInfo.originalDueDate) : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-slate-100">
                            <span class="text-sm text-slate-600">Current Due Date</span>
                            <span class="text-sm font-medium text-slate-800">${durationInfo.currentDueDate ? formatDate(durationInfo.currentDueDate) : 'N/A'}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-slate-600">Extensions Used</span>
                            <span class="text-sm font-medium ${durationInfo.totalExtensions > 0 ? 'text-amber-600' : 'text-slate-800'}">
                                ${durationInfo.totalExtensions}/2
                                ${durationInfo.totalDaysExtended > 0 ? `(+${durationInfo.totalDaysExtended} days)` : ''}
                            </span>
                        </div>
                    </div>
                    
                    ${durationInfo.isOverdue ? `
                        <div class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <i data-lucide="alert-triangle" class="w-4 h-4 text-red-600"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-red-800">Loan Overdue</p>
                                <p class="text-sm text-red-700">This loan is ${durationInfo.daysOverdue} days past due. Please submit repayment as soon as possible.</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${durationInfo.extensions.length > 0 ? `
                    <div class="px-4 pb-4">
                        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Extension History</p>
                        <div class="space-y-2">
                            ${durationInfo.extensions.map((ext, index) => `
                                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <span class="text-xs font-medium text-amber-700">Extension #${index + 1}</span>
                                            <p class="text-sm text-slate-700 mt-1">
                                                <span class="line-through text-slate-400">${formatDate(ext.previousDueDate)}</span>
                                                <i data-lucide="arrow-right" class="w-3 h-3 inline mx-1"></i>
                                                <span class="font-medium">${formatDate(ext.newDueDate)}</span>
                                            </p>
                                            ${ext.reason ? `<p class="text-xs text-slate-500 mt-1">Reason: ${ext.reason}</p>` : ''}
                                        </div>
                                        <span class="text-xs text-amber-600 font-medium">+${ext.daysExtended} days</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ===== LOAN PURPOSE =====
    html += `
        <!-- Purpose Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
            <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                    <i data-lucide="file-text" class="w-4 h-4 text-slate-600"></i>
                    Purpose of Loan
                </h3>
            </div>
            <div class="p-4">
                <p class="text-slate-700 text-sm leading-relaxed">${loan.purpose || 'Not specified'}</p>
            </div>
        </div>
    `;

    // ===== WITNESSES SECTION =====
    if (shouldShowSection('witnessesAdmin', role, loan.status) || shouldShowSection('witnessesStudent', role, loan.status)) {
        html += `
            <!-- Witnesses Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                        <i data-lucide="users" class="w-4 h-4 text-slate-600"></i>
                        Witnesses
                    </h3>
                </div>
                <div class="divide-y divide-slate-100">
        `;

        if (loan.witness1) {
            html += `
                <div class="p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-primary font-bold">1</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-slate-800">${loan.witness1.name}</p>
                            ${role === 'admin' ? `
                                <div class="mt-2 space-y-1">
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                                        ${loan.witness1.mobile}
                                    </p>
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                                        <span class="truncate">${loan.witness1.email}</span>
                                    </p>
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="hash" class="w-3.5 h-3.5"></i>
                                        ${loan.witness1.regNo}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        if (loan.witness2) {
            html += `
                <div class="p-4">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-secondary font-bold">2</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-slate-800">${loan.witness2.name}</p>
                            ${role === 'admin' ? `
                                <div class="mt-2 space-y-1">
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="phone" class="w-3.5 h-3.5"></i>
                                        ${loan.witness2.mobile}
                                    </p>
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                                        <span class="truncate">${loan.witness2.email}</span>
                                    </p>
                                    <p class="text-sm text-slate-600 flex items-center gap-2">
                                        <i data-lucide="hash" class="w-3.5 h-3.5"></i>
                                        ${loan.witness2.regNo}
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    // ===== DISBURSEMENT INFO =====
    if (shouldShowSection('disbursementInfo', role, loan.status) && loan.disbursementInfo) {
        html += `
            <!-- Disbursement Info Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-green-50 border-b border-green-100">
                    <h3 class="font-semibold text-green-800 flex items-center gap-2">
                        <i data-lucide="banknote" class="w-4 h-4"></i>
                        Disbursement Details
                    </h3>
                </div>
                <div class="p-4">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center py-2 border-b border-slate-100">
                            <span class="text-sm text-slate-600">Payment Method</span>
                            <span class="text-sm font-semibold text-slate-800">${loan.disbursementInfo.mfsType || loan.disbursementInfo.method}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-slate-100">
                            <span class="text-sm text-slate-600">Account Number</span>
                            <span class="text-sm font-mono font-medium text-slate-800">${loan.disbursementInfo.accountNo}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-slate-100">
                            <span class="text-sm text-slate-600">Transaction ID</span>
                            <span class="text-sm font-mono font-medium text-primary">${loan.disbursementInfo.transactionId}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-slate-600">Disbursed On</span>
                            <span class="text-sm font-medium text-slate-800">${formatTimestamp(loan.disbursementInfo.disbursedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== REJECTION REASON =====
    if (shouldShowSection('rejectionReason', role, loan.status) && loan.rejectionReason) {
        html += `
            <!-- Rejection Reason Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-red-50 border-b border-red-100">
                    <h3 class="font-semibold text-red-800 flex items-center gap-2">
                        <i data-lucide="x-circle" class="w-4 h-4"></i>
                        Rejection Reason
                    </h3>
                </div>
                <div class="p-4">
                    <p class="text-red-700 text-sm">${loan.rejectionReason}</p>
                </div>
            </div>
        `;
    }

    // ===== LOAN HISTORY =====
    if (shouldShowSection('loanHistory', role, loan.status) && loanHistory.length > 0) {
        html += `
            <!-- Loan History Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                        <i data-lucide="history" class="w-4 h-4 text-slate-600"></i>
                        Previous Loans
                    </h3>
                </div>
                <div class="divide-y divide-slate-100">
        `;

        loanHistory.forEach(historicalLoan => {
            const historicalDurationInfo = calculateDurationInfo(historicalLoan);
            const historicalBadge = getStatusBadge(historicalLoan.status);
            const historicalScoreBadge = getScoreBadge(historicalDurationInfo.score);

            html += `
                <div class="p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-semibold text-slate-800">৳${historicalLoan.amount.toLocaleString()}</p>
                            <p class="text-xs text-slate-500 mt-0.5">${formatDate(historicalLoan.appliedAt)}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${(historicalLoan.status === 'paid' || historicalLoan.status === 'completed' || historicalLoan.status === 'disbursed' || historicalLoan.status === 'partially_paid') ? `
                                <span class="px-2 py-0.5 rounded text-xs font-medium ${historicalScoreBadge.bg} ${historicalScoreBadge.text}">
                                    ${historicalDurationInfo.score}
                                </span>
                            ` : ''}
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${historicalBadge.bg} ${historicalBadge.text}">
                                ${historicalBadge.label}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // ===== ADMIN MESSAGES (Student View) =====
    if (shouldShowSection('adminMessages', role, loan.status)) {
        const messages = loan.adminMessages || [];
        html += `
            <!-- Admin Messages Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <div class="px-4 py-3 bg-blue-50 border-b border-blue-100">
                    <h3 class="font-semibold text-blue-800 flex items-center gap-2">
                        <i data-lucide="message-circle" class="w-4 h-4"></i>
                        Messages from Admin
                    </h3>
                </div>
                ${messages.length > 0 ? `
                    <div class="divide-y divide-slate-100">
                        ${messages.map(msg => `
                            <div class="p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <i data-lucide="user" class="w-3.5 h-3.5 text-slate-500"></i>
                                        ${msg.author}
                                    </span>
                                    <span class="text-xs text-slate-500">${formatTimestamp(msg.timestamp)}</span>
                                </div>
                                <p class="text-sm text-slate-700">${msg.text}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="p-6 text-center">
                        <i data-lucide="inbox" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                        <p class="text-sm text-slate-500">No messages yet</p>
                    </div>
                `}
            </div>
        `;
    }

    // ===== ADMIN-ONLY SECTIONS =====
    if (role === 'admin') {
        // Internal Notes
        if (shouldShowSection('internalNotes', role, loan.status)) {
            const notes = loan.notes || [];
            html += `
                <!-- Internal Notes Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                    <div class="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                        <h3 class="font-semibold text-purple-800 flex items-center gap-2">
                            <i data-lucide="sticky-note" class="w-4 h-4"></i>
                            Internal Notes
                        </h3>
                        <button onclick="showAddNoteModal('${loan.id}', 'loan')" 
                                class="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-1">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                            Add Note
                        </button>
                    </div>
                    ${notes.length > 0 ? `
                        <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                            ${notes.slice().reverse().map(note => `
                                <div class="p-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-slate-800">${note.author}</span>
                                        <span class="text-xs text-slate-500">${formatTimestamp(note.timestamp)}</span>
                                    </div>
                                    <p class="text-sm text-slate-700">${note.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="p-6 text-center">
                            <p class="text-sm text-slate-500">No notes yet</p>
                        </div>
                    `}
                </div>
            `;
        }

        // Call Logs
        if (shouldShowSection('callLogs', role, loan.status)) {
            const callLogs = loan.callLogs || [];
            html += `
                <!-- Call Logs Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                    <div class="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
                        <h3 class="font-semibold text-orange-800 flex items-center gap-2">
                            <i data-lucide="phone" class="w-4 h-4"></i>
                            Call Logs
                        </h3>
                        <button onclick="showAddCallLogModal('${loan.id}')" 
                                class="text-xs px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-1">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                            Log Call
                        </button>
                    </div>
                    ${callLogs.length > 0 ? `
                        <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                            ${callLogs.slice().reverse().map(log => `
                                <div class="p-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-semibold text-slate-800">${log.volunteer}</span>
                                            <span class="px-2 py-0.5 rounded text-xs font-medium ${
                                                log.outcome === 'Reached' ? 'bg-green-100 text-green-700' :
                                                log.outcome === 'Promised Payment' ? 'bg-blue-100 text-blue-700' :
                                                log.outcome === 'No Answer' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }">${log.outcome}</span>
                                        </div>
                                        <span class="text-xs text-slate-500">${formatTimestamp(log.timestamp)}</span>
                                    </div>
                                    <p class="text-sm text-slate-700">${log.notes}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="p-6 text-center">
                            <p class="text-sm text-slate-500">No call logs yet</p>
                        </div>
                    `}
                </div>
            `;
        }

        // Admin Actions
        if (shouldShowSection('adminActions', role, loan.status)) {
            const actions = getActionsForStatus(loan.status);
            if (actions.length > 0) {
                html += `
                    <!-- Admin Actions Card -->
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                                <i data-lucide="settings" class="w-4 h-4 text-slate-600"></i>
                                Actions
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="flex flex-wrap gap-2">
                `;

                actions.forEach(action => {
                    const btnClass = action.style === 'primary' ? 'bg-primary hover:bg-secondary text-white' :
                        action.style === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
                            action.style === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                'bg-slate-600 hover:bg-slate-700 text-white';

                    let onclick = '';
                    if (action.type === 'approve') onclick = `approveLoan('${loan.id}')`;
                    else if (action.type === 'reject') onclick = `showRejectModal('${loan.id}')`;
                    else if (action.type === 'disburse') onclick = `showDisburseModal('${loan.id}')`;
                    else if (action.type === 'extend') onclick = `showExtendDurationModal('${loan.id}')`;
                    else if (action.type === 'default') onclick = `markLoanAsDefaulted('${loan.id}')`;

                    html += `
                        <button onclick="${onclick}" 
                                class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-medium transition ${btnClass} flex items-center justify-center gap-2">
                            <i data-lucide="${action.icon}" class="w-4 h-4"></i>
                            ${action.label}
                        </button>
                    `;
                });

                html += `
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    // ===== REPAYMENT HISTORY SECTION (for Student) =====
    if (role === 'student' && ['disbursed', 'partially_paid', 'completed', 'paid'].includes(loan.status)) {
        const allRepayments = window.db.getRepayments().filter(r => r.loanId === loan.id);
        
        if (allRepayments.length > 0) {
            html += `
                <!-- Repayment History Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                    <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <h3 class="font-semibold text-slate-800 flex items-center gap-2">
                            <i data-lucide="history" class="w-4 h-4 text-slate-600"></i>
                            Payment History
                        </h3>
                    </div>
                    <div class="divide-y divide-slate-100">
            `;

            // Sort by date descending
            allRepayments.sort((a, b) => new Date(b.submittedAt || b.date) - new Date(a.submittedAt || a.date));

            allRepayments.forEach(r => {
                const statusColors = {
                    verified: { bg: 'bg-green-100', text: 'text-green-700', icon: 'check-circle', label: 'Verified' },
                    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'clock', label: 'Pending' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: 'x-circle', label: 'Rejected' }
                };
                const s = statusColors[r.status] || statusColors.pending;
                const date = new Date(r.submittedAt || r.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });

                html += `
                    <div class="p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-bold text-slate-900">৳${r.amount}</span>
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}">
                                        <i data-lucide="${s.icon}" class="w-3 h-3"></i>
                                        ${s.label}
                                    </span>
                                </div>
                                <div class="text-sm text-slate-500">
                                    <span>${r.method}</span> • <span>TrxID: ${r.trxId}</span>
                                </div>
                                <div class="text-xs text-slate-400 mt-1">${date}</div>
                                ${r.status === 'rejected' && r.rejectionReason ? `
                                    <div class="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                        <p class="text-xs text-red-600 font-medium">Rejection Reason:</p>
                                        <p class="text-sm text-red-800">${r.rejectionReason}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }
    }

    // ===== STUDENT REPAYMENT BUTTON =====
    if (shouldShowSection('repaymentButton', role, loan.status)) {
        html += `
            <!-- Repayment Action -->
            <div class="sticky bottom-4 z-10">
                <button onclick="renderView('repayment')" 
                        class="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <i data-lucide="banknote" class="w-5 h-5"></i>
                    Submit Repayment
                </button>
            </div>
        `;
    }

    html += `
        </div>
    `;

    return html;
}

// Helper: Get status icon
function getStatusIcon(status) {
    const icons = {
        pending: 'clock',
        approved: 'check-circle',
        disbursed: 'send',
        partially_paid: 'pie-chart',
        completed: 'check-circle-2',
        paid: 'check-circle-2',
        rejected: 'x-circle',
        defaulted: 'alert-triangle'
    };
    return icons[status] || 'circle';
}

// Expose to window
window.renderUnifiedLoanDetail = renderUnifiedLoanDetail;
window.getStatusIcon = getStatusIcon;
