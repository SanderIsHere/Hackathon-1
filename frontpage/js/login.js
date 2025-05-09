document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const formMessage = document.getElementById('formMessage'); 

    if (!formMessage) {
        console.error("Elemen #formMessage tidak ditemukan di login.html!");
        return; 
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        const credential = document.getElementById('loginCredential').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!credential || !password) {
            showMessage('Semua field wajib diisi!', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = users.find(user =>
            (user.username.toLowerCase() === credential.toLowerCase() || user.email.toLowerCase() === credential.toLowerCase()) &&
            user.password === password
        );

        if (foundUser) {
            showMessage('Login berhasil! Mengarahkan ke beranda...', 'success');
            localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('Username/Email atau Password salah!', 'error');
        }
    });

    function showMessage(message, type) {
        if (formMessage) { 
            formMessage.textContent = message;
            formMessage.className = 'form-message'; 
            formMessage.classList.add(type === 'success' ? 'success-message' : 'error-message');
            formMessage.style.display = 'block'; 
        }
    }
});
