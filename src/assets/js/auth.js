/**
 * DU Qarze Hasana - Authentication Logic
 */

const auth = {
    register: (name, email, regNo, password) => {
        if (window.db.findUserByEmail(email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: 'user-' + Date.now(),
            name,
            email,
            regNo,
            password,
            role: 'student',
            isVerified: false,
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString()
        };

        window.db.saveUser(newUser);
        return { success: true, message: 'Registration successful! Please login.' };
    },

    login: (emailOrRegNo, password) => {
        return window.db.login(emailOrRegNo, password);
    },

    // Mask email for security (e.g., student@du.ac.bd -> s***t@du.ac.bd)
    maskEmail: (email) => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return `${localPart[0]}***@${domain}`;
        }
        const firstChar = localPart[0];
        const lastChar = localPart[localPart.length - 1];
        return `${firstChar}***${lastChar}@${domain}`;
    },

    // Request password reset - returns user info if found
    requestPasswordReset: (identifier) => {
        // Check if it's an email or registration number
        const isEmail = identifier.includes('@');
        const user = isEmail
            ? window.db.findUserByEmail(identifier)
            : window.db.findUserByRegNo(identifier);

        if (!user) {
            return {
                success: false,
                message: isEmail
                    ? 'No account found with this email address'
                    : 'No account found with this registration number'
            };
        }

        // Return user info with masked email if requested via registration number
        return {
            success: true,
            userId: user.id,
            email: isEmail ? user.email : auth.maskEmail(user.email),
            isEmailMasked: !isEmail,
            message: 'Password reset verification successful'
        };
    },

    // Reset password for a user
    resetPassword: (userId, newPassword) => {
        const success = window.db.resetUserPassword(userId, newPassword);
        if (success) {
            return { success: true, message: 'Password reset successful!' };
        }
        return { success: false, message: 'Failed to reset password. Please try again.' };
    },

    googleLogin: () => {
        // Simulate Google Auth Provider response
        const googleUser = {
            name: "Google User",
            email: "google.user@gmail.com", // Example non-institutional email
            photoURL: "https://ui-avatars.com/api/?name=Google+User&background=random"
        };

        // Check if user exists
        let user = window.db.findUserByEmail(googleUser.email);

        if (!user) {
            // Create new user from Google data
            user = {
                id: 'user-' + Date.now(),
                name: googleUser.name,
                email: googleUser.email,
                regNo: "", // Empty initially, must be filled later
                password: "", // No password for Google users
                role: 'student',
                isVerified: false,
                verificationStatus: 'unverified',
                createdAt: new Date().toISOString(),
                authProvider: 'google'
            };
            window.db.saveUser(user);
        }

        // Log them in
        // Use the same key as data.js (DB_KEYS.CURRENT_USER = 'duqh_current_user')
        localStorage.setItem('duqh_current_user', JSON.stringify(user));
        return { success: true, user };
    },

    logout: () => {
        window.db.logout();
        window.location.href = 'index.html';
    },

    checkAuth: () => {
        const user = window.db.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    },

    checkAdmin: () => {
        const user = auth.checkAuth();
        if (user.role !== 'admin') {
            window.location.href = 'dashboard.html';
        }
    }
};

window.auth = auth;
