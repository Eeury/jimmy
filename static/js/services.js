document.addEventListener('DOMContentLoaded', function () {
    loadServices();

    // Post Service Form
    const postServiceForm = document.getElementById('post-service-form');
    if (postServiceForm) {
        postServiceForm.onsubmit = async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/medical/services/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    this.reset();
                    loadServices();
                }
            } catch (error) {
                console.error('Error posting service:', error);
            }
        }
    }

    // Book Modal
    const bookModal = document.getElementById('book-modal');
    const bookForm = document.getElementById('book-form');

    if (bookForm) {
        bookForm.onsubmit = async function (e) {
            e.preventDefault();
            console.log('Submitting booking...');
            const formData = new FormData(this);
            const serviceId = formData.get('service_id');

            if (!serviceId) {
                console.error('No Service ID found in form');
                return;
            }

            try {
                const response = await fetch(`/api/medical/services/${serviceId}/book/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                if (response.ok) {
                    bookModal.style.display = 'none';
                    this.reset();
                    alert('Booking submitted successfully!');
                    loadServices();
                } else {
                    const err = await response.json();
                    console.error('Booking submission failed:', err);
                    alert('Error submitting booking: ' + JSON.stringify(err));
                }
            } catch (error) {
                console.error('Error submitting booking:', error);
                alert('An error occurred. Please try again.');
            }
        }
    }
});

async function loadServices() {
    try {
        const response = await fetch('/api/medical/services/');
        const services = await response.json();

        const clientGrid = document.getElementById('client-services-grid');
        const pwdGrid = document.getElementById('pwd-services-grid');

        if (clientGrid) {
            clientGrid.innerHTML = services.map(service => `
                <div class="job-card">
                    <div class="service-header">
                        <h3>${service.title}</h3>
                        <span class="status ${service.status}">${service.status}</span>
                    </div>
                    <p>${service.description}</p>
                    <div class="job-meta">
                        <span>Amount: KES ${service.amount}</span>
                        <span>Session: ${service.session_timeframe}</span>
                    </div>
                    <div class="service-actions">
                        ${service.status === 'open' ? `
                            <button onclick="closeService(${service.id})" class="btn-secondary">Close Service</button>
                        ` : ''}
                    </div>
                    ${service.bookings.length > 0 ? `
                        <div class="bookings-list">
                            <h4>Bookings (${service.bookings.length})</h4>
                            ${service.bookings.map(booking => `
                                <div class="booking-item">
                                    <div class="booking-header">
                                        <span>${booking.pwd_user.username}</span>
                                        <button onclick="startChat('${booking.pwd_user.username}')"><i class="fas fa-comment"></i></button>
                                    </div>
                                    <p>${booking.proposal}</p>
                                    <small>Amount: ${booking.amount} | Time: ${new Date(booking.session_time).toLocaleString()}</small>
                                    ${booking.file ? `<a href="${booking.file}" target="_blank">View File</a>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No bookings yet</p>'}
                </div>
            `).join('');
        }

        if (pwdGrid) {
            pwdGrid.innerHTML = services.map(service => `
                <div class="job-card">
                    <h3>${service.title}</h3>
                    <p class="provider-name">Posted by: ${service.provider.username}</p>
                    <p>${service.description}</p>
                    <div class="job-meta">
                        <span>Amount: KES ${service.amount}</span>
                        <span>Session: ${service.session_timeframe}</span>
                    </div>
                    <button onclick="openBookModal(${service.id})" class="btn-primary">Book Service</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function closeService(serviceId) {
    if (!confirm('Are you sure you want to close this service?')) return;

    try {
        const response = await fetch(`/api/medical/services/${serviceId}/close/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (response.ok) loadServices();
    } catch (error) {
        console.error('Error closing service:', error);
    }
}

window.openBookModal = function (serviceId) {
    console.log('Opening book modal for service:', serviceId);
    const idInput = document.getElementById('book-service-id');
    const modal = document.getElementById('book-modal');

    if (idInput && modal) {
        idInput.value = serviceId;
        modal.style.display = 'block';
    } else {
        console.error('Book modal elements not found');
    }
}
