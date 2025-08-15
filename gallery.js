// Enhanced Photo Gallery with Filters and Sliders
class PhotoGallery {
    constructor() {
        this.photoDirectories = [
            'photos/academic/',
            'photos/conferences/',
            'photos/research/',
            'photos/personal/'
        ];
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'JPG', 'JPEG', 'PNG'];
        this.currentFilter = 'all';
        this.currentSlide = 0;
        this.photos = [];
    }

    // Enhanced photo data with better names and categories
    async generateImageList() {
        const photoData = [
            // Academic photos
            { file: 'IMG-20240611-WA0015.jpg', category: 'academic', title: 'Academic Journey', description: 'Moments from my doctoral studies' },
            { file: 'Screenshot_20250621_105946_Gallery.jpg', category: 'academic', title: 'Digital Portfolio', description: 'Portfolio development showcase' },
            { file: 'Screenshot_20250626_220411_LinkedIn.jpg', category: 'academic', title: 'Professional Network', description: 'LinkedIn academic profile' },
            { file: 'office.jpg', category: 'academic', title: 'Research Workspace', description: 'My dedicated research office at UCD' },
            { file: 'writing.jpg', category: 'academic', title: 'Academic Writing', description: 'Research paper writing process' },
            { file: 'protest.JPG', category: 'academic', title: 'Campus Activism', description: 'Participating in academic discussions' },
            { file: 'summerschool1.jpg', category: 'academic', title: 'Summer School Program', description: 'Advanced research training session' },
            { file: 'summerschool2.jpg', category: 'academic', title: 'Research Collaboration', description: 'Working with fellow researchers' },
            { file: 'summerschool3.jpg', category: 'academic', title: 'Conference Networking', description: 'Building academic connections' },
            { file: 'summerschool4.jpg', category: 'academic', title: 'Knowledge Sharing', description: 'Presenting research findings' },
            
            // Conference photos
            { file: 'IMG_9249.jpg', category: 'conferences', title: 'Conference Presentation', description: 'Presenting at international AI conference' },
            
            // Research photos
            { file: '1721920706437.jpeg', category: 'research', title: 'Research Innovation', description: 'Working on cutting-edge AI research' },
            
            // Personal photos
            { file: '20250712_120851.jpg', category: 'personal', title: 'Life in Dublin', description: 'Exploring Irish culture and lifestyle' }
        ];

        console.log('Checking', photoData.length, 'photos...');
        const images = [];
        
        // Check all photos in parallel for faster loading
        const checkPromises = photoData.map(async (photo) => {
            for (const dir of this.photoDirectories) {
                const fullPath = dir + photo.file;
                if (await this.imageExists(fullPath)) {
                    return {
                        src: fullPath,
                        category: photo.category,
                        title: photo.title,
                        description: photo.description
                    };
                }
            }
            return null;
        });

        const results = await Promise.all(checkPromises);
        const validImages = results.filter(result => result !== null);
        
        console.log('Found', validImages.length, 'valid images');
        this.photos = validImages;
        return validImages;
    }

    // Check if an image exists by trying to load it
    imageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve(false);
            }, 3000); // 3 second timeout
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(true);
            };
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            img.src = src;
        });
    }

    async generateGalleryHTML() {
        const images = await this.generateImageList();
        let html = '';

        images.forEach((photo, index) => {
            html += `
                <div class="gallery-item" data-category="${photo.category}">
                    <div class="gallery-image">
                        <img src="${photo.src}" 
                             alt="${photo.title}" 
                             loading="lazy">
                        <div class="gallery-overlay">
                            <div class="gallery-info">
                                <h3>${photo.title}</h3>
                                <p>${photo.description}</p>
                            </div>
                            <div class="gallery-actions">
                                <button class="gallery-btn" onclick="openModal(this)" data-index="${index}">
                                    <i class="fas fa-expand"></i>
                                </button>
                                <button class="gallery-btn" onclick="openSlideshow(${index})">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        return html;
    }

    filterPhotos(category) {
        this.currentFilter = category;
        const items = document.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                item.style.animation = 'fadeInScale 0.5s ease';
            } else {
                item.style.display = 'none';
            }
        });

        // Update filter button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
        });
    }

    async initializeGallery() {
        console.log('Initializing gallery...');
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            // Always show the fancy loading screen first
            galleryGrid.innerHTML = `
                <div class="loading-container" style="min-height: 400px; display: flex; align-items: center; justify-content: center;">
                    <div class="loading-animation">
                        <div class="loading-spinner">
                            <i class="fas fa-camera"></i>
                        </div>
                        <div class="loading-text">
                            <h3 style="font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(45deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hello! I am Stephen Pilli</h3>
                            <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 1rem;">Welcome to my visual journey...</p>
                            <div class="loading-message">
                                <span style="font-size: 1rem; color: #94a3b8;">Loading my photo gallery</span>
                            </div>
                            <div class="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Force a repaint to ensure loading screen shows
            galleryGrid.offsetHeight;
            
            try {
                const html = await this.generateGalleryHTML();
                console.log('Generated HTML for', this.photos.length, 'photos');
                
                // Add a smooth transition from loading to gallery
                setTimeout(() => {
                    galleryGrid.innerHTML = html || '<p>No images found in directories.</p>';
                    
                    // Animate gallery items appearing
                    const items = galleryGrid.querySelectorAll('.gallery-item');
                    items.forEach((item, index) => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.transition = 'all 0.5s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }, 3000); // Show loading screen for at least 3 seconds
                
            } catch (error) {
                console.error('Error generating gallery:', error);
                galleryGrid.innerHTML = '<p>Error loading photos. Please try refreshing the page.</p>';
            }
        } else {
            console.error('Gallery grid element not found');
        }

        this.setupFilters();
        this.setupModal();
        this.setupSlideshow();
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterPhotos(filter);
            });
        });
    }

    setupModal() {
        window.openModal = (element) => {
            const modal = document.getElementById('galleryModal');
            const modalImage = document.getElementById('modalImage');
            const modalTitle = document.getElementById('modalTitle');
            const modalDescription = document.getElementById('modalDescription');
            
            const galleryItem = element.closest('.gallery-item');
            const img = galleryItem.querySelector('img');
            const title = galleryItem.querySelector('.gallery-info h3').textContent;
            const description = galleryItem.querySelector('.gallery-info p').textContent;
            
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        };

        const modal = document.getElementById('galleryModal');
        const closeBtn = document.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', this.closeModal);
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupSlideshow() {
        window.openSlideshow = (startIndex) => {
            this.currentSlide = startIndex;
            this.showSlideshow();
        };

        // Create slideshow HTML if it doesn't exist
        if (!document.getElementById('slideshowModal')) {
            const slideshowHTML = `
                <div id="slideshowModal" class="slideshow-modal">
                    <div class="slideshow-container">
                        <span class="slideshow-close" onclick="closeSlideshow()">&times;</span>
                        <div class="slideshow-content">
                            <img id="slideshowImage" src="" alt="">
                            <div class="slideshow-info">
                                <h3 id="slideshowTitle"></h3>
                                <p id="slideshowDescription"></p>
                                <div class="slideshow-counter">
                                    <span id="slideNumber">1</span> / <span id="totalSlides">1</span>
                                </div>
                            </div>
                        </div>
                        <button class="slideshow-nav prev" onclick="changeSlide(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="slideshow-nav next" onclick="changeSlide(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="slideshow-controls">
                            <button id="playPauseBtn" onclick="toggleSlideshow()">
                                <i class="fas fa-play"></i>
                            </button>
                            <input type="range" id="slideshowSpeed" min="1" max="10" value="5" onchange="updateSlideshowSpeed()">
                            <span>Speed</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', slideshowHTML);
        }

        // Global functions for slideshow
        window.closeSlideshow = () => {
            document.getElementById('slideshowModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            this.stopSlideshow();
        };

        window.changeSlide = (direction) => {
            const filteredPhotos = this.getFilteredPhotos();
            this.currentSlide = (this.currentSlide + direction + filteredPhotos.length) % filteredPhotos.length;
            this.updateSlideshow();
        };

        window.toggleSlideshow = () => {
            const btn = document.getElementById('playPauseBtn');
            if (this.slideshowInterval) {
                this.stopSlideshow();
                btn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                this.startSlideshow();
                btn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        };

        window.updateSlideshowSpeed = () => {
            const speed = document.getElementById('slideshowSpeed').value;
            this.slideshowSpeed = (11 - speed) * 500; // Convert to milliseconds (500-5000ms)
            if (this.slideshowInterval) {
                this.stopSlideshow();
                this.startSlideshow();
            }
        };
    }

    getFilteredPhotos() {
        if (this.currentFilter === 'all') {
            return this.photos;
        }
        return this.photos.filter(photo => photo.category === this.currentFilter);
    }

    showSlideshow() {
        const modal = document.getElementById('slideshowModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.updateSlideshow();
        
        const filteredPhotos = this.getFilteredPhotos();
        document.getElementById('totalSlides').textContent = filteredPhotos.length;
    }

    updateSlideshow() {
        const filteredPhotos = this.getFilteredPhotos();
        const currentPhoto = filteredPhotos[this.currentSlide];
        
        document.getElementById('slideshowImage').src = currentPhoto.src;
        document.getElementById('slideshowTitle').textContent = currentPhoto.title;
        document.getElementById('slideshowDescription').textContent = currentPhoto.description;
        document.getElementById('slideNumber').textContent = this.currentSlide + 1;
    }

    startSlideshow() {
        this.slideshowSpeed = this.slideshowSpeed || 3000;
        this.slideshowInterval = setInterval(() => {
            window.changeSlide(1);
        }, this.slideshowSpeed);
    }

    stopSlideshow() {
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
    }

    closeModal() {
        const modal = document.getElementById('galleryModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const gallery = new PhotoGallery();
    await gallery.initializeGallery();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoGallery;
}
