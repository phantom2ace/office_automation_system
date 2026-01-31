// Notification System
(function() {
    // 1. Initialize Container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Show Toast Function
    window.showToast = function(title, message, type = 'info', onClick = null) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'success') toast.style.borderLeftColor = 'var(--success)';
        if (type === 'error') toast.style.borderLeftColor = 'var(--danger)';
        if (type === 'warning') toast.style.borderLeftColor = 'var(--warning)';

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close">&times;</div>
        `;

        // Click to open message
        if (onClick) {
            toast.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toast-close')) {
                    onClick();
                }
            });
        }

        // Close button
        toast.querySelector('.toast-close').onclick = (e) => {
            e.stopPropagation();
            removeToast(toast);
        };

        // Auto remove
        setTimeout(() => removeToast(toast), 5000);

        container.appendChild(toast);
    };

    function removeToast(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }

    // 3. Socket.IO Integration
    function initSocket() {
        if (typeof io === 'undefined') {
            // Load Socket.IO if not present
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = connectSocket;
            document.head.appendChild(script);
        } else {
            connectSocket();
        }
    }

    function connectSocket() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        
        // Reuse existing socket if available globally
        let socket = window.socket;
        
        if (!socket) {
            socket = io();
            window.socket = socket; // Make it global
            
            socket.on('connect', () => {
                console.log('Notification system connected');
                socket.emit('join_room', user.id);
            });
        }

        // Listen for messages
        // Remove existing listener to avoid duplicates if re-initialized
        socket.off('receive_message', handleMessageNotification);
        socket.on('receive_message', handleMessageNotification);
    }

    function handleMessageNotification(data) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Don't show notification if:
        // 1. I sent it (shouldn't happen via receive_message usually, but just in case)
        // 2. I'm currently in the chat with this person (window.currentChatId matches)
        
        if (data.senderId == user.id) return;
        
        if (window.currentChatId && (window.currentChatId == data.senderId)) {
            return; // Chat is open, no toast needed
        }

        // Update sidebar counter if function exists
        if (typeof window.updateUnreadCount === 'function') {
            window.updateUnreadCount();
        }

        // Fetch sender name if not provided (or assume we have it in cache/local storage?)
        // For now, use "New Message" or try to find name
        // We can't easily fetch user name here without an API call, but let's try to be generic
        
        // Play sound (Optional - requires file)
        // const audio = new Audio('/assets/notification.mp3'); 
        // audio.play().catch(e => console.log('Audio play failed', e));
        
        showToast(
            'New Message', 
            data.content.length > 50 ? data.content.substring(0, 50) + '...' : data.content,
            'info',
            () => {
                window.location.href = 'messages.html';
            }
        );
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSocket);
    } else {
        initSocket();
    }
})();
