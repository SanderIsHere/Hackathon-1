document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const formMessage = document.getElementById('formMessage'); 

    if (!formMessage) {
        console.error("Elemen #formMessage tidak ditemukan di signup.html!");
        return; 
    }

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;

        if (!username || !email || !password) {
            showMessage('Semua field wajib diisi!', 'error');
            return;
        }
        if (username.length < 3) {
            showMessage('Username minimal 3 karakter!', 'error');
            return;
        }
        if (!validateEmail(email)) {
            showMessage('Format email tidak valid!', 'error');
            return;
        }
        if (password.length < 6) {
            showMessage('Password minimal 6 karakter!', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const isUserExists = users.some(user => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email.toLowerCase());
        if (isUserExists) {
            showMessage('Username atau Email sudah terdaftar!', 'error');
            return;
        }
        
        const newUser = { username: username, email: email, password: password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showMessage('Pendaftaran berhasil! Mengarahkan ke halaman login...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });

    function showMessage(message, type) {
        if (formMessage) { 
            formMessage.textContent = message;
            formMessage.className = 'form-message'; 
            formMessage.classList.add(type === 'success' ? 'success-message' : 'error-message');
            formMessage.style.display = 'block'; 
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});