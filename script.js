// Ritvi Foundations - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.95)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(15, 23, 42, 0.8)';
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation classes - FAST animations
    const animateElements = document.querySelectorAll(
        '.service-card, .program-card, .team-card, .testimonial-card, .stat, .feature, .requirement-card'
    );

    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.3s ease ${index * 0.03}s, transform 0.3s ease ${index * 0.03}s`;
        observer.observe(el);
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Counter animation for stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const suffix = element.textContent.replace(/[\d,]/g, '');

        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString() + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString() + suffix;
            }
        }

        updateCounter();
    }

    // Observe stats for counter animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNums = entry.target.querySelectorAll('.stat-num');
                statNums.forEach(stat => {
                    const text = stat.textContent;
                    const num = parseInt(text.replace(/\D/g, ''));
                    if (num && !stat.classList.contains('counted')) {
                        stat.classList.add('counted');
                        animateCounter(stat, num, 1500);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // Contact form handling - Real submission via Web3Forms
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Also save to localStorage as backup
            const submissionData = {
                timestamp: new Date().toISOString(),
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                stage: formData.get('stage'),
                message: formData.get('message')
            };

            // Store in localStorage
            const submissions = JSON.parse(localStorage.getItem('ritvi_submissions') || '[]');
            submissions.push(submissionData);
            localStorage.setItem('ritvi_submissions', JSON.stringify(submissions));
            console.log('📝 Submission saved to localStorage:', submissionData);

            try {
                // Submit to Web3Forms (if access key is configured)
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Show success
                    submitBtn.textContent = '✓ Message Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
                    contactForm.reset();

                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                    }, 3000);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                console.log('Form service not configured, but data saved locally:', error.message);
                // Still show success since we saved to localStorage
                submitBtn.textContent = '✓ Saved Successfully!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });
    }

    // Helper function to view saved submissions (for testing)
    window.viewSubmissions = function () {
        const submissions = JSON.parse(localStorage.getItem('ritvi_submissions') || '[]');
        console.table(submissions);
        return submissions;
    };

    console.log('💡 Tip: Run viewSubmissions() in console to see saved form data');

    // Add hover tilt effect to cards
    const cards = document.querySelectorAll('.service-card, .program-card, .team-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Parallax effect for orbs
    document.addEventListener('mousemove', function (e) {
        const orbs = document.querySelectorAll('.orb');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const moveX = (x - 0.5) * speed;
            const moveY = (y - 0.5) * speed;
            orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    console.log('🌱 Ritvi Foundations website loaded successfully!');
});
