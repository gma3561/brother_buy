// Brand Selection
const brandItems = document.querySelectorAll('.brand-item');
const brandInput = document.getElementById('brand');
const buyRateInput = document.getElementById('buyRate');
const currentRateDisplay = document.getElementById('currentRate');

brandItems.forEach(item => {
    item.addEventListener('click', function() {
        // Remove previous selection
        brandItems.forEach(b => b.classList.remove('selected'));

        // Add selection to clicked item
        this.classList.add('selected');

        // Update hidden inputs
        const brand = this.dataset.brand;
        const rate = this.dataset.rate;
        brandInput.value = brand;
        buyRateInput.value = rate;

        // Update rate display
        if (currentRateDisplay) {
            currentRateDisplay.textContent = rate + '%';
        }

        // Recalculate if amount is entered
        calculatePayment();
    });
});

// PIN Number Formatting (16 digits with hyphens: 0000-0000-0000-0000)
const pinInput = document.getElementById('pin');

pinInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 16 digits
    if (value.length > 16) {
        value = value.slice(0, 16);
    }

    // Add hyphens every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join('-') || value;
    e.target.value = formatted;
});

// Amount Formatting and Calculation
const amountInput = document.getElementById('amount');
const calculationDisplay = document.getElementById('calculationDisplay');

amountInput.addEventListener('input', function(e) {
    // Remove non-digits
    let value = e.target.value.replace(/\D/g, '');

    // Format with commas
    if (value) {
        e.target.value = parseInt(value).toLocaleString('ko-KR');
    } else {
        e.target.value = '';
    }

    // Calculate payment
    calculatePayment();
});

function calculatePayment() {
    const amount = parseInt(amountInput.value.replace(/,/g, '')) || 0;
    const rate = parseFloat(buyRateInput.value) || 0;

    if (amount > 0 && rate > 0) {
        const payment = Math.floor(amount * rate / 100);

        // Show calculation
        calculationDisplay.classList.add('show');

        // Update display
        document.getElementById('displayAmount').textContent = amount.toLocaleString('ko-KR') + '원';
        document.getElementById('displayRate').textContent = rate + '%';
        document.getElementById('displayPayment').textContent = payment.toLocaleString('ko-KR') + '원';
    } else {
        calculationDisplay.classList.remove('show');
    }
}

// Phone Number Formatting
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 11 digits
    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    // Format: 010-0000-0000
    let formatted = '';
    if (value.length <= 3) {
        formatted = value;
    } else if (value.length <= 7) {
        formatted = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
    }

    e.target.value = formatted;
});

// Form Submission
const form = document.getElementById('applyForm');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate brand selection
    if (!brandInput.value) {
        alert('상품권 종류를 선택해주세요.');
        return;
    }

    // Validate PIN (16 digits)
    const pin = pinInput.value.replace(/\D/g, '');
    if (pin.length !== 16) {
        alert('핀번호 16자리를 정확히 입력해주세요.');
        pinInput.focus();
        return;
    }

    // Validate amount
    const amount = parseInt(amountInput.value.replace(/,/g, ''));
    if (!amount || amount < 10000) {
        alert('금액을 정확히 입력해주세요. (최소 10,000원)');
        amountInput.focus();
        return;
    }

    // Validate phone
    const phone = phoneInput.value.replace(/\D/g, '');
    if (phone.length !== 11) {
        alert('휴대폰 번호 11자리를 정확히 입력해주세요.');
        phoneInput.focus();
        return;
    }

    // Validate account
    if (document.getElementById('account').value.trim().length < 5) {
        alert('입금받을 계좌 정보를 정확히 입력해주세요.');
        document.getElementById('account').focus();
        return;
    }

    // Disable submit button
    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리중...';

    try {
        // Get brand information from Supabase
        const { data: brandData, error: brandError } = await supabaseClient
            .from('giftcard_brands')
            .select('id, buy_rate')
            .eq('brand_code', brandInput.value)
            .eq('is_active', true)
            .single();

        if (brandError) {
            throw new Error('상품권 브랜드 정보를 찾을 수 없습니다.');
        }

        // Calculate payment amount
        const paymentAmount = Math.floor(amount * brandData.buy_rate / 100);

        // Encrypt PIN (Base64 encoding for now)
        const pinEncrypted = btoa(pin);

        // Insert purchase request to Supabase
        const { data: purchaseData, error: purchaseError } = await supabaseClient
            .from('purchase_requests')
            .insert({
                brand_id: brandData.id,
                brand_code: brandInput.value,
                amount: amount,
                pin_encrypted: pinEncrypted,
                customer_name: document.getElementById('name')?.value || '고객',
                customer_phone: phoneInput.value,
                account_info: document.getElementById('account').value,
                buy_rate: brandData.buy_rate,
                payment_amount: paymentAmount,
                status: 'pending'
            })
            .select()
            .single();

        if (purchaseError) {
            console.error('Purchase error:', purchaseError);
            throw purchaseError;
        }

        // Success message
        alert(
            `✅ 매입 신청이 접수되었습니다!\n\n` +
            `📱 상품권 종류: ${getBrandName(brandInput.value)}\n` +
            `💰 상품권 금액: ${amount.toLocaleString()}원\n` +
            `📊 매입율: ${brandData.buy_rate}%\n` +
            `💵 입금 예정액: ${paymentAmount.toLocaleString()}원\n\n` +
            `핀번호 확인 후 3분 이내에 입금해드리겠습니다.\n` +
            `감사합니다!`
        );

        // Update steps
        updateSteps(2);
        setTimeout(() => {
            updateSteps(3);
            setTimeout(() => {
                // Reset form
                form.reset();
                brandItems.forEach(b => b.classList.remove('selected'));
                calculationDisplay.classList.remove('show');
                brandInput.value = '';
                buyRateInput.value = '';
                if (currentRateDisplay) {
                    currentRateDisplay.textContent = '96.5%';
                }
                updateSteps(1);
            }, 2000);
        }, 1500);

    } catch (error) {
        console.error('Submit error:', error);
        alert(
            `오류가 발생했습니다.\n\n` +
            `${error.message || '다시 시도해주시거나 고객센터로 문의해주세요.'}\n\n` +
            `☎️ 02-541-0656`
        );
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Helper function to get brand name
function getBrandName(brandCode) {
    const brandNames = {
        'hyundai': '현대백화점',
        'galleria': '갤러리아',
        'shinsegae': '신세계',
        'lotte': '롯데백화점',
        'hanwha': '한화갤러리아',
        'ak': 'AK플라자',
        'emart': '이마트',
        'cultureland': '컬처랜드'
    };
    return brandNames[brandCode] || brandCode;
}

// Update steps
function updateSteps(activeStep) {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
        if (index < activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('브라더상품권 핀매입 페이지 로드 완료');
    console.log('Supabase 연결:', supabaseClient ? '✅' : '❌');
});
