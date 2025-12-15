document.addEventListener('DOMContentLoaded', function () {
    // Modal Logic
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const closeBtns = document.querySelectorAll('.close');

    if (loginBtn) {
        loginBtn.onclick = () => loginModal.style.display = 'block';
    }
    if (signupBtn) {
        signupBtn.onclick = () => signupModal.style.display = 'block';
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'none';
            const serviceModal = document.getElementById('service-modal');
            if (serviceModal) serviceModal.style.display = 'none';
            const bookModal = document.getElementById('book-modal');
            if (bookModal) bookModal.style.display = 'none';
            const bidModal = document.getElementById('bid-modal');
            if (bidModal) bidModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function (event) {
        if (loginModal && event.target == loginModal) loginModal.style.display = 'none';
        if (signupModal && event.target == signupModal) signupModal.style.display = 'none';

        const serviceModal = document.getElementById('service-modal');
        if (serviceModal && event.target == serviceModal) serviceModal.style.display = 'none';

        const bookModal = document.getElementById('book-modal');
        if (bookModal && event.target == bookModal) bookModal.style.display = 'none';

        const bidModal = document.getElementById('bid-modal');
        if (bidModal && event.target == bidModal) bidModal.style.display = 'none';

        const chatInterface = document.getElementById('chat-interface');
        const chatBubble = document.getElementById('chat-bubble');

        // Close chat if clicked outside of it and not on the bubble
        if (chatInterface && chatInterface.style.display !== 'none' &&
            !chatInterface.contains(event.target) &&
            chatBubble && event.target !== chatBubble &&
            !chatBubble.contains(event.target)) {
            chatInterface.style.display = 'none';
        }
    });

    // Password Toggle
    const togglePasswords = document.querySelectorAll('.toggle-password');
    togglePasswords.forEach(icon => {
        icon.onclick = function () {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        }
    });

    // Login Slider Logic
    const loginSliderBtns = document.querySelectorAll('.login-slider-btn');
    const loginUserTypeInput = document.getElementById('login-user-type');

    if (loginSliderBtns.length > 0) {
        loginSliderBtns.forEach(btn => {
            btn.onclick = function () {
                loginSliderBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const type = this.getAttribute('data-type');
                if (loginUserTypeInput) loginUserTypeInput.value = type;
            }
        });
    }

    // Password Strength Checker
    const sliderBtns = document.querySelectorAll('.slider-btn');
    const userTypeInput = document.getElementById('user-type');
    const pwdFields = document.getElementById('pwd-fields');
    const clientFields = document.getElementById('client-fields');

    sliderBtns.forEach(btn => {
        btn.onclick = function () {
            sliderBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const type = this.getAttribute('data-type');
            userTypeInput.value = type;

            if (type === 'pwd') {
                pwdFields.style.display = 'block';
                clientFields.style.display = 'none';
            } else {
                pwdFields.style.display = 'none';
                clientFields.style.display = 'block';
            }
        }
    });

    // Password Strength Checker
    const signupPassword = document.getElementById('signup-password');
    const strengthDiv = document.getElementById('password-strength');

    if (signupPassword) {
        signupPassword.addEventListener('input', function () {
            const val = this.value;
            let strength = 0;
            if (val.length >= 8) strength++;
            if (/[A-Z]/.test(val)) strength++;
            if (/[0-9]/.test(val)) strength++;
            if (/[^A-Za-z0-9]/.test(val)) strength++;

            let text = '';
            let color = '';
            switch (strength) {
                case 0:
                case 1: text = 'Weak'; color = 'red'; break;
                case 2: text = 'Medium'; color = 'orange'; break;
                case 3:
                case 4: text = 'Strong'; color = 'green'; break;
            }
            strengthDiv.innerText = text;
            strengthDiv.style.color = color;
        });
    }

    // Auth Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Show loading state
            btn.innerHTML = '<span class="spinner"></span> ' + originalText;
            btn.disabled = true;

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/accounts/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    window.location.href = '/tubonge/';
                } else {
                    alert('Login failed. Please check your credentials.');
                    // Reset button state on failure
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                // Reset button state on error
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    if (signupForm) {
        signupForm.onsubmit = async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Show loading state
            btn.innerHTML = '<span class="spinner"></span> ' + originalText;
            btn.disabled = true;

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Transform data for nested serializers
            const payload = {
                username: data.username,
                email: data.email,
                password: data.password,
                phone_number: data.phone_number,
                is_pwd: data.user_type === 'pwd',
                is_client: data.user_type === 'client'
            };

            if (payload.is_pwd) {
                payload.pwd_profile = { disability_type: data.disability_type };
            } else {
                payload.client_profile = { client_type: data.client_type };
            }

            try {
                const response = await fetch('/api/accounts/signup/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    window.location.href = '/tubonge/';
                } else {
                    const err = await response.json();
                    alert('Signup failed: ' + JSON.stringify(err));
                    // Reset button state on failure
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                // Reset button state on error
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }
});

// Chat Bubble Logic
// chatBubble and chatInterface are already declared and captured from top of scope or need to be retrieved again without const if we want fresh reference, but IDs don't change.
// However, to be safe and avoid lint errors with the previous block, let's just use the elements.
// We didn't declare them at the top level of DOMContentLoaded, we declared them inside the click listener.
// Wait, the previous block was inside window.addEventListener('click', ...).
// The lint error says 'chatInterface' redeclared. 
// Chat Bubble Logic
const chatBubbleBtn = document.getElementById('chat-bubble');
const chatInterfaceDiv = document.getElementById('chat-interface');
const closeChatBtn = document.getElementById('close-chat');

if (chatBubbleBtn) {
    chatBubbleBtn.onclick = function () {
        if (chatInterfaceDiv) {
            chatInterfaceDiv.style.display = 'flex';
            loadConversations();
        }
    }
}

if (closeChatBtn) {
    closeChatBtn.onclick = function () {
        if (chatInterfaceDiv) chatInterfaceDiv.style.display = 'none';
    }
}

// Logout Logic
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = async function () {
        try {
            const response = await fetch('/api/accounts/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            // Fallback: redirect anyway
            window.location.href = '/';
        }
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Chat functions placeholder - to be implemented in chat.js
function loadConversations() {
    // Fetch conversations from API
    console.log('Loading conversations...');
}
