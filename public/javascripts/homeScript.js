const linkForm = document.getElementById('link-form');
    if (linkForm) {
        const linkInput = document.getElementById('eventLink');
        const errorDiv = document.getElementById('link-error');

        linkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.textContent = '';
            const linkValue = linkInput.value.trim();
            
            if (!linkValue) {
                errorDiv.textContent = 'Please paste a link.';
                return;
            }

            try {
                // Link se aakhri hissa (unique code) nikalne ki koshish
                const parts = linkValue.split('/');
                const uniqueLink = parts[parts.length - 1];

                if (uniqueLink) {
                    // User ko event page par redirect karo
                    location.assign(`/event/${uniqueLink}`);
                } else {
                    errorDiv.textContent = 'Invalid link. Please check and try again.';
                }
            } catch (err) {
                errorDiv.textContent = 'Invalid link format.';
            }
        });
    }