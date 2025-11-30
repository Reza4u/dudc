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
                // ========== ADMIN USER ==========
                {
                    id: 'admin-1',
                    name: 'Admin User',
                    email: 'admin@du.ac.bd',
                    password: 'admin', // In real app, hash this
                    role: 'admin',
                    isVerified: true
                },

                // ========== STUDENT 1: INCOMPLETE (Registered but not submitted verification form) ==========
                {
                    id: 'user-incomplete',
                    name: 'Student 1 (Incomplete)',
                    email: 'student1@du.ac.bd',
                    regNo: '2020111111',
                    password: '123',
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'incomplete', // incomplete, pending, verified, rejected, blocked
                    phone: '01711111111',
                    verificationData: null // No verification data submitted yet
                },

                // ========== STUDENT 2: PENDING (Submitted verification form, awaiting review) ==========
                {
                    id: 'user-pending',
                    name: 'Student 2 (Pending)',
                    email: 'student2@du.ac.bd',
                    regNo: '2020222222',
                    password: '123',
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'pending',
                    phone: '01722222222',
                    verificationData: {
                        payment: {
                            senderNumber: '01722222222',
                            transactionId: 'TRX222222222'
                        },
                        personal: {
                            gender: 'Male',
                            fatherName: 'Student 2 Father',
                            motherName: 'Student 2 Mother',
                            userMobile: '01722222222',
                            familyMobile: '01822222222',
                            dob: '2001-02-02',
                            currentAddress: 'Shahidullah Hall, DU',
                            permanentAddress: 'Comilla, Bangladesh'
                        },
                        academic: {
                            regNo: '2020222222',
                            session: '2020-21',
                            department: 'Physics',
                            program: 'B.Sc',
                            hall: 'Shahidullah Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Student+2&size=400'
                        },
                        submittedAt: new Date().toISOString()
                    }
                },

                // ========== STUDENT 3: VERIFIED (Approved, can apply for loans) ==========
                {
                    id: 'user-verified',
                    name: 'Student 3 (Verified)',
                    email: 'student3@du.ac.bd',
                    regNo: '2020333333',
                    password: '123',
                    role: 'student',
                    isVerified: true,
                    verificationStatus: 'verified',
                    phone: '01733333333',
                    verificationData: {
                        payment: {
                            senderNumber: '01733333333',
                            transactionId: 'TRX333333333'
                        },
                        personal: {
                            gender: 'Female',
                            fatherName: 'Student 3 Father',
                            motherName: 'Student 3 Mother',
                            userMobile: '01733333333',
                            familyMobile: '01833333333',
                            dob: '2000-03-03',
                            currentAddress: 'Rokeya Hall, DU',
                            permanentAddress: 'Chittagong, Bangladesh'
                        },
                        academic: {
                            regNo: '2020333333',
                            session: '2020-21',
                            department: 'Economics',
                            program: 'B.S.S',
                            hall: 'Rokeya Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Student+3&size=400'
                        },
                        submittedAt: '2024-11-15T10:30:00.000Z',
                        reviewedAt: '2024-11-16T14:00:00.000Z',
                        reviewedBy: 'admin-1'
                    }
                },

                // ========== STUDENT 4: REJECTED (Verification rejected, needs to resubmit) ==========
                {
                    id: 'user-rejected',
                    name: 'Student 4 (Rejected)',
                    email: 'student4@du.ac.bd',
                    regNo: '2020444444',
                    password: '123',
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'rejected',
                    rejectionReason: 'আপনার জমা দেওয়া আইডি কার্ডের ছবি অস্পষ্ট। অনুগ্রহ করে পরিষ্কার ছবি দিয়ে আবার আবেদন করুন।',
                    phone: '01744444444',
                    verificationData: {
                        payment: {
                            senderNumber: '01744444444',
                            transactionId: 'TRX444444444'
                        },
                        personal: {
                            gender: 'Male',
                            fatherName: 'Student 4 Father',
                            motherName: 'Student 4 Mother',
                            userMobile: '01744444444',
                            familyMobile: '01844444444',
                            dob: '1999-04-04',
                            currentAddress: 'Jagannath Hall, DU',
                            permanentAddress: 'Sylhet, Bangladesh'
                        },
                        academic: {
                            regNo: '2020444444',
                            session: '2020-21',
                            department: 'History',
                            program: 'B.A (Hons)',
                            hall: 'Jagannath Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Student+4&size=400'
                        },
                        submittedAt: '2024-11-10T09:00:00.000Z',
                        reviewedAt: '2024-11-11T16:30:00.000Z',
                        reviewedBy: 'admin-1'
                    }
                },

                // ========== STUDENT 5: BLOCKED (Blocked by admin, cannot use system) ==========
                {
                    id: 'user-blocked',
                    name: 'Student 5 (Blocked)',
                    email: 'student5@du.ac.bd',
                    regNo: '2020555555',
                    password: '123',
                    role: 'student',
                    isVerified: false,
                    verificationStatus: 'blocked',
                    blockReason: 'ভুল তথ্য প্রদান এবং নিয়ম লঙ্ঘনের কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ করা হয়েছে।',
                    phone: '01755555555',
                    verificationData: {
                        payment: {
                            senderNumber: '01755555555',
                            transactionId: 'TRX555555555'
                        },
                        personal: {
                            gender: 'Male',
                            fatherName: 'Student 5 Father',
                            motherName: 'Student 5 Mother',
                            userMobile: '01755555555',
                            familyMobile: '01855555555',
                            dob: '2000-05-05',
                            currentAddress: 'Haji Muhammad Muhsin Hall, DU',
                            permanentAddress: 'Rajshahi, Bangladesh'
                        },
                        academic: {
                            regNo: '2020555555',
                            session: '2020-21',
                            department: 'Law',
                            program: 'LL.B (Hons)',
                            hall: 'Haji Muhammad Muhsin Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Student+5&size=400'
                        },
                        submittedAt: '2024-10-01T08:00:00.000Z',
                        reviewedAt: '2024-10-02T11:00:00.000Z',
                        reviewedBy: 'admin-1',
                        blockedAt: '2024-11-20T15:00:00.000Z',
                        blockedBy: 'admin-1'
                    }
                },

                // ========== STUDENT 6: VERIFIED WITH ACTIVE LOANS ==========
                {
                    id: 'user-with-loan',
                    name: 'Student 6 (With Loans)',
                    email: 'student6@du.ac.bd',
                    regNo: '2020666666',
                    password: '123',
                    role: 'student',
                    isVerified: true,
                    verificationStatus: 'verified',
                    phone: '01766666666',
                    verificationData: {
                        payment: {
                            senderNumber: '01766666666',
                            transactionId: 'TRX666666666'
                        },
                        personal: {
                            gender: 'Male',
                            fatherName: 'Student 6 Father',
                            motherName: 'Student 6 Mother',
                            userMobile: '01766666666',
                            familyMobile: '01866666666',
                            dob: '2001-06-06',
                            currentAddress: 'Salimullah Hall, DU',
                            permanentAddress: 'Khulna, Bangladesh'
                        },
                        academic: {
                            regNo: '2020666666',
                            session: '2020-21',
                            department: 'Computer Science',
                            program: 'B.Sc',
                            hall: 'Salimullah Hall'
                        },
                        identity: {
                            method: 'document',
                            idCardFrontUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            idCardBackUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Dhaka_University_logo.svg/1200px-Dhaka_University_logo.svg.png',
                            recentPhotoUrl: 'https://ui-avatars.com/api/?name=Student+6&size=400'
                        },
                        submittedAt: '2024-09-01T10:00:00.000Z',
                        reviewedAt: '2024-09-02T14:00:00.000Z',
                        reviewedBy: 'admin-1'
                    }
                }
            ];
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
        }

        if (!localStorage.getItem(DB_KEYS.LOANS)) {
            // Sample loans for different statuses
            const initialLoans = [
                // ========== PENDING LOAN (Waiting for admin approval) ==========
                {
                    id: 'loan-pending',
                    loanRefNo: 'DUQH-2024-0001',
                    userId: 'user-verified',
                    userName: 'Student 3 (Verified)',
                    userEmail: 'student3@du.ac.bd',
                    regNo: '2020333333',
                    department: 'Economics',
                    amount: 8000,
                    purpose: 'Medical Emergency',
                    reason: 'হাসপাতালে ভর্তি হওয়ার জন্য জরুরি টাকা দরকার। পরীক্ষার খরচ এবং ওষুধের জন্য।',
                    expectedDate: '2025-02-15',
                    paymentMethod: 'bKash',
                    accountNumber: '01733333333',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01733333333' },
                        { type: 'backup', method: 'Nagad', accountNumber: '01833333333' }
                    ],
                    witnesses: [
                        { name: 'রহিম উদ্দিন', relation: 'বন্ধু', phone: '01712345678' },
                        { name: 'করিম সাহেব', relation: 'রুমমেট', phone: '01787654321' }
                    ],
                    status: 'pending',
                    appliedAt: '2024-11-28T10:00:00.000Z'
                },

                // ========== APPROVED LOAN (Approved, waiting for disbursement) ==========
                {
                    id: 'loan-approved',
                    loanRefNo: 'DUQH-2024-0002',
                    userId: 'user-verified',
                    userName: 'Student 3 (Verified)',
                    userEmail: 'student3@du.ac.bd',
                    regNo: '2020333333',
                    department: 'Economics',
                    amount: 5000,
                    purpose: 'Book Purchase',
                    reason: 'সেমিস্টার ফাইনাল পরীক্ষার জন্য বই কিনতে হবে।',
                    expectedDate: '2025-01-30',
                    paymentMethod: 'Nagad',
                    accountNumber: '01833333333',
                    paymentMethods: [
                        { type: 'primary', method: 'Nagad', accountNumber: '01833333333' }
                    ],
                    witnesses: [
                        { name: 'সালমা বেগম', relation: 'বোন', phone: '01756789012' }
                    ],
                    status: 'approved',
                    appliedAt: '2024-11-20T09:00:00.000Z',
                    approvedAt: '2024-11-22T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    adminMessages: [
                        { text: 'আপনার আবেদন অনুমোদন করা হয়েছে। শীঘ্রই টাকা পাঠানো হবে।', author: 'Admin', timestamp: '2024-11-22T14:05:00.000Z' }
                    ]
                },

                // ========== DISBURSED LOAN (Money sent, active loan) ==========
                {
                    id: 'loan-disbursed',
                    loanRefNo: 'DUQH-2024-0003',
                    userId: 'user-with-loan',
                    userName: 'Student 6 (With Loans)',
                    userEmail: 'student6@du.ac.bd',
                    regNo: '2020666666',
                    department: 'Computer Science',
                    amount: 10000,
                    purpose: 'Academic Expenses',
                    reason: 'টিউশন ফি এবং বই কেনার জন্য',
                    expectedDate: '2025-01-15',
                    paymentMethod: 'bKash',
                    accountNumber: '01766666666',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01766666666' },
                        { type: 'backup', method: 'Nagad', accountNumber: '01866666666' }
                    ],
                    witnesses: [
                        { name: 'আব্দুল করিম', relation: 'বাবা', phone: '01711111111' },
                        { name: 'ফাতেমা খাতুন', relation: 'মা', phone: '01722222222' }
                    ],
                    status: 'disbursed',
                    appliedAt: '2024-10-01T10:00:00.000Z',
                    approvedAt: '2024-10-03T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    disbursementInfo: {
                        method: 'bKash',
                        accountNo: '01766666666',
                        transactionId: 'TRX9876543210',
                        disbursedAt: '2024-10-05T11:00:00.000Z'
                    },
                    dueDate: '2024-12-05T00:00:00.000Z'
                },

                // ========== PARTIALLY PAID LOAN (Some amount repaid) ==========
                {
                    id: 'loan-partial',
                    loanRefNo: 'DUQH-2024-0004',
                    userId: 'user-with-loan',
                    userName: 'Student 6 (With Loans)',
                    userEmail: 'student6@du.ac.bd',
                    regNo: '2020666666',
                    department: 'Computer Science',
                    amount: 15000,
                    purpose: 'Family Emergency',
                    reason: 'পরিবারের জরুরি প্রয়োজনে',
                    expectedDate: '2024-10-05',
                    paymentMethod: 'bKash',
                    accountNumber: '01766666666',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01766666666' }
                    ],
                    witnesses: [
                        { name: 'মোঃ রফিকুল ইসলাম', relation: 'চাচা', phone: '01799999999' }
                    ],
                    status: 'partially_paid',
                    appliedAt: '2024-09-01T10:00:00.000Z',
                    approvedAt: '2024-09-03T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    disbursementInfo: {
                        method: 'bKash',
                        accountNo: '01766666666',
                        transactionId: 'TRX1122334455',
                        disbursedAt: '2024-09-05T11:00:00.000Z'
                    },
                    dueDate: '2024-11-05T00:00:00.000Z',
                    currentDueDate: '2024-11-20T00:00:00.000Z',
                    extensions: [
                        {
                            previousDueDate: '2024-10-05T00:00:00.000Z',
                            newDueDate: '2024-10-20T00:00:00.000Z',
                            daysExtended: 15,
                            reason: 'Student requested more time due to exam schedule',
                            extendedAt: '2024-10-03T10:00:00.000Z',
                            extendedBy: 'admin-1'
                        },
                        {
                            previousDueDate: '2024-10-20T00:00:00.000Z',
                            newDueDate: '2024-11-20T00:00:00.000Z',
                            daysExtended: 31,
                            reason: 'Family emergency - father hospitalized',
                            extendedAt: '2024-10-18T14:00:00.000Z',
                            extendedBy: 'admin-1'
                        }
                    ]
                },

                // ========== PAID LOAN (Fully repaid - On Time) ==========
                {
                    id: 'loan-paid-ontime',
                    loanRefNo: 'DUQH-2024-0005',
                    userId: 'user-verified',
                    userName: 'Student 3 (Verified)',
                    userEmail: 'student3@du.ac.bd',
                    regNo: '2020333333',
                    department: 'Economics',
                    amount: 6000,
                    purpose: 'Exam Fee',
                    reason: 'পরীক্ষার ফি জমা দেওয়ার জন্য',
                    expectedDate: '2024-08-30',
                    paymentMethod: 'Nagad',
                    accountNumber: '01833333333',
                    paymentMethods: [
                        { type: 'primary', method: 'Nagad', accountNumber: '01833333333' }
                    ],
                    witnesses: [
                        { name: 'আয়েশা সিদ্দিকা', relation: 'বান্ধবী', phone: '01744444444' }
                    ],
                    status: 'paid',
                    appliedAt: '2024-06-01T10:00:00.000Z',
                    approvedAt: '2024-06-02T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    disbursementInfo: {
                        method: 'Nagad',
                        accountNo: '01833333333',
                        transactionId: 'TRX5566778899',
                        disbursedAt: '2024-06-03T11:00:00.000Z'
                    },
                    dueDate: '2024-08-03T00:00:00.000Z',
                    paidAt: '2024-07-25T15:00:00.000Z',
                    paymentDuration: {
                        daysRemaining: 9,
                        paidOnTime: true
                    }
                },

                // ========== PAID LOAN (Fully repaid - Late) ==========
                {
                    id: 'loan-paid-late',
                    loanRefNo: 'DUQH-2024-0006',
                    userId: 'user-with-loan',
                    userName: 'Student 6 (With Loans)',
                    userEmail: 'student6@du.ac.bd',
                    regNo: '2020666666',
                    department: 'Computer Science',
                    amount: 7000,
                    purpose: 'Transport',
                    reason: 'বাড়ি যাওয়ার জন্য ট্রেনের টিকিট',
                    expectedDate: '2024-04-03',
                    paymentMethod: 'bKash',
                    accountNumber: '01766666666',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01766666666' }
                    ],
                    witnesses: [
                        { name: 'জাহিদ হাসান', relation: 'ভাই', phone: '01755555555' }
                    ],
                    status: 'paid',
                    appliedAt: '2024-03-01T10:00:00.000Z',
                    approvedAt: '2024-03-02T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    disbursementInfo: {
                        method: 'bKash',
                        accountNo: '01766666666',
                        transactionId: 'TRX2233445566',
                        disbursedAt: '2024-03-03T11:00:00.000Z'
                    },
                    dueDate: '2024-05-03T00:00:00.000Z',
                    currentDueDate: '2024-05-03T00:00:00.000Z',
                    extensions: [
                        {
                            previousDueDate: '2024-04-03T00:00:00.000Z',
                            newDueDate: '2024-05-03T00:00:00.000Z',
                            daysExtended: 30,
                            reason: 'Semester exam - needs more time',
                            extendedAt: '2024-04-01T10:00:00.000Z',
                            extendedBy: 'admin-1'
                        }
                    ],
                    paidAt: '2024-05-20T15:00:00.000Z',
                    paymentDuration: {
                        daysRemaining: -17,
                        paidOnTime: false
                    }
                },

                // ========== REJECTED LOAN ==========
                {
                    id: 'loan-rejected',
                    loanRefNo: 'DUQH-2024-0007',
                    userId: 'user-rejected',
                    userName: 'Student 4 (Rejected)',
                    userEmail: 'student4@du.ac.bd',
                    regNo: '2020444444',
                    department: 'History',
                    amount: 20000,
                    purpose: 'Business',
                    reason: 'ব্যবসা শুরু করার জন্য',
                    expectedDate: '2025-06-30',
                    paymentMethod: 'bKash',
                    accountNumber: '01744444444',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01744444444' }
                    ],
                    witnesses: [],
                    status: 'rejected',
                    appliedAt: '2024-11-15T10:00:00.000Z',
                    rejectedAt: '2024-11-16T14:00:00.000Z',
                    rejectedBy: 'admin-1',
                    rejectionReason: 'ব্যবসায়িক উদ্দেশ্যে ঋণ প্রদান করা হয় না। শুধুমাত্র শিক্ষা সংক্রান্ত বা জরুরি প্রয়োজনে ঋণ দেওয়া হয়।',
                    adminMessages: [
                        { text: 'দুঃখিত, আপনার আবেদন গ্রহণযোগ্য নয়। কারণ দেখুন।', author: 'Admin', timestamp: '2024-11-16T14:05:00.000Z' }
                    ]
                },

                // ========== DEFAULTED LOAN (Overdue and marked as defaulted) ==========
                {
                    id: 'loan-defaulted',
                    loanRefNo: 'DUQH-2024-0008',
                    userId: 'user-blocked',
                    userName: 'Student 5 (Blocked)',
                    userEmail: 'student5@du.ac.bd',
                    regNo: '2020555555',
                    department: 'Law',
                    amount: 12000,
                    purpose: 'Tuition Fee',
                    reason: 'সেমিস্টার ফি জমা দেওয়ার জন্য',
                    expectedDate: '2024-08-30',
                    paymentMethod: 'bKash',
                    accountNumber: '01755555555',
                    paymentMethods: [
                        { type: 'primary', method: 'bKash', accountNumber: '01755555555' }
                    ],
                    witnesses: [
                        { name: 'কামাল হোসেন', relation: 'বন্ধু', phone: '01788888888' }
                    ],
                    status: 'defaulted',
                    appliedAt: '2024-06-01T10:00:00.000Z',
                    approvedAt: '2024-06-02T14:00:00.000Z',
                    approvedBy: 'admin-1',
                    disbursementInfo: {
                        method: 'bKash',
                        accountNo: '01755555555',
                        transactionId: 'TRX7788990011',
                        disbursedAt: '2024-06-03T11:00:00.000Z'
                    },
                    dueDate: '2024-08-03T00:00:00.000Z',
                    defaultedAt: '2024-10-15T14:00:00.000Z',
                    defaultedBy: 'admin-1',
                    extensionCount: 2,
                    adminMessages: [
                        { text: 'আপনার ঋণ পরিশোধের সময়সীমা শেষ। অনুগ্রহ করে যোগাযোগ করুন।', author: 'Admin', timestamp: '2024-08-10T10:00:00.000Z' },
                        { text: 'দ্বিতীয়বার সময় বাড়ানো হয়েছে। এবার পরিশোধ না করলে একাউন্ট ব্লক করা হবে।', author: 'Admin', timestamp: '2024-09-15T10:00:00.000Z' },
                        { text: 'ঋণ defaulted হিসেবে চিহ্নিত করা হয়েছে।', author: 'Admin', timestamp: '2024-10-15T14:00:00.000Z' }
                    ],
                    notes: [
                        { text: 'বারবার ফোন করা হয়েছে, কোনো সাড়া নেই।', author: 'Volunteer Rahim', timestamp: '2024-09-01T10:00:00.000Z' },
                        { text: 'পরিবারের সাথে যোগাযোগ করা হয়েছে।', author: 'Admin', timestamp: '2024-09-20T11:00:00.000Z' }
                    ],
                    callLogs: [
                        { volunteer: 'Rahim', outcome: 'No Answer', details: 'ফোন রিসিভ করেনি', timestamp: '2024-08-15T10:00:00.000Z' },
                        { volunteer: 'Karim', outcome: 'Reached', details: 'বলেছে পরে দেবে', timestamp: '2024-09-01T10:00:00.000Z' },
                        { volunteer: 'Admin', outcome: 'No Answer', details: 'ফোন বন্ধ', timestamp: '2024-10-01T10:00:00.000Z' }
                    ]
                }
            ];
            localStorage.setItem(DB_KEYS.LOANS, JSON.stringify(initialLoans));
        }

        // Initialize repayments for partially paid loan
        if (!localStorage.getItem(DB_KEYS.REPAYMENTS)) {
            const initialRepayments = [
                {
                    id: 'repay-1',
                    userId: 'user-with-loan',
                    userName: 'Student 6 (With Loans)',
                    loanId: 'loan-partial',
                    amount: 5000,
                    paymentType: 'partial',
                    method: 'bKash',
                    trxId: 'BKASH123456',
                    senderAccount: '01766666666',
                    status: 'verified',
                    date: '2024-10-01T10:00:00.000Z',
                    verifiedAt: '2024-10-01T14:00:00.000Z',
                    verifiedBy: 'admin-1'
                },
                {
                    id: 'repay-2',
                    userId: 'user-with-loan',
                    userName: 'Student 6 (With Loans)',
                    loanId: 'loan-partial',
                    amount: 3000,
                    paymentType: 'partial',
                    method: 'Nagad',
                    trxId: 'NAGAD789012',
                    senderAccount: '01866666666',
                    status: 'verified',
                    date: '2024-10-20T09:30:00.000Z',
                    verifiedAt: '2024-10-20T14:00:00.000Z',
                    verifiedBy: 'admin-1'
                },
                {
                    id: 'repay-3',
                    userId: 'user-verified',
                    userName: 'Verified Student',
                    loanId: 'loan-paid-ontime',
                    amount: 6000,
                    paymentType: 'full',
                    method: 'Nagad',
                    trxId: 'NAGAD111222',
                    senderAccount: '01833333333',
                    status: 'verified',
                    date: '2024-07-25T15:00:00.000Z',
                    verifiedAt: '2024-07-25T16:00:00.000Z',
                    verifiedBy: 'admin-1'
                },
                {
                    id: 'repay-4',
                    userId: 'user-with-loan',
                    userName: 'Loan Active Student',
                    loanId: 'loan-paid-late',
                    amount: 7000,
                    paymentType: 'full',
                    method: 'bKash',
                    trxId: 'BKASH333444',
                    senderAccount: '01766666666',
                    status: 'verified',
                    date: '2024-05-20T15:00:00.000Z',
                    verifiedAt: '2024-05-20T16:00:00.000Z',
                    verifiedBy: 'admin-1'
                }
            ];
            localStorage.setItem(DB_KEYS.REPAYMENTS, JSON.stringify(initialRepayments));
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
