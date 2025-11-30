/**
 * Unified Loan Detail Renderer
 * Shared functions for rendering loan details for both students and admins
 */

// Main unified loan detail renderer
function renderUnifiedLoanDetail(loan, userId, role) {
    const badge = getStatusBadge(loan.status);
    const daysRemaining = calculateDaysRemaining(loan);

    // Get user's loan history (last 5 loans)
    const allUserLoans = window.db.getLoans().filter(l => l.userId === userId && l.id !== loan.id);
    const loanHistory = allUserLoans
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);

    let html = `
        <!-- Back Button -->
        <button onclick="${role === 'admin' ? 'renderLoanManagement()' : "renderView('overview')"}" 
                class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> 
            Back to ${role === 'admin' ? 'Loans' : 'Overview'}
        </button>

        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900">Loan Request #${loan.id.slice(-4)}</h2>
                        <p class="text-slate-500 mt-1">Applied on ${formatDate(loan.appliedAt)}</p>
                    </div>
                    <span class="px-4 py-2 rounded-full text-sm font-medium ${badge.bg} ${badge.text}">
                        ${badge.label}
                    </span>
                </div>

                <!-- Amount Info -->
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                    <div class="grid md:grid-cols-3 gap-6">
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Amount Requested</p>
                            <p class="text-3xl font-bold text-slate-900">৳${loan.amount}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Expected Repayment</p>
                            <p class="text-xl font-medium text-primary">${loan.dueDate ? formatDate(loan.dueDate) : 'TBD'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-600 mb-1">Duration</p>
                            <p class="text-xl font-bold">${formatDaysRemaining(daysRemaining)}</p>
                        </div>
                    </div>
                </div>

                <!-- Purpose -->
                <div class="mb-6">
                    <h4 class="font-bold text-slate-900 mb-3">Purpose of Loan</h4>
                    <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p class="text-slate-700">${loan.purpose || 'Not specified'}</p>
                    </div>
                </div>
    `;

    // Witnesses Section
    if (shouldShowSection('witnessesAdmin', role, loan.status) || shouldShowSection('witnessesStudent', role, loan.status)) {
        html += `
            <div class="mb-6">
                <h4 class="font-bold text-slate-900 mb-3">Witnesses</h4>
                <div class="grid md:grid-cols-2 gap-4">
        `;

        if (loan.witness1) {
            html += `
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="font-semibold text-slate-800">Witness 1</p>
                    <p class="text-slate-700">${loan.witness1.name}</p>
                    ${role === 'admin' ? `
                        <p class="text-sm text-slate-600 mt-2">📱 ${loan.witness1.mobile}</p>
                        <p class="text-sm text-slate-600">📧 ${loan.witness1.email}</p>
                        <p class="text-sm text-slate-600">🎓 ${loan.witness1.regNo}</p>
                    ` : ''}
                </div>
            `;
        }

        if (loan.witness2) {
            html += `
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="font-semibold text-slate-800">Witness 2</p>
                    <p class="text-slate-700">${loan.witness2.name}</p>
                    ${role === 'admin' ? `
                        <p class="text-sm text-slate-600 mt-2">📱 ${loan.witness2.mobile}</p>
                        <p class="text-sm text-slate-600">📧 ${loan.witness2.email}</p>
                        <p class="text-sm text-slate-600">🎓 ${loan.witness2.regNo}</p>
                    ` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    // Disbursement Info (shown to both per user request)
    if (shouldShowSection('disbursementInfo', role, loan.status) && loan.disbursementInfo) {
        html += `
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

    // Rejection Reason
    if (shouldShowSection('rejectionReason', role, loan.status) && loan.rejectionReason) {
        html += `
            <div class="bg-red-50 p-6 rounded-xl border border-red-200 mb-6">
                <h4 class="font-bold text-red-900 mb-2">Rejection Reason</h4>
                <p class="text-red-700">${loan.rejectionReason}</p>
            </div>
        `;
    }

    // Loan History Section (last 5 loans)
    if (shouldShowSection('loanHistory', role, loan.status) && loanHistory.length > 0) {
        html += `
            <div class="mb-6">
                <h4 class="font-bold text-slate-900 mb-3">Previous Loan History</h4>
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div class="space-y-2">
        `;

        loanHistory.forEach(historicalLoan => {
            const historicalDays = calculateDaysRemaining(historicalLoan);
            const historicalBadge = getStatusBadge(historicalLoan.status);

            html += `
                <div class="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                    <div class="flex-1">
                        <span class="font-medium text-slate-800">৳${historicalLoan.amount}</span>
                        <span class="text-sm text-slate-500 ml-2">${formatDate(historicalLoan.appliedAt)}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        ${historicalDays !== null ? `
                            <span class="text-sm">${formatDaysRemaining(historicalDays)}</span>
                        ` : ''}
                        <span class="px-2 py-1 rounded text-xs font-medium ${historicalBadge.bg} ${historicalBadge.text}">
                            ${historicalBadge.label}
                        </span>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    // Admin Messages (student only)
    if (shouldShowSection('adminMessages', role, loan.status)) {
        const messages = loan.adminMessages || [];
        html += `
            <div class="mb-6">
                <h4 class="font-bold text-slate-900 mb-3">Messages from Admin</h4>
                ${messages.length > 0 ? messages.map(msg => `
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-semibold text-blue-900 flex items-center gap-2">
                                <i data-lucide="user" class="w-4 h-4"></i> ${msg.author}
                            </span>
                            <span class="text-xs text-blue-600">${formatTimestamp(msg.timestamp)}</span>
                        </div>
                        <p class="text-blue-800">${msg.text}</p>
                    </div>
                `).join('') : '<p class="text-slate-500 italic text-center py-4">No messages from admin yet.</p>'}
            </div>
        `;
    }

    // Admin-only sections
    if (role === 'admin') {
        // Internal Notes
        if (shouldShowSection('internalNotes', role, loan.status)) {
            const notes = loan.notes || [];
            html += `
                <div class="mb-6">
                    <h4 class="font-bold text-slate-900 mb-3">Internal Notes</h4>
                    ${notes.length > 0 ? notes.slice().reverse().map(note => `
                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-semibold text-slate-800">${note.author}</span>
                                <span class="text-xs text-slate-500">${formatTimestamp(note.timestamp)}</span>
                            </div>
                            <p class="text-slate-700">${note.text}</p>
                        </div>
                    `).join('') : '<p class="text-slate-500 text-center py-4">No notes yet</p>'}
                    <button onclick="showAddNoteModal('${loan.id}', 'loan')" 
                            class="mt-3 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition">
                        <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>Add Note
                    </button>
                </div>
            `;
        }

        // Call Logs
        if (shouldShowSection('callLogs', role, loan.status)) {
            const callLogs = loan.callLogs || [];
            html += `
                <div class="mb-6">
                    <h4 class="font-bold text-slate-900 mb-3">Call Logs</h4>
                    ${callLogs.length > 0 ? callLogs.slice().reverse().map(log => `
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
                            <p class="text-slate-700">${log.notes}</p>
                        </div>
                    `).join('') : '<p class="text-slate-500 text-center py-4">No call logs yet</p>'}
                    <button onclick="showAddCallLogModal('${loan.id}')" 
                            class="mt-3 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition">
                        <i data-lucide="phone" class="w-4 h-4 inline mr-2"></i>Log Call
                    </button>
                </div>
            `;
        }

        // Admin Actions
        if (shouldShowSection('adminActions', role, loan.status)) {
            const actions = getActionsForStatus(loan.status);
            if (actions.length > 0) {
                html += `
                    <div class="border-t border-slate-200 pt-6 mt-6">
                        <h4 class="font-bold text-slate-900 mb-4">Actions</h4>
                        <div class="flex gap-3 flex-wrap">
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
                                class="px-6 py-3 rounded-lg font-medium transition ${btnClass}">
                            <i data-lucide="${action.icon}" class="w-4 h-4 inline mr-2"></i>
                            ${action.label}
                        </button>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }
        }
    }

    // Student Repayment Button
    if (shouldShowSection('repaymentButton', role, loan.status)) {
        html += `
            <div class="border-t border-slate-200 pt-6 mt-6">
                <button onclick="renderView('repayment')" 
                        class="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5">
                    <i data-lucide="banknote" class="w-5 h-5 inline mr-2"></i>
                    Submit Repayment
                </button>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

// Expose to window
window.renderUnifiedLoanDetail = renderUnifiedLoanDetail;
