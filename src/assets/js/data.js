/**
 * DU Qarze Hasana - Mock Data Management
 * Handles LocalStorage for Users, Loans, and Transactions.
 */

const DB_KEYS = {
    USERS: 'duqh_users',
    LOANS: 'duqh_loans',
    REPAYMENTS: 'duqh_repayments',
    DONATIONS: 'duqh_donations',
    CURRENT_USER: 'duqh_current_user'
};

class MockDB {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            const initialUsers = [
                {
                    id: 'admin-1',
                    name: 'Admin User',
                    email: 'admin@du.ac.bd',
                    password: 'admin', // In real app, hash this
                    role: 'admin',
                    isVerified: true
                },
                {
                    id: 'user-1',
                    name: 'Demo Student',
                    email: 'student@du.ac.bd',
                    regNo: '2020543210',
                    password: '123',
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'unverified', // unverified, pending, verified
                    phone: '01700000000',
                    verificationData: {
                        payment: {
                            senderNumber: '01700000000',
                            transactionId: 'TRX987654321'
                        },
                        personal: {
                            gender: 'Male',
                            fatherName: 'Demo Father',
                            motherName: 'Demo Mother',
                            userMobile: '01700000000',
                            familyMobile: '01800000000',
                            dob: '2000-01-01',
                            currentAddress: 'Dhaka University Hall',
                            permanentAddress: 'Village, District'
                        },
                        academic: {
                            regNo: '2020543210',
                            session: '2020-21',
                            department: 'Computer Science',
                            program: 'B.Sc',
                            hall: 'Jagannath Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png', // Mock ID Front
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png', // Mock ID Back
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Demo+Student&size=400' // Mock Recent Photo
                        },
                        submittedAt: new Date().toISOString()
                    }
                }
            ];
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
        }

        if (!localStorage.getItem(DB_KEYS.LOANS)) {
            localStorage.setItem(DB_KEYS.LOANS, JSON.stringify([]));
        }
    }

    // --- User Methods ---
    getUsers() {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    }

    updateUser(updatedUser) {
        const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

        // Update session if it's the current user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === updatedUser.id) {
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
    }

    findUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    }

    findUserByRegNo(regNo) {
        return this.getUsers().find(u => u.regNo === regNo);
    }

    findUserByEmailOrRegNo(identifier) {
        // Try to find by email first, then by registration number
        return this.findUserByEmail(identifier) || this.findUserByRegNo(identifier);
    }

    resetUserPassword(userId, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.password = newPassword;
            this.updateUser(user);
            return true;
        }
        return false;
    }

    // --- Auth Methods ---
    login(emailOrRegNo, password) {
        const user = this.findUserByEmailOrRegNo(emailOrRegNo);
        if (user && user.password === password) {
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    }

    // --- Loan Methods ---
    getLoans() {
        return JSON.parse(localStorage.getItem(DB_KEYS.LOANS) || '[]');
    }

    addLoan(loan) {
        const loans = this.getLoans();
        loans.push(loan);
        localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(loans));
    }

    updateLoan(updatedLoan) {
        const loans = this.getLoans().map(l => l.id === updatedLoan.id ? updatedLoan : l);
        localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(loans));
    }

    getLoansByUserId(userId) {
        return this.getLoans().filter(l => l.userId === userId);
    }

    // Add a note to a loan
    addLoanNote(loanId, noteText) {
        const loan = this.getLoans().find(l => l.id === loanId);
        if (loan) {
            if (!loan.notes) loan.notes = [];
            const currentUser = this.getCurrentUser();
            loan.notes.push({
                id: 'note-' + Date.now(),
                text: noteText,
                author: currentUser ? currentUser.name : 'Unknown',
                timestamp: new Date().toISOString()
            });
            this.updateLoan(loan);
            return true;
        }
        return false;
    }

    // Add a call log to a loan
    addCallLog(loanId, callLogData) {
        const loan = this.getLoans().find(l => l.id === loanId);
        if (loan) {
            if (!loan.callLogs) loan.callLogs = [];
            loan.callLogs.push({
                id: 'call-' + Date.now(),
                volunteer: callLogData.volunteer,
                outcome: callLogData.outcome,
                details: callLogData.details,
                timestamp: new Date().toISOString()
            });
            this.updateLoan(loan);
            return true;
        }
        return false;
    }

    // --- Repayment Methods ---
    getRepayments() {
        return JSON.parse(localStorage.getItem(DB_KEYS.REPAYMENTS) || '[]');
    }

    addRepayment(repayment) {
        const repayments = this.getRepayments();
        repayments.push(repayment);
        localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify(repayments));
    }

    updateRepayment(updatedRepayment) {
        const repayments = this.getRepayments().map(r => r.id === updatedRepayment.id ? updatedRepayment : r);
        localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify(repayments));
    }

    // --- Donation Methods ---
    getDonations() {
        return JSON.parse(localStorage.getItem(DB_KEYS.DONATIONS) || '[]');
    }

    addDonation(donation) {
        const donations = this.getDonations();
        donations.push(donation);
        localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify(donations));
    }

    // --- Verification Methods ---
    getPendingVerifications() {
        return this.getUsers().filter(u => u.verificationStatus === 'pending' && !u.isVerified);
    }

    approveVerification(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (user) {
            user.isVerified = true;
            user.verificationStatus = 'verified';
            this.updateUser(user);
            return { success: true, message: 'User verified successfully' };
        }
        return { success: false, message: 'User not found' };
    }

    rejectVerification(userId, reason) {
        const user = this.getUsers().find(u => u.id === userId);
        if (user) {
            user.verificationStatus = 'rejected';
            user.rejectionReason = reason;
            user.rejectedAt = new Date().toISOString();
            this.updateUser(user);
            return { success: true, message: 'Verification rejected' };
        }
        return { success: false, message: 'User not found' };
    }

    // Add note to user
    addUserNote(userId, noteText) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.notes) user.notes = [];
            user.notes.push({
                text: noteText,
                author: 'Admin',
                timestamp: new Date().toISOString()
            });
            this.updateUser(user);
            return true;
        }
        return false;
    }

    // Add call log to user
    addUserCallLog(userId, callData) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            if (!user.callLogs) user.callLogs = [];
            user.callLogs.push({
                ...callData,
                timestamp: new Date().toISOString()
            });
            this.updateUser(user);
            return true;
        }
        return false;
    }

    // Block user (with reason and admin ID)
    blockUser(userId, reason, adminId = 'admin') {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.verificationStatus = 'blocked';
            user.blockReason = reason;
            user.blockedAt = new Date().toISOString();
            user.blockedBy = adminId;
            this.updateUser(user);
            return { success: true, message: 'User blocked successfully' };
        }
        return { success: false, message: 'User not found' };
    }

    // Unblock user (restore to verified status)
    unblockUser(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.verificationStatus = 'verified'; // Restore to verified
            user.blockReason = undefined;
            user.blockedAt = undefined;
            user.blockedBy = undefined;
            this.updateUser(user);
            return { success: true, message: 'User unblocked successfully' };
        }
        return { success: false, message: 'User not found' };
    }
}

const db = new MockDB();
window.db = db; // Expose to window for easy access
