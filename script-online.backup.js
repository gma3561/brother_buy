// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');

function activateNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', activateNavLink);

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 70;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Gallery Modal
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('.gallery-image').src;
        modalImage.src = imgSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Apply Form Submission
const applyForm = document.getElementById('applyForm');

if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 제출 버튼 비활성화
        const submitBtn = applyForm.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>처리중...</span>';

        try {
            // Get form data
            const formData = {
                brand: document.getElementById('brand').value,
                amount: parseInt(document.getElementById('amount').value),
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                account: document.getElementById('account').value,
                pin: document.getElementById('pin').value,
                message: document.getElementById('message').value
            };

            // Validate PIN (16 digits)
            const pin = formData.pin.replace(/\D/g, '');
            if (pin.length !== 16) {
                alert('PIN 번호는 16자리 숫자여야 합니다.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }

            // Get brand information
            const { data: brandData, error: brandError } = await supabaseClient
                .from('giftcard_brands')
                .select('id, buy_rate')
                .eq('brand_code', formData.brand)
                .eq('is_active', true)
                .single();

            if (brandError) {
                throw new Error('상품권 브랜드 정보를 찾을 수 없습니다.');
            }

            // Calculate payment amount
            const paymentAmount = Math.floor(formData.amount * brandData.buy_rate / 100);

            // Encrypt PIN (Base64 encoding for now)
            const pinEncrypted = btoa(pin);

            // Insert purchase request
            const { data: purchaseData, error: purchaseError } = await supabaseClient
                .from('purchase_requests')
                .insert({
                    brand_id: brandData.id,
                    brand_code: formData.brand,
                    amount: formData.amount,
                    pin_encrypted: pinEncrypted,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    account_info: formData.account,
                    buy_rate: brandData.buy_rate,
                    payment_amount: paymentAmount,
                    message: formData.message || null,
                    status: 'pending'
                })
                .select()
                .single();

            if (purchaseError) {
                throw purchaseError;
            }

            // Success message
            alert(
                `매입 신청이 접수되었습니다!\n\n` +
                `상품권 금액: ${formData.amount.toLocaleString()}원\n` +
                `매입율: ${brandData.buy_rate}%\n` +
                `입금 예정액: ${paymentAmount.toLocaleString()}원\n\n` +
                `핀번호 확인 후 3분 이내에 입금해드리겠습니다.\n` +
                `감사합니다!`
            );

            // Reset form
            applyForm.reset();

        } catch (error) {
            console.error('신청 오류:', error);
            alert(
                `매입 신청 처리 중 오류가 발생했습니다.\n\n` +
                `오류: ${error.message || error}\n\n` +
                `잠시 후 다시 시도해주시거나,\n` +
                `전화로 문의해주세요: 02-541-0656`
            );
        } finally {
            // 버튼 복원
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Phone Number Formatting
const phoneInput = document.getElementById('phone');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 3 && value.length <= 7) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 7) {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }

        e.target.value = value;
    });
}

// Animate Elements on Scroll (Intersection Observer)
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .brand-item, .gallery-item, .info-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Initialize animations when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateOnScroll);
} else {
    animateOnScroll();
}

// Floating Apply Button - Show/Hide on Scroll
const floatingApplyBtn = document.getElementById('floatingApplyBtn');
let lastScrollTop = 0;

if (floatingApplyBtn) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 300) {
            floatingApplyBtn.style.opacity = '1';
            floatingApplyBtn.style.visibility = 'visible';
        } else {
            floatingApplyBtn.style.opacity = '0';
            floatingApplyBtn.style.visibility = 'hidden';
        }

        lastScrollTop = scrollTop;
    }, false);
}

// Brand Logos Animation (Subtle Float Effect)
const brandLogos = document.querySelectorAll('.brand-logo-item');

brandLogos.forEach((logo, index) => {
    logo.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
});

// Add floating animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// Click to Call Analytics (if needed)
const callButtons = document.querySelectorAll('a[href^="tel:"]');

callButtons.forEach(button => {
    button.addEventListener('click', () => {
        // You can add analytics tracking here
        console.log('Call button clicked:', button.href);

        // Example: Google Analytics tracking
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', 'click', {
        //         'event_category': 'Call',
        //         'event_label': button.href
        //     });
        // }
    });
});

// Page Load Animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Add fade-in effect to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Console message
console.log('%c브라더상품권 웹사이트', 'color: #DAA549; font-size: 20px; font-weight: bold;');
console.log('%c백화점 상품권 최고가 매입 전문', 'color: #3A3234; font-size: 14px;');
console.log('%c문의: 02-541-0656', 'color: #777; font-size: 12px;');
