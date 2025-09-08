// Simple navigation script
document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');
    
    // Function to show a specific section and hide others
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show the selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Add fade-in animation
            targetSection.classList.add('fade-in');
            
            // Update active navigation link
            navLinks.forEach(link => {
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
            
            // Update URL hash
            window.location.hash = sectionId;
        }
    }
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = link.getAttribute('data-section');
            
            // Only prevent default if this is a section navigation link
            if (sectionId) {
                e.preventDefault();
                showSection(sectionId);
            }
            // Otherwise, allow the link to navigate normally (like admin panel)
        });
    });
    
    // Check URL hash on page load
    function checkHash() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        } else {
            // Show default section (welcome)
            showSection('welcome');
        }
    }
    
    // Initialize sections
    function initializeSections() {
        checkHash();
    }
    
    // Initialize the sections
    initializeSections();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
}); 