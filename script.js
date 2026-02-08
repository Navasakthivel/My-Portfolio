// Navigation toggle
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        burger.classList.remove('active');
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Skip if href is just "#" (like logo link)
        if (targetId === '#' || targetId.length <= 1) {
            return;
        }

        const targetElement = document.querySelector(targetId);

        // Only scroll if target element exists
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Animate progress bars on scroll
const progressBars = document.querySelectorAll('.progress');
const animateElements = document.querySelectorAll('.fade-in');

function animateOnScroll() {
    const triggerBottom = window.innerHeight * 0.8;

    progressBars.forEach(bar => {
        const barTop = bar.getBoundingClientRect().top;
        if (barTop < triggerBottom) {
            const width = bar.parentElement.previousElementSibling.querySelector('.skill-percent').textContent;
            bar.style.width = width;
        }
    });

    animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < triggerBottom) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Reset animation state when page loads
window.addEventListener('load', () => {
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 1s ease, transform 1s ease';
    });

    // Animate elements that are already in view on page load
    setTimeout(animateOnScroll, 300);
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Form submission is now handled by firebase-contact.js

// Interactive typing effect for the hero text
const heroTextElement = document.querySelector('.hero-text h1 span');
const originalText = heroTextElement.textContent;
heroTextElement.textContent = '';

let charIndex = 0;
function typeWriter() {
    if (charIndex < originalText.length) {
        heroTextElement.textContent += originalText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 100);
    }
}

// Start typing effect after a short delay
setTimeout(typeWriter, 1000);

// Add interactive hover effects for project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.backgroundColor = 'rgba(227, 27, 35, 0.1)';
        this.style.borderLeft = '3px solid var(--primary-red)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.backgroundColor = 'var(--dark-gray)';
        this.style.borderLeft = 'none';
    });
});

// Add particle background effect to hero section
const heroBg = document.querySelector('.hero-bg');
for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 5 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(227, 27, 35, ' + (Math.random() * 0.5) + ')';
    particle.style.borderRadius = '50%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animation = 'float ' + (Math.random() * 10 + 5) + 's linear infinite';
    particle.style.opacity = Math.random() * 0.5;

    heroBg.appendChild(particle);
}

// Add animation for floating particles
const style = document.createElement('style');
style.innerHTML = `
    @keyframes float {
        0% {
            transform: translateY(0) translateX(0);
        }
        50% {
            transform: translateY(-20px) translateX(20px);
        }
        100% {
            transform: translateY(0) translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Toggle collapsible experience section
function toggleExperience(headerElement) {
    const arrow = headerElement.querySelector('.experience-arrow');
    const details = headerElement.nextElementSibling;

    arrow.classList.toggle('rotated');
    details.classList.toggle('expanded');
}

// ============================================
// Projects Section - Dynamic Loading & Modal
// ============================================

let projectsData = [];

// Load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        projectsData = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback: show placeholder message
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            grid.innerHTML = '<p style="text-align: center; color: var(--light-gray);">Unable to load projects. Please refresh the page.</p>';
        }
    }
}

// Render project cards
function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid || !projectsData.length) return;

    grid.innerHTML = projectsData.map(project => `
        <div class="project-card fade-in" data-project-id="${project.id}">
            <div class="project-image">
                <i class="${project.icon}"></i>
            </div>
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.shortDescription}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <button class="project-btn view-details" onclick="openProjectModal('${project.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${typeof project.sourceCode === 'string'
            ? `<a href="${project.sourceCode}" target="_blank" class="project-btn source-code">
                            <i class="fab fa-github"></i> Source Code
                          </a>`
            : `<a href="${project.sourceCode.frontend}" target="_blank" class="project-btn source-code">
                            <i class="fab fa-github"></i> Frontend
                          </a>
                          <a href="${project.sourceCode.backend}" target="_blank" class="project-btn source-code">
                            <i class="fab fa-github"></i> Backend
                          </a>`
        }
                </div>
            </div>
        </div>
    `).join('');

    // Re-apply fade-in animations
    const newCards = grid.querySelectorAll('.project-card');
    newCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 1s ease, transform 1s ease';
    });
    setTimeout(() => {
        animateOnScroll();
    }, 100);
}

// Open project modal with details
function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('projectDetailsModal');
    const video = document.getElementById('projectDemoVideo');
    const noVideoPlaceholder = document.getElementById('noVideoPlaceholder');
    const title = document.getElementById('modalProjectTitle');
    const description = document.getElementById('modalProjectDescription');
    const techStack = document.getElementById('modalTechStack');
    const githubLink = document.getElementById('modalGitHubLink');
    const modalActions = document.querySelector('.project-modal-actions');

    // Set modal content
    title.textContent = project.title;
    description.textContent = project.fullDescription;

    // Handle single or multiple source code links
    if (typeof project.sourceCode === 'string') {
        modalActions.innerHTML = `
            <a href="${project.sourceCode}" target="_blank" class="project-modal-btn github-btn">
                <i class="fab fa-github"></i> View Source Code
            </a>`;
    } else {
        modalActions.innerHTML = `
            <a href="${project.sourceCode.frontend}" target="_blank" class="project-modal-btn github-btn">
                <i class="fab fa-github"></i> Frontend Repo
            </a>
            <a href="${project.sourceCode.backend}" target="_blank" class="project-modal-btn github-btn">
                <i class="fab fa-github"></i> Backend Repo
            </a>`;
    }

    // Set tech stack
    techStack.innerHTML = project.techStack.map(tech => `<span>${tech}</span>`).join('');

    // Handle video
    if (project.demoVideo && project.demoVideo.trim() !== '') {
        video.style.display = 'block';
        video.querySelector('source').src = project.demoVideo;
        video.load();
        noVideoPlaceholder.style.display = 'none';
    } else {
        video.style.display = 'none';
        noVideoPlaceholder.style.display = 'flex';
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('projectDetailsModal');
    const video = document.getElementById('projectDemoVideo');

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Pause and reset video
    video.pause();
    video.currentTime = 0;
}

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    // Load projects
    loadProjects();

    // Close modal button
    const closeBtn = document.getElementById('closeProjectModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    // Close modal on backdrop click
    const modal = document.getElementById('projectDetailsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
            closeResumeModal();
        }
    });
});

// ============================================
// Resume Modal Functions
// ============================================

function openResumeModal() {
    const modal = document.getElementById('resumeModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for resume modal
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeResumeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeResumeModal);
    }

    const modal = document.getElementById('resumeModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeResumeModal();
            }
        });
    }
});
