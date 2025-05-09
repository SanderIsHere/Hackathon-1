
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserString = localStorage.getItem('loggedInUser');
    if (!loggedInUserString) {
        window.location.href = 'login.html';
        return;
    }

    let loggedInUser = null;
    try {
        loggedInUser = JSON.parse(loggedInUserString);
    } catch (e) {
        console.error("Error parsing loggedInUser:", e);
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
        return;
    }

    if (!loggedInUser || typeof loggedInUser !== 'object' || !loggedInUser.username || !loggedInUser.email) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const accountCurrentUserEl = document.getElementById('accountCurrentUser');
    const currentUsernameInput = document.getElementById('currentUsername');
    const currentEmailInput = document.getElementById('currentEmail');
    const accountPageMessage = document.getElementById('accountPageMessage');

    const updateUsernameForm = document.getElementById('updateUsernameForm');
    const newUsernameInput = document.getElementById('newUsername');
    const updateUsernameMessage = document.getElementById('updateUsernameMessage');

    const updateEmailForm = document.getElementById('updateEmailForm');
    const newEmailInput = document.getElementById('newEmail');
    const updateEmailMessage = document.getElementById('updateEmailMessage');

    const updatePasswordForm = document.getElementById('updatePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const updatePasswordMessage = document.getElementById('updatePasswordMessage');

    const deleteAccountButton = document.getElementById('deleteAccountButton');

    function showMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = 'form-message'; 
            element.classList.add(type === 'success' ? 'success-message' : 'error-message');
            element.style.display = 'block'; 
        }
    }
    
    function clearMessage(element) {
        if (element) {
            element.textContent = '';
            element.className = 'form-message';
            element.style.display = 'none';
        }
    }
    
    function persistUserData(updatedUsersArray, updatedLoggedInUserObject) {
        localStorage.setItem('users', JSON.stringify(updatedUsersArray));
        localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUserObject));
    }

    if (accountCurrentUserEl) {
        accountCurrentUserEl.textContent = `Login sebagai: ${loggedInUser.username} (${loggedInUser.email})`;
    }
    if (currentUsernameInput) {
        currentUsernameInput.value = loggedInUser.username;
    }
    if (currentEmailInput) {
        currentEmailInput.value = loggedInUser.email;
    }

    if (updateUsernameForm) {
        updateUsernameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearMessage(updateUsernameMessage);
            const newUsername = newUsernameInput.value.trim();

            if (!newUsername) {
                showMessage(updateUsernameMessage, 'Username baru tidak boleh kosong!', 'error');
                return;
            }
            if (newUsername.length < 3) {
                showMessage(updateUsernameMessage, 'Username baru minimal 3 karakter!', 'error');
                return;
            }
            if (newUsername.toLowerCase() === loggedInUser.username.toLowerCase()) {
                showMessage(updateUsernameMessage, 'Username baru sama dengan username saat ini.', 'info'); 
                return;
            }

            const isUsernameTaken = users.some(user => 
                user.email.toLowerCase() !== loggedInUser.email.toLowerCase() && 
                user.username.toLowerCase() === newUsername.toLowerCase()
            );
            if (isUsernameTaken) {
                showMessage(updateUsernameMessage, 'Username baru sudah digunakan pengguna lain!', 'error');
                return;
            }

            const userIndexInUsersArray = users.findIndex(user => user.email.toLowerCase() === loggedInUser.email.toLowerCase());
            if (userIndexInUsersArray !== -1) {
                users[userIndexInUsersArray].username = newUsername;
            } else {
                showMessage(updateUsernameMessage, 'Terjadi kesalahan internal saat update data pengguna.', 'error');
                return;
            }
            
            loggedInUser.username = newUsername;
            persistUserData(users, loggedInUser);

            if (currentUsernameInput) currentUsernameInput.value = newUsername;
            if (accountCurrentUserEl) accountCurrentUserEl.textContent = `Login sebagai: ${loggedInUser.username} (${loggedInUser.email})`;
            showMessage(updateUsernameMessage, 'Username berhasil diperbarui!', 'success');
            newUsernameInput.value = ''; 
        });
    }

    if (updateEmailForm) {
        updateEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearMessage(updateEmailMessage);
            const newEmail = newEmailInput.value.trim();

            if (!newEmail) {
                showMessage(updateEmailMessage, 'Email baru tidak boleh kosong!', 'error');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail.toLowerCase())) {
                showMessage(updateEmailMessage, 'Format email baru tidak valid!', 'error');
                return;
            }
            if (newEmail.toLowerCase() === loggedInUser.email.toLowerCase()) {
                showMessage(updateEmailMessage, 'Email baru sama dengan email saat ini.', 'info');
                return;
            }

            const isEmailTaken = users.some(user => 
                user.username.toLowerCase() !== loggedInUser.username.toLowerCase() && 
                user.email.toLowerCase() === newEmail.toLowerCase()
            );
            if (isEmailTaken) {
                showMessage(updateEmailMessage, 'Email baru sudah digunakan pengguna lain!', 'error');
                return;
            }
            
            const userIndexInUsersArray = users.findIndex(user => user.username.toLowerCase() === loggedInUser.username.toLowerCase());
            if (userIndexInUsersArray !== -1) {
                users[userIndexInUsersArray].email = newEmail;
            } else {
                showMessage(updateEmailMessage, 'Terjadi kesalahan internal saat update data pengguna.', 'error');
                return;
            }

            loggedInUser.email = newEmail;
            persistUserData(users, loggedInUser);

            if (currentEmailInput) currentEmailInput.value = newEmail;
            if (accountCurrentUserEl) accountCurrentUserEl.textContent = `Login sebagai: ${loggedInUser.username} (${loggedInUser.email})`;
            showMessage(updateEmailMessage, 'Email berhasil diperbarui!', 'success');
            newEmailInput.value = '';
        });
    }

    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearMessage(updatePasswordMessage);
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showMessage(updatePasswordMessage, 'Semua field password wajib diisi!', 'error');
                return;
            }
            if (currentPassword !== loggedInUser.password) { 
                showMessage(updatePasswordMessage, 'Password saat ini salah!', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showMessage(updatePasswordMessage, 'Password baru minimal 6 karakter!', 'error');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                showMessage(updatePasswordMessage, 'Konfirmasi password baru tidak cocok!', 'error');
                return;
            }
            if (newPassword === currentPassword) {
                 showMessage(updatePasswordMessage, 'Password baru tidak boleh sama dengan password lama!', 'error');
                return;
            }

            const userIndexInUsersArray = users.findIndex(user => user.email.toLowerCase() === loggedInUser.email.toLowerCase());
            if (userIndexInUsersArray !== -1) {
                users[userIndexInUsersArray].password = newPassword; 
            } else {
                 showMessage(updatePasswordMessage, 'Terjadi kesalahan internal saat update data pengguna.', 'error');
                return;
            }
            
            loggedInUser.password = newPassword;
            persistUserData(users, loggedInUser);
            
            showMessage(updatePasswordMessage, 'Password berhasil diperbarui!', 'success');
            updatePasswordForm.reset(); 
        });
    }

    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => {
            clearMessage(accountPageMessage); 
            if (window.confirm('Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat diurungkan.')) {
                const updatedUsers = users.filter(user => user.email.toLowerCase() !== loggedInUser.email.toLowerCase());
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                localStorage.removeItem('loggedInUser');
                
                showMessage(accountPageMessage, 'Akun Anda telah berhasil dihapus. Mengarahkan ke halaman utama...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 2000);
            }
        });
    }
});
