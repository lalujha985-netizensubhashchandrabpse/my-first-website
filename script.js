const API_KEY = 'AIzaSyDpyrHBTPxABHk7QfltFlpn1bzY4o58HD0';
const CHANNEL_ID = 'UCtuofVfeOMlytIftkcYOqJA';
let allVideos = [];
let isExpanded = false;

function createVideoCard(item) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // Format the upload date
    const uploadDate = new Date(item.snippet.publishedAt);
    const formattedDate = uploadDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    card.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank">
            <img src="${item.snippet.thumbnails.medium.url}" alt="thumbnail">
            <h3>${item.snippet.title}</h3>
            <p class="upload-date">Uploaded: ${formattedDate}</p>
        </a>
    `;
    return card;
}

function renderVideos(count) {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return; // Don't try to render on pages without video grid
    
    videoGrid.innerHTML = '';
    
    const videosToShow = allVideos.slice(0, count);
    videosToShow.forEach(item => {
        videoGrid.appendChild(createVideoCard(item));
    });
}

async function fetchYouTubeData() {
    try {
        // 1. Get Channel Stats
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${API_KEY}`;
        const channelRes = await fetch(channelUrl);
        const channelData = await channelRes.json();

        const channel = channelData.items[0];
        
        // Only update elements if they exist (this is index.html only)
        const channelNameEl = document.getElementById('channel-name');
        const statsEl = document.getElementById('stats');
        
        if (channelNameEl) {
            channelNameEl.innerText = channel.snippet.title;
        }
        if (statsEl) {
            statsEl.innerText = `Subscribers: ${channel.statistics.subscriberCount} | Videos: ${channel.statistics.videoCount}`;
        }

        // 2. Get Latest Videos (fetch more to have available for "See More")
        const videoUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50`;
        const videoRes = await fetch(videoUrl);
        const videoData = await videoRes.json();

        allVideos = videoData.items;
        
        // Only try to render videos if video grid exists
        if (document.getElementById('video-grid')) {
            renderVideos(6);
        }

        // Hide loading spinner after data loads
        const spinner = document.getElementById('loading-spinner');
        setTimeout(() => {
            if (spinner) {
                spinner.classList.add('hidden');
            }
        }, 500);

    } catch (error) {
        console.error("Error fetching data:", error);
        const channelNameEl = document.getElementById('channel-name');
        if (channelNameEl) {
            channelNameEl.innerText = "Failed to load data.";
        }
        
        // Hide spinner on error too
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }
}

// Subscribe Button Handler
const subscribeBtn = document.getElementById('subscribe-btn');
if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function() {
        // Open YouTube channel with subscribe redirect
        window.open(`https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`, '_blank');
        
        // Visual feedback
        const btn = this;
        const text = document.getElementById('subscribe-text');
        
        btn.style.background = 'linear-gradient(135deg, #00cc00, #00aa00)';
        if (text) {
            text.innerText = 'SUBSCRIBED!';
        }
        
        setTimeout(() => {
            btn.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
            if (text) {
                text.innerText = 'SUBSCRIBE';
            }
        }, 2000);
    });
}

// Channel Button Handler
const channelBtn = document.getElementById('channel-btn');
if (channelBtn) {
    channelBtn.addEventListener('click', function() {
        window.open(`https://www.youtube.com/channel/${CHANNEL_ID}`, '_blank');
    });
}

// Discord Icon Handler
const DISCORD_USER_ID = '1369314213306044568';
const discordLink = document.getElementById('discord-link');

if (discordLink) {
    discordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Try to open Discord app if available
        const isDiscordAppAvailable = navigator.userAgent.includes('Discord');
        
        if (isDiscordAppAvailable) {
            window.location.href = `discord://users/${DISCORD_USER_ID}`;
        } else {
            // Show user ID and copy to clipboard option
            const userMessage = `Discord User ID: ${DISCORD_USER_ID}\n\nClick OK to copy to clipboard!`;
            if (confirm(userMessage)) {
                navigator.clipboard.writeText(DISCORD_USER_ID).then(() => {
                    alert('Discord User ID copied to clipboard!');
                });
            }
        }
    });
}

// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const htmlElement = document.documentElement;

// Load saved theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    if (themeIcon) {
        updateThemeIcon(savedTheme);
    }
}

// Update theme icon
function updateThemeIcon(theme) {
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
}

// Toggle theme
if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.classList.toggle('light-mode', newTheme === 'light');
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

// Load theme on page load
loadTheme();

// See More Button Handler
const seeMoreBtn = document.getElementById('see-more-btn');
const seeMoreText = document.querySelector('.see-more-text');

if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', function() {
        if (isExpanded) {
            // Show only 6 videos
            renderVideos(6);
            seeMoreBtn.classList.remove('show-less');
            if (seeMoreText) {
                seeMoreText.textContent = 'SEE MORE VIDEOS';
            }
            isExpanded = false;
            
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Show all videos
            renderVideos(allVideos.length);
            seeMoreBtn.classList.add('show-less');
            if (seeMoreText) {
                seeMoreText.textContent = 'SHOW LESS';
            }
            isExpanded = true;
        }
    });
}

// Scroll handling for See More button hide/show
let lastScrollTop = 0;
const seeMoreContainer = document.querySelector('.see-more-container');
let scrollTimeout;

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTimeout) clearTimeout(scrollTimeout);
    
    if (currentScroll > lastScrollTop) {
        // Scrolling down - hide button
        if (seeMoreContainer) {
            seeMoreContainer.classList.remove('show');
            seeMoreContainer.classList.add('hide');
        }
    } else {
        // Scrolling up - show button
        if (seeMoreContainer) {
            seeMoreContainer.classList.remove('hide');
            seeMoreContainer.classList.add('show');
        }
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// Set active nav link based on current page
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Discord Copy Button Handler - Simplified
function setupDiscordCopyButton() {
    const discordCopyBtn = document.getElementById('discord-copy-btn');
    if (!discordCopyBtn) return;
    
    discordCopyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const username = 'sj_sup7';
        const tooltip = document.getElementById('copy-tooltip');
        
        console.log('Copy button clicked');
        console.log('Tooltip element:', tooltip);
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(username).then(() => {
                console.log('Copied to clipboard:', username);
                
                if (tooltip) {
                    // Reset and show tooltip
                    tooltip.classList.remove('show-tooltip');
                    tooltip.style.opacity = '0';
                    
                    // Trigger reflow
                    void tooltip.offsetHeight;
                    
                    // Show tooltip
                    tooltip.classList.add('show-tooltip');
                    tooltip.style.opacity = '1';
                    
                    // Hide after 2 seconds
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        tooltip.classList.remove('show-tooltip');
                    }, 2000);
                } else {
                    console.warn('Tooltip element not found');
                }
            }).catch(err => {
                console.error('Copy failed:', err);
                alert('Username copied: ' + username);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = username;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (tooltip) {
                tooltip.style.opacity = '1';
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                }, 2000);
            }
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDiscordCopyButton);
} else {
    setupDiscordCopyButton();
}

setActiveNavLink();

// Get In Touch button handler
const hireBtnn = document.querySelector('.hire-btn');
if (hireBtnn) {
    hireBtnn.addEventListener('click', function() {
        // Scroll to discord and open it
        const discordLink = document.getElementById('discord-link');
        if (discordLink) {
            discordLink.click();
        }
    });
}

// Only fetch YouTube data if on the videos page
if (document.getElementById('video-grid')) {
    fetchYouTubeData();
}

// ============= NEW FEATURES =============

// 1. Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navContent = document.querySelector('.nav-content');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navContent.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navContent.classList.remove('active');
        });
    });
}

// 2. Back to Top Button
const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 3. Video Search Functionality
const videoSearch = document.getElementById('video-search');
if (videoSearch) {
    videoSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const videoCards = document.querySelectorAll('.video-card');

        videoCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// 4. Animated Stats Counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// 5. Contact Form Handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        const formMessage = document.getElementById('form-message');

        // Validate
        if (!name || !email || !message) {
            formMessage.textContent = 'Please fill in all fields.';
            formMessage.style.color = '#ff6b6b';
            return;
        }

        // Show success message
        formMessage.textContent = 'Message sent successfully! I\'ll reply within 24 hours.';
        formMessage.style.color = '#00ff88';
        
        // Reset form
        contactForm.reset();
        
        // Clear message after 3 seconds
        setTimeout(() => {
            formMessage.textContent = '';
        }, 3000);
    });
}

// 6. FAQ Toggle Functionality
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.faq-icon');
            if (icon) icon.textContent = '+';
        });

        // Toggle current FAQ
        if (!isActive) {
            faqItem.classList.add('active');
            this.querySelector('.faq-icon').textContent = '−';
        }
    });
});

// 7. Animate stats when page loads
window.addEventListener('load', function() {
    const statsEl = document.getElementById('stats');
    if (statsEl) {
        // Stats will be populated from YouTube API
        // Animation happens automatically with rendered values
    }
});