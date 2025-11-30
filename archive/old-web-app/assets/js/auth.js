/**
 * Authentication Module
 * Handles user registration, login, logout, and session management
 */

const auth = {
    // Register new user
    register: (name, email, regNo, password) => {
        // Check if user already exists
        const existingUser = window.db.findUser(email) || window.db.findUser(regNo);
        if (existingUser) {
            return { success: false, message: 'User with this email or registration number already exists!' };
        }

        // Validate DU email
        if (!email.endsWith('@du.ac.bd')) {
            return { success: false, message: 'Please use a valid DU email address (@du.ac.bd)' };
        }

        // Create new user
        const newUser = {
            id: 'user-' + Date.now(),
            name,
            email,
            regNo,
            password, // In production, hash this!
            role: 'student',
            isVerified: false,
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString()
        };

        window.db.saveUser(newUser);
        return { success: true, message: 'Registration successful! Please login.' };
    },

    // Login user
    login: (emailOrRegNo, password) => {
        const user = window.db.findUser(emailOrRegNo);

        if (!user) {
            return { success: false, message: 'User not found!' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Incorrect password!' };
        }

        // Store session
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    checkAuth: () => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    },

    // Check if user is admin
    checkAdmin: () => {
        const user = auth.getCurrentUser();
        if (!user || user.role !== 'admin') {
            alert('Access denied! Admin only.');
            window.location.href = 'index.html';
            return null;
        }
        return user;
    },

    // Google login simulation
    googleLogin: () => {
        // Simulate Google OAuth
        const googleUser = {
            id: 'google-' + Date.now(),
            name: 'Google User',
            email: 'googleuser@du.ac.bd',
            regNo: 'GOOGLE' + Date.now(),
            password: 'google-auth',
            role: 'student',
            isVerified: false,
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString()
        };

        window.db.saveUser(googleUser);
        localStorage.setItem('currentUser', JSON.stringify(googleUser));
        return { success: true, user: googleUser };
    },

    // Password reset request
    requestPasswordReset: (identifier) => {
        const user = window.db.findUser(identifier);
        if (!user) {
            return { success: false, message: 'User not found!' };
        }

        // In real app, send email with reset link
        return {
            success: true,
            message: 'Password reset link sent to your email!',
            userId: user.id
        };
    },

    // Reset password
    resetPassword: (userId, newPassword) => {
        const user = window.db.getUserById(userId);
        if (!user) {
            return { success: false, message: 'Invalid reset link!' };
        }

        user.password = newPassword;
        window.db.updateUser(user);
        return { success: true, message: 'Password reset successful!' };
    },

    // Mask email for security
    maskEmail: (email) => {
        const [name, domain] = email.split('@');
        const maskedName = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
        return `${maskedName}@${domain}`;
    }
};

// Expose globally
window.auth = auth;
