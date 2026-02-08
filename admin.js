/**
 * Admin Dashboard JavaScript
 * Handles login, analytics, messages, and export functionality
 */

// Firebase imports (using compat for compatibility)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEQtx2ZPolatun-dYQGBgrqtpw8Apvntg",
    authDomain: "my-portfolio-fd428.firebaseapp.com",
    projectId: "my-portfolio-fd428",
    storageBucket: "my-portfolio-fd428.firebasestorage.app",
    messagingSenderId: "8100051076",
    appId: "1:8100051076:web:11a119a44a5d3a2f4faad1",
    measurementId: "G-FJ097WW1B1",
    databaseURL: "https://my-portfolio-fd428-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const adminLoginModal = document.getElementById('adminLoginModal');
const adminPanel = document.getElementById('adminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const closeAdminLogin = document.getElementById('closeAdminLogin');
const logoutBtn = document.getElementById('logoutBtn');
const adminUserEmail = document.getElementById('adminUserEmail');
const confirmModal = document.getElementById('confirmModal');
const successToast = document.getElementById('successToast');

// State
let allMessages = [];
let currentFilter = 'all';
let visitorChart = null;
let messageTypeChart = null;
let autoSyncInterval = null;

// Categories with colors
const categoryColors = {
    'General Inquiry': { bg: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' },
    'Job Opportunity': { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
    'Project Collaboration': { bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' },
    'Feedback': { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
    'Other': { bg: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }
};

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setupAdminAccess();
    setupEventListeners();

    // Check auth state
    onAuthStateChanged(auth, (user) => {
        if (user && adminPanel.style.display === 'block') {
            showAdminPanel(user);
        }
    });
});

// Setup secret admin access (Ctrl+Shift+A or triple-click logo)
function setupAdminAccess() {
    let clickCount = 0;
    let clickTimer = null;

    // Triple-click on logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            clickCount++;
            if (clickCount === 3) {
                e.preventDefault();
                openAdminLogin();
                clickCount = 0;
                clearTimeout(clickTimer);
            }
            if (!clickTimer) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    clickTimer = null;
                }, 500);
            }
        });
    }

    // Ctrl+Shift+A keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            openAdminLogin();
        }
    });
}

// Open admin login modal
function openAdminLogin() {
    adminLoginModal.classList.add('active');
}

// Close admin login modal
function closeAdminLoginModal() {
    adminLoginModal.classList.remove('active');
    loginError.style.display = 'none';
    adminLoginForm.reset();
}

// Setup event listeners
function setupEventListeners() {
    // Close login modal
    if (closeAdminLogin) {
        closeAdminLogin.addEventListener('click', closeAdminLoginModal);
    }

    // Click outside modal to close
    adminLoginModal?.addEventListener('click', (e) => {
        if (e.target === adminLoginModal) {
            closeAdminLoginModal();
        }
    });

    // Login form submission
    adminLoginForm?.addEventListener('submit', handleLogin);

    // Logout button
    logoutBtn?.addEventListener('click', handleLogout);

    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Message filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterMessages(btn.dataset.filter));
    });

    // Refresh messages
    document.getElementById('refreshMessages')?.addEventListener('click', loadMessages);

    // Mark all as read
    document.getElementById('markAllRead')?.addEventListener('click', markAllMessagesRead);

    // Export buttons
    document.getElementById('exportExcel')?.addEventListener('click', () => exportToCSV(true));
    document.getElementById('exportCSV')?.addEventListener('click', () => exportToCSV(false));
    document.getElementById('exportJSON')?.addEventListener('click', exportToJSON);

    // Sync button
    document.getElementById('syncNowBtn')?.addEventListener('click', syncToGoogleSheets);

    // Auto-sync toggle
    document.getElementById('autoSyncToggle')?.addEventListener('change', toggleAutoSync);

    // Toast close
    document.querySelector('.toast-close')?.addEventListener('click', hideToast);

    // Confirm modal buttons
    document.getElementById('confirmCancel')?.addEventListener('click', closeConfirmModal);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = adminEmail.value;
    const password = adminPassword.value;
    const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        closeAdminLoginModal();
        showAdminPanel(userCredential.user);
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = getErrorMessage(error.code);
        loginError.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Get friendly error message
function getErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };
    return messages[code] || 'Login failed. Please try again.';
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        hideAdminPanel();
        showToast('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show admin panel
function showAdminPanel(user) {
    adminPanel.style.display = 'block';
    adminUserEmail.textContent = user.email;
    document.body.style.overflow = 'hidden';

    // Load all data
    loadAnalytics();
    loadMessages();
}

// Hide admin panel
function hideAdminPanel() {
    adminPanel.style.display = 'none';
    document.body.style.overflow = '';

    // Clear auto-sync interval
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Record page visit
async function recordVisit() {
    const today = new Date().toISOString().split('T')[0];
    const visitsRef = ref(database, `analytics/visits/${today}`);

    try {
        const snapshot = await get(visitsRef);
        const currentCount = snapshot.val() || 0;
        await set(visitsRef, currentCount + 1);
    } catch (error) {
        console.error('Error recording visit:', error);
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        // Get messages for stats
        const messagesRef = ref(database, 'contacts');
        const messagesSnapshot = await get(messagesRef);
        const messages = messagesSnapshot.val();

        let totalMessages = 0;
        let unreadMessages = 0;
        const categoryCount = {};

        if (messages) {
            Object.values(messages).forEach(msg => {
                totalMessages++;
                if (!msg.read) unreadMessages++;

                const category = msg.subject || 'General Inquiry';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
        }

        // Get visits
        const visitsRef = ref(database, 'analytics/visits');
        const visitsSnapshot = await get(visitsRef);
        const visits = visitsSnapshot.val() || {};

        const today = new Date().toISOString().split('T')[0];
        const todayViews = visits[today] || 0;
        const totalViews = Object.values(visits).reduce((sum, val) => sum + val, 0);

        // Update stats
        document.getElementById('totalViews').textContent = formatNumber(totalViews);
        document.getElementById('totalMessages').textContent = formatNumber(totalMessages);
        document.getElementById('todayViews').textContent = formatNumber(todayViews);
        document.getElementById('unreadMessages').textContent = formatNumber(unreadMessages);
        document.getElementById('unreadBadge').textContent = unreadMessages;

        // Create charts
        createVisitorChart(visits);
        createMessageTypeChart(categoryCount);

    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Format number
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Create visitor trends chart
function createVisitorChart(visits) {
    const canvas = document.getElementById('visitorChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Get last 7 days
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });

        labels.push(dayName);
        data.push(visits[dateStr] || 0);
    }

    // Destroy existing chart
    if (visitorChart) {
        visitorChart.destroy();
    }

    visitorChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visitors',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#252836',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 10,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 12 },
                        stepSize: 2
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 12 }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Create message categories chart
function createMessageTypeChart(categoryCount) {
    const canvas = document.getElementById('messageTypeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let labels = Object.keys(categoryCount);
    let data = Object.values(categoryCount);
    let colors;

    // Dynamic color palette for any categories
    const colorPalette = [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#8b5cf6', // Violet
        '#06b6d4', // Cyan
        '#ef4444', // Red
        '#84cc16', // Lime
        '#f97316', // Orange
        '#14b8a6'  // Teal
    ];

    // If no data, show placeholder
    if (labels.length === 0) {
        labels = ['General Inquiry', 'Job Opportunity', 'Feedback', 'Other'];
        data = [0, 0, 0, 0];
        colors = colorPalette.slice(0, 4);
    } else {
        // Assign a unique color to each category
        colors = labels.map((label, index) => {
            return categoryColors[label]?.color || colorPalette[index % colorPalette.length];
        });
    }

    // Destroy existing chart
    if (messageTypeChart) {
        messageTypeChart.destroy();
    }

    // Check if all data is zero
    const hasData = data.some(val => val > 0);

    messageTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: hasData ? data : [1, 1, 1, 1],
                backgroundColor: hasData ? colors : ['#374151', '#374151', '#374151', '#374151'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#9ca3af',
                        padding: 15,
                        font: { size: 11 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: hasData,
                    callbacks: {
                        label: function (context) {
                            return hasData ? `${context.label}: ${context.raw}` : 'No data yet';
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Load messages
async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '<div class="loading-messages"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';

    try {
        const messagesRef = ref(database, 'contacts');
        const snapshot = await get(messagesRef);
        const messages = snapshot.val();

        if (!messages) {
            allMessages = [];
            renderMessages([]);
            return;
        }

        // Convert to array with IDs
        allMessages = Object.entries(messages).map(([id, msg]) => ({
            id,
            ...msg
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        filterMessages(currentFilter);
        updateUnreadBadge();

    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = '<div class="no-messages"><i class="fas fa-exclamation-circle"></i><p>Error loading messages</p></div>';
    }
}

// Filter messages
function filterMessages(filter) {
    currentFilter = filter;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    let filtered = [...allMessages];

    if (filter === 'unread') {
        filtered = filtered.filter(msg => !msg.read);
    } else if (filter === 'read') {
        filtered = filtered.filter(msg => msg.read);
    }

    renderMessages(filtered);
}

// Render messages
function renderMessages(messages) {
    const container = document.getElementById('messagesContainer');

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-inbox"></i>
                <p>No messages found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(msg => {
        const category = msg.subject || 'General Inquiry';
        const categoryStyle = categoryColors[category] || categoryColors['Other'];
        const date = new Date(msg.timestamp).toLocaleString();

        return `
            <div class="message-card ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
                <div class="message-header">
                    <div class="message-info">
                        <h4>
                            ${msg.name}
                            ${!msg.read ? '<span class="unread-badge">New</span>' : ''}
                            <span class="category-badge" style="background: ${categoryStyle.bg}; color: ${categoryStyle.color};">${category}</span>
                        </h4>
                        <p>${msg.email}</p>
                    </div>
                    <div class="message-actions">
                        ${!msg.read ? `<button class="mark-read-btn" onclick="markAsRead('${msg.id}')"><i class="fas fa-check"></i> Mark Read</button>` : ''}
                        <button class="delete-btn" onclick="deleteMessage('${msg.id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
                <div class="message-body">${msg.message}</div>
                <div class="message-date"><i class="fas fa-clock"></i> ${date}</div>
            </div>
        `;
    }).join('');
}

// Update unread badge
function updateUnreadBadge() {
    const unreadCount = allMessages.filter(msg => !msg.read).length;
    document.getElementById('unreadBadge').textContent = unreadCount;
    document.getElementById('unreadMessages').textContent = unreadCount;
}

// Mark message as read
window.markAsRead = async function (id) {
    try {
        await update(ref(database, `contacts/${id}`), { read: true });

        // Update local state
        const msg = allMessages.find(m => m.id === id);
        if (msg) msg.read = true;

        filterMessages(currentFilter);
        updateUnreadBadge();
        showToast('Success', 'Message marked as read');
    } catch (error) {
        console.error('Error marking as read:', error);
    }
};

// Delete message
window.deleteMessage = function (id) {
    showConfirmModal(
        'Delete Message',
        'Are you sure you want to delete this message? This action cannot be undone.',
        async () => {
            try {
                // Find the message to get email and content for Sheets sync
                const msg = allMessages.find(m => m.id === id);

                // Delete from Firebase
                await remove(ref(database, `contacts/${id}`));

                // Also delete from Google Sheets
                if (msg) {
                    const sheetsUrl = document.getElementById('sheetsUrl').value;
                    const params = new URLSearchParams({
                        action: 'delete',
                        email: msg.email || '',
                        message: msg.message || ''
                    });

                    try {
                        await fetch(`${sheetsUrl}?${params.toString()}`, {
                            method: 'GET',
                            mode: 'no-cors'
                        });
                        console.log('Message deleted from Google Sheets');
                    } catch (sheetErr) {
                        console.error('Error deleting from Sheets:', sheetErr);
                    }
                }

                allMessages = allMessages.filter(m => m.id !== id);
                filterMessages(currentFilter);
                updateUnreadBadge();
                showToast('Deleted', 'Message has been deleted from Firebase and Google Sheets');
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    );
};

// Mark all messages as read
async function markAllMessagesRead() {
    const unreadMessages = allMessages.filter(msg => !msg.read);

    if (unreadMessages.length === 0) {
        showToast('Info', 'All messages are already read');
        return;
    }

    showConfirmModal(
        'Mark All as Read',
        `Are you sure you want to mark ${unreadMessages.length} message(s) as read?`,
        async () => {
            try {
                const updates = {};
                unreadMessages.forEach(msg => {
                    updates[`contacts/${msg.id}/read`] = true;
                });

                await update(ref(database), updates);

                // Update local state
                allMessages.forEach(msg => msg.read = true);
                filterMessages(currentFilter);
                updateUnreadBadge();
                showToast('Success', 'All messages marked as read');
            } catch (error) {
                console.error('Error marking all as read:', error);
            }
        }
    );
}

// Export to CSV
function exportToCSV(isExcel) {
    if (allMessages.length === 0) {
        showToast('No Data', 'No messages to export');
        return;
    }

    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date', 'Status'];
    const rows = allMessages.map(msg => [
        msg.name,
        msg.email,
        msg.subject || 'General Inquiry',
        msg.message.replace(/"/g, '""'),
        new Date(msg.timestamp).toLocaleString(),
        msg.read ? 'Read' : 'Unread'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact_messages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Exported', `Messages exported to ${isExcel ? 'Excel (CSV)' : 'CSV'}`);
}

// Export to JSON
function exportToJSON() {
    if (allMessages.length === 0) {
        showToast('No Data', 'No messages to export');
        return;
    }

    const data = allMessages.map(msg => ({
        name: msg.name,
        email: msg.email,
        subject: msg.subject || 'General Inquiry',
        message: msg.message,
        timestamp: msg.timestamp,
        read: msg.read
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact_messages_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Exported', 'Messages exported to JSON');
}

// Sync to Google Sheets
async function syncToGoogleSheets() {
    const syncBtn = document.getElementById('syncNowBtn');
    const syncStatus = document.getElementById('syncStatus');
    const sheetsUrl = document.getElementById('sheetsUrl').value;

    syncBtn.disabled = true;
    syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    syncStatus.innerHTML = '<i class="fas fa-circle" style="color: #f59e0b;"></i> Loading messages...';

    try {
        // First, load messages directly from Firebase to ensure we have the latest data
        const messagesRef = ref(database, 'contacts');
        const snapshot = await get(messagesRef);
        const messages = snapshot.val();

        // Step 1: Clear the Google Sheet first
        syncStatus.innerHTML = '<i class="fas fa-circle" style="color: #f59e0b;"></i> Clearing old data...';
        try {
            await fetch(`${sheetsUrl}?action=clear`, {
                method: 'GET',
                mode: 'no-cors'
            });
            console.log('Cleared Google Sheet');
            // Small delay to ensure clear completes
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (clearErr) {
            console.error('Error clearing sheet:', clearErr);
        }

        if (!messages) {
            showToast('Synced', 'Sheet cleared - no messages in Firebase');
            syncStatus.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> Synced (0 messages)';
            return;
        }

        // Convert to array
        const messagesToSync = Object.entries(messages).map(([id, msg]) => ({
            id,
            ...msg
        }));

        console.log('Messages to sync:', messagesToSync.length);
        syncStatus.innerHTML = `<i class="fas fa-circle" style="color: #f59e0b;"></i> Adding ${messagesToSync.length} messages...`;

        let syncedCount = 0;

        // Step 2: Add all current messages
        for (const msg of messagesToSync) {
            const params = new URLSearchParams({
                action: 'submit',
                name: msg.name || '',
                email: msg.email || '',
                subject: msg.subject || 'General Inquiry',
                message: msg.message || '',
                status: msg.read ? 'read' : 'unread'
            });

            try {
                await fetch(`${sheetsUrl}?${params.toString()}`, {
                    method: 'GET',
                    mode: 'no-cors'
                });
                syncedCount++;
                console.log(`Synced message ${syncedCount}/${messagesToSync.length}`);
            } catch (err) {
                console.error('Error syncing message:', err);
            }
        }

        // Update status
        syncStatus.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> Synced successfully';
        document.getElementById('lastSync').textContent = `Last sync: ${new Date().toLocaleString()}`;

        // Save last sync time
        localStorage.setItem('lastSync', new Date().toISOString());

        showToast('Synced', `${syncedCount} message(s) synced to Google Sheets`);

    } catch (error) {
        console.error('Sync error:', error);
        syncStatus.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> Sync failed';
        showToast('Error', 'Failed to sync to Google Sheets');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = '<i class="fas fa-sync"></i> Sync Now';
    }
}

// Toggle auto-sync
function toggleAutoSync() {
    const toggle = document.getElementById('autoSyncToggle');

    if (toggle.checked) {
        // Start auto-sync (every 30 minutes)
        syncToGoogleSheets();
        autoSyncInterval = setInterval(syncToGoogleSheets, 30 * 60 * 1000);
        showToast('Auto-Sync Enabled', 'Data will sync every 30 minutes');
    } else {
        // Stop auto-sync
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }
        showToast('Auto-Sync Disabled', 'Automatic sync has been turned off');
    }
}

// Show confirm modal
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmModal.classList.add('active');

    const confirmOk = document.getElementById('confirmOk');
    const newConfirmOk = confirmOk.cloneNode(true);
    confirmOk.parentNode.replaceChild(newConfirmOk, confirmOk);

    newConfirmOk.addEventListener('click', () => {
        onConfirm();
        closeConfirmModal();
    });
}

// Close confirm modal
function closeConfirmModal() {
    confirmModal.classList.remove('active');
}

// Show toast notification
function showToast(title, message) {
    const toast = document.getElementById('successToast');
    toast.querySelector('.toast-text h3').textContent = title;
    toast.querySelector('.toast-text p').textContent = message;
    toast.classList.add('show');

    setTimeout(hideToast, 4000);
}

// Hide toast
function hideToast() {
    successToast.classList.remove('show');
}

// Load last sync time
function loadLastSync() {
    const lastSync = localStorage.getItem('lastSync');
    if (lastSync) {
        document.getElementById('lastSync').textContent = `Last sync: ${new Date(lastSync).toLocaleString()}`;
    }
}

// Initialize on load
loadLastSync();
