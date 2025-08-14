document.addEventListener('DOMContentLoaded', async () => {
    // Define the base URL for your API
    const API_URL = 'https://traininghealthandsafety.com:4000';

    // Get references to DOM elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginLoader = document.getElementById('login-loader');
    const registerLoader = document.getElementById('register-loader');

    // Helper function to show a temporary message box
    const showMessage = (message, isError = false) => {
        // Create the message box element
        let messageBox = document.createElement('div');
        messageBox.className = `message-box ${isError ? 'error' : 'success'}`;
        messageBox.textContent = message;

        // Append to the body
        document.body.appendChild(messageBox);

        // Show the message box
        setTimeout(() => {
            messageBox.classList.add('show');
        }, 10);

        // Hide and remove the message box after 3 seconds
        setTimeout(() => {
            messageBox.classList.remove('show');
            // Remove the element after the transition ends
            messageBox.addEventListener('transitionend', () => {
                messageBox.remove();
            }, { once: true });
        }, 3000);
    };

    // Helper function to toggle between login and registration forms
    const toggleForms = (showLogin) => {
        if (showLogin) {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    };

    // Add event listeners for form toggling
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms(false);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleForms(true);
        });
    }

    // Handle Registration Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match!', true);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/user/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(result.message);
                    toggleForms(true);
                } else {
                    showMessage(result.message || 'Registration failed.', true);
                }
            } catch (error) {
                console.error('Registration Error:', error);
                showMessage('An unexpected error occurred during registration.', true);
            }
        });
    }

    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show loader and disable button
            loginLoader.style.display = 'block';

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_URL}/user/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    showMessage(result.message || 'Login successful!');
                    window.location.href = 'home.html';

                    // Hide loader and re-enable button
                    loginLoader.style.display = 'none';
                } else {
                    showMessage(result.message || 'Login failed.', true);
                    // Hide loader and re-enable button
                     loginLoader.style.display = 'none';
                }
            } catch (error) {
                console.error('Login Error:', error);
                showMessage('An unexpected error occurred during login.', true);
                // Hide loader and re-enable button
                loginLoader.style.display = 'none';
            }
        });
    }
});