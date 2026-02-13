 const loginToggle = document.getElementById('loginToggle');
        const registerToggle = document.getElementById('registerToggle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        
        function showLoginForm() {
            loginForm.classList.remove('hidden');
            loginForm.classList.add('visible');
            registerForm.classList.remove('visible');
            registerForm.classList.add('hidden');
            
            loginToggle.classList.add('active');
            registerToggle.classList.remove('active');
        }
        
        function showRegisterForm() {
            registerForm.classList.remove('hidden');
            registerForm.classList.add('visible');
            loginForm.classList.remove('visible');
            loginForm.classList.add('hidden');
            
            registerToggle.classList.add('active');
            loginToggle.classList.remove('active');
        }
        
        loginToggle.addEventListener('click', showLoginForm);
        registerToggle.addEventListener('click', showRegisterForm);
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });

          // Password toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Toggle for login password
            const toggleLoginPassword = document.getElementById('toggleLoginPassword');
            const loginPasswordInput = document.getElementById('loginPassword');
            
            if (toggleLoginPassword && loginPasswordInput) {
                toggleLoginPassword.addEventListener('click', function() {
                    const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    loginPasswordInput.setAttribute('type', type);
                    this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
                });
            }
            
            // Toggle for register password
            const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
            const registerPasswordInput = document.getElementById('registerPassword');
            
            if (toggleRegisterPassword && registerPasswordInput) {
                toggleRegisterPassword.addEventListener('click', function() {
                    const type = registerPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    registerPasswordInput.setAttribute('type', type);
                    this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
                });
            }
            
            // Toggle for confirm password
            const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            
            if (toggleConfirmPassword && confirmPasswordInput) {
                toggleConfirmPassword.addEventListener('click', function() {
                    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    confirmPasswordInput.setAttribute('type', type);
                    this.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
                });
            }
        });