document.addEventListener('DOMContentLoaded', () => {
    // Admin credentials
    const ADMIN_EMAIL = 'adminhba';
    const ADMIN_PASSWORD = 'hba2025';

    // DOM elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const adminContent = document.getElementById('admin-content');
    const logoutBtn = document.getElementById('logout-btn');

    // Check authentication status
    let isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    // Initialize the admin panel
    init();

    function init() {
        if (!isAuthenticated) {
            showLoginModal();
        } else {
            showAdminContent();
            loadContributions();
        }

        // Set up event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Login form submission
        loginForm.addEventListener('submit', handleLogin);
        
        // Logout button
        logoutBtn.addEventListener('click', handleLogout);
    }

    function showLoginModal() {
        loginModal.classList.remove('hidden');
        adminContent.classList.add('hidden');
    }

    function showAdminContent() {
        loginModal.classList.add('hidden');
        adminContent.classList.remove('hidden');
    }

    function hideLoginError() {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }

    async function handleLogin(event) {
        event.preventDefault();
        hideLoginError();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            isAuthenticated = true;
            showAdminContent();
            loadContributions();
        } else {
            showLoginError('Invalid credentials. Please try again.');
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('adminAuthenticated');
        isAuthenticated = false;
        showLoginModal();
        
        // Clear form
        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';
        hideLoginError();
    }

    async function loadContributions() {
        try {
            console.log('Loading contributions...');
            const response = await fetch('/api/contributions');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contributions = await response.json();
            console.log('Contributions loaded:', contributions);
            
            displayContributions(contributions);
        } catch (error) {
            console.error('Error loading contributions:', error);
            
            // Show error message to user
            const pendingDiv = document.getElementById('pending-contributions');
            const processedDiv = document.getElementById('processed-contributions');
            
            const errorMessage = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> Unable to load contributions. ${error.message}
                </div>
            `;
            
            if (pendingDiv) pendingDiv.innerHTML = errorMessage;
            if (processedDiv) processedDiv.innerHTML = errorMessage;
        }
    }

    function displayContributions(contributions) {
        const pendingDiv = document.getElementById('pending-contributions');
        const processedDiv = document.getElementById('processed-contributions');
        
        // Clear loading messages
        if (pendingDiv) pendingDiv.innerHTML = '';
        if (processedDiv) processedDiv.innerHTML = '';
        
        // Filter contributions by status
        const pending = contributions.filter(c => c.status === 'pending' || !c.status);
        const processed = contributions.filter(c => c.status === 'approved' || c.status === 'rejected');
        
        // Display pending contributions
        if (pending.length === 0) {
            if (pendingDiv) {
                pendingDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No pending contributions.</p>';
            }
        } else {
            pending.forEach(contribution => {
                if (pendingDiv) {
                    pendingDiv.appendChild(createContributionCard(contribution, true));
                }
            });
        }
        
        // Display processed contributions
        if (processed.length === 0) {
            if (processedDiv) {
                processedDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No processed contributions.</p>';
            }
        } else {
            processed.forEach(contribution => {
                if (processedDiv) {
                    processedDiv.appendChild(createContributionCard(contribution, false));
                }
            });
        }
    }

    function createContributionCard(contribution, isPending) {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4';
        
        const statusBadge = isPending ? 
            '<span class="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>' :
            `<span class="inline-block px-2 py-1 text-xs ${contribution.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-full">${contribution.status || 'Processed'}</span>`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${contribution.name || contribution.scholarshipName || 'Unknown Scholarship'}</h3>
                    <p class="text-sm text-gray-600">by ${contribution.submitterName || contribution.email || 'Unknown'}</p>
                </div>
                ${statusBadge}
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="font-medium">Organization:</span> ${contribution.organization || 'N/A'}
                </div>
                <div>
                    <span class="font-medium">Website:</span> 
                    <a href="${contribution.website || '#'}" target="_blank" class="text-blue-600 hover:underline">${contribution.website || 'N/A'}</a>
                </div>
                <div>
                    <span class="font-medium">Level:</span> ${contribution.level || 'N/A'}
                </div>
                <div>
                    <span class="font-medium">Country:</span> ${contribution.hostCountry || 'N/A'}
                </div>
                <div class="col-span-2">
                    <span class="font-medium">Email:</span> ${contribution.submitterEmail || contribution.email || 'N/A'}
                </div>
                <div class="col-span-2">
                    <span class="font-medium">Message:</span> ${contribution.message || contribution.additionalNotes || 'No message provided'}
                </div>
            </div>
            
            ${isPending ? `
                <div class="mt-4 flex space-x-2">
                    <button onclick="approveContribution(${contribution.id})" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                        Approve
                    </button>
                    <button onclick="rejectContribution(${contribution.id})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        Reject
                    </button>
                </div>
            ` : `
                ${contribution.status === 'approved' ? `
                    <div class="mt-4">
                        <button onclick="removeFromPublicView(${contribution.id})" class="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
                            Remove from Public View
                        </button>
                    </div>
                ` : ''}
            `}
        `;
        
        return card;
    }

    // Make functions global so they can be called from onclick handlers
    window.approveContribution = async function(id) {
        try {
            const response = await fetch('/api/approve-scholarship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            
            if (response.ok) {
                alert('Contribution approved successfully!');
                loadContributions(); // Reload the contributions
            } else {
                throw new Error('Failed to approve contribution');
            }
        } catch (error) {
            console.error('Error approving contribution:', error);
            alert('Error approving contribution. Please try again.');
        }
    };

    window.rejectContribution = async function(id) {
        try {
            const response = await fetch('/api/reject-scholarship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            
            if (response.ok) {
                alert('Contribution rejected successfully!');
                loadContributions(); // Reload the contributions
            } else {
                throw new Error('Failed to reject contribution');
            }
        } catch (error) {
            console.error('Error rejecting contribution:', error);
            alert('Error rejecting contribution. Please try again.');
        }
    };

    window.removeFromPublicView = async function(id) {
        if (!confirm('Are you sure you want to remove this scholarship from public view? This will hide it from the main scholarship explorer page.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/remove-scholarship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            
            if (response.ok) {
                alert('Scholarship removed from public view successfully!');
                loadContributions(); // Reload the contributions
            } else {
                throw new Error('Failed to remove scholarship from public view');
            }
        } catch (error) {
            console.error('Error removing scholarship:', error);
            alert('Error removing scholarship from public view. Please try again.');
        }
    };
});
