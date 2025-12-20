document.addEventListener('DOMContentLoaded', () => {
    // Hide the loading spinner when the page is fully loaded
    const spinner = document.getElementById('loading-spinner');
    spinner.style.opacity = '0';
    setTimeout(() => {
        spinner.style.display = 'none';
    }, 500);

    // Add a little entrance animation to the stats when scrolling
    const cards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});