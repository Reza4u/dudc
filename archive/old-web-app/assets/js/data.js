/**
 * Mock Database using LocalStorage
 * Simulates a backend database for the Qarze Hasana system
 */

const DB_KEYS = {
    USERS: 'qh_users',
    LOANS: 'qh_loans',
    REPAYMENTS: 'qh_repayments',
    DONATIONS: 'qh_donations'
};

class MockDB {
    constructor() {
        this.initializeDB();
    }

    initializeDB() {
        // Initialize with default admin if no users exist
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 'admin-001',
                    name: 'Admin User',
                    email: 'admin@du.ac.bd',
                    regNo: 'ADMIN001',
                    password: 'admin', // In real app, hash this
                    role: 'admin',
                    isVerified: true,
                    verificationStatus: 'verified',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'user-001',
                    name: 'Test Student',
                    email: 'student@du.ac.bd',
                    regNo: '2020123456',
                    password: '123', // In real app, hash this
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'unverified',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem(DB_KEYS.LOANS)) {
            localStorage.setItem(DB_KEYS.LOANS, JSON.stringify([]));
        }

        if (!localStorage.getItem(DB_KEYS.REPAYMENTS)) {
            localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify([]));
        }

        if (!localStorage.getItem(DB_KEYS.DONATIONS)) {
            localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify([]));
        }
    }

    // User Methods
    getUsers() {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    }

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        return user;
    }

    updateUser(updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    findUser(emailOrRegNo) {
        const users = this.getUsers();
        return users.find(u => u.email === emailOrRegNo || u.regNo === emailOrRegNo);
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Verification Methods
    getPendingVerifications() {
        return this.getUsers().filter(u => u.verificationStatus === 'pending' && u.role !== 'admin');
    }

    approveVerification(userId) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'User not found' };

        user.isVerified = true;
        user.verificationStatus = 'verified';
        user.verifiedAt = new Date().toISOString();
        this.updateUser(user);

        return { success: true, message: 'Verification approved' };
    }

    rejectVerification(userId, reason) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'User not found' };

        user.verificationStatus = 'rejected';
        user.rejectionReason = reason;
        user.rejectedAt = new Date().toISOString();
        this.updateUser(user);

        return { success: true, message: 'Verification rejected' };
    }

    blockUser(userId, reason, blockedBy) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'User not found' };

        user.verificationStatus = 'blocked';
        user.blockReason = reason;
        user.blockedAt = new Date().toISOString();
        user.blockedBy = blockedBy;
        this.updateUser(user);

        return { success: true, message: 'User blocked' };
    }

    unblockUser(userId) {
        const user = this.getUserById(userId);
        if (!user) return { success: false, message: 'User not found' };

        user.verificationStatus = user.isVerified ? 'verified' : 'unverified';
        delete user.blockReason;
        delete user.blockedAt;
        delete user.blockedBy;
        this.updateUser(user);

        return { success: true, message: 'User unblocked' };
    }

    // User Notes and Call Logs
    addUserNote(userId, noteText) {
        const user = this.getUserById(userId);
        if (!user) return false;

        if (!user.notes) user.notes = [];
        user.notes.push({
            text: noteText,
            author: 'Admin',
            timestamp: new Date().toISOString()
        });
        this.updateUser(user);
        return true;
    }

    addCallLogToUser(userId, log) {
        const user = this.getUserById(userId);
        if (!user) return false;

        if (!user.callLogs) user.callLogs = [];
        user.callLogs.push({
            ...log,
            timestamp: new Date().toISOString()
        });
        this.updateUser(user);
        return true;
    }

    // Loan Methods
    getLoans() {
        return JSON.parse(localStorage.getItem(DB_KEYS.LOANS) || '[]');
    }

    addLoan(loan) {
        const loans = this.getLoans();
        loans.push(loan);
        localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(loans));
        return loan;
    }

    updateLoan(updatedLoan) {
        const loans = this.getLoans();
        const index = loans.findIndex(l => l.id === updatedLoan.id);
        if (index !== -1) {
            loans[index] = { ...loans[index], ...updatedLoan };
            localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(loans));
            return loans[index];
        }
        return null;
    }

    getLoansByUser(userId) {
        return this.getLoans().filter(l => l.userId === userId);
    }

    getLoansByUserId(userId) {
        return this.getLoans().filter(l => l.userId === userId);
    }

    // Loan Notes and Call Logs
    addLoanNote(loanId, noteText) {
        const loan = this.getLoans().find(l => l.id === loanId);
        if (!loan) return false;

        if (!loan.notes) loan.notes = [];
        loan.notes.push({
            text: noteText,
            author: 'Admin',
            timestamp: new Date().toISOString()
        });
        this.updateLoan(loan);
        return true;
    }

    addCallLog(loanId, log) {
        const loan = this.getLoans().find(l => l.id === loanId);
        if (!loan) return false;

        if (!loan.callLogs) loan.callLogs = [];
        loan.callLogs.push({
            ...log,
            timestamp: new Date().toISOString()
        });
        this.updateLoan(loan);
        return true;
    }

    // Repayment Methods
    getRepayments() {
        return JSON.parse(localStorage.getItem(DB_KEYS.REPAYMENTS) || '[]');
    }

    addRepayment(repayment) {
        const repayments = this.getRepayments();
        repayments.push(repayment);
        localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify(repayments));
        return repayment;
    }

    updateRepayment(updatedRepayment) {
        const repayments = this.getRepayments();
        const index = repayments.findIndex(r => r.id === updatedRepayment.id);
        if (index !== -1) {
            repayments[index] = { ...repayments[index], ...updatedRepayment };
            localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify(repayments));
            return repayments[index];
        }
        return null;
    }

    // Donation Methods
    getDonations() {
        return JSON.parse(localStorage.getItem(DB_KEYS.DONATIONS) || '[]');
    }

    addDonation(donation) {
        const donations = this.getDonations();
        donations.push(donation);
        localStorage.setItem(DB_KEYS.DONATIONS, JSON.stringify(donations));
        return donation;
    }

    // Utility Methods
    resetDatabase() {
        Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
        this.initializeDB();
    }
}

// Initialize and expose globally
window.db = new MockDB();

