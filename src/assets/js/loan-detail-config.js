/**
 * Loan Detail Configuration
 * Unified configuration for rendering loan details for both students and admins
 */

const LOAN_DETAIL_CONFIG = {
    // Section visibility configuration
    sections: {
        header: {
            showFor: ['student', 'admin'],
            showForStatuses: '*' // All statuses
        },
        amountInfo: {
            showFor: ['student', 'admin'],
            showForStatuses: '*'
        },
        purpose: {
            showFor: ['student', 'admin'],
            showForStatuses: '*'
        },
        witnessesAdmin: {
            showFor: ['admin'], // Full contact info
            showForStatuses: ['pending', 'approved', 'disbursed', 'completed', 'defaulted']
        },
        witnessesStudent: {
            showFor: ['student'], // Names only
            showForStatuses: ['pending', 'approved', 'disbursed', 'completed']
        },
        dueDateStatus: {
            showFor: ['student', 'admin'],
            showForStatuses: ['disbursed', 'completed', 'defaulted', 'partially_paid']
        },
        disbursementInfo: {
            showFor: ['student', 'admin'], // Show for both per user request
            showForStatuses: ['disbursed', 'completed', 'defaulted', 'partially_paid']
        },
        loanHistory: {
            showFor: ['student', 'admin'], // Show last 5 loans with duration
            showForStatuses: '*'
        },
        adminMessages: {
            showFor: ['student'],
            showForStatuses: '*'
        },
        internalNotes: {
            showFor: ['admin'],
            showForStatuses: '*'
        },
        callLogs: {
            showFor: ['admin'],
            showForStatuses: ['disbursed', 'defaulted', 'partially_paid']
        },
        rejectionReason: {
            showFor: ['student', 'admin'],
            showForStatuses: ['rejected']
        },
        repaymentButton: {
            showFor: ['student'],
            showForStatuses: ['disbursed', 'partially_paid']
        },
        adminActions: {
            showFor: ['admin'],
            showForStatuses: '*' // Actual actions filtered by status
        }
    },

    // Status-based action buttons (admin only)
    statusActions: {
        pending: [
            { type: 'approve', label: 'Approve', style: 'primary', icon: 'check' },
            { type: 'reject', label: 'Reject', style: 'danger', icon: 'x' },
            { type: 'disburse', label: 'Disburse Directly', style: 'success', icon: 'send' }
        ],
        approved: [
            { type: 'disburse', label: 'Disburse Funds', style: 'primary', icon: 'send' }
        ],
        disbursed: [
            { type: 'extend', label: 'Extend Duration', style: 'secondary', icon: 'calendar' },
            { type: 'default', label: 'Mark as Defaulted', style: 'danger', icon: 'alert-triangle' }
        ],
        partially_paid: [
            { type: 'extend', label: 'Extend Duration', style: 'secondary', icon: 'calendar' }
        ],
        completed: [],
        rejected: [],
        defaulted: []
    },

    // Status badge configurations
    statusBadges: {
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'PENDING REVIEW' },
        approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'APPROVED' },
        disbursed: { bg: 'bg-green-100', text: 'text-green-700', label: 'DISBURSED' },
        partially_paid: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'PARTIALLY PAID' },
        completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'COMPLETED' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'REJECTED' },
        defaulted: { bg: 'bg-red-100', text: 'text-red-700', label: 'DEFAULTED' }
    }
};

// Helper: Check if section should be shown
function shouldShowSection(sectionKey, role, loanStatus) {
    const section = LOAN_DETAIL_CONFIG.sections[sectionKey];
    if (!section) return false;

    // Check role permission
    if (!section.showFor.includes(role)) return false;

    // Check status permission
    if (section.showForStatuses === '*') return true;
    return section.showForStatuses.includes(loanStatus);
}

// Helper: Get status badge classes
function getStatusBadge(status) {
    return LOAN_DETAIL_CONFIG.statusBadges[status] ||
        { bg: 'bg-slate-100', text: 'text-slate-700', label: status.toUpperCase() };
}

// Helper: Get actions for status
function getActionsForStatus(status) {
    return LOAN_DETAIL_CONFIG.statusActions[status] || [];
}

// Helper: Calculate comprehensive duration info
function calculateDurationInfo(loan) {
    const info = {
        daysRemaining: null,
        daysSinceDisbursement: null,
        totalDuration: null,
        originalDueDate: null,
        currentDueDate: null,
        extensions: loan.extensions || [],
        totalExtensions: (loan.extensions || []).length,
        totalDaysExtended: 0,
        isOverdue: false,
        daysOverdue: 0,
        score: 100
    };

    // Calculate total days extended
    info.extensions.forEach(ext => {
        info.totalDaysExtended += ext.daysExtended || 0;
    });

    // For completed/paid loans with saved payment duration
    if ((loan.status === 'completed' || loan.status === 'paid') && loan.paymentDuration) {
        info.daysRemaining = loan.paymentDuration.daysRemaining;
        info.paidOnTime = loan.paymentDuration.paidOnTime;
        
        // Calculate score for paid loans
        if (loan.paymentDuration.daysRemaining < 0) {
            info.daysOverdue = Math.abs(loan.paymentDuration.daysRemaining);
        }
        info.score = calculateLoanScore(info);
        return info;
    }

    // Get disbursement date
    if (!loan.disbursementInfo || !loan.disbursementInfo.disbursedAt) {
        return info;
    }

    const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
    const today = new Date();
    disbursedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Days since disbursement
    info.daysSinceDisbursement = Math.floor((today - disbursedDate) / (1000 * 60 * 60 * 24));

    // Original due date from loan application
    info.originalDueDate = loan.expectedDate || null;

    // Current due date (considering extensions)
    info.currentDueDate = loan.currentDueDate || loan.dueDate || loan.expectedDate;

    // Calculate days remaining from current due date
    if (info.currentDueDate) {
        const dueDate = new Date(info.currentDueDate);
        dueDate.setHours(0, 0, 0, 0);
        info.daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (info.daysRemaining < 0) {
            info.isOverdue = true;
            info.daysOverdue = Math.abs(info.daysRemaining);
        }
    } else {
        // Fallback: 60 days from disbursement
        info.daysRemaining = 60 - info.daysSinceDisbursement;
        if (info.daysRemaining < 0) {
            info.isOverdue = true;
            info.daysOverdue = Math.abs(info.daysRemaining);
        }
    }

    // For active loans, calculate score based on current status
    info.score = calculateLoanScore(info);

    return info;
}

// Helper: Calculate loan score (0-100, higher is better)
// Score is based on whether user pays within the allowed time (including extensions)
// Extensions don't reduce score - only paying late after extended due date does
function calculateLoanScore(durationInfo) {
    let score = 100;

    // Only deduct points if overdue from CURRENT due date (after extensions)
    // Extensions are allowed, so we don't penalize for using them
    if (durationInfo.daysOverdue > 0) {
        // Deduct 3 points per day overdue from current/extended due date (max 60 points)
        score -= Math.min(60, durationInfo.daysOverdue * 3);
    }

    // If paid on time (within current due date), keep full score regardless of extensions
    if (durationInfo.paidOnTime) {
        score = 100;
    }

    return Math.max(0, Math.min(100, score));
}

// Helper: Get score badge
function getScoreBadge(score) {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Fair' };
    if (score >= 20) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Poor' };
    return { bg: 'bg-red-100', text: 'text-red-700', label: 'Bad' };
}

// Helper: Calculate days remaining (legacy - for backward compatibility)
function calculateDaysRemaining(loan) {
    const info = calculateDurationInfo(loan);
    return info.daysRemaining;
}

// Helper: Format days remaining as HTML
function formatDaysRemaining(daysRemaining) {
    if (daysRemaining === null) {
        return '<span class="text-slate-500">N/A</span>';
    }

    if (daysRemaining > 7) {
        return `<span class="font-medium text-green-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
    } else if (daysRemaining > 0) {
        return `<span class="font-medium text-amber-600">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left</span>`;
    } else if (daysRemaining === 0) {
        return '<span class="font-medium text-amber-600">Due Today</span>';
    } else {
        const overdue = Math.abs(daysRemaining);
        return `<span class="font-medium text-red-600">${overdue} day${overdue !== 1 ? 's' : ''} overdue</span>`;
    }
}

// Helper: Format timestamp
function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper: Format date only
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Expose to window
window.LOAN_DETAIL_CONFIG = LOAN_DETAIL_CONFIG;
window.shouldShowSection = shouldShowSection;
window.getStatusBadge = getStatusBadge;
window.getActionsForStatus = getActionsForStatus;
window.calculateDaysRemaining = calculateDaysRemaining;
window.calculateDurationInfo = calculateDurationInfo;
window.calculateLoanScore = calculateLoanScore;
window.getScoreBadge = getScoreBadge;
window.formatDaysRemaining = formatDaysRemaining;
window.formatTimestamp = formatTimestamp;
window.formatDate = formatDate;
