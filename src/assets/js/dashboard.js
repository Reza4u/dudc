/**
 * Dashboard Logic
 * Handles dynamic view rendering
 */

let contentArea;
const navItems = document.querySelectorAll('.nav-item');

// =============== TOAST NOTIFICATION ===============
function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast) return;

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    if (type === 'success') {
        toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600';
        toastIcon.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i>';
    } else if (type === 'error') {
        toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600';
        toastIcon.innerHTML = '<i data-lucide="x-circle" class="w-6 h-6"></i>';
    } else if (type === 'info') {
        toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600';
        toastIcon.innerHTML = '<i data-lucide="info" class="w-6 h-6"></i>';
    } else if (type === 'warning') {
        toastIcon.className = 'w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600';
        toastIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i>';
    }
    
    if (window.lucide) lucide.createIcons();

    toast.classList.remove('translate-y-full', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('translate-y-full', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }
}

// =============== LOGOUT MODAL ===============
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function confirmLogout() {
    showToast('info', 'Logging out...', 'You will be redirected shortly');
    setTimeout(() => {
        auth.logout();
    }, 1000);
}

// =============== NOTIFICATIONS ===============
function getNotifications(user) {
    const notifications = [];
    const loans = window.db.getLoansByUserId(user.id);
    
    // Check for loan status updates
    loans.forEach(loan => {
        // Loan Applied/Pending
        if (loan.status === 'pending') {
            notifications.push({
                id: 'notif-' + loan.id + '-pending',
                type: 'info',
                icon: 'send',
                title: 'Loan Application Submitted',
                message: `Your loan request for ৳${loan.amount} is under review.`,
                time: loan.appliedAt,
                read: true // Already seen when applied
            });
        }
        
        // Loan Approved
        if (loan.status === 'approved' || loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') {
            notifications.push({
                id: 'notif-' + loan.id + '-approved',
                type: 'success',
                icon: 'check-circle',
                title: 'Loan Approved!',
                message: `Your loan of ৳${loan.amount} has been approved.${loan.adminNote ? ' Note: ' + loan.adminNote : ''}`,
                time: loan.approvedAt || loan.appliedAt,
                read: loan.notifRead?.approved || false
            });
        }
        
        // Loan Disbursed
        if (loan.status === 'disbursed' || loan.status === 'partially_paid' || loan.status === 'paid') {
            notifications.push({
                id: 'notif-' + loan.id + '-disbursed',
                type: 'info',
                icon: 'banknote',
                title: 'Money Disbursed',
                message: `৳${loan.amount} has been sent to your account.${loan.disbursementInfo?.note ? ' Note: ' + loan.disbursementInfo.note : ''}`,
                time: loan.disbursementInfo?.disbursedAt || loan.approvedAt || loan.appliedAt,
                read: loan.notifRead?.disbursed || false
            });
        }
        
        // Loan Rejected
        if (loan.status === 'rejected') {
            notifications.push({
                id: 'notif-' + loan.id + '-rejected',
                type: 'error',
                icon: 'x-circle',
                title: 'Loan Rejected',
                message: loan.rejectionReason || 'Your loan application was not approved. Please contact admin for details.',
                time: loan.rejectedAt || loan.appliedAt,
                read: loan.notifRead?.rejected || false
            });
        }
        
        // Loan Fully Paid
        if (loan.status === 'paid') {
            notifications.push({
                id: 'notif-' + loan.id + '-paid',
                type: 'success',
                icon: 'party-popper',
                title: 'Loan Fully Paid!',
                message: `Congratulations! You have fully repaid your loan of ৳${loan.amount}.`,
                time: loan.paidAt || new Date().toISOString(),
                read: loan.notifRead?.paid || false
            });
        }
        
        // Admin Messages on Loan
        if (loan.adminMessages && loan.adminMessages.length > 0) {
            loan.adminMessages.forEach((msg, idx) => {
                notifications.push({
                    id: 'notif-' + loan.id + '-adminmsg-' + idx,
                    type: 'info',
                    icon: 'message-circle',
                    title: 'Message from Admin',
                    message: msg.message,
                    time: msg.sentAt,
                    read: msg.read || false
                });
            });
        }
        
        // Due date reminder (7 days before)
        if ((loan.status === 'disbursed' || loan.status === 'partially_paid') && loan.dueDate) {
            const dueDate = new Date(loan.currentDueDate || loan.dueDate);
            const now = new Date();
            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue <= 7 && daysUntilDue >= 0) {
                notifications.push({
                    id: 'notif-' + loan.id + '-duereminder',
                    type: 'warning',
                    icon: 'clock',
                    title: 'Payment Reminder',
                    message: `Your loan payment of ৳${loan.amount} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
                    time: new Date().toISOString(),
                    read: false
                });
            } else if (daysUntilDue < 0) {
                notifications.push({
                    id: 'notif-' + loan.id + '-overdue',
                    type: 'error',
                    icon: 'alert-triangle',
                    title: 'Payment Overdue!',
                    message: `Your loan payment is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue. Please pay immediately.`,
                    time: new Date().toISOString(),
                    read: false
                });
            }
        }
        
        // Extension granted
        if (loan.extensions && loan.extensions.length > 0) {
            loan.extensions.forEach((ext, idx) => {
                notifications.push({
                    id: 'notif-' + loan.id + '-extension-' + idx,
                    type: 'info',
                    icon: 'calendar-plus',
                    title: 'Due Date Extended',
                    message: `Your due date has been extended to ${new Date(ext.newDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}.${ext.reason ? ' Reason: ' + ext.reason : ''}`,
                    time: ext.grantedAt,
                    read: ext.notifRead || false
                });
            });
        }
    });
    
    // Repayment verified notifications
    const repayments = window.db.getRepayments().filter(r => r.userId === user.id);
    repayments.forEach(repayment => {
        if (repayment.status === 'verified') {
            notifications.push({
                id: 'notif-repayment-' + repayment.id + '-verified',
                type: 'success',
                icon: 'badge-check',
                title: 'Payment Verified',
                message: `Your payment of ৳${repayment.amount} has been verified.`,
                time: repayment.verifiedAt || repayment.submittedAt,
                read: repayment.notifRead || false
            });
        }
        if (repayment.status === 'rejected') {
            notifications.push({
                id: 'notif-repayment-' + repayment.id + '-rejected',
                type: 'error',
                icon: 'x-circle',
                title: 'Payment Rejected',
                message: `Your payment of ৳${repayment.amount} was rejected.${repayment.rejectionReason ? ' Reason: ' + repayment.rejectionReason : ''}`,
                time: repayment.rejectedAt || repayment.submittedAt,
                read: repayment.notifRead || false
            });
        }
    });
    
    // Verification status notifications
    if (user.verificationStatus === 'verified') {
        notifications.push({
            id: 'notif-verified',
            type: 'success',
            icon: 'shield-check',
            title: 'Account Verified!',
            message: 'Your account has been verified. You can now apply for loans.',
            time: user.verifiedAt || new Date().toISOString(),
            read: user.notifRead?.verified || false
        });
    }
    
    if (user.verificationStatus === 'rejected') {
        notifications.push({
            id: 'notif-verification-rejected',
            type: 'error',
            icon: 'shield-x',
            title: 'Verification Rejected',
            message: user.rejectionReason || 'Your verification was not approved. Please resubmit.',
            time: user.rejectedAt || new Date().toISOString(),
            read: user.notifRead?.verificationRejected || false
        });
    }
    
    if (user.verificationStatus === 'blocked') {
        notifications.push({
            id: 'notif-blocked',
            type: 'error',
            icon: 'ban',
            title: 'Account Blocked',
            message: user.blockReason || 'Your account has been blocked. Contact admin.',
            time: user.blockedAt || new Date().toISOString(),
            read: false
        });
    }
    
    // Sort by time (newest first)
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return notifications;
}

function showNotifications() {
    const panel = document.getElementById('notificationsPanel');
    const list = document.getElementById('notificationsList');
    const user = window.db.getCurrentUser();
    
    if (!panel || !list) return;
    
    const notifications = getNotifications(user);
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="bell-off" class="w-8 h-8 text-slate-400"></i>
                </div>
                <p class="text-slate-500">No notifications yet</p>
            </div>
        `;
    } else {
        list.innerHTML = notifications.map(notif => {
            const iconColors = {
                success: 'bg-green-100 text-green-600',
                error: 'bg-red-100 text-red-600',
                warning: 'bg-amber-100 text-amber-600',
                info: 'bg-blue-100 text-blue-600'
            };
            
            const timeAgo = getTimeAgo(new Date(notif.time));
            
            return `
                <div class="p-4 rounded-xl border ${notif.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}">
                    <div class="flex gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[notif.type]}">
                            <i data-lucide="${notif.icon}" class="w-5 h-5"></i>
                        </div>
                        <div class="flex-1">
                            <p class="font-semibold text-slate-900">${notif.title}</p>
                            <p class="text-sm text-slate-600 mt-1">${notif.message}</p>
                            <p class="text-xs text-slate-400 mt-2">${timeAgo}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    panel.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function closeNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

function updateNotificationBadge(user) {
    const notifications = getNotifications(user);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('mobileNotifBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
            badge.classList.add('flex');
        } else {
            badge.classList.add('hidden');
            badge.classList.remove('flex');
        }
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// =============== ISLAMIC GREETING ===============
function getIslamicGreeting() {
    return 'Assalamu Alaikum';
}

// =============== STATS CALCULATION ===============
function getUserStats(user) {
    const loans = window.db.getLoansByUserId(user.id);
    const repayments = window.db.getRepayments().filter(r => r.userId === user.id && r.status === 'verified');
    
    const totalBorrowed = loans
        .filter(l => l.status === 'disbursed' || l.status === 'partially_paid' || l.status === 'paid')
        .reduce((sum, l) => sum + parseInt(l.amount || 0), 0);
    
    const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
    
    const completedLoans = loans.filter(l => l.status === 'paid').length;
    const activeLoans = loans.filter(l => l.status === 'disbursed' || l.status === 'partially_paid').length;
    
    return {
        totalBorrowed,
        totalRepaid,
        completedLoans,
        activeLoans,
        totalLoans: loans.length
    };
}

function setActiveNav(viewName) {
    // Desktop sidebar nav
    navItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(viewName)) {
            item.classList.add('bg-gradient-to-r', 'from-primary/10', 'to-secondary/10', 'text-primary', 'border-l-4', 'border-primary');
            item.classList.remove('text-slate-600');
        } else {
            item.classList.remove('bg-gradient-to-r', 'from-primary/10', 'to-secondary/10', 'text-primary', 'border-l-4', 'border-primary');
            item.classList.add('text-slate-600');
        }
    });
    
    // Mobile bottom nav
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('text-primary');
            item.classList.remove('text-slate-500');
        } else {
            item.classList.remove('text-primary');
            item.classList.add('text-slate-500');
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

// --- All View Render Functions ---

function renderSettings(user) {
    const greeting = getIslamicGreeting();
    
    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto pb-24 md:pb-8">
            <!-- Header with Greeting -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="settings" class="w-6 h-6 text-primary"></i>
                    Profile Settings
                </h2>
                <p class="text-slate-500 mt-1">Manage your account information</p>
            </div>
            
            <!-- Profile Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <!-- Profile Header -->
                <div class="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold">${user.name}</h3>
                            <p class="text-white/80 text-sm">${user.email}</p>
                            <span class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                                <i data-lucide="${user.verificationStatus === 'verified' ? 'check-circle' : 'clock'}" class="w-3 h-3"></i>
                                ${user.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Form Fields -->
                <div class="p-6 space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <div class="relative">
                                <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="text" id="settingsName" value="${user.name}" 
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <div class="relative">
                                <i data-lucide="mail" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="email" value="${user.email}" disabled 
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 outline-none cursor-not-allowed">
                            </div>
                            <p class="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <div class="relative">
                                <i data-lucide="phone" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="text" id="settingsPhone" value="${user.phone || ''}" placeholder="+8801XXXXXXXXX" 
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">Registration No</label>
                            <div class="relative">
                                <i data-lucide="hash" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="text" value="${user.regNo || 'Not provided'}" disabled 
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 outline-none cursor-not-allowed">
                            </div>
                        </div>
                    </div>

                    <!-- Security Section -->
                    <div class="pt-6 border-t border-slate-100">
                        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i data-lucide="shield" class="w-5 h-5 text-primary"></i>
                            Security
                        </h3>
                        <div class="bg-slate-50 rounded-xl p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-medium text-slate-800">Password</p>
                                    <p class="text-sm text-slate-500">Last changed: Never</p>
                                </div>
                                <button onclick="showChangePasswordModal()" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Save Button -->
                    <div class="pt-4">
                        <button onclick="saveSettings()" id="saveSettingsBtn" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-5 h-5"></i>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Danger Zone -->
            <div class="mt-6 bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                <h3 class="font-bold text-red-600 mb-2 flex items-center gap-2">
                    <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                    Danger Zone
                </h3>
                <p class="text-sm text-slate-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button class="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                    Delete Account
                </button>
            </div>
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
}

// Settings save function
function saveSettings() {
    const name = document.getElementById('settingsName')?.value?.trim();
    const phone = document.getElementById('settingsPhone')?.value?.trim();
    const btn = document.getElementById('saveSettingsBtn');
    
    if (!name) {
        showToast('error', 'Error', 'Name cannot be empty');
        return;
    }
    
    // Show loading state
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> Saving...';
    }
    
    // Simulate save delay
    setTimeout(() => {
        const user = window.db.getCurrentUser();
        user.name = name;
        user.phone = phone;
        window.db.updateUser(user);
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Saved!';
            btn.classList.remove('bg-primary');
            btn.classList.add('bg-green-500');
            if (window.lucide) lucide.createIcons();
        }
        
        showToast('success', 'Success', 'Your profile has been updated');
        
        // Reset button after delay
        setTimeout(() => {
            if (btn) {
                btn.innerHTML = '<i data-lucide="save" class="w-5 h-5"></i> Save Changes';
                btn.classList.remove('bg-green-500');
                btn.classList.add('bg-primary');
                if (window.lucide) lucide.createIcons();
            }
        }, 2000);
    }, 1000);
}

function showChangePasswordModal() {
    showToast('info', 'Coming Soon', 'Password change feature will be available soon');
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
    const verificationStatus = user.verificationStatus || (user.isVerified ? 'verified' : 'incomplete');

    if (verificationStatus === 'verified') {
        statusCard = `
            <div class="bg-green-50 border border-green-100 px-4 py-3 rounded-xl flex items-center gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                </div>
                <span class="text-sm font-semibold text-green-700">Account Verified</span>
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
    } else if (verificationStatus === 'pending') {
        // Form submitted, waiting for admin review
        statusCard = `
            <div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i data-lucide="clock" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-blue-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-blue-700">Under Review</h3>
                    <p class="text-sm text-blue-600 mt-1">Your verification is being reviewed. Usually takes 24 hours.</p>
                </div>
            </div>`;
    } else {
        // 'incomplete' - registered but hasn't submitted verification form yet
        statusCard = `
            <div class="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <i data-lucide="alert-circle" class="w-6 h-6"></i>
                </div>
                <div>
                    <p class="text-sm text-amber-600 font-medium">Account Status</p>
                    <h3 class="text-xl font-bold text-amber-700">Verification Required</h3>
                    <p class="text-sm text-amber-600 mt-1">Complete your verification to apply for loans.</p>
                </div>
                <button onclick="renderView('verification')" class="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition">Start Now</button>
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
        // Use currentDueDate (after extensions) if available, otherwise fallback to dueDate
        let dueDateDisplay = 'TBD';
        let statusIndicator = '';

        const effectiveDueDate = activeLoan.currentDueDate || activeLoan.dueDate;
        if (isDisbursed && effectiveDueDate) {
            const dueDate = new Date(effectiveDueDate);
            dueDateDisplay = dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            // Calculate days remaining from current/extended due date
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
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
                    ${activeLoan.extensions && activeLoan.extensions.length > 0 ? `
                        <span class="text-xs text-slate-500">(Extended ${activeLoan.extensions.length}x)</span>
                    ` : ''}
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
                    ${effectiveDueDate ? `
                        <div class="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                            <div>
                                <p class="text-xs text-blue-600 font-medium">Due Date${activeLoan.extensions && activeLoan.extensions.length > 0 ? ' (Extended)' : ''}</p>
                                <p class="text-sm font-bold text-blue-900">${new Date(effectiveDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div class="text-right">
                                ${(() => {
                        const dueDate = new Date(effectiveDueDate);
                        const now = new Date();
                        dueDate.setHours(0, 0, 0, 0);
                        now.setHours(0, 0, 0, 0);
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
                
                ${(() => {
                    // Check for pending repayment - show warning but still allow new repayment
                    const pendingRepayment = window.db.getRepayments().find(r => r.loanId === activeLoan.id && r.status === 'pending');
                    const rejectedRepayments = window.db.getRepayments().filter(r => r.loanId === activeLoan.id && r.status === 'rejected');
                    let pendingWarning = '';
                    let rejectedWarning = '';
                    
                    if (pendingRepayment) {
                        pendingWarning = `
                            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="clock" class="w-4 h-4 text-amber-600 flex-shrink-0"></i>
                                    <p class="text-sm text-amber-800">
                                        <span class="font-semibold">৳${pendingRepayment.amount}</span> pending verification
                                    </p>
                                </div>
                            </div>
                        `;
                    }
                    
                    // Show rejected repayment warning with reason
                    if (rejectedRepayments.length > 0) {
                        const latestRejected = rejectedRepayments[rejectedRepayments.length - 1];
                        rejectedWarning = `
                            <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                                <div class="flex items-start gap-2">
                                    <i data-lucide="x-circle" class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"></i>
                                    <div>
                                        <p class="text-sm text-red-800 font-medium">
                                            Payment of ৳${latestRejected.amount} was rejected
                                        </p>
                                        ${latestRejected.rejectionReason ? `
                                            <p class="text-xs text-red-600 mt-1">
                                                <span class="font-medium">Reason:</span> ${latestRejected.rejectionReason}
                                            </p>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    if (isDisbursed) {
                        return `
                            ${rejectedWarning}
                            ${pendingWarning}
                            <button onclick="event.stopPropagation(); renderView('repayment');" class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5">
                                ${isPartiallyPaid ? `Pay Remaining ৳${remaining}` : 'Repay Now'}
                            </button>
                        `;
                    } else {
                        return `
                            <button disabled class="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium cursor-not-allowed">
                                <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i> Waiting for Disbursement
                            </button>
                            <p class="text-xs text-center text-slate-500 mt-2">Admin will confirm when money is sent.</p>
                        `;
                    }
                })()}
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

    // Get stats and greeting
    const stats = getUserStats(user);
    const greeting = getIslamicGreeting();
    
    contentArea.innerHTML = `
        <div class="pb-24 md:pb-8">
            <!-- Greeting Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div class="flex items-center gap-2">
                    <i data-lucide="moon-star" class="w-6 h-6 text-primary"></i>
                    <h2 class="text-2xl font-bold text-slate-800">${greeting}, ${user.name.split(' ')[0]}</h2>
                </div>
                ${verificationStatus === 'verified' ? statusCard : ''}
            </div>
            
            <!-- Quick Stats Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i data-lucide="banknote" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500">Total Borrowed</p>
                            <p class="text-lg font-bold text-slate-900">৳${stats.totalBorrowed.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <i data-lucide="wallet" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500">Total Repaid</p>
                            <p class="text-lg font-bold text-green-600">৳${stats.totalRepaid.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <i data-lucide="file-check" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500">Completed</p>
                            <p class="text-lg font-bold text-blue-600">${stats.completedLoans}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500">Active Loans</p>
                            <p class="text-lg font-bold text-amber-600">${stats.activeLoans}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Main Cards -->
            ${verificationStatus !== 'verified' ? `
            <div class="grid md:grid-cols-2 gap-6 mb-6">
                ${statusCard}
                ${loanCard}
            </div>
            ` : `
            <div class="mb-6">
                ${loanCard}
            </div>
            `}
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i data-lucide="zap" class="w-5 h-5 text-primary"></i>
                    Quick Actions
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onclick="renderView('loan-request')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition group" ${!user.isVerified ? 'disabled title="Verify first"' : ''}>
                        <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-primary group-hover:bg-primary/10 transition">
                            <i data-lucide="hand-coins" class="w-6 h-6"></i>
                        </div>
                        <span class="text-sm font-medium text-slate-700 group-hover:text-primary">Apply Loan</span>
                    </button>
                    <button onclick="renderView('repayment')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-600 transition group">
                        <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-green-600 group-hover:bg-green-100 transition">
                            <i data-lucide="credit-card" class="w-6 h-6"></i>
                        </div>
                        <span class="text-sm font-medium text-slate-700 group-hover:text-green-600">Pay Now</span>
                    </button>
                    <button onclick="renderView('history')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition group">
                        <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-100 transition">
                            <i data-lucide="history" class="w-6 h-6"></i>
                        </div>
                        <span class="text-sm font-medium text-slate-700 group-hover:text-blue-600">Loan History</span>
                    </button>
                    <button onclick="renderView('settings')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition group">
                        <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-purple-600 group-hover:bg-purple-100 transition">
                            <i data-lucide="settings" class="w-6 h-6"></i>
                        </div>
                        <span class="text-sm font-medium text-slate-700 group-hover:text-purple-600">Settings</span>
                    </button>
                </div>
            </div>
            
            <!-- Notifications & Recent History Grid -->
            <div class="grid md:grid-cols-2 gap-6 mt-6">
                <!-- Recent Notifications -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-slate-800 flex items-center gap-2">
                            <i data-lucide="bell" class="w-5 h-5 text-primary"></i>
                            Recent Notifications
                        </h3>
                        <button onclick="showNotifications()" class="text-sm text-primary hover:underline">View All</button>
                    </div>
                    ${renderDashboardNotifications(user)}
                </div>
                
                <!-- Recent Loan History -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-slate-800 flex items-center gap-2">
                            <i data-lucide="history" class="w-5 h-5 text-primary"></i>
                            Recent Loan History
                        </h3>
                        <button onclick="renderView('history')" class="text-sm text-primary hover:underline">View All</button>
                    </div>
                    ${renderRecentLoanHistory(user)}
                </div>
            </div>
        </div>
    `;
    
    // Update notification badge
    updateNotificationBadge(user);
}

// Render dashboard notifications (last 5)
function renderDashboardNotifications(user) {
    const notifications = getNotifications(user).slice(0, 5);
    
    if (notifications.length === 0) {
        return `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="bell-off" class="w-6 h-6 text-slate-400"></i>
                </div>
                <p class="text-slate-500 text-sm">No notifications yet</p>
            </div>
        `;
    }
    
    const iconColors = {
        success: 'bg-green-100 text-green-600',
        error: 'bg-red-100 text-red-600',
        warning: 'bg-amber-100 text-amber-600',
        info: 'bg-blue-100 text-blue-600'
    };
    
    return `
        <div class="space-y-3">
            ${notifications.map(notif => `
                <div class="flex items-start gap-3 p-3 rounded-xl ${notif.read ? 'bg-white' : 'bg-blue-50'} border border-slate-100 hover:border-slate-200 transition">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[notif.type]}">
                        <i data-lucide="${notif.icon}" class="w-4 h-4"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-slate-800 text-sm">${notif.title}</p>
                        <p class="text-xs text-slate-500 truncate">${notif.message}</p>
                        <p class="text-xs text-slate-400 mt-1">${getTimeAgo(new Date(notif.time))}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render recent loan history (last 5)
function renderRecentLoanHistory(user) {
    const loans = window.db.getLoansByUserId(user.id)
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);
    
    if (loans.length === 0) {
        return `
            <div class="text-center py-8">
                <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="file-x" class="w-6 h-6 text-slate-400"></i>
                </div>
                <p class="text-slate-500 text-sm">No loan history yet</p>
                <button onclick="renderView('loan-request')" class="mt-3 text-sm text-primary hover:underline">Apply for your first loan</button>
            </div>
        `;
    }
    
    const statusConfig = {
        pending: { color: 'bg-amber-100 text-amber-700', icon: 'clock', label: 'Pending' },
        approved: { color: 'bg-blue-100 text-blue-700', icon: 'check', label: 'Approved' },
        disbursed: { color: 'bg-green-100 text-green-700', icon: 'banknote', label: 'Active' },
        partially_paid: { color: 'bg-purple-100 text-purple-700', icon: 'pie-chart', label: 'Partial' },
        paid: { color: 'bg-emerald-100 text-emerald-700', icon: 'check-circle', label: 'Paid' },
        rejected: { color: 'bg-red-100 text-red-700', icon: 'x-circle', label: 'Rejected' }
    };
    
    return `
        <div class="space-y-3">
            ${loans.map(loan => {
                const config = statusConfig[loan.status] || statusConfig.pending;
                const date = new Date(loan.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
                    <div onclick="window.currentLoanId='${loan.id}'; renderView('loan-detail');" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                        <div class="w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0">
                            <i data-lucide="${config.icon}" class="w-5 h-5"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="font-semibold text-slate-800">৳${parseInt(loan.amount).toLocaleString()}</p>
                                <span class="text-xs px-2 py-0.5 rounded-full ${config.color}">${config.label}</span>
                            </div>
                            <p class="text-xs text-slate-500">${date} • ${loan.purpose || 'General'}</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderVerification(user) {
    if (user.verificationStatus === 'blocked') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10 pb-24">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                    <i data-lucide="shield-ban" class="w-10 h-10"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">Account Blocked</h2>
                <p class="text-slate-600 mb-4">Your account has been temporarily blocked.</p>
                ${user.blockReason ? `<p class="text-red-600 font-medium bg-red-50 p-3 rounded-lg inline-block">Reason: ${user.blockReason}</p>` : ''}
                <p class="text-slate-500 mt-4">Please contact the administrator for more information.</p>
            </div>`;
        return;
    }

    if (user.isVerified && user.verificationStatus !== 'rejected') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10 pb-24">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                    <i data-lucide="shield-check" class="w-10 h-10"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">You are Verified!</h2>
                <p class="text-slate-600 mb-6">Your account is fully verified. You can now apply for loans.</p>
                <button onclick="renderView('loan-request')" class="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition">
                    Apply for Loan
                </button>
            </div>`;
        return;
    }

    if (user.verificationStatus === 'pending') {
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center pt-10 pb-24">
                <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <i data-lucide="clock" class="w-10 h-10"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 mb-2">Verification Under Review</h2>
                <p class="text-slate-600 mb-4">Your verification form has been submitted successfully.</p>
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 inline-flex items-center gap-2">
                    <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
                    <p class="text-blue-700">Our team is reviewing your submission. This usually takes 24 hours.</p>
                </div>
            </div>`;
        return;
    }

    // DU Halls list
    const duHalls = [
        'Salimullah Muslim Hall',
        'Jagannath Hall', 
        'Fazlul Huq Muslim Hall',
        'Shahidullah Hall',
        'Muktijoddha Ziaur Rahman Hall',
        'Haji Muhammad Mohsin Hall',
        'Kabi Jasimuddin Hall',
        'A.F. Rahman Hall',
        'Bijoy Ekattor Hall',
        'Bangabandhu Sheikh Mujibur Rahman Hall',
        'Rokeya Hall',
        'Shamsunnahar Hall',
        'Kabi Sufia Kamal Hall',
        'Bangamata Sheikh Fazilatunnesa Mujib Hall',
        'Bangladesh-Kuwait Maitree Hall',
        'Amar Ekushey Hall',
        'Sergeant Zahurul Haque Hall',
        'Sir P.J. Hartog International Hall',
        'Nawab Faizunnesa Chowdhurani Hall',
        'Non-residential'
    ];

    // DU Departments/Faculties
    const duDepartments = [
        // Faculty of Arts
        'Bangla', 'English', 'Arabic', 'Persian & Urdu', 'Sanskrit & Pali', 'Philosophy', 
        'History', 'Islamic History & Culture', 'Islamic Studies', 'Music', 'Theatre & Performance Studies',
        'Linguistics', 'World Religions & Culture',
        // Faculty of Science
        'Physics', 'Mathematics', 'Chemistry', 'Statistics', 'Biomedical Physics & Technology',
        'Theoretical Physics', 'Oceanography', 'Nuclear Engineering', 'Applied Mathematics',
        // Faculty of Biological Sciences
        'Botany', 'Zoology', 'Biochemistry & Molecular Biology', 'Microbiology', 
        'Genetic Engineering & Biotechnology', 'Psychology', 'Soil, Water & Environment',
        'Fisheries', 'Clinical Psychology', 'Educational & Counselling Psychology',
        // Faculty of Business Studies
        'Accounting & Information Systems', 'Finance', 'Management', 'Marketing', 
        'Banking & Insurance', 'Management Information Systems', 'Tourism & Hospitality Management',
        'International Business', 'Organization Strategy & Leadership',
        // Faculty of Social Sciences  
        'Economics', 'Political Science', 'Sociology', 'Public Administration',
        'International Relations', 'Anthropology', 'Mass Communication & Journalism',
        'Population Sciences', 'Peace & Conflict Studies', 'Women & Gender Studies',
        'Development Studies', 'Criminology', 'Communication Disorders', 'Television, Film & Photography',
        'Printing & Publication Studies', 'Japanese Studies',
        // Faculty of Law
        'Law',
        // Faculty of Earth & Environmental Sciences
        'Geography & Environment', 'Geology', 'Disaster Science & Management',
        'Meteorology', 'Environmental Sciences',
        // Faculty of Engineering & Technology
        'Electrical & Electronic Engineering', 'Computer Science & Engineering',
        'Applied Chemistry & Chemical Engineering', 'Robotics & Mechatronics Engineering',
        // Faculty of Pharmacy
        'Pharmacy', 'Clinical Pharmacy & Pharmacology', 'Pharmaceutical Technology',
        // Faculty of Fine Arts
        'Drawing & Painting', 'Sculpture', 'Printmaking', 'Graphic Design',
        'Oriental Art', 'Ceramics & Glass', 'Crafts', 'History of Art',
        // Others
        'Institute of Education & Research (IER)', 'Institute of Business Administration (IBA)',
        'Institute of Social Welfare & Research', 'Institute of Nutrition & Food Science',
        'Institute of Statistical Research & Training (ISRT)', 'Institute of Modern Languages (IML)',
        'Institute of Health Economics', 'Institute of Disaster Management & Vulnerability Studies',
        'Institute of Leather Engineering & Technology', 'Textile Engineering College',
        'Other'
    ].sort();

    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto pb-24 md:pb-8">
            ${user.verificationStatus === 'rejected' ? `
                <div class="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-red-900">Verification Rejected</h3>
                        <p class="text-red-700 text-sm mt-1">Your previous request was rejected.</p>
                        ${user.rejectionReason ? `<p class="text-red-800 text-sm font-medium mt-2 bg-white p-2 rounded-lg border border-red-100">Reason: ${user.rejectionReason}</p>` : ''}
                    </div>
                </div>
            ` : ''}
            
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="shield-check" class="w-6 h-6 text-primary"></i>
                    Account Verification
                </h2>
                <p class="text-slate-500 mt-1">Complete verification to apply for loans</p>
            </div>

            <!-- Progress Steps -->
            <div class="flex items-center justify-center gap-4 mb-8">
                <div class="flex items-center gap-2">
                    <div id="step1Indicator" class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                    <span class="text-sm font-medium text-slate-700 hidden sm:inline">Payment</span>
                </div>
                <div class="w-12 h-0.5 bg-slate-200" id="stepConnector"></div>
                <div class="flex items-center gap-2">
                    <div id="step2Indicator" class="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">2</div>
                    <span class="text-sm font-medium text-slate-400 hidden sm:inline">Details</span>
                </div>
            </div>

            <!-- Step 1: Payment -->
            <div id="verifyStep1" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                    <h3 class="font-bold flex items-center gap-2">
                        <i data-lucide="credit-card" class="w-5 h-5"></i>
                        Step 1: Verification Fee
                    </h3>
                </div>
                <div class="p-5">
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg">
                                ৳100
                            </div>
                            <div>
                                <p class="font-semibold text-amber-900">One-time Fee</p>
                                <p class="text-sm text-amber-700">Non-refundable verification charge</p>
                            </div>
                        </div>
                    </div>

                    <p class="text-slate-600 mb-4 text-sm">Send <strong>100 BDT</strong> to any of these numbers:</p>
                    
                    <div class="space-y-3 mb-5">
                        <div class="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                            <div class="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">bKash</div>
                            <div>
                                <p class="font-semibold text-slate-800">01671-XXXXXX</p>
                                <p class="text-xs text-slate-500">Personal (Send Money)</p>
                            </div>
                            <button onclick="navigator.clipboard.writeText('01671XXXXXX'); showToast('success', 'Copied!', 'Number copied to clipboard')" class="ml-auto p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                            <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">Nagad</div>
                            <div>
                                <p class="font-semibold text-slate-800">01671-XXXXXX</p>
                                <p class="text-xs text-slate-500">Personal (Send Money)</p>
                            </div>
                            <button onclick="navigator.clipboard.writeText('01671XXXXXX'); showToast('success', 'Copied!', 'Number copied to clipboard')" class="ml-auto p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition">
                                <i data-lucide="copy" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Payment Method <span class="text-red-500">*</span></label>
                            <div class="grid grid-cols-3 gap-3">
                                <label class="relative">
                                    <input type="radio" name="paymentMethod" value="bKash" class="peer sr-only" required>
                                    <div class="p-3 border-2 border-slate-200 rounded-xl text-center cursor-pointer peer-checked:border-pink-500 peer-checked:bg-pink-50 transition">
                                        <span class="font-semibold text-sm text-slate-700">bKash</span>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="paymentMethod" value="Nagad" class="peer sr-only">
                                    <div class="p-3 border-2 border-slate-200 rounded-xl text-center cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-50 transition">
                                        <span class="font-semibold text-sm text-slate-700">Nagad</span>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="paymentMethod" value="Rocket" class="peer sr-only">
                                    <div class="p-3 border-2 border-slate-200 rounded-xl text-center cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 transition">
                                        <span class="font-semibold text-sm text-slate-700">Rocket</span>
                                    </div>
                                </label>
                            </div>
                            <p id="paymentMethodError" class="text-red-500 text-xs mt-1 hidden">Please select payment method</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Transaction ID (TrxID) <span class="text-red-500">*</span></label>
                            <div class="relative">
                                <input type="text" id="verifyTrxId" required minlength="8" maxlength="20"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="e.g. ABC123XYZ">
                                <div id="trxIdStatus" class="absolute right-3 top-1/2 -translate-y-1/2 hidden">
                                    <i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>
                                </div>
                            </div>
                            <p id="trxIdError" class="text-red-500 text-xs mt-1 hidden">TrxID must be 8-20 characters</p>
                        </div>
                    </div>

                    <button type="button" onclick="goToStep2()" class="w-full mt-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition flex items-center justify-center gap-2">
                        Continue to Details
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Personal Details -->
            <div id="verifyStep2" class="hidden">
                <form id="verificationForm" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div class="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                        <h3 class="font-bold flex items-center gap-2">
                            <i data-lucide="user" class="w-5 h-5"></i>
                            Step 2: Personal Details
                        </h3>
                    </div>
                    <div class="p-5 space-y-5">
                        <!-- Family Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Father's Name <span class="text-red-500">*</span></label>
                                <input type="text" id="fatherName" required minlength="3"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="Enter father's name">
                                <p id="fatherNameError" class="text-red-500 text-xs mt-1 hidden">Please enter valid name</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Mother's Name <span class="text-red-500">*</span></label>
                                <input type="text" id="motherName" required minlength="3"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="Enter mother's name">
                                <p id="motherNameError" class="text-red-500 text-xs mt-1 hidden">Please enter valid name</p>
                            </div>
                        </div>

                        <!-- Academic Info -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Department <span class="text-red-500">*</span></label>
                                <select id="department" required
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white">
                                    <option value="">Select Department</option>
                                    ${duDepartments.map(d => `<option value="${d}">${d}</option>`).join('')}
                                </select>
                                <p id="departmentError" class="text-red-500 text-xs mt-1 hidden">Please select department</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Session <span class="text-red-500">*</span></label>
                                <input type="text" id="session" required pattern="20[0-9]{2}-[0-9]{2}"
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                    placeholder="e.g. 2020-21">
                                <p id="sessionError" class="text-red-500 text-xs mt-1 hidden">Format: 2020-21</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Current Year <span class="text-red-500">*</span></label>
                                <select id="currentYear" required
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white">
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Masters">Masters</option>
                                    <option value="PhD">PhD</option>
                                </select>
                                <p id="currentYearError" class="text-red-500 text-xs mt-1 hidden">Please select year</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1.5">Hall <span class="text-red-500">*</span></label>
                                <select id="hall" required
                                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white">
                                    <option value="">Select Hall</option>
                                    ${duHalls.map(h => `<option value="${h}">${h}</option>`).join('')}
                                </select>
                                <p id="hallError" class="text-red-500 text-xs mt-1 hidden">Please select hall</p>
                            </div>
                        </div>

                        <!-- Address -->
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Permanent Address <span class="text-red-500">*</span></label>
                            <textarea id="permanentAddress" required minlength="10" rows="2"
                                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none"
                                placeholder="Village, Post Office, Upazila, District"></textarea>
                            <p id="addressError" class="text-red-500 text-xs mt-1 hidden">Please enter complete address</p>
                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-3 pt-2">
                            <button type="button" onclick="goToStep1()" class="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2">
                                <i data-lucide="arrow-left" class="w-5 h-5"></i>
                                Back
                            </button>
                            <button type="submit" id="submitVerificationBtn" class="flex-[2] py-3 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition flex items-center justify-center gap-2">
                                <i data-lucide="send" class="w-5 h-5"></i>
                                Submit Verification
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Initialize Lucide icons
    if (window.lucide) lucide.createIcons();

    // Real-time validation for TrxID
    const trxIdInput = document.getElementById('verifyTrxId');
    trxIdInput?.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        const statusIcon = document.getElementById('trxIdStatus');
        const errorEl = document.getElementById('trxIdError');
        
        if (value.length >= 8 && value.length <= 20) {
            statusIcon.classList.remove('hidden');
            errorEl.classList.add('hidden');
            trxIdInput.classList.remove('border-red-300');
            trxIdInput.classList.add('border-green-300');
        } else if (value.length > 0) {
            statusIcon.classList.add('hidden');
            errorEl.classList.remove('hidden');
            trxIdInput.classList.add('border-red-300');
            trxIdInput.classList.remove('border-green-300');
        } else {
            statusIcon.classList.add('hidden');
            errorEl.classList.add('hidden');
            trxIdInput.classList.remove('border-red-300', 'border-green-300');
        }
    });

    // Session auto-format
    const sessionInput = document.getElementById('session');
    sessionInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9-]/g, '');
        if (value.length === 4 && !value.includes('-')) {
            value = value + '-';
        }
        e.target.value = value.substring(0, 7);
    });

    // Form validation on input
    const validateInput = (input, errorId, minLength = 1) => {
        input?.addEventListener('blur', () => {
            const errorEl = document.getElementById(errorId);
            if (input.value.trim().length < minLength) {
                errorEl?.classList.remove('hidden');
                input.classList.add('border-red-300');
            } else {
                errorEl?.classList.add('hidden');
                input.classList.remove('border-red-300');
            }
        });
    };

    validateInput(document.getElementById('fatherName'), 'fatherNameError', 3);
    validateInput(document.getElementById('motherName'), 'motherNameError', 3);
    validateInput(document.getElementById('permanentAddress'), 'addressError', 10);

    // Form submission
    document.getElementById('verificationForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submitVerificationBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> Submitting...';

        // Collect all data
        const verificationData = {
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
            trxId: document.getElementById('verifyTrxId')?.value.trim(),
            fatherName: document.getElementById('fatherName')?.value.trim(),
            motherName: document.getElementById('motherName')?.value.trim(),
            department: document.getElementById('department')?.value,
            session: document.getElementById('session')?.value.trim(),
            currentYear: document.getElementById('currentYear')?.value,
            hall: document.getElementById('hall')?.value,
            permanentAddress: document.getElementById('permanentAddress')?.value.trim(),
            submittedAt: new Date().toISOString()
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update user
        user.verificationStatus = 'pending';
        user.verificationData = verificationData;
        window.db.updateUser(user);

        showToast('success', 'Submitted!', 'Your verification is under review');
        
        setTimeout(() => {
            renderView('overview');
        }, 1000);
    });
}

// Step navigation functions
function goToStep2() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const trxId = document.getElementById('verifyTrxId')?.value.trim();

    let hasError = false;

    if (!paymentMethod) {
        document.getElementById('paymentMethodError')?.classList.remove('hidden');
        hasError = true;
    } else {
        document.getElementById('paymentMethodError')?.classList.add('hidden');
    }

    if (!trxId || trxId.length < 8) {
        document.getElementById('trxIdError')?.classList.remove('hidden');
        document.getElementById('verifyTrxId')?.classList.add('border-red-300');
        hasError = true;
    }

    if (hasError) {
        showToast('error', 'Error', 'Please complete all fields');
        return;
    }

    // Update step indicators
    document.getElementById('step1Indicator').classList.remove('bg-primary', 'text-white');
    document.getElementById('step1Indicator').classList.add('bg-green-500', 'text-white');
    document.getElementById('step1Indicator').innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
    
    document.getElementById('step2Indicator').classList.remove('bg-slate-200', 'text-slate-500');
    document.getElementById('step2Indicator').classList.add('bg-primary', 'text-white');
    
    document.getElementById('stepConnector').classList.add('bg-green-500');

    // Switch steps
    document.getElementById('verifyStep1')?.classList.add('hidden');
    document.getElementById('verifyStep2')?.classList.remove('hidden');

    if (window.lucide) lucide.createIcons();
}

function goToStep1() {
    // Reset step indicators
    document.getElementById('step1Indicator').classList.add('bg-primary', 'text-white');
    document.getElementById('step1Indicator').classList.remove('bg-green-500');
    document.getElementById('step1Indicator').innerHTML = '1';
    
    document.getElementById('step2Indicator').classList.add('bg-slate-200', 'text-slate-500');
    document.getElementById('step2Indicator').classList.remove('bg-primary', 'text-white');
    
    document.getElementById('stepConnector').classList.remove('bg-green-500');

    // Switch steps
    document.getElementById('verifyStep1')?.classList.remove('hidden');
    document.getElementById('verifyStep2')?.classList.add('hidden');

    if (window.lucide) lucide.createIcons();
}

function renderLoanRequest(user) {
    console.log('🔥 renderLoanRequest called - NEW VERSION with 3 sections');

    // Check if user is blocked - blocked users cannot apply for new loans
    if (user.verificationStatus === 'blocked') {
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shield-ban" class="w-10 h-10 text-red-600"></i>
                </div>
                <h2 class="text-xl font-bold text-red-700">Account Blocked</h2>
                <p class="text-slate-500 mt-2 max-w-md mx-auto">Your account has been blocked. You cannot apply for new loans.</p>
                ${user.blockReason ? `<p class="text-red-600 mt-3 bg-red-50 p-3 rounded-lg inline-block">Reason: ${user.blockReason}</p>` : ''}
                <p class="text-slate-400 text-sm mt-4">If you have an existing loan, you can still make repayments.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

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

// renderRepayment with full partial payment support
function renderRepayment(user) {
    console.log('💳 [REPAYMENT v2] renderRepayment called for user:', user.id, user.name);

    const loans = window.db.getLoansByUserId(user.id);
    console.log('📋 [REPAYMENT v2] User loans:', loans.map(l => ({ id: l.id, status: l.status, amount: l.amount })));

    // FIXED: Include 'partially_paid' status so users can pay remaining amount
    const activeLoan = loans.find(l => l.status === 'disbursed' || l.status === 'partially_paid');

    if (!activeLoan) {
        console.log('❌ [REPAYMENT v2] No active loan found for repayment');
        contentArea.innerHTML = `
            <div class="text-center pt-20">
                <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                <h2 class="text-xl font-bold text-slate-700">No Active Loan to Repay</h2>
                <p class="text-slate-500 mt-2">You don't have any disbursed loans pending repayment.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    console.log('✅ [REPAYMENT v2] Active loan found:', {
        id: activeLoan.id,
        status: activeLoan.status,
        amount: activeLoan.amount
    });

    // Check for pending repayment - show warning but allow new repayment
    const pendingRepayment = window.db.getRepayments().find(r => r.loanId === activeLoan.id && r.status === 'pending');
    const rejectedRepayments = window.db.getRepayments().filter(r => r.loanId === activeLoan.id && r.status === 'rejected');
    
    // Build rejected warning HTML if exists (most recent first)
    let rejectedWarningHTML = '';
    if (rejectedRepayments.length > 0) {
        const latestRejected = rejectedRepayments[rejectedRepayments.length - 1];
        rejectedWarningHTML = `
            <!-- Rejected Repayment Warning -->
            <div class="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i data-lucide="x-circle" class="w-5 h-5 text-red-600"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-red-900 mb-1">আপনার সর্বশেষ Payment Rejected হয়েছে</h3>
                        <p class="text-sm text-red-700 mb-3">
                            অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার submit করুন।
                        </p>
                        <div class="bg-white rounded-lg p-3 border border-red-200 text-sm space-y-2">
                            <div class="flex flex-wrap gap-4">
                                <div>
                                    <span class="text-slate-500">Amount:</span>
                                    <span class="font-bold text-slate-900">৳${latestRejected.amount}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500">TrxID:</span>
                                    <span class="font-medium text-slate-900">${latestRejected.trxId}</span>
                                </div>
                            </div>
                            ${latestRejected.rejectionReason ? `
                                <div class="pt-2 border-t border-red-100">
                                    <span class="text-red-600 font-medium">Rejection Reason:</span>
                                    <p class="text-red-800 mt-1">${latestRejected.rejectionReason}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Build pending warning HTML if exists
    let pendingWarningHTML = '';
    if (pendingRepayment) {
        pendingWarningHTML = `
            <!-- Pending Repayment Warning -->
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-amber-900 mb-1">আপনার একটি Repayment Verification এর অপেক্ষায় আছে</h3>
                        <p class="text-sm text-amber-700 mb-3">
                            নিচে নতুন repayment submit করলে এটি <strong>আলাদা payment</strong> হিসেবে গণ্য হবে।
                            একই payment দুইবার submit করবেন না।
                        </p>
                        <div class="bg-white rounded-lg p-3 border border-amber-200 text-sm">
                            <div class="flex flex-wrap gap-4">
                                <div>
                                    <span class="text-slate-500">Amount:</span>
                                    <span class="font-bold text-slate-900">৳${pendingRepayment.amount}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500">TrxID:</span>
                                    <span class="font-medium text-slate-900">${pendingRepayment.trxId}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500">Date:</span>
                                    <span class="font-medium text-slate-900">${new Date(pendingRepayment.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // FIXED: Calculate remaining amount dynamically from verified repayments
    const repayments = window.db.getRepayments().filter(r => r.loanId === activeLoan.id && r.status === 'verified');
    const totalRepaid = repayments.reduce((sum, r) => sum + parseInt(r.amount || 0), 0);
    const remaining = parseInt(activeLoan.amount) - totalRepaid;
    const isPartiallyPaid = totalRepaid > 0 && remaining > 0;

    console.log('💰 [REPAYMENT v2] Payment calculation:', {
        loanAmount: activeLoan.amount,
        totalRepaid: totalRepaid,
        remaining: remaining,
        isPartiallyPaid: isPartiallyPaid,
        numberOfPayments: repayments.length
    });

    // Use remaining amount as the due amount
    const dueAmount = remaining;

    contentArea.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Repay Loan</h2>
            
            ${rejectedWarningHTML}
            ${pendingWarningHTML}
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                ${isPartiallyPaid ? `
                    <!-- Partially Paid Status -->
                    <div class="mb-4 inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                        <i data-lucide="info" class="w-4 h-4 mr-1.5"></i>
                        Partially Paid Loan
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-100">
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
                    
                    <!-- Progress Bar -->
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs text-slate-600 font-medium">Repayment Progress</span>
                            <span class="text-xs text-slate-600 font-bold">${Math.round((totalRepaid / activeLoan.amount) * 100)}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2.5">
                            <div class="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500" style="width: ${(totalRepaid / activeLoan.amount) * 100}%"></div>
                        </div>
                    </div>
                ` : `
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-slate-500">Total Due Amount</span>
                        <span class="text-2xl font-bold text-slate-900">৳${dueAmount}</span>
                    </div>
                `}
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
                                    <span class="font-semibold text-slate-900">${isPartiallyPaid ? 'Pay Remaining' : 'Full Payment'}</span>
                                    <i data-lucide="check-circle" class="w-5 h-5 text-primary hidden peer-checked:block"></i>
                                </div>
                                <p class="text-sm text-slate-600">${isPartiallyPaid ? 'Clear remaining balance' : 'Pay entire amount'}</p>
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
                    <p id="amountHint" class="text-sm text-slate-500 mt-2">${isPartiallyPaid ? `Paying remaining balance: ৳${dueAmount}` : `Paying full amount: ৳${dueAmount}`}</p>
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

                <button type="submit" class="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl font-semibold shadow-md transition">
                    ${isPartiallyPaid ? `Pay Remaining ৳${dueAmount}` : 'Submit Repayment Info'}
                </button>
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
                amountHint.textContent = isPartiallyPaid ? `Paying remaining balance: ৳${dueAmount}` : `Paying full amount: ৳${dueAmount}`;
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
        
        // Refresh repayment view to show pending status
        renderView('repayment');
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

    // Use the unified loan detail renderer
    if (window.renderUnifiedLoanDetail) {
        contentArea.innerHTML = window.renderUnifiedLoanDetail(loan, user.id, 'student');
        lucide.createIcons();
    } else {
        // Fallback if unified renderer not loaded
        console.error('renderUnifiedLoanDetail not found');
        contentArea.innerHTML = `
            <div class="p-6 text-center">
                <p class="text-red-500">Error loading loan details. Please refresh the page.</p>
                <button onclick="renderView('overview')" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                    Back to Overview
                </button>
            </div>
        `;
    }
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
            <div class="text-center pt-20 pb-24">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="file-x" class="w-8 h-8 text-slate-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-slate-800 mb-2">No Loan History</h3>
                <p class="text-slate-500 mb-4">You haven't applied for any loans yet.</p>
                <button onclick="renderView('loan-request')" class="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition">
                    Apply for Loan
                </button>
            </div>`;
        return;
    }

    // Status config for styling
    const statusConfig = {
        pending: { color: 'bg-amber-100 text-amber-700', icon: 'clock', label: 'Pending' },
        approved: { color: 'bg-blue-100 text-blue-700', icon: 'check', label: 'Approved' },
        disbursed: { color: 'bg-green-100 text-green-700', icon: 'banknote', label: 'Active' },
        partially_paid: { color: 'bg-purple-100 text-purple-700', icon: 'pie-chart', label: 'Partial' },
        paid: { color: 'bg-emerald-100 text-emerald-700', icon: 'check-circle', label: 'Paid' },
        rejected: { color: 'bg-red-100 text-red-700', icon: 'x-circle', label: 'Rejected' },
        defaulted: { color: 'bg-gray-100 text-gray-700', icon: 'alert-octagon', label: 'Defaulted' }
    };

    // Generate mobile cards
    const mobileCards = filteredLoans.map(loan => {
        const config = statusConfig[loan.status] || statusConfig.pending;
        const date = new Date(loan.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Calculate Duration
        let durationDisplay = 'N/A';
        let durationClass = 'text-slate-500';

        if (loan.status === 'paid' && loan.paymentDuration) {
            const daysRemaining = loan.paymentDuration.daysRemaining;
            if (daysRemaining > 0) {
                durationDisplay = `${daysRemaining} days early`;
                durationClass = 'text-green-600';
            } else if (daysRemaining === 0) {
                durationDisplay = 'On Time';
                durationClass = 'text-green-600';
            } else {
                durationDisplay = `${Math.abs(daysRemaining)} days late`;
                durationClass = 'text-red-600';
            }
        } else if (loan.status === 'disbursed' && loan.disbursementInfo?.disbursedAt) {
            const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
            const now = new Date();
            const daysSinceDisbursement = Math.floor((now - disbursedDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = 60 - daysSinceDisbursement;

            if (daysRemaining > 7) {
                durationDisplay = `${daysRemaining} days left`;
                durationClass = 'text-green-600';
            } else if (daysRemaining > 0) {
                durationDisplay = `${daysRemaining} days left`;
                durationClass = 'text-amber-600';
            } else if (daysRemaining === 0) {
                durationDisplay = 'Due Today';
                durationClass = 'text-amber-600';
            } else {
                durationDisplay = `${Math.abs(daysRemaining)} days overdue`;
                durationClass = 'text-red-600';
            }
        }

        return `
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg ${config.color} flex items-center justify-center">
                                <i data-lucide="${config.icon}" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-bold text-lg text-slate-900">৳${parseInt(loan.amount).toLocaleString()}</p>
                                <p class="text-xs text-slate-500">${date}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${config.color}">
                            ${config.label}
                        </span>
                    </div>
                    
                    <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                            <p class="text-xs text-slate-500">Duration</p>
                            <p class="text-sm font-medium ${durationClass}">${durationDisplay}</p>
                        </div>
                        <button onclick="window.currentLoanId='${loan.id}'; renderView('loan-detail')" 
                            class="flex items-center gap-1 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition">
                            <span>Details</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Generate desktop table rows
    const tableRows = filteredLoans.map(loan => {
        const config = statusConfig[loan.status] || statusConfig.pending;
        
        let durationDisplay = '<span class="text-slate-500">N/A</span>';

        if (loan.status === 'paid' && loan.paymentDuration) {
            const daysRemaining = loan.paymentDuration.daysRemaining;
            if (daysRemaining > 0) {
                durationDisplay = `<span class="text-green-600 font-medium">${daysRemaining} days early</span>`;
            } else if (daysRemaining === 0) {
                durationDisplay = '<span class="text-green-600 font-medium">On Time</span>';
            } else {
                durationDisplay = `<span class="text-red-600 font-medium">${Math.abs(daysRemaining)} days late</span>`;
            }
        } else if (loan.status === 'disbursed' && loan.disbursementInfo?.disbursedAt) {
            const disbursedDate = new Date(loan.disbursementInfo.disbursedAt);
            const now = new Date();
            const daysSinceDisbursement = Math.floor((now - disbursedDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = 60 - daysSinceDisbursement;

            if (daysRemaining > 7) {
                durationDisplay = `<span class="text-green-600 font-medium">${daysRemaining} days left</span>`;
            } else if (daysRemaining > 0) {
                durationDisplay = `<span class="text-amber-600 font-medium">${daysRemaining} days left</span>`;
            } else if (daysRemaining === 0) {
                durationDisplay = '<span class="text-amber-600 font-medium">Due Today</span>';
            } else {
                durationDisplay = `<span class="text-red-600 font-medium">${Math.abs(daysRemaining)} days overdue</span>`;
            }
        } else if (loan.status === 'rejected') {
            durationDisplay = '<span class="text-red-600">Rejected</span>';
        }

        return `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="px-6 py-4 text-sm text-slate-900 font-medium">৳${parseInt(loan.amount).toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${new Date(loan.appliedAt).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-sm">${durationDisplay}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${config.color}">
                        ${config.label}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="window.currentLoanId='${loan.id}'; renderView('loan-detail')" 
                        class="text-primary hover:text-secondary font-medium text-sm flex items-center gap-1 transition">
                        View Details <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    contentArea.innerHTML = `
        <div class="pb-24 md:pb-8">
            <!-- Header with Filters -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i data-lucide="history" class="w-6 h-6 text-primary"></i>
                    Loan History
                </h2>
                <div class="flex gap-3 w-full md:w-auto">
                    <select onchange="historyFilterState.status = this.value; renderHistory(window.db.getCurrentUser())" 
                        class="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white text-sm font-medium">
                        <option value="all" ${historyFilterState.status === 'all' ? 'selected' : ''}>All Status</option>
                        <option value="pending" ${historyFilterState.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="approved" ${historyFilterState.status === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="disbursed" ${historyFilterState.status === 'disbursed' ? 'selected' : ''}>Active</option>
                        <option value="paid" ${historyFilterState.status === 'paid' ? 'selected' : ''}>Paid</option>
                        <option value="rejected" ${historyFilterState.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                    <select onchange="historyFilterState.sort = this.value; renderHistory(window.db.getCurrentUser())"
                        class="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white text-sm font-medium">
                        <option value="newest" ${historyFilterState.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                        <option value="oldest" ${historyFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                        <option value="amount_high" ${historyFilterState.sort === 'amount_high' ? 'selected' : ''}>Amount ↓</option>
                        <option value="amount_low" ${historyFilterState.sort === 'amount_low' ? 'selected' : ''}>Amount ↑</option>
                    </select>
                </div>
            </div>

            <!-- Mobile Cards View -->
            <div class="md:hidden space-y-4">
                ${filteredLoans.length > 0 ? mobileCards : `
                    <div class="text-center py-12 bg-white rounded-xl border border-slate-100">
                        <p class="text-slate-500">No loans found matching filter.</p>
                    </div>
                `}
            </div>

            <!-- Desktop Table View -->
            <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                        ${tableRows.length > 0 ? tableRows : '<tr><td colspan="5" class="px-6 py-8 text-center text-slate-500">No loans found matching filter.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
}
