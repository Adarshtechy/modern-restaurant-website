// Restaurant Website JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // ===== DOM Elements =====
    const body = document.body;
    const currentYear = document.getElementById('current-year');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');
    const cartToggle = document.querySelector('.cart-toggle');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartClose = document.querySelector('.cart-close');
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const totalAmount = document.querySelector('.total-amount');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const backToTop = document.querySelector('.back-to-top');
    const navLinks = document.querySelectorAll('.nav-link');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuSearch = document.getElementById('menu-search');
    const menuItems = document.querySelectorAll('.menu-item');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const contactForm = document.getElementById('contact-form');
    const scrollDown = document.querySelector('.scroll-down');

    // ===== Initialize =====
    initializeWebsite();

    // ===== Functions =====
    function initializeWebsite() {
        // Set current year in footer
        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }

        // Initialize cart from localStorage
        initializeCart();

        // Set up event listeners
        setupEventListeners();

        // Initialize animations
        initializeAnimations();

        // Check scroll position for back to top button
        checkScrollPosition();
    }

    function setupEventListeners() {
        // Mobile menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }

        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Cart functionality
        if (cartToggle) {
            cartToggle.addEventListener('click', openCart);
        }

        if (cartClose) {
            cartClose.addEventListener('click', closeCart);
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', closeCart);
        }

        // Navigation link active state
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // If it's a hash link, scroll smoothly
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Menu filter functionality
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function () {
                    // Update active filter button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Filter menu items
                    const filter = this.dataset.filter;
                    filterMenuItems(filter);
                });
            });
        }

        // Menu search functionality
        if (menuSearch) {
            menuSearch.addEventListener('input', function () {
                const searchTerm = this.value.toLowerCase();
                searchMenuItems(searchTerm);
            });
        }

        // Add to cart buttons
        if (addToCartButtons.length > 0) {
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const item = {
                        name: this.dataset.name,
                        price: parseInt(this.dataset.price),
                        image: this.dataset.image,
                        quantity: 1,
                        id: Date.now() + Math.random().toString(36).substr(2, 9)
                    };
                    addToCart(item);
                    showCartNotification(item.name);
                });
            });
        }

        // Contact form validation
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);

            // Real-time validation
            const formInputs = contactForm.querySelectorAll('input, textarea');
            formInputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', clearFieldError);
            });
        }

        // Scroll down button
        if (scrollDown) {
            scrollDown.addEventListener('click', function () {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Back to top button
        if (backToTop) {
            backToTop.addEventListener('click', scrollToTop);
        }

        // Scroll event for back to top button
        window.addEventListener('scroll', checkScrollPosition);

        // Close cart on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && cartSidebar.getAttribute('aria-hidden') === 'false') {
                closeCart();
            }
        });
    }

    function initializeCart() {
        // Get cart from localStorage or initialize empty
        let cart = JSON.parse(localStorage.getItem('restaurant-cart')) || [];
        updateCartDisplay(cart);
    }

    function toggleMobileMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');

        if (!isExpanded) {
            // Disable scroll when menu is open
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    function closeMobileMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        body.style.overflow = '';
    }

    function toggleTheme() {
        const isDark = body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
    }

    function openCart() {
        cartSidebar.setAttribute('aria-hidden', 'false');
        cartOverlay.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartSidebar.setAttribute('aria-hidden', 'true');
        cartOverlay.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
    }

    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('restaurant-cart')) || [];

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem =>
            cartItem.name === item.name && cartItem.price === item.price
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push(item);
        }

        // Save to localStorage
        localStorage.setItem('restaurant-cart', JSON.stringify(cart));

        // Update cart display
        updateCartDisplay(cart);

        // Open cart if it's closed
        if (cartSidebar.getAttribute('aria-hidden') === 'true') {
            openCart();
        }
    }

    function updateCartDisplay(cart) {
        // Update cart count
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.setAttribute('aria-label', `${totalItems} items in cart`);

        // Update cart items display
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItems.innerHTML = '';
            checkoutBtn.disabled = true;
            totalAmount.textContent = '₹0';
        } else {
            emptyCartMessage.style.display = 'none';
            renderCartItems(cart);
            checkoutBtn.disabled = false;

            // Calculate and update total
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalAmount.textContent = `₹${total}`;
        }
    }

    function renderCartItems(cart) {
        cartItems.innerHTML = '';

        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">₹${item.price} × ${item.quantity}</p>
                    <div class="cart-item-actions">
                        <button class="quantity-btn decrease" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItemElement);
        });

        // Add event listeners for cart item buttons
        document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
            btn.addEventListener('click', function () {
                updateCartItemQuantity(this.dataset.id, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
            btn.addEventListener('click', function () {
                updateCartItemQuantity(this.dataset.id, 1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                removeCartItem(this.dataset.id);
            });
        });
    }

    function updateCartItemQuantity(itemId, change) {
        let cart = JSON.parse(localStorage.getItem('restaurant-cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }

            localStorage.setItem('restaurant-cart', JSON.stringify(cart));
            updateCartDisplay(cart);
        }
    }

    function removeCartItem(itemId) {
        let cart = JSON.parse(localStorage.getItem('restaurant-cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('restaurant-cart', JSON.stringify(cart));
        updateCartDisplay(cart);
    }

    function showCartNotification(itemName) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${itemName} added to cart!</span>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1003;
            box-shadow: var(--shadow-lg);
            animation: slideIn 0.3s ease;
        `;

        // Add to document
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Add CSS animations
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function filterMenuItems(filter) {
        menuItems.forEach(item => {
            const categories = item.dataset.category.split(' ');

            if (filter === 'all' || categories.includes(filter)) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    function searchMenuItems(searchTerm) {
        menuItems.forEach(item => {
            const title = item.querySelector('.menu-item-title').textContent.toLowerCase();
            const description = item.querySelector('.menu-item-description').textContent.toLowerCase();
            const tags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

            const matches = title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                tags.some(tag => tag.includes(searchTerm));

            if (searchTerm === '' || matches) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    function validateField(e) {
        const field = e.target;
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let message = '';

        switch (field.id) {
            case 'name':
                if (field.value.trim().length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters long';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(field.value)) {
                    isValid = false;
                    message = 'Please enter a valid 10-digit phone number';
                }
                break;

            case 'message':
                if (field.value.trim().length < 10) {
                    isValid = false;
                    message = 'Message must be at least 10 characters long';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('error');
            errorElement.textContent = message;
        }

        return isValid;
    }

    function clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    const successMsg = document.getElementById("form-success");

    // Show
    successMsg.hidden = false;

    // Hide
    successMsg.hidden = true;


    function handleFormSubmit(e) {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        const formInputs = contactForm.querySelectorAll('input[required], textarea[required]');

        formInputs.forEach(input => {
            const event = new Event('blur');
            input.dispatchEvent(event);
            if (input.classList.contains('error')) {
                isValid = false;
            }
        });

        if (!isValid) {
            // Shake form to indicate error
            contactForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                contactForm.style.animation = '';
            }, 500);
            return;
        }

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());



        // In a real application, you would send this data to a server
        console.log('Form submitted:', data);

        // Show success message
        const successElement = document.getElementById('form-success');
        successElement.style.display = 'flex';

        // Reset form
        contactForm.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);

        // Add shake animation if not already present
        if (!document.querySelector('#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function initializeAnimations() {
        // Simple scroll animation implementation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements with data-aos attribute
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    function checkScrollPosition() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Update active navigation link based on scroll position
        updateActiveNavLink();
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
});