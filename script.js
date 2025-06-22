// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('TAS MONTAŽE website loaded');
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize all slideshows
    initializeSlideshows();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
});

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

// Slideshow functionality
function initializeSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow');
    
    slideshows.forEach((slideshow, slideshowIndex) => {
        const images = JSON.parse(slideshow.dataset.images || '[]');
        const interval = parseInt(slideshow.dataset.interval || '5000');
        const showControls = slideshow.dataset.controls !== 'false';
        
        if (images.length === 0) return;
        
        let currentIndex = 0;
        let autoAdvanceTimer;
        let isHovered = false;
        
        const container = slideshow.querySelector('.slideshow-container');
        const imageElement = slideshow.querySelector('.slideshow-image');
        const controlsElement = slideshow.querySelector('.slideshow-controls');
        const dotsContainer = slideshow.querySelector('.slideshow-dots');
        
        // Create dots if there are multiple images
        if (dotsContainer && images.length > 1) {
            dotsContainer.innerHTML = '';
            images.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = index === 0 ? 'active' : '';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            });
        }
        
        // Hide controls if specified or if only one image
        if ((!showControls || images.length <= 1) && controlsElement) {
            controlsElement.style.display = 'none';
        }
        
        // Navigation functions
        function goToSlide(index) {
            currentIndex = index;
            updateSlide();
            resetAutoAdvance();
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % images.length;
            updateSlide();
            resetAutoAdvance();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateSlide();
            resetAutoAdvance();
        }
        
        function updateSlide() {
            if (imageElement) {
                // Preload next image
                const nextImg = new Image();
                nextImg.onload = function() {
                    imageElement.src = images[currentIndex];
                    imageElement.alt = `TAS MONTAŽE slide ${currentIndex + 1}`;
                };
                nextImg.src = images[currentIndex];
            }
            
            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('button');
                dots.forEach((dot, index) => {
                    dot.className = index === currentIndex ? 'active' : '';
                });
            }
        }
        
        function startAutoAdvance() {
            if (images.length > 1 && !isHovered) {
                autoAdvanceTimer = setInterval(() => {
                    if (!isHovered) {
                        nextSlide();
                    }
                }, interval);
            }
        }
        
        function stopAutoAdvance() {
            if (autoAdvanceTimer) {
                clearInterval(autoAdvanceTimer);
                autoAdvanceTimer = null;
            }
        }
        
        function resetAutoAdvance() {
            stopAutoAdvance();
            startAutoAdvance();
        }
        
        // Event listeners for controls
        const prevBtn = slideshow.querySelector('.slideshow-prev');
        const nextBtn = slideshow.querySelector('.slideshow-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
            });
        }
        
        // Pause on hover
        slideshow.addEventListener('mouseenter', () => {
            isHovered = true;
            stopAutoAdvance();
        });
        
        slideshow.addEventListener('mouseleave', () => {
            isHovered = false;
            startAutoAdvance();
        });
        
        // Touch events for mobile swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        slideshow.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        slideshow.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide(); // Swipe left - next slide
                } else {
                    prevSlide(); // Swipe right - previous slide
                }
            }
        }
        
        // Keyboard navigation
        slideshow.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        });
        
        // Make slideshow focusable for keyboard navigation
        slideshow.setAttribute('tabindex', '0');
        
        // Initialize first slide
        updateSlide();
        
        // Start auto-advance
        startAutoAdvance();
        
        console.log(`Slideshow ${slideshowIndex + 1} initialized with ${images.length} images`);
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log('Website fully loaded');
    
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

console.log('TAS MONTAŽE script initialized');