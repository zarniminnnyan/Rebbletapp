document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');

    // Password strength elements
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const passwordRequirements = document.getElementById('passwordRequirements');

    const reqLength = document.getElementById('reqLength');
    const reqUppercase = document.getElementById('reqUppercase');
    const reqLowercase = document.getElementById('reqLowercase');
    const reqNumber = document.getElementById('reqNumber');
    const reqSpecial = document.getElementById('reqSpecial');

    const passwordCriteria = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    };

    // Show indicators on focus
    passwordInput.addEventListener('focus', () => {
        passwordRequirements.style.maxHeight = '150px';
        passwordRequirements.style.padding = '10px 10px 10px 12px';
        passwordRequirements.style.marginTop = '10px';
        passwordStrength.style.opacity = '1';
    });

    // Hide indicators if empty
    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value === '') {
            passwordRequirements.style.maxHeight = '0';
            passwordRequirements.style.padding = '0 10px 0 12px';
            passwordRequirements.style.marginTop = '0';
            passwordStrength.style.opacity = '0';
        }
    });

    // Update indicators on input
    passwordInput.addEventListener('input', () => {
        validatePassword();
        updatePasswordStrength();
    });

    function validatePassword() {
        const password = passwordInput.value;

        passwordCriteria.length = password.length >= 8;
        passwordCriteria.uppercase = /[A-Z]/.test(password);
        passwordCriteria.lowercase = /[a-z]/.test(password);
        passwordCriteria.number = /[0-9]/.test(password);
        passwordCriteria.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        updateRequirementIndicator(reqLength, passwordCriteria.length);
        updateRequirementIndicator(reqUppercase, passwordCriteria.uppercase);
        updateRequirementIndicator(reqLowercase, passwordCriteria.lowercase);
        updateRequirementIndicator(reqNumber, passwordCriteria.number);
        updateRequirementIndicator(reqSpecial, passwordCriteria.special);
    }

    function updatePasswordStrength() {
        let strength = 0;

        if (passwordCriteria.length) strength += 20;
        if (passwordCriteria.uppercase) strength += 20;
        if (passwordCriteria.lowercase) strength += 20;
        if (passwordCriteria.number) strength += 20;
        if (passwordCriteria.special) strength += 20;

        strengthBar.style.width = `${strength}%`;

        if (strength < 40) {
            strengthBar.style.backgroundColor = '#ffb000';
        } else if (strength < 80) {
            strengthBar.style.backgroundColor = '#ff8b00';
        } else {
            strengthBar.style.backgroundColor = '#ff4500';
        }
    }

    function updateRequirementIndicator(element, isValid) {
        const icon = element.querySelector('i');

        if (isValid) {
            element.classList.add('valid');
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#ff4500';
        } else {
            element.classList.remove('valid');
            icon.className = 'fas fa-circle';
            icon.style.color = '#878a8c';
        }
    }
});
