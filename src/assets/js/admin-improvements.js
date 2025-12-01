/**
 * Admin Panel Improvements
 * - Mobile-friendly tables (card view)
 * - Dashboard analytics
 * - Quick actions FAB
 * - Better notifications (toast)
 * - Bulk actions
 * - Export data
 * - Unified status colors
 */

// ==================== UNIFIED STATUS SYSTEM ====================

const STATUS_CONFIG = {
    // User verification statuses
    verified: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'check-circle', label: 'Verified' },
    pending: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: 'clock', label: 'Pending' },
    incomplete: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: 'alert-circle', label: 'Incomplete' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'x-circle', label: 'Rejected' },
    blocked: { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300', icon: 'shield-ban', label: 'Blocked' },
    
    // Loan statuses
    approved: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: 'check', label: 'Approved' },
    disbursed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'banknote', label: 'Disbursed' },
    partially_paid: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'pie-chart', label: 'Partial' },
    paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'check-circle-2', label: 'Paid' },
    defaulted: { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-300', icon: 'alert-triangle', label: 'Defaulted' }
};

function getStatusBadgeHTML(status, size = 'sm') {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.incomplete;
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    
    return `
        <span class="${config.bg} ${config.text} ${sizeClasses} rounded-full font-medium inline-flex items-center gap-1">
            <i data-lucide="${config.icon}" class="w-3 h-3"></i>
            ${config.label}
        </span>
    `;
}

// ==================== TOAST NOTIFICATION SYSTEM ====================

function initToastContainer() {
    if (document.getElementById('toast-container')) return;
    
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-4 right-4 z-[100] flex flex-col gap-2';
    document.body.appendChild(container);
}

function showToast(message, type = 'success', duration = 3000) {
    initToastContainer();
    
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-amber-500',
        info: 'bg-blue-600'
    };
    
    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transform translate-x-full transition-transform duration-300 max-w-sm`;
    toast.innerHTML = `
        <i data-lucide="${icons[type]}" class="w-5 h-5 flex-shrink-0"></i>
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-auto hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    lucide.createIcons();
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Replace alert with toast
window.originalAlert = window.alert;
window.alert = function(message) {
    if (message.startsWith('✅')) {
        showToast(message.replace('✅ ', ''), 'success');
    } else if (message.startsWith('❌')) {
        showToast(message.replace('❌ ', ''), 'error');
    } else if (message.startsWith('⚠️')) {
        showToast(message.replace('⚠️ ', ''), 'warning');
    } else {
        showToast(message, 'info');
    }
};

// ==================== MOBILE CARD VIEW RENDERERS ====================

// Check if mobile
function isMobile() {
    return window.innerWidth < 768;
}

// Render Users as Cards for Mobile
function renderUserCards(users) {
    return users.map(user => {
        const status = user.verificationStatus || (user.isVerified ? 'verified' : 'incomplete');
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.incomplete;
        
        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-3">
                <div class="p-4">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-900">${user.name}</h4>
                                <p class="text-xs text-slate-500">${user.email}</p>
                            </div>
                        </div>
                        ${getStatusBadgeHTML(status)}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500">Reg No</p>
                            <p class="font-medium text-slate-800">${user.regNo || 'N/A'}</p>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500">Joined</p>
                            <p class="font-medium text-slate-800">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                    
                    <button onclick="renderUserDetail('${user.id}')" 
                        class="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Loans as Cards for Mobile
function renderLoanCards(loans) {
    return loans.map(loan => {
        const config = STATUS_CONFIG[loan.status] || STATUS_CONFIG.pending;
        
        // Calculate duration
        let durationHtml = '<span class="text-slate-500">N/A</span>';
        if (loan.status === 'paid' && loan.paymentDuration) {
            const dr = loan.paymentDuration.daysRemaining;
            if (dr > 0) {
                durationHtml = `<span class="text-green-600 font-medium">${dr} days early</span>`;
            } else if (dr === 0) {
                durationHtml = `<span class="text-green-600 font-medium">On Time</span>`;
            } else {
                durationHtml = `<span class="text-red-600 font-medium">${Math.abs(dr)} days late</span>`;
            }
        } else if ((loan.status === 'disbursed' || loan.status === 'partially_paid') && loan.disbursementInfo) {
            const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
            const today = new Date();
            disbursedDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const daysSince = Math.floor((today - disbursedDate) / 86400000);
            const daysRemaining = 60 - daysSince;
            
            if (daysRemaining > 7) {
                durationHtml = `<span class="text-green-600 font-medium">${daysRemaining} days left</span>`;
            } else if (daysRemaining > 0) {
                durationHtml = `<span class="text-amber-600 font-medium">${daysRemaining} days left</span>`;
            } else if (daysRemaining === 0) {
                durationHtml = `<span class="text-amber-600 font-medium">Due Today</span>`;
            } else {
                durationHtml = `<span class="text-red-600 font-medium">${Math.abs(daysRemaining)} days overdue</span>`;
            }
        }
        
        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-3">
                <div class="border-l-4 ${config.border.replace('border', 'border-l')} p-4">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <button onclick="renderUserDetail('${loan.userId}')" class="font-bold text-primary hover:text-secondary transition">
                                ${loan.userName}
                            </button>
                            <p class="text-lg font-bold text-slate-900">৳${loan.amount}</p>
                        </div>
                        ${getStatusBadgeHTML(loan.status)}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500">Applied</p>
                            <p class="font-medium text-slate-800">${new Date(loan.appliedAt).toLocaleDateString()}</p>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500">Duration</p>
                            <p class="font-medium">${durationHtml}</p>
                        </div>
                    </div>
                    
                    <button onclick="renderLoanDetail('${loan.id}')" 
                        class="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Repayments as Cards for Mobile
function renderRepaymentCards(repayments) {
    return repayments.map(rep => {
        const isPending = rep.status === 'pending';
        const isRejected = rep.status === 'rejected';
        
        // Status badge
        let statusBadge = '';
        if (isPending) {
            statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-0.5 text-xs rounded-full font-medium">Pending</span>';
        } else if (rep.status === 'verified') {
            statusBadge = '<span class="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i>Verified</span>';
        } else if (isRejected) {
            statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1"><i data-lucide="x" class="w-3 h-3"></i>Rejected</span>';
        }
        
        // Action buttons
        let actionButtons = '';
        if (isPending) {
            actionButtons = `
                <div class="flex gap-2">
                    <button onclick="verifyRepayment('${rep.id}')" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <i data-lucide="check" class="w-4 h-4"></i> Verify
                    </button>
                    <button onclick="showRejectRepaymentModal('${rep.id}')" 
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <i data-lucide="x" class="w-4 h-4"></i> Reject
                    </button>
                </div>
            `;
        } else if (rep.status === 'verified') {
            actionButtons = `
                <div class="w-full bg-green-50 text-green-700 py-2.5 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4"></i> Verified
                </div>
            `;
        } else if (isRejected) {
            actionButtons = `
                <div class="w-full bg-red-50 text-red-700 py-2.5 rounded-lg text-center">
                    <div class="font-medium flex items-center justify-center gap-2"><i data-lucide="x-circle" class="w-4 h-4"></i> Rejected</div>
                    ${rep.rejectionReason ? `<p class="text-xs mt-1">${rep.rejectionReason}</p>` : ''}
                </div>
            `;
        }
        
        return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-3">
                <div class="p-4">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h4 class="font-bold text-slate-900">${rep.userName || 'Unknown'}</h4>
                            <p class="text-lg font-bold text-green-600">৳${rep.amount}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500">Method</p>
                            <p class="font-medium text-slate-800">${rep.method}</p>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg">
                            <p class="text-xs text-slate-500 flex items-center justify-between">
                                TrxID
                                <button onclick="copyToClipboard('${rep.trxId}', this)" class="p-0.5 hover:bg-slate-200 rounded text-slate-400"><i data-lucide="copy" class="w-3 h-3"></i></button>
                            </p>
                            <p class="font-medium text-slate-800 truncate">${rep.trxId}</p>
                        </div>
                        <div class="bg-slate-50 p-2 rounded-lg col-span-2">
                            <p class="text-xs text-slate-500 flex items-center justify-between">
                                Sender Account
                                ${rep.senderAccount ? `<button onclick="copyToClipboard('${rep.senderAccount}', this)" class="p-0.5 hover:bg-slate-200 rounded text-slate-400"><i data-lucide="copy" class="w-3 h-3"></i></button>` : ''}
                            </p>
                            <p class="font-medium text-slate-800">${rep.senderAccount || 'N/A'}</p>
                        </div>
                    </div>
                    
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== BULK ACTIONS ====================

let selectedItems = new Set();

function toggleSelectAll(type) {
    const checkboxes = document.querySelectorAll(`.bulk-checkbox-${type}`);
    const selectAllCheckbox = document.getElementById(`select-all-${type}`);
    
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
        if (selectAllCheckbox.checked) {
            selectedItems.add(cb.value);
        } else {
            selectedItems.delete(cb.value);
        }
    });
    
    updateBulkActionsBar(type);
}

function toggleSelectItem(id, type) {
    if (selectedItems.has(id)) {
        selectedItems.delete(id);
    } else {
        selectedItems.add(id);
    }
    updateBulkActionsBar(type);
}

function updateBulkActionsBar(type) {
    const bar = document.getElementById(`bulk-actions-bar-${type}`);
    if (!bar) return;
    
    if (selectedItems.size > 0) {
        bar.classList.remove('hidden');
        document.getElementById(`selected-count-${type}`).textContent = selectedItems.size;
    } else {
        bar.classList.add('hidden');
    }
}

function bulkApproveLoans() {
    if (selectedItems.size === 0) return;
    
    if (!confirm(`Are you sure you want to approve ${selectedItems.size} loan(s)?`)) return;
    
    let approved = 0;
    selectedItems.forEach(id => {
        const loan = window.db.getLoans().find(l => l.id === id);
        if (loan && loan.status === 'pending') {
            loan.status = 'approved';
            window.db.updateLoan(loan);
            approved++;
        }
    });
    
    selectedItems.clear();
    showToast(`${approved} loan(s) approved successfully!`, 'success');
    renderLoanManagement();
}

function bulkRejectLoans() {
    if (selectedItems.size === 0) return;
    
    const reason = prompt('Enter rejection reason for all selected loans:');
    if (!reason) return;
    
    let rejected = 0;
    selectedItems.forEach(id => {
        const loan = window.db.getLoans().find(l => l.id === id);
        if (loan && loan.status === 'pending') {
            loan.status = 'rejected';
            loan.rejectionReason = reason;
            window.db.updateLoan(loan);
            rejected++;
        }
    });
    
    selectedItems.clear();
    showToast(`${rejected} loan(s) rejected.`, 'warning');
    renderLoanManagement();
}

function bulkApproveVerifications() {
    if (selectedItems.size === 0) return;
    
    if (!confirm(`Are you sure you want to approve ${selectedItems.size} verification(s)?`)) return;
    
    let approved = 0;
    selectedItems.forEach(id => {
        const result = window.db.approveVerification(id);
        if (result.success) approved++;
    });
    
    selectedItems.clear();
    showToast(`${approved} verification(s) approved!`, 'success');
    renderVerificationManagement();
}

function bulkVerifyRepayments() {
    if (selectedItems.size === 0) return;
    
    if (!confirm(`Are you sure you want to verify ${selectedItems.size} repayment(s)?`)) return;
    
    let verified = 0;
    selectedItems.forEach(id => {
        const repayment = window.db.getRepayments().find(r => r.id === id);
        if (repayment && repayment.status === 'pending') {
            repayment.status = 'verified';
            window.db.updateRepayment(repayment);
            
            // Update loan status
            const loan = window.db.getLoans().find(l => l.id === repayment.loanId);
            if (loan) {
                const allRepayments = window.db.getRepayments().filter(r => r.loanId === loan.id && r.status === 'verified');
                const totalRepaid = allRepayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
                loan.repaid = totalRepaid;
                
                if (totalRepaid >= parseInt(loan.amount)) {
                    loan.status = 'paid';
                } else {
                    loan.status = 'partially_paid';
                }
                window.db.updateLoan(loan);
            }
            verified++;
        }
    });
    
    selectedItems.clear();
    showToast(`${verified} repayment(s) verified!`, 'success');
    renderRepaymentVerification();
}

// ==================== EXPORT DATA ====================

function exportToCSV(data, filename, headers) {
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast(`${filename} exported successfully!`, 'success');
}

function exportUsers() {
    const users = window.db.getUsers().filter(u => u.role !== 'admin');
    const headers = ['name', 'email', 'regNo', 'verificationStatus', 'createdAt'];
    
    const data = users.map(u => ({
        name: u.name,
        email: u.email,
        regNo: u.regNo || '',
        verificationStatus: u.verificationStatus || 'incomplete',
        createdAt: u.createdAt || ''
    }));
    
    exportToCSV(data, 'users', headers);
}

function exportLoans() {
    const loans = window.db.getLoans();
    const headers = ['userName', 'amount', 'status', 'appliedAt', 'dueDate', 'purpose'];
    
    const data = loans.map(l => ({
        userName: l.userName,
        amount: l.amount,
        status: l.status,
        appliedAt: l.appliedAt,
        dueDate: l.dueDate || '',
        purpose: l.purpose || ''
    }));
    
    exportToCSV(data, 'loans', headers);
}

function exportRepayments() {
    const repayments = window.db.getRepayments();
    const headers = ['userName', 'amount', 'method', 'trxId', 'status', 'date'];
    
    const data = repayments.map(r => ({
        userName: r.userName || '',
        amount: r.amount,
        method: r.method,
        trxId: r.trxId,
        status: r.status,
        date: r.date || ''
    }));
    
    exportToCSV(data, 'repayments', headers);
}

// ==================== ENHANCED DASHBOARD ====================

function renderEnhancedDashboard() {
    const users = window.db.getUsers().filter(u => u.role !== 'admin');
    const loans = window.db.getLoans();
    const repayments = window.db.getRepayments();

    // Statistics
    const stats = {
        pendingVerifications: users.filter(u => u.verificationStatus === 'pending').length,
        verifiedUsers: users.filter(u => u.verificationStatus === 'verified').length,
        totalUsers: users.length,
        
        pendingLoans: loans.filter(l => l.status === 'pending').length,
        approvedLoans: loans.filter(l => l.status === 'approved').length,
        activeLoans: loans.filter(l => l.status === 'disbursed' || l.status === 'partially_paid').length,
        paidLoans: loans.filter(l => l.status === 'paid').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        
        pendingRepayments: repayments.filter(r => r.status === 'pending').length,
        
        totalDisbursed: loans.filter(l => ['disbursed', 'partially_paid', 'paid'].includes(l.status))
            .reduce((sum, l) => sum + parseInt(l.amount || 0), 0),
        totalRepaid: repayments.filter(r => r.status === 'verified')
            .reduce((sum, r) => sum + parseInt(r.amount || 0), 0)
    };
    
    // Overdue loans
    const overdueLoans = loans.filter(l => {
        if (l.status !== 'disbursed' && l.status !== 'partially_paid') return false;
        const dueDate = new Date(l.currentDueDate || l.dueDate);
        return dueDate < new Date();
    });

    // Recent activities (last 5 loans)
    const recentLoans = [...loans].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 5);

    // Calculate repayment rate
    const repaymentRate = stats.totalDisbursed > 0 
        ? Math.round((stats.totalRepaid / stats.totalDisbursed) * 100) 
        : 0;

    const pageTitle = document.getElementById('pageTitle');
    pageTitle.textContent = 'Dashboard Overview';

    adminContent.innerHTML = `
        <!-- Quick Stats Row 1 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
            <!-- Pending Verifications -->
            <div onclick="renderAdminView('verifications')" 
                class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all group">
                <div class="flex items-center justify-between mb-2 md:mb-4">
                    <div class="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition">
                        <i data-lucide="user-check" class="w-5 h-5"></i>
                    </div>
                    ${stats.pendingVerifications > 0 ? `
                        <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold animate-pulse">
                            ${stats.pendingVerifications}
                        </span>
                    ` : ''}
                </div>
                <p class="text-2xl md:text-3xl font-bold text-slate-900">${stats.pendingVerifications}</p>
                <p class="text-xs md:text-sm text-slate-500 mt-1">Pending Verifications</p>
            </div>

            <!-- Pending Loans -->
            <div onclick="loanFilterState.status = 'pending'; renderAdminView('loans')" 
                class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
                <div class="flex items-center justify-between mb-2 md:mb-4">
                    <div class="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition">
                        <i data-lucide="file-text" class="w-5 h-5"></i>
                    </div>
                    ${stats.pendingLoans > 0 ? `
                        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            ${stats.pendingLoans}
                        </span>
                    ` : ''}
                </div>
                <p class="text-2xl md:text-3xl font-bold text-slate-900">${stats.pendingLoans}</p>
                <p class="text-xs md:text-sm text-slate-500 mt-1">Loan Requests</p>
            </div>

            <!-- Active Loans -->
            <div onclick="loanFilterState.status = 'disbursed'; renderAdminView('loans')" 
                class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group">
                <div class="flex items-center justify-between mb-2 md:mb-4">
                    <div class="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition">
                        <i data-lucide="activity" class="w-5 h-5"></i>
                    </div>
                </div>
                <p class="text-2xl md:text-3xl font-bold text-slate-900">${stats.activeLoans}</p>
                <p class="text-xs md:text-sm text-slate-500 mt-1">Active Loans</p>
            </div>

            <!-- Total Disbursed -->
            <div onclick="renderAdminView('loans')" 
                class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group">
                <div class="flex items-center justify-between mb-2 md:mb-4">
                    <div class="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition">
                        <i data-lucide="wallet" class="w-5 h-5"></i>
                    </div>
                </div>
                <p class="text-xl md:text-2xl font-bold text-slate-900">৳${stats.totalDisbursed.toLocaleString()}</p>
                <p class="text-xs md:text-sm text-slate-500 mt-1">Total Disbursed</p>
            </div>
        </div>

        <!-- Analytics Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <!-- Repayment Progress -->
            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h4 class="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                    <i data-lucide="trending-up" class="w-4 h-4"></i>
                    Repayment Progress
                </h4>
                <div class="flex items-end gap-4">
                    <div class="flex-1">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-slate-600">৳${stats.totalRepaid.toLocaleString()} / ৳${stats.totalDisbursed.toLocaleString()}</span>
                            <span class="font-bold text-primary">${repaymentRate}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all" style="width: ${repaymentRate}%"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div class="bg-green-50 p-2 rounded-lg">
                        <p class="text-lg font-bold text-green-700">${stats.paidLoans}</p>
                        <p class="text-xs text-green-600">Fully Paid</p>
                    </div>
                    <div class="bg-red-50 p-2 rounded-lg">
                        <p class="text-lg font-bold text-red-700">${stats.defaultedLoans}</p>
                        <p class="text-xs text-red-600">Defaulted</p>
                    </div>
                </div>
            </div>

            <!-- Loan Status Distribution -->
            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h4 class="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-4 h-4"></i>
                    Loan Status
                </h4>
                <div class="space-y-2">
                    ${[
                        { label: 'Pending', count: stats.pendingLoans, color: 'amber', total: loans.length },
                        { label: 'Approved', count: stats.approvedLoans, color: 'blue', total: loans.length },
                        { label: 'Active', count: stats.activeLoans, color: 'green', total: loans.length },
                        { label: 'Paid', count: stats.paidLoans, color: 'emerald', total: loans.length }
                    ].map(item => `
                        <div class="flex items-center gap-3">
                            <span class="w-20 text-xs text-slate-600">${item.label}</span>
                            <div class="flex-1 bg-slate-100 rounded-full h-2">
                                <div class="bg-${item.color}-500 h-2 rounded-full" style="width: ${item.total > 0 ? (item.count / item.total * 100) : 0}%"></div>
                            </div>
                            <span class="text-xs font-medium text-slate-700 w-8 text-right">${item.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- User Stats -->
            <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h4 class="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                    <i data-lucide="users" class="w-4 h-4"></i>
                    User Statistics
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-600">Total Users</span>
                        <span class="font-bold text-slate-900">${stats.totalUsers}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-600">Verified</span>
                        <span class="font-bold text-green-600">${stats.verifiedUsers}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-600">Pending Review</span>
                        <span class="font-bold text-blue-600">${stats.pendingVerifications}</span>
                    </div>
                    <div class="pt-2 border-t">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-slate-600">Verification Rate</span>
                            <span class="font-bold text-primary">
                                ${stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pending Tasks & Alerts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Action Required -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4">
                    <h3 class="text-white font-bold flex items-center gap-2">
                        <i data-lucide="bell-ring" class="w-5 h-5"></i>
                        Action Required
                    </h3>
                </div>
                <div class="p-4 space-y-3">
                    ${stats.pendingVerifications > 0 ? `
                        <div onclick="renderAdminView('verifications')" class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <i data-lucide="user-check" class="w-5 h-5 text-amber-600"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-amber-900">${stats.pendingVerifications} Verification Request(s)</p>
                                <p class="text-xs text-amber-700">Students waiting for approval</p>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-amber-400"></i>
                        </div>
                    ` : ''}
                    
                    ${stats.pendingLoans > 0 ? `
                        <div onclick="loanFilterState.status = 'pending'; renderAdminView('loans')" class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-blue-900">${stats.pendingLoans} Loan Request(s)</p>
                                <p class="text-xs text-blue-700">Pending review and approval</p>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-blue-400"></i>
                        </div>
                    ` : ''}
                    
                    ${stats.approvedLoans > 0 ? `
                        <div onclick="loanFilterState.status = 'approved'; renderAdminView('loans')" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i data-lucide="banknote" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-green-900">${stats.approvedLoans} Ready to Disburse</p>
                                <p class="text-xs text-green-700">Approved and waiting for disbursement</p>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-green-400"></i>
                        </div>
                    ` : ''}
                    
                    ${stats.pendingRepayments > 0 ? `
                        <div onclick="repaymentFilterState.status = 'pending'; renderAdminView('repayment-verify')" class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <i data-lucide="check-circle" class="w-5 h-5 text-purple-600"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-purple-900">${stats.pendingRepayments} Repayment(s) to Verify</p>
                                <p class="text-xs text-purple-700">Confirm payment transactions</p>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-purple-400"></i>
                        </div>
                    ` : ''}
                    
                    ${overdueLoans.length > 0 ? `
                        <div onclick="loanFilterState.status = 'disbursed'; renderAdminView('loans')" class="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition">
                            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-red-900">${overdueLoans.length} Overdue Loan(s)</p>
                                <p class="text-xs text-red-700">Require immediate attention</p>
                            </div>
                            <i data-lucide="chevron-right" class="w-5 h-5 text-red-400"></i>
                        </div>
                    ` : ''}
                    
                    ${stats.pendingVerifications === 0 && stats.pendingLoans === 0 && stats.approvedLoans === 0 && stats.pendingRepayments === 0 && overdueLoans.length === 0 ? `
                        <div class="text-center py-6">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i data-lucide="check-circle" class="w-6 h-6 text-green-600"></i>
                            </div>
                            <p class="text-slate-600">All caught up! No pending actions.</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="bg-gradient-to-r from-primary to-secondary px-5 py-4">
                    <h3 class="text-white font-bold flex items-center gap-2">
                        <i data-lucide="clock" class="w-5 h-5"></i>
                        Recent Loan Applications
                    </h3>
                </div>
                <div class="p-4 space-y-3">
                    ${recentLoans.length > 0 ? recentLoans.map(loan => `
                        <div onclick="renderLoanDetail('${loan.id}')" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                                <span class="font-bold text-primary">${loan.userName.charAt(0)}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-slate-900 truncate">${loan.userName}</p>
                                <p class="text-xs text-slate-500">${new Date(loan.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-slate-900">৳${loan.amount}</p>
                                ${getStatusBadgeHTML(loan.status, 'xs')}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-6 text-slate-500">
                            No recent applications
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Quick Export -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i data-lucide="download" class="w-5 h-5 text-primary"></i>
                Export Data
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onclick="exportUsers()" class="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition">
                    <i data-lucide="users" class="w-4 h-4"></i>
                    Export Users
                </button>
                <button onclick="exportLoans()" class="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                    Export Loans
                </button>
                <button onclick="exportRepayments()" class="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition">
                    <i data-lucide="credit-card" class="w-4 h-4"></i>
                    Export Repayments
                </button>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ==================== FLOATING ACTION BUTTON ====================

function initFAB() {
    if (document.getElementById('admin-fab')) return;
    
    const fab = document.createElement('div');
    fab.id = 'admin-fab';
    fab.className = 'fixed bottom-6 right-6 z-50 md:hidden';
    fab.innerHTML = `
        <div id="fab-menu" class="hidden absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden w-48 mb-2">
            <button onclick="renderAdminView('verifications'); closeFabMenu()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left">
                <i data-lucide="user-check" class="w-5 h-5 text-amber-600"></i>
                <span class="text-sm font-medium text-slate-700">Verifications</span>
            </button>
            <button onclick="loanFilterState.status = 'pending'; renderAdminView('loans'); closeFabMenu()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left border-t">
                <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i>
                <span class="text-sm font-medium text-slate-700">Pending Loans</span>
            </button>
            <button onclick="renderAdminView('repayment-verify'); closeFabMenu()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left border-t">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                <span class="text-sm font-medium text-slate-700">Verify Payments</span>
            </button>
            <button onclick="renderAdminView('dashboard'); closeFabMenu()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left border-t">
                <i data-lucide="layout-dashboard" class="w-5 h-5 text-primary"></i>
                <span class="text-sm font-medium text-slate-700">Dashboard</span>
            </button>
        </div>
        <button id="fab-button" onclick="toggleFabMenu()" 
            class="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all">
            <i data-lucide="plus" class="w-6 h-6" id="fab-icon"></i>
        </button>
    `;
    
    document.body.appendChild(fab);
    lucide.createIcons();
}

function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    const icon = document.getElementById('fab-icon');
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'plus');
    }
    lucide.createIcons();
}

function closeFabMenu() {
    const menu = document.getElementById('fab-menu');
    const icon = document.getElementById('fab-icon');
    menu.classList.add('hidden');
    icon.setAttribute('data-lucide', 'plus');
    lucide.createIcons();
}

// ==================== RESPONSIVE TABLE WRAPPER ====================

function getResponsiveTableHTML(tableContent, cardContent, emptyMessage = 'No data found.') {
    return `
        <!-- Desktop Table -->
        <div class="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            ${tableContent}
        </div>
        
        <!-- Mobile Cards -->
        <div class="md:hidden">
            ${cardContent || `<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">${emptyMessage}</div>`}
        </div>
    `;
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    initToastContainer();
    initFAB();
});

// ==================== COMPACT VERIFICATION CARDS ====================

function renderCompactVerificationCards(verifications) {
    if (verifications.length === 0) {
        return `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="check-circle" class="w-10 h-10 text-green-500"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                <p class="text-slate-600">No pending verification requests at the moment.</p>
            </div>
        `;
    }

    return verifications.map(user => {
        const data = user.verificationData || {};
        const payment = data.payment || {};
        const personal = data.personal || {};
        const academic = data.academic || {};
        const identity = data.identity || {};

        return `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                <!-- Compact Header -->
                <div class="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="${identity.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=0F766E&color=fff'}" 
                                alt="${user.name}" 
                                class="w-12 h-12 rounded-full object-cover border-2 border-white/30 bg-white">
                            <div>
                                <h3 class="font-bold">${user.name}</h3>
                                <p class="text-xs opacity-80">${academic.regNo || user.regNo || 'N/A'} • ${academic.department || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                            Pending
                        </span>
                    </div>
                </div>

                <!-- Quick Info Grid -->
                <div class="p-4">
                    <!-- Payment & Contact Row -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div class="bg-green-50 p-3 rounded-lg">
                            <p class="text-xs text-green-600 font-medium mb-1">Payment</p>
                            <p class="text-sm font-bold text-green-800">${payment.transactionId || 'N/A'}</p>
                            <p class="text-xs text-green-600">${payment.senderNumber || ''}</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <p class="text-xs text-blue-600 font-medium mb-1">Mobile</p>
                            <p class="text-sm font-bold text-blue-800">${personal.userMobile || 'N/A'}</p>
                            <p class="text-xs text-blue-600">Family: ${personal.familyMobile || 'N/A'}</p>
                        </div>
                        <div class="bg-purple-50 p-3 rounded-lg">
                            <p class="text-xs text-purple-600 font-medium mb-1">Session</p>
                            <p class="text-sm font-bold text-purple-800">${academic.session || 'N/A'}</p>
                            <p class="text-xs text-purple-600">${academic.program || 'N/A'}</p>
                        </div>
                        <div class="bg-amber-50 p-3 rounded-lg">
                            <p class="text-xs text-amber-600 font-medium mb-1">Hall</p>
                            <p class="text-sm font-bold text-amber-800">${academic.hall || 'N/A'}</p>
                            <p class="text-xs text-amber-600">${personal.gender || 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Parents & Address (Collapsible) -->
                    <details class="mb-4">
                        <summary class="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-2 py-2">
                            <i data-lucide="chevron-right" class="w-4 h-4 transition-transform details-open:rotate-90"></i>
                            More Details (Parents, Address, Email)
                        </summary>
                        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                            <div>
                                <p class="text-xs text-slate-500">Father's Name</p>
                                <p class="text-sm font-medium text-slate-800">${personal.fatherName || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Mother's Name</p>
                                <p class="text-sm font-medium text-slate-800">${personal.motherName || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Date of Birth</p>
                                <p class="text-sm font-medium text-slate-800">${personal.dob || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Email</p>
                                <p class="text-sm font-medium text-slate-800">${user.email}</p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-xs text-slate-500">Current Address</p>
                                <p class="text-sm font-medium text-slate-800">${personal.currentAddress || 'N/A'}</p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-xs text-slate-500">Permanent Address</p>
                                <p class="text-sm font-medium text-slate-800">${personal.permanentAddress || 'N/A'}</p>
                            </div>
                        </div>
                    </details>

                    <!-- Documents Preview -->
                    <div class="mb-4">
                        <p class="text-xs font-medium text-slate-600 mb-2">Documents</p>
                        <div class="flex gap-2 overflow-x-auto pb-2">
                            ${identity.idCardFrontUrl ? `
                                <img src="${identity.idCardFrontUrl}" alt="ID Front" 
                                    class="w-20 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition flex-shrink-0"
                                    onclick="window.open('${identity.idCardFrontUrl}', '_blank')">
                            ` : '<div class="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs flex-shrink-0">No ID Front</div>'}
                            ${identity.idCardBackUrl ? `
                                <img src="${identity.idCardBackUrl}" alt="ID Back" 
                                    class="w-20 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition flex-shrink-0"
                                    onclick="window.open('${identity.idCardBackUrl}', '_blank')">
                            ` : '<div class="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs flex-shrink-0">No ID Back</div>'}
                            ${identity.recentPhotoUrl ? `
                                <img src="${identity.recentPhotoUrl}" alt="Photo" 
                                    class="w-20 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition flex-shrink-0"
                                    onclick="window.open('${identity.recentPhotoUrl}', '_blank')">
                            ` : '<div class="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs flex-shrink-0">No Photo</div>'}
                        </div>
                    </div>

                    <!-- Submitted Time -->
                    <div class="text-xs text-slate-500 mb-4 flex items-center gap-1">
                        <i data-lucide="clock" class="w-3 h-3"></i>
                        Submitted: ${data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'Unknown'}
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                        <button onclick="approveUserVerification('${user.id}')"
                            class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm">
                            <i data-lucide="check" class="w-4 h-4"></i>
                            Approve
                        </button>
                        <button onclick="showRejectVerificationModal('${user.id}')"
                            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm">
                            <i data-lucide="x" class="w-4 h-4"></i>
                            Reject
                        </button>
                        <button onclick="renderUserDetail('${user.id}')"
                            class="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Make functions global
window.showToast = showToast;
window.getStatusBadgeHTML = getStatusBadgeHTML;
window.renderUserCards = renderUserCards;
window.renderLoanCards = renderLoanCards;
window.renderRepaymentCards = renderRepaymentCards;
window.toggleSelectAll = toggleSelectAll;
window.toggleSelectItem = toggleSelectItem;
window.bulkApproveLoans = bulkApproveLoans;
window.bulkRejectLoans = bulkRejectLoans;
window.bulkApproveVerifications = bulkApproveVerifications;
window.bulkVerifyRepayments = bulkVerifyRepayments;
window.exportUsers = exportUsers;
window.exportLoans = exportLoans;
window.exportRepayments = exportRepayments;
window.exportToCSV = exportToCSV;
window.renderEnhancedDashboard = renderEnhancedDashboard;
window.isMobile = isMobile;
window.getResponsiveTableHTML = getResponsiveTableHTML;
window.initFAB = initFAB;
window.toggleFabMenu = toggleFabMenu;
window.closeFabMenu = closeFabMenu;
window.STATUS_CONFIG = STATUS_CONFIG;
window.renderCompactVerificationCards = renderCompactVerificationCards;
