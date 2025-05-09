document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    };
    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach(target => intersectionObserver.observe(target));

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let lastScrollTop = 0;
        const delta = 5; 
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const currentNavbarHeight = navbar.offsetHeight;
            if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

            if (scrollTop > lastScrollTop && scrollTop > currentNavbarHeight) {
                navbar.classList.add('navbar--hidden'); 
            } else {
                if (scrollTop + window.innerHeight < document.documentElement.scrollHeight) {
                     navbar.classList.remove('navbar--hidden'); 
                }
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }

    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    const authButton = document.getElementById('authButton');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const accountLink = document.getElementById('accountLink');
    const rateButton = document.getElementById('rateButton');
    const loginNoticeForRating = document.getElementById('loginNoticeForRating');
    const notifHalo = document.getElementById("notifHalo")

    const ratingModal = document.getElementById('ratingModal');
    const ratingModalBackdrop = document.getElementById('ratingModalBackdrop');
    const closeRatingModalButton = document.getElementById('closeRatingModalButton');
    const ratingModalTitle = document.getElementById('ratingModalTitle');
    const ratingSubmitButton = document.getElementById('ratingSubmitButton');

    const ratingForm = document.getElementById('ratingForm');
    const ratingStarsInput = document.getElementById('ratingStarsInput');
    const selectedRatingInput = document.getElementById('selectedRating');
    const ratingComment = document.getElementById('ratingComment');
    const charCounter = document.getElementById('charCounter');
    const ratingFormMessage = document.getElementById('ratingFormMessage');
    const ratingsGrid = document.getElementById('ratingsGrid');

    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    let toastTimeout; 


    const defaultRatings = [
        { username: "Bambang", stars: 5, comment: "Dah ok banget, sangat direkomendasikan", timestamp: "2024-01-01T10:00:00Z" },
        { username: "Fatimah", stars: 4, comment: "dah cukup bagus, udah memuaskan tapi bisa diimprove lagi.", timestamp: "2024-01-02T11:00:00Z" },
        { username: "M Abdul", stars: 5, comment: "fix bintang 5 tanpa ragu ini mah", timestamp: "2024-01-03T12:00:00Z" },

    ];

    function getStoredOrDefaultReviews() {
        const storedReviewsString = localStorage.getItem('reviews');
        const initialDefaultReviews = JSON.parse(JSON.stringify(defaultRatings));

        if (storedReviewsString) {
            try {
                const parsedReviews = JSON.parse(storedReviewsString);
                if (Array.isArray(parsedReviews)) {
                    return parsedReviews;
                } else {
                    console.warn("Stored reviews is not an array. Resetting to default.");
                    localStorage.setItem('reviews', JSON.stringify(initialDefaultReviews));
                    return initialDefaultReviews;
                }
            } catch (e) {
                console.error("Error parsing reviews from LS. Resetting to default:", e);
                localStorage.setItem('reviews', JSON.stringify(initialDefaultReviews));
                return initialDefaultReviews;
            }
        } else {
            localStorage.setItem('reviews', JSON.stringify(initialDefaultReviews));
            return initialDefaultReviews;
        }
    }

    function renderRatings(reviews) {
        if (!ratingsGrid) return;
        ratingsGrid.innerHTML = '';
        if (!reviews || reviews.length === 0) {
            ratingsGrid.innerHTML = '<p>Belum ada rating.</p>';
            return;
        }
        const sortedReviews = reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedReviews.forEach(review => {
            const ratingItem = document.createElement('div');
            ratingItem.className = 'rating-item animate-on-scroll';
            const starsDiv = document.createElement('div');
            starsDiv.className = 'rating-stars';
            for (let i = 1; i <= 5; i++) {
                starsDiv.textContent += (i <= review.stars) ? '★' : '☆';
            }
            const userH4 = document.createElement('h4');
            userH4.className = 'rating-user';
            userH4.textContent = review.username;
            const commentP = document.createElement('p');
            commentP.className = 'rating-comment';
            commentP.textContent = `"${review.comment}"`;
            ratingItem.appendChild(starsDiv);
            ratingItem.appendChild(userH4);
            ratingItem.appendChild(commentP);
            ratingsGrid.appendChild(ratingItem);
            intersectionObserver.observe(ratingItem);
        });
    }

    let loggedInUser = null;
    let currentGlobalReviews = [];
    let userExistingReviewData = null;

    function openRatingModal(reviewDataToEdit = null) { 
        if (!ratingModal || !ratingModalBackdrop) return;

        if (ratingForm) ratingForm.reset();
        if (selectedRatingInput) selectedRatingInput.value = "0";
        if (ratingStarsInput) updateStarsVisual(0);
        if (charCounter && ratingComment) charCounter.textContent = `0/${ratingComment.maxLength || 150}`;
        clearModalMessage();

        if (reviewDataToEdit && typeof reviewDataToEdit === 'object') {
            if (ratingModalTitle) ratingModalTitle.textContent = "Edit Rating Anda";
            if (ratingSubmitButton) ratingSubmitButton.textContent = "Update Rating";
            if (selectedRatingInput) selectedRatingInput.value = reviewDataToEdit.stars;
            if (ratingComment) ratingComment.value = reviewDataToEdit.comment;
            if (ratingStarsInput) updateStarsVisual(reviewDataToEdit.stars);
            if (charCounter && ratingComment) charCounter.textContent = `${ratingComment.value.length}/${ratingComment.maxLength || 150}`;
        } else {
            if (ratingModalTitle) ratingModalTitle.textContent = "Beri Rating Anda";
            if (ratingSubmitButton) ratingSubmitButton.textContent = "Kirim Rating";
        }
        ratingModalBackdrop.classList.add('visible');
        ratingModal.classList.add('visible');
    }
    function closeRatingModal() { 
        if (!ratingModal || !ratingModalBackdrop) return;
        ratingModalBackdrop.classList.remove('visible');
        ratingModal.classList.remove('visible');
    }
    function showModalMessage(message, type) { 
        if (!ratingFormMessage) return;
        ratingFormMessage.textContent = message;
        ratingFormMessage.className = 'form-message';
        ratingFormMessage.classList.add(type === 'success' ? 'success-message' : 'error-message');
        ratingFormMessage.style.display = 'block';
    }
    function clearModalMessage() { 
        if (!ratingFormMessage) return;
        ratingFormMessage.textContent = '';
        ratingFormMessage.className = 'form-message';
        ratingFormMessage.style.display = 'none';
    }
    function updateStarsVisual(ratingValue, isHovering = false) { 
        if (!ratingStarsInput) return;
        const stars = ratingStarsInput.querySelectorAll('.star-input');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            let isFilled = starValue <= ratingValue;
            star.textContent = isFilled ? '★' : '☆';
            star.classList.toggle('active', isFilled && !isHovering);
            star.classList.toggle('hover', isHovering && isFilled);
        });
        if (!isHovering) {
            if (ratingValue > 0) ratingStarsInput.classList.add('rated');
            else ratingStarsInput.classList.remove('rated');
        }
    }

    function showToast(message, type = 'success', duration = 3000) {
        if (!toastNotification || !toastMessage) {
            console.error("Toast elements not found!");
            return;
        }
        clearTimeout(toastTimeout);

        toastMessage.textContent = message;
        toastNotification.className = 'toast'; 
        toastNotification.classList.add(type);
        toastNotification.classList.add('show');

        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }

    function updateUserInterface() {
        console.log("updateUserInterface called");
        const loggedInUserString = localStorage.getItem('loggedInUser');
        if (loggedInUserString) {
            try {
                loggedInUser = JSON.parse(loggedInUserString);
            } catch (e) {
                console.error("Error parsing loggedInUser from LS:", e);
                localStorage.removeItem('loggedInUser');
                loggedInUser = null;
            }
        } else {
            loggedInUser = null;
        }

        currentGlobalReviews = getStoredOrDefaultReviews();

        if (loggedInUser && loggedInUser.username) {
            if (usernameDisplay) usernameDisplay.textContent = `Username : ${loggedInUser.username}`;
            if (usernameDisplay) notifHalo.textContent = `Halo, ${loggedInUser.username}!`;
            if (accountLink) accountLink.style.display = 'inline-block';
            if (authButton) {
                authButton.textContent = 'Logout';
                authButton.onclick = () => {
                    localStorage.removeItem('loggedInUser');
                    window.location.reload();
                };
            }
            userExistingReviewData = currentGlobalReviews.find(
                review => review.username.toLowerCase() === loggedInUser.username.toLowerCase()
            );
            if (rateButton) {
                rateButton.disabled = false;
                if (userExistingReviewData) {
                    rateButton.textContent = "Edit Review Anda";
                    rateButton.onclick = () => openRatingModal(userExistingReviewData);
                } else {
                    rateButton.textContent = "Beri Rating Anda!";
                    rateButton.onclick = () => openRatingModal(null);
                }
            }
            if (loginNoticeForRating) loginNoticeForRating.style.display = 'none';
        } else { 
            if (usernameDisplay) usernameDisplay.textContent = '';
            if (accountLink) accountLink.style.display = 'none';
            if (authButton) {
                authButton.textContent = 'Login';
                authButton.onclick = () => { window.location.href = 'login.html'; };
            }
            if (rateButton) {
                rateButton.textContent = "Beri Rating Anda!";
                rateButton.disabled = false;
                rateButton.onclick = () => {
                    if (loginNoticeForRating) {
                        loginNoticeForRating.style.display = 'block';
                        setTimeout(() => { loginNoticeForRating.style.display = 'none'; }, 3000);
                    } else {
                        
                        showToast("Anda harus login untuk memberi rating.", "error");
                    }
                };
            }
            userExistingReviewData = null;
        }
        renderRatings(currentGlobalReviews);
        console.log("UI Updated. Logged in:", loggedInUser ? loggedInUser.username : "No", "Existing review:", userExistingReviewData ? "Yes" : "No");
    }

    if (closeRatingModalButton) closeRatingModalButton.addEventListener('click', closeRatingModal);
    if (ratingModalBackdrop) ratingModalBackdrop.addEventListener('click', closeRatingModal);

    if (ratingStarsInput) { 
        const stars = ratingStarsInput.querySelectorAll('.star-input');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                if (selectedRatingInput) selectedRatingInput.value = value;
                updateStarsVisual(value, false);
            });
            star.addEventListener('mouseover', () => {
                const value = parseInt(star.getAttribute('data-value'));
                updateStarsVisual(value, true);
            });
        });
        ratingStarsInput.addEventListener('mouseleave', () => {
            const currentRating = parseInt(selectedRatingInput.value) || 0;
            updateStarsVisual(currentRating, false);
        });
    }

    if (ratingComment && charCounter) { 
        const maxLength = ratingComment.maxLength || 150;
        charCounter.textContent = `${ratingComment.value.length}/${maxLength}`;
        ratingComment.addEventListener('input', () => {
            const currentLength = ratingComment.value.length;
            charCounter.textContent = `${currentLength}/${maxLength}`;
        });
    }

    if (ratingForm) {
        ratingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearModalMessage();

            if (!loggedInUser) {
                showToast('Sesi Anda berakhir atau Anda belum login.', 'error');
                setTimeout(closeRatingModal, 2500); 
                return;
            }

            const ratingValue = parseInt(selectedRatingInput.value) || 0;
            const comment = ratingComment.value.trim();
            const maxLength = ratingComment.maxLength || 150;

            if (ratingValue === 0) {
                showModalMessage('Silakan pilih rating bintang Anda.', 'error'); 
                return;
            }
            if (!comment) {
                showModalMessage('Komentar tidak boleh kosong.', 'error'); 
                return;
            }
            if (comment.length > maxLength) {
                showModalMessage(`Komentar melebihi batas ${maxLength} karakter.`, 'error'); 
                return;
            }

            let reviewsFromStorage = getStoredOrDefaultReviews();
            const usernameToMatch = loggedInUser.username.toLowerCase();
            const existingReviewIndex = reviewsFromStorage.findIndex(
                review => review.username.toLowerCase() === usernameToMatch
            );
            const newTimestamp = new Date().toISOString();

            if (existingReviewIndex !== -1) {
                reviewsFromStorage[existingReviewIndex].stars = ratingValue;
                reviewsFromStorage[existingReviewIndex].comment = comment;
                reviewsFromStorage[existingReviewIndex].timestamp = newTimestamp;
            } else {
                const newReview = {
                    username: loggedInUser.username,
                    stars: ratingValue,
                    comment: comment,
                    timestamp: newTimestamp
                };
                reviewsFromStorage.unshift(newReview);
            }

            localStorage.setItem('reviews', JSON.stringify(reviewsFromStorage));
            closeRatingModal();

            const successMessage = existingReviewIndex !== -1 ? 'Rating Anda berhasil diperbarui!' : 'Rating Anda berhasil dikirim!';
            showToast(successMessage, 'success');

            updateUserInterface();
        });
    }

    updateUserInterface();
})