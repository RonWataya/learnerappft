document.addEventListener('DOMContentLoaded', async () => {
    // Define the base URL for your API
    //const API_URL = 'http://localhost:3000';
    const API_URL = 'https://traininghealthandsafety.com:4000';

    // Get references to DOM elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Helper function to show a temporary message box
    const showMessage = (message, isError = false) => {
        // Find the existing message box or create a new one
        let alertDiv = document.querySelector('.custom-alert');
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.className = 'custom-alert fixed-top start-50 translate-middle-x mt-3 p-3 rounded-3 shadow-lg text-white text-center d-none';
            document.body.appendChild(alertDiv);
        }

        // Set the message and style
        alertDiv.textContent = message;
        alertDiv.classList.remove('d-none', 'alert-success', 'alert-danger');
        alertDiv.classList.add('d-block', `alert-${isError ? 'danger' : 'success'}`);

        // Automatically hide the message after a few seconds
        setTimeout(() => {
            alertDiv.classList.remove('d-block');
            alertDiv.classList.add('d-none');
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
                    toggleForms(true); // Switch to login form after successful registration
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
                    // This is the crucial part that was missing
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    showMessage(result.message || 'Login successful!');
                    // Redirect to the home page after a successful login
                    window.location.href = 'home.html';
                } else {
                    showMessage(result.message || 'Login failed.', true);
                }
            } catch (error) {
                console.error('Login Error:', error);
                showMessage('An unexpected error occurred during login.', true);
            }
        });
    }
});
