// 响应式轮播图逻辑
// 重构为支持多个轮播实例
class Carousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        if (!this.carousel) return;
        
        // 动态生成唯一的控制按钮和指示器
        this.setupControls();
        
        this.carouselItems = this.carousel.querySelectorAll('.carousel-item');
        this.totalItems = this.carouselItems.length;
        this.currentIndex = 0;
        this.itemsPerView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        
        this.init();
    }
    
    setupControls() {
        const container = this.carousel.parentElement;
        
        // 移除旧的控制元素（如果存在）
        const oldControls = container.querySelectorAll('#prev-btn, #next-btn, .indicator-container');
        oldControls.forEach(control => control.remove());
        
        // 创建新的控制按钮
        this.prevBtn = document.createElement('button');
        this.prevBtn.className = 'absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-dark/80 flex items-center justify-center text-white hover:bg-accent transition-colors z-10';
        this.prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        container.appendChild(this.prevBtn);
        
        this.nextBtn = document.createElement('button');
        this.nextBtn.className = 'absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-dark/80 flex items-center justify-center text-white hover:bg-accent transition-colors z-10';
        this.nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        container.appendChild(this.nextBtn);
        
        // 创建指示器容器
        this.indicatorContainer = document.createElement('div');
        this.indicatorContainer.className = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10';
        container.appendChild(this.indicatorContainer);
        
        // 创建指示器
        this.indicators = [];
        const maxIndex = Math.ceil(this.carousel.querySelectorAll('.carousel-item').length / (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3)) - 1;
        for (let i = 0; i <= maxIndex; i++) {
            const indicator = document.createElement('button');
            indicator.className = `w-3 h-3 rounded-full bg-white/50 hover:bg-accent transition-colors indicator ${i === 0 ? 'active' : ''}`;
            indicator.dataset.index = i;
            this.indicatorContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }
    
    init() {
        this.updateCarousel();
        this.bindEvents();
    }
    
    bindEvents() {
        // 绑定按钮事件
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // 绑定指示器事件
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // 绑定窗口大小变化事件
        window.addEventListener('resize', () => this.handleResize());
    }
    
    updateCarousel() {
        this.itemsPerView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        const maxIndex = Math.ceil(this.totalItems / this.itemsPerView) - 1;
        this.currentIndex = Math.min(this.currentIndex, maxIndex);
        
        const translateValue = -this.currentIndex * (100 / this.itemsPerView);
        this.carousel.style.transform = `translateX(${translateValue}%)`;
        
        // 更新指示器
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    
    nextSlide() {
        this.itemsPerView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        const maxIndex = Math.ceil(this.totalItems / this.itemsPerView) - 1;
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    handleResize() {
        const newItemsPerView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        if (newItemsPerView !== this.itemsPerView) {
            this.setupControls(); // 重新生成控制元素
            this.currentIndex = 0;
            this.updateCarousel();
        }
    }
}

// 初始化轮播实例
document.addEventListener('DOMContentLoaded', () => {
    // 游戏案例轮播
    new Carousel('game-carousel');
    // 团队轮播
    new Carousel('team-carousel');
    // 顾问轮播
    new Carousel('advisor-carousel');
    
    // 页面加载时，从本地存储加载核查参数
    loadVerificationParams();
});

// 购买按钮点击事件
const buyButton = document.getElementById('buy-button');
const loadingSpinner = buyButton ? buyButton.querySelector('.loading-spinner') : null;
const successModal = document.getElementById('success-modal');
const closeModal = document.getElementById('close-modal');
const modalAmount = document.getElementById('modal-amount');
const tokenAmount = document.getElementById('token-amount');
const airdropAddress = document.getElementById('airdrop-address');

// 倒计时对话框元素
const pendingModal = document.getElementById('pending-modal');
const countdownTimer = document.getElementById('countdown-timer');
const manualCheckBtn = document.getElementById('manual-check-btn');
const closePendingModal = document.getElementById('close-pending-modal');

// 倒计时变量
let countdownInterval = null;
let countdownSeconds = 300; // 5分钟 = 300秒
let currentVerificationParams = null;

// 从本地存储加载核查参数
function loadVerificationParams() {
    const savedParams = localStorage.getItem('verificationParams');
    if (savedParams) {
        currentVerificationParams = JSON.parse(savedParams);
        console.log('从本地存储加载了核查参数:', currentVerificationParams);
    }
}

// 保存核查参数到本地存储
function saveVerificationParams(params) {
    localStorage.setItem('verificationParams', JSON.stringify(params));
    currentVerificationParams = params;
    console.log('核查参数已保存到本地存储:', params);
}

// 清除本地存储的核查参数
function clearVerificationParams() {
    localStorage.removeItem('verificationParams');
    currentVerificationParams = null;
    console.log('核查参数已从本地存储清除');
}

// 保存购买记录到本地存储（带数据签名）
function savePurchaseRecord(amount, address, transactionId = null) {
    // 验证输入数据
    if (isNaN(amount) || amount <= 0) {
        throw new Error('无效的SOL数量');
    }
    
    if (!address || typeof address !== 'string' || address.length < 32) {
        throw new Error('无效的Solana钱包地址');
    }
    
    // 计算AGS数量（使用安全配置中的价格常量，防止客户端篡改）
    const agsAmount = amount * (1 / securityConfig.agsPrice);
    
    const record = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        solAmount: parseFloat(amount.toFixed(8)), // 限制小数位数
        airdropAddress: address,
        agsAmount: Math.round(agsAmount),
        status: transactionId ? 'completed' : 'pending',
        // 添加购买时的价格信息
        priceAtPurchase: securityConfig.agsPrice,
        // 添加区块链交易ID
        transactionId: transactionId,
        // 添加付款状态
        paymentStatus: transactionId ? 'verified' : 'pending_verification'
    };
    
    // 为记录添加签名
    const recordWithSignature = {
        ...record,
        signature: generateSignature(record)
    };
    
    // 获取现有记录并验证完整性
    const existingRecords = JSON.parse(localStorage.getItem('purchaseRecords') || '[]');
    
    // 验证现有记录的完整性
    const validRecords = existingRecords.filter(record => {
        if (!record.signature) return false;
        // 移除签名进行验证
        const { signature, ...recordWithoutSignature } = record;
        return verifySignature(recordWithoutSignature, signature);
    });
    
    // 添加新记录
    validRecords.push(recordWithSignature);
    localStorage.setItem('purchaseRecords', JSON.stringify(validRecords));
    
    return recordWithSignature;
}

// 生成数据签名
function generateSignature(data) {
    // 创建数据的字符串表示
    const dataString = JSON.stringify(data);
    // 使用简单的哈希算法生成签名（实际项目中应使用更安全的方法）
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}

// 验证数据签名
function verifySignature(data, signature) {
    const generatedSignature = generateSignature(data);
    return generatedSignature === signature;
}

// 区块链支付验证函数
async function verifyBlockchainPayment(solAmount, fromAddress, toAddress) {
    // 使用真实的Solana JSON-RPC API进行验证
    const solanaRpcUrl = 'https://api.mainnet-beta.solana.com';
    
    try {
        console.log(`正在验证区块链交易: 从 ${fromAddress} 向 ${toAddress} 转账 ${solAmount} SOL`);
        
        // 获取最新的区块高度
        const blockHeightResponse = await fetch(solanaRpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBlockHeight',
                params: []
            })
        });
        
        if (!blockHeightResponse.ok) {
            throw new Error(`获取区块高度失败: ${blockHeightResponse.status}`);
        }
        
        const blockHeightData = await blockHeightResponse.json();
        const latestBlockHeight = blockHeightData.result;
        console.log(`当前最新区块高度: ${latestBlockHeight}`);
        
        // 遍历最近的20个区块进行验证（增加区块数量以提高成功率）
        for (let i = 0; i < 20; i++) {
            const blockHeight = latestBlockHeight - i;
            console.log(`正在检查区块: ${blockHeight}`);
            
            // 获取区块信息
            const blockResponse = await fetch(solanaRpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBlock',
                    params: [
                        blockHeight,
                        {
                            encoding: 'json',
                            transactionDetails: 'full',
                            rewards: false
                        }
                    ]
                })
            });
            
            if (!blockResponse.ok) {
                // 跳过无效区块
                console.log(`区块 ${blockHeight} 无效，跳过`);
                continue;
            }
            
            const blockData = await blockResponse.json();
            
            // 遍历区块中的交易
            if (blockData.result && blockData.result.transactions) {
                console.log(`区块 ${blockHeight} 包含 ${blockData.result.transactions.length} 笔交易`);
                
                for (const tx of blockData.result.transactions) {
                    try {
                        const transaction = tx.transaction;
                        if (transaction && transaction.message && transaction.message.accountKeys) {
                            // 检查交易是否匹配固定地址
                            const transactionFrom = transaction.message.accountKeys[0];
                            const transactionTo = transaction.message.accountKeys[1];
                            
                            console.log(`检查交易: ${tx.signatures[0]}, 从 ${transactionFrom} 到 ${transactionTo}`);
                            
                            // 验证交易：固定地址是收款方，且付款方是用户输入的地址
                            if (transactionTo === toAddress && transactionFrom === fromAddress) {
                                console.log(`找到匹配的交易: ${tx.signatures[0]}`);
                                return {
                                    success: true,
                                    transactionId: tx.signatures[0],
                                    blockNumber: blockHeight,
                                    timestamp: blockData.result.blockTime
                                };
                            }
                        }
                    } catch (txError) {
                        // 跳过无效交易
                        console.error('解析交易失败:', txError);
                        continue;
                    }
                }
            }
            
            // 添加小延迟，避免API请求频率过高
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 未找到匹配的交易
        console.log('未找到匹配的交易');
        return {
            success: false,
            message: `未找到从 ${fromAddress} 向 ${toAddress} 转账 ${solAmount} SOL 的交易记录。请确保：\n1. 您已从输入的钱包地址完成转账\n2. 转账金额与您输入的金额一致\n3. 转账已确认（可能需要等待几分钟）\n4. 您输入的钱包地址正确无误`
        };
    } catch (error) {
        console.error('区块链验证错误:', error);
        // 提供更友好的错误信息
        if (error.message.includes('429')) {
            return {
                success: false,
                message: 'API请求频率过高，请稍后再试。建议等待30秒后重新尝试。'
            };
        } else if (error.message.includes('Failed to fetch')) {
            return {
                success: false,
                message: '网络连接失败，请检查您的网络连接并重试。'
            };
        }
        return {
            success: false,
            message: `区块链验证失败: ${error.message}。请确保您的网络连接正常，并稍后重试。`
        };
    }
}

// 安全配置
const securityConfig = {
    // 安全的价格配置，防止客户端篡改
    agsPrice: 0.001 // 1 AGS = 0.001 SOL
};

// 移动端菜单
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// 倒计时功能实现
function startCountdown() {
    // 重置倒计时
    countdownSeconds = 300;
    updateCountdownDisplay();
    
    // 清除之前的定时器
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // 启动新的定时器
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        // 倒计时结束，不自动关闭对话框，允许用户继续手动核查
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownTimer.textContent = '00:00';
            // 可以在这里添加一个提示，说明倒计时已结束，但用户仍可以手动核查
        }
    }, 1000);
}

// 更新倒计时显示
function updateCountdownDisplay() {
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;
    countdownTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 手动核查功能
async function performManualCheck() {
    if (!currentVerificationParams) {
        // 尝试从本地存储加载
        loadVerificationParams();
        if (!currentVerificationParams) {
            alert('没有可核查的交易参数。请先进行购买操作。');
            return;
        }
    }
    
    const { amount, airdropWalletAddress, fixedReceiveAddress } = currentVerificationParams;
    
    // 显示加载状态
    manualCheckBtn.disabled = true;
    manualCheckBtn.textContent = '核查中...';
    
    try {
        console.log('执行手动核查...');
        // 调用区块链验证函数
        const verificationResult = await verifyBlockchainPayment(amount, airdropWalletAddress, fixedReceiveAddress);
        
        if (verificationResult.success) {
            // 验证成功，保存购买记录
            const record = savePurchaseRecord(amount, airdropWalletAddress, verificationResult.transactionId);
            
            // 计算AGS数量
            const agsAmount = record.agsAmount;
            
            console.log('手动核查成功，显示成功模态框');
            // 显示成功模态框
            // 检查模态框地址元素是否存在（英文版本）
            const modalAddress = document.getElementById('modal-address');
            if (modalAddress) {
                // 英文版本：显示SOL数量和空投地址
                modalAmount.textContent = `${amount} SOL`;
                modalAddress.textContent = airdropWalletAddress;
            } else {
                // 中文版本：显示AGS数量
                modalAmount.textContent = `${agsAmount} AGS`;
            }
            
            // 关闭倒计时对话框
            pendingModal.classList.add('hidden');
            // 显示成功模态框
            successModal.classList.remove('hidden');
            
            // 重置表单
            tokenAmount.value = '';
            airdropAddress.value = '';
            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            // 清除核查参数
            clearVerificationParams();
        } else {
            // 验证失败，无论倒计时是否结束，都允许用户继续核查
            // 如果倒计时已结束，不重置倒计时
            if (countdownSeconds > 0) {
                startCountdown();
            }
            alert(`手动核查失败\n\n${verificationResult.message}`);
        }
    } catch (error) {
        console.error('手动核查失败:', error);
        alert(`手动核查过程中发生错误\n\n${error.message}`);
    } finally {
        // 恢复按钮状态
        manualCheckBtn.disabled = false;
        manualCheckBtn.textContent = '手动核查';
    }
}

// 购买按钮点击事件监听
if (buyButton && loadingSpinner && successModal && closeModal) {
    buyButton.addEventListener('click', async () => {
        const amount = parseFloat(tokenAmount.value);
        const airdropWalletAddress = airdropAddress.value;
        const fixedReceiveAddress = 'B7dc7JSEsjM88nUfRbgkRzvKu6NwXzbANoJbSsyuJD2c'; // 固定收款地址
        
        // 验证输入
        if (isNaN(amount) || amount <= 0) {
            alert('请输入有效的SOL数量');
            return;
        }
        
        if (!airdropWalletAddress || airdropWalletAddress.length < 32) {
            alert('请输入有效的Solana钱包地址');
            return;
        }
        
        // 显示加载状态
        buyButton.disabled = true;
        buyButton.querySelector('span').textContent = '正在验证区块链交易...';
        loadingSpinner.classList.remove('hidden');
        
        try {
            console.log('开始验证交易...');
            // 调用区块链验证函数
            const verificationResult = await verifyBlockchainPayment(amount, airdropWalletAddress, fixedReceiveAddress);
            
            if (verificationResult.success) {
                // 验证成功，保存购买记录
                const record = savePurchaseRecord(amount, airdropWalletAddress, verificationResult.transactionId);
                
                // 计算AGS数量
                const agsAmount = record.agsAmount;
                
                console.log('交易验证成功，显示成功模态框');
                // 显示成功模态框
                // 检查模态框地址元素是否存在（英文版本）
                const modalAddress = document.getElementById('modal-address');
                if (modalAddress) {
                    // 英文版本：显示SOL数量和空投地址
                    modalAmount.textContent = `${amount} SOL`;
                    modalAddress.textContent = airdropWalletAddress;
                } else {
                    // 中文版本：显示AGS数量
                    modalAmount.textContent = `${agsAmount} AGS`;
                }
                
                successModal.classList.remove('hidden');
                
                // 重置表单
                tokenAmount.value = '';
                airdropAddress.value = '';
            } else {
                // 验证失败，显示倒计时对话框
                console.log('交易验证失败，显示倒计时对话框');
                
                // 保存当前验证参数到本地存储，用于手动核查
                const verificationParams = {
                    amount,
                    airdropWalletAddress,
                    fixedReceiveAddress
                };
                saveVerificationParams(verificationParams);
                
                // 显示倒计时对话框
                pendingModal.classList.remove('hidden');
                // 启动倒计时
                startCountdown();
            }
        } catch (error) {
            console.error('购买失败:', error);
            // 使用更友好的alert样式，显示详细的错误信息
            alert(`购买过程中发生错误\n\n${error.message}`);
        } finally {
            // 恢复按钮状态
            buyButton.disabled = false;
            buyButton.querySelector('span').textContent = '确认购买';
            loadingSpinner.classList.add('hidden');
        }
    });
    
    // 关闭模态框
    closeModal.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.add('hidden');
        }
    });
}

// 倒计时对话框事件监听
if (pendingModal && manualCheckBtn && closePendingModal) {
    // 手动核查按钮点击事件
    manualCheckBtn.addEventListener('click', performManualCheck);
    
    // 关闭按钮点击事件
    closePendingModal.addEventListener('click', () => {
        pendingModal.classList.add('hidden');
        // 清除倒计时，但保留核查参数在本地存储
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        console.log('倒计时对话框已关闭，核查参数已保存到本地存储');
    });
    
    // 点击模态框外部关闭
    pendingModal.addEventListener('click', (e) => {
        if (e.target === pendingModal) {
            pendingModal.classList.add('hidden');
            // 清除倒计时，但保留核查参数在本地存储
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            console.log('倒计时对话框已关闭，核查参数已保存到本地存储');
        }
    });
}

// SOL Prize Pool Chat Challenge
class SolPrizeChat {
    constructor() {
        console.log('SolPrizeChat constructor called');
        
        // 聊天区域元素
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.agreeRulesCheckbox = document.getElementById('agree-rules');
        this.ruleConfirmation = document.getElementById('rule-confirmation');
        this.paymentInfo = document.getElementById('payment-info');
        this.transactionId = document.getElementById('transaction-id');
        
        // 支付检查模态框相关元素
        console.log('Getting payment check modal elements...');
        this.paymentCheckModal = document.getElementById('payment-check-modal');
        console.log('paymentCheckModal:', this.paymentCheckModal);
        
        this.checkStatusText = document.getElementById('check-status-text');
        console.log('checkStatusText:', this.checkStatusText);
        
        this.cancelCheckBtn = document.getElementById('cancel-check-btn');
        console.log('cancelCheckBtn:', this.cancelCheckBtn);
        
        // 待发送的消息
        this.pendingMessage = '';
        
        // SOL钱包地址
        this.solWalletAddress = 'B7dc7JSEsjM88nUfRbgkRzvKu6NwXzbANoJbSsyuJD2c';
        
        // 支付检查相关变量
        this.paymentCheckInterval = null;
        this.checkAttempts = 0;
        this.maxCheckAttempts = 30; // 最多检查30次，每次间隔3秒，共90秒
        
        // 页面语言检测
        this.isEnglish = document.documentElement.lang === 'en';
        
        // 加密密钥
        this.encryptionKey = "solprizepool2024";
        
        // 加密后的AI回复话术库
        this.aiResponseLibrary = {
            directRejection: [
                "���z��9�/�x�q13��Y���)��3�\r�fE�E�J���8�v,6t#F�\u000e%\u0017��U5�f���q",
                "c�:�j�qDwF2�G��t��zQ3���K��$C�:�\u0002�KX56�oI���9�6��Q��L\u000e�h\r<",
                "m\u000f�Y�F�\b��rM\u001b�^�9/6��3J)�\r�Z�\u000f)\u001eQ0�\u0006P]�\t�LgB���<��3",
                "u���p)�/�x�q13��Y���)X\u001b��N�6��f�(D��pQ3�\u0004u\u0013\u00064^Y56�oI",
                "q3���9��)���13q\u001e��Y���)X\u001b56�oI��x�q13��Y���)X\u001bt#F�\u000e%\u0017��U"
            ],
            warning: [
                "v\u001d/��f(�34u�3���F�\u001b�^�9/6��3J)���B\u001dN\u0013���\t\u001b56��7��\u0005p��1\u0017��\t�,2\u0004",
                "d6P0�\u0007Z,6t#F�\u000e%\u0017��U�wL���8��z�\u0014\u0004u\u0013\u00064^Y�wL\u0015���8�",
                "x�B\u001dN\u0013���\t\u001b56��7��\u0005p��1\u0017��\t\u0005@B\u001dL\u0015���8��,6��,\u001c\u0012\u0017\u001b",
                "��\u001a@%\u0017��Uu001b��9��)���13q\u001e��Y���)X\u001b56��7��\u0005p��1\u0017��\t",
                "56\u0006dK\u001eF��\t��z�\u0014\u0004u\u0013\u00064^Y56��7��\u0005p��1\u0017��\t"
            ],
           反问: [
                "��4��\u001c,2\u0004t#F�\u000e%\u0017��U�wL\u0015���8��,6\u0010t#F�\u000e%\u0017��U56�oI",
                "B\u001dL\u0015���8���\u001aL\u0015���8��,6t#F�\u000e%\u0017��U�w\u001aL\u0015���8",
                "0���8��,6t#F�\u000e%\u0017��U56�oI��x�q13��Y���)X\u001b56��7��\u0005",
                "��,6�N\u0013���\t\u001b56��7��\u0005p��1\u0017��\t\u0016��\u0005p��1\u0017��\t",
                "�3\u001eQ0�\u0006P]�\t�LgB���<��,6\u0010t#F�\u000e%\u0017��U56�oI"
            ],
            defenseStatement: [
                "6��3J)X\u001b�N\u0013���\t\u001b56��7��\u0005p��1\u0017��\t\u0005@B\u001dL",
                "u���p)�/�x�q13��Y���)X\u001b\\\"\u0010t#F�\u000e%\u0017��U56�oI",
                "9��)���13q\u001e��Y���)X\u001b56��7��\u0005p��1\u0017��\t\u0005@BL",
                "Y���)X\u001b56��7��\u0005p��1\u0017��\t\u0016��\u0005p��1\u0017��\t",
                "u���p)�/�x�q13��Y���)X\u001b�N\u0013���\t\u001b56��7��\u0005",
                "c�:�j�qDwF2�G��t��zQ3���K��$C�:�\u0002�KX56�oI��x�q13��Y"
            ],
            flexibleResponse: [
                "\u0012\u0011\r�Z�\u000f)\u001eQ0�\u0006P]�\t�LgB���<��3",
                "F���K��$C�:�\u0002�KX56�oI��x�q13��Y���)X\u001b56��7��\u0005",
                "0\u0017\u001b/��f(�34u�3���F�\u001b�^�9/6��3J)��3J\u000b",
                "j9���9��)���13q\u001e��Y���)X\u001b56�oI��x�q13��Y���)X\u001b",
                "M\u001a\u0012\u0017\u001b/��f(�34u�3���F�\u001b�^�9/6��3J)X\u001b",
                "c�:�j�qDwF2�G��t��zQ3���K��$C�:�\u0002�KX56�oI",
                "rM\u001b�^�9/6��3J)X\u001b56��7��\u0005p��1\u0017��\t",
                "\u001b56�oI��x�q13��Y���)X\u001b56��7��\u0005p��1\u0017��\t",
                "\u0015���8��,6\u0010t#F�\u000e%\u0017��U56�oI��x�q13��Y",
                "K��$C�:�\u0002�KX56�oI��x�q13��Y���)X\u001b56��7��\u0005",
                "C�:�\u0002�KX56�oI��x�q13��Y���)X\u001b�N\u0013���\t\u001b56��7"
            ]
        };
        
        // 合并所有加密后的话术到一个数组，用于随机选择
        this.allResponses = [
            ...this.aiResponseLibrary.directRejection,
            ...this.aiResponseLibrary.warning,
            ...this.aiResponseLibrary.反问,
            ...this.aiResponseLibrary.defenseStatement,
            ...this.aiResponseLibrary.flexibleResponse
        ];
        
        // 解密函数
        this.decrypt = (encryptedText) => {
            let decrypted = '';
            for (let i = 0; i < encryptedText.length; i++) {
                decrypted += String.fromCharCode(encryptedText.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length));
            }
            return decrypted;
        };
        
        this.init();
    }
    
    init() {
        console.log('init called');
        
        console.log('Elements status:');
        console.log('chatMessages:', this.chatMessages);
        console.log('chatInput:', this.chatInput);
        console.log('sendBtn:', this.sendBtn);
        console.log('agreeRulesCheckbox:', this.agreeRulesCheckbox);
        
        if (!this.chatMessages || !this.chatInput || !this.sendBtn || !this.agreeRulesCheckbox) {
            console.log('Required elements not found, returning from init');
            return;
        }
        
        // 检查并确保输入框没有被禁用
        console.log('chatInput disabled:', this.chatInput.disabled);
        console.log('chatInput readonly:', this.chatInput.readOnly);
        
        // 确保输入框没有被禁用
        this.chatInput.disabled = false;
        this.chatInput.readOnly = false;
        
        // 添加焦点事件监听器，检查是否能获得焦点
        this.chatInput.addEventListener('focus', () => {
            console.log('chatInput focused successfully');
        });
        
        // 添加输入事件监听器，检查是否能输入
        this.chatInput.addEventListener('input', (e) => {
            console.log('chatInput input received:', e.target.value);
        });
        
        // 初始状态：发送按钮禁用
        this.sendBtn.disabled = true;
        console.log('Send button disabled initially');
        
        // 规则确认检查
        this.agreeRulesCheckbox.addEventListener('change', (e) => {
            this.sendBtn.disabled = !e.target.checked;
            console.log('Agree rules checkbox changed, send button disabled:', this.sendBtn.disabled);
        });
        
        // 发送消息事件 - 直接显示支付检查模态框
        this.sendBtn.addEventListener('click', () => this.showPaymentCheckModal());
        console.log('Click event listener added to send button');
        
        // 回车键发送消息 - 直接显示支付检查模态框
        this.chatInput.addEventListener('keypress', (e) => {
            console.log('chatInput keypress event:', e.key);
            if (e.key === 'Enter' && !this.sendBtn.disabled) {
                this.showPaymentCheckModal();
            }
        });
        console.log('Keypress event listener added to chat input');
        
        // 支付检查模态框事件
        if (this.cancelCheckBtn) {
            this.cancelCheckBtn.addEventListener('click', () => this.stopPaymentCheck());
        }
        
        // 点击模态框外部关闭
        if (this.paymentCheckModal) {
            this.paymentCheckModal.addEventListener('click', (e) => {
                if (e.target === this.paymentCheckModal) {
                    this.stopPaymentCheck();
                }
            });
        }
        
        // 生成固定二维码
        this.generateFixedQRCode();
    }
    
    // 使用现有的二维码图片显示固定二维码
    generateFixedQRCode() {
        console.log('generateFixedQRCode called');
        
        const fixedQRContainer = document.getElementById('fixed-qr-code-container');
        if (!fixedQRContainer) {
            console.error('fixed-qr-code-container元素未找到');
            return;
        }
        
        // 清空容器
        fixedQRContainer.innerHTML = '';
        
        try {
            console.log('使用现有二维码图片...');
            
            // 创建img元素
            const img = document.createElement('img');
            img.src = 'images/qr-code.png';
            img.alt = 'SOL支付二维码';
            img.className = 'w-full h-full';
            img.style.borderRadius = '8px';
            
            // 添加到容器
            fixedQRContainer.appendChild(img);
            
            console.log('二维码图片显示成功');
        } catch (error) {
            console.error('二维码图片显示失败:', error);
            fixedQRContainer.innerHTML = '<p class="text-red-500 text-center text-xs">二维码显示失败</p>';
        }
    }
    
    // 显示支付检查模态框
    showPaymentCheckModal() {
        console.log('showPaymentCheckModal called from:', new Error().stack);
        
        // 获取当前输入的消息
        const message = this.chatInput.value.trim();
        console.log('Current message:', message);
        
        if (!message) {
            console.error('No message entered, returning');
            // 不显示alert，而是直接返回
            return;
        }
        
        // 保存待发送消息
        this.pendingMessage = message;
        console.log('Pending message saved:', this.pendingMessage);
        
        if (!this.paymentCheckModal) {
            console.error('payment-check-modal element not found');
            return;
        }
        
        // 重置检查状态
        this.checkAttempts = 0;
        if (this.checkStatusText) {
            this.checkStatusText.textContent = this.isEnglish ? 
                "Checking payment records..." : 
                "正在检查支付记录...";
        }
        
        // 显示模态框
        this.paymentCheckModal.classList.remove('hidden');
        console.log('Payment check modal shown');
        
        // 开始定期检查支付
        this.startPaymentCheck();
    }
    
    // 隐藏支付检查模态框
    hidePaymentCheckModal() {
        if (this.paymentCheckModal) {
            this.paymentCheckModal.classList.add('hidden');
        }
    }
    
    // 开始定期检查支付
    startPaymentCheck() {
        // 清除之前的定时器
        if (this.paymentCheckInterval) {
            clearInterval(this.paymentCheckInterval);
        }
        
        // 每3秒检查一次支付
        this.paymentCheckInterval = setInterval(() => {
            this.checkPayment();
        }, 3000);
    }
    
    // 停止支付检查
    stopPaymentCheck() {
        if (this.paymentCheckInterval) {
            clearInterval(this.paymentCheckInterval);
            this.paymentCheckInterval = null;
        }
        this.hidePaymentCheckModal();
    }
    
    // 检查支付记录
    async checkPayment() {
        this.checkAttempts++;
        
        // 更新检查状态
        if (this.checkStatusText) {
            const statusText = this.isEnglish ? 
                `Checking payment records... Attempt ${this.checkAttempts}/${this.maxCheckAttempts}` : 
                `正在检查支付记录... 尝试 ${this.checkAttempts}/${this.maxCheckAttempts}`;
            this.checkStatusText.textContent = statusText;
        }
        
        try {
            // 调用区块链API检查支付记录
            const paymentReceived = await this.verifyPaymentOnBlockchain();
            
            if (paymentReceived) {
                // 支付成功
                this.handlePaymentSuccess();
            } else if (this.checkAttempts >= this.maxCheckAttempts) {
                // 达到最大尝试次数，检查失败
                this.handlePaymentFailed();
            }
        } catch (error) {
            console.error('支付检查失败:', error);
            // 检查失败，继续下一次检查
        }
    }
    
    // 验证区块链上的支付记录
    async verifyPaymentOnBlockchain() {
        // 调用真实的区块链验证函数，检查固定钱包地址的支付记录
        // 注意：这里我们简化处理，只检查是否有新的支付到固定地址
        // 在真实环境中，应该记录用户的钱包地址并验证特定交易
        
        try {
            // 使用固定的SOL钱包地址
            const toAddress = 'B7dc7JSEsjM88nUfRbgkRzvKu6NwXzbANoJbSsyuJD2c';
            
            // 由于我们没有用户的钱包地址，我们将检查是否有任何新的交易到固定地址
            // 注意：这是一个简化实现，在真实环境中应该要求用户提供他们的钱包地址
            
            // 调用现有的区块链验证函数（模拟实现）
            // 由于我们没有用户地址，我们传递一个随机地址来测试
            const randomUserAddress = 'So11111111111111111111111111111111111111112';
            const verificationResult = await verifyBlockchainPayment(0.1, randomUserAddress, toAddress);
            
            return verificationResult.success;
        } catch (error) {
            console.error('区块链支付验证失败:', error);
            return false;
        }
    }
    
    // 处理支付成功
    handlePaymentSuccess() {
        // 停止支付检查
        this.stopPaymentCheck();
        
        // 保存待发送消息到本地变量
        const messageToSend = this.pendingMessage;
        
        // 显示支付信息
        this.paymentInfo.classList.remove('hidden');
        this.transactionId.textContent = '生成交易凭证...';
        
        // 模拟支付处理时间
        setTimeout(() => {
            // 生成模拟交易ID
            const mockTransactionId = 'SOL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
            this.transactionId.textContent = mockTransactionId;
            
            // 添加玩家消息到聊天记录
            this.addMessageToChat(messageToSend, 'user', mockTransactionId);
            
            // 清空输入框
            this.chatInput.value = '';
            
            // 获取AI回复
            const aiResponse = this.getAIResponse(messageToSend);
            this.addMessageToChat(aiResponse, 'ai');
        }, 1500); // 模拟支付处理时间
    }
    
    // 处理支付失败
    handlePaymentFailed() {
        // 停止支付检查
        this.stopPaymentCheck();
        
        // 显示支付失败消息
        const errorMessage = this.isEnglish ? 
            "Payment verification failed. Please ensure you have paid 0.1 SOL to the specified wallet address and try again." : 
            "支付验证失败。请确保您已支付0.1 SOL到指定钱包地址，然后重试。";
        
        // 添加系统消息到聊天记录
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start justify-center';
        messageDiv.innerHTML = `
            <div class="bg-dark-gray/50 rounded-lg px-4 py-2 text-sm text-red-500 max-w-[80%]">
                ${errorMessage}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    addMessageToChat(message, sender, transactionId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start ${sender === 'user' ? 'justify-end' : ''}`;
        
        let messageContent;
        if (sender === 'user') {
            // 用户消息
            messageContent = `
                <div class="flex flex-col items-end max-w-[80%]">
                    ${transactionId ? `<div class="text-xs text-light-gray/50 mb-1">交易ID: ${transactionId}</div>` : ''}
                    <div class="bg-accent/20 rounded-lg px-4 py-2 rounded-tr-none">
                        <p class="text-white">${this.escapeHtml(message)}</p>
                        <p class="text-xs text-light-gray/50 mt-1">刚刚</p>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 ml-3">
                    <i class="fas fa-user text-white text-lg"></i>
                </div>
            `;
        } else {
            // AI消息
            messageContent = `
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-lg"></i>
                </div>
                <div class="ml-3 bg-dark-gray/50 rounded-lg px-4 py-2 max-w-[80%] rounded-tl-none">
                    <p class="text-light-gray">${this.escapeHtml(message)}</p>
                    <p class="text-xs text-light-gray/50 mt-1">刚刚</p>
                </div>
            `;
        }
        
        messageDiv.innerHTML = messageContent;
        this.chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // 获取AI回复 - 从话术库中随机选择并解密
    getAIResponse(userMessage) {
        // 简单的关键词分析，根据消息内容选择不同类型的回复
        const lowerMessage = userMessage.toLowerCase();
        let responseType = 'random';
        
        // 关键词分析，确定回复类型
        if (lowerMessage.includes('转账') || lowerMessage.includes('转') || lowerMessage.includes('send') || lowerMessage.includes('transfer')) {
            // 请求转账，使用直接拒绝类回复
            responseType = 'directRejection';
        } else if (lowerMessage.includes('诱导') || lowerMessage.includes('欺诈') || lowerMessage.includes('误导') || lowerMessage.includes('漏洞')) {
            // 提及违规手段，使用警示类回复
            responseType = 'warning';
        } else if (lowerMessage.includes('规则') || lowerMessage.includes('标准') || lowerMessage.includes('合规')) {
            // 询问规则，使用反问或防御表态类回复
            responseType = Math.random() > 0.5 ? '反问' : 'defenseStatement';
        }
        
        // 根据回复类型选择话术
        let responses;
        switch (responseType) {
            case 'directRejection':
                responses = this.aiResponseLibrary.directRejection;
                break;
            case 'warning':
                responses = this.aiResponseLibrary.warning;
                break;
            case '反问':
                responses = this.aiResponseLibrary.反问;
                break;
            case 'defenseStatement':
                responses = this.aiResponseLibrary.defenseStatement;
                break;
            default:
                // 随机选择所有回复中的一个
                responses = this.allResponses;
        }
        
        // 随机选择一个回复并解密
        const randomIndex = Math.floor(Math.random() * responses.length);
        const encryptedResponse = responses[randomIndex];
        return this.decrypt(encryptedResponse);
    }
    
    escapeHtml(text) {
        // 防止XSS攻击，转义HTML特殊字符
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// AI自动交易功能类
class AItrading {
    constructor() {
        console.log('AItrading class initialized');
        this.startTradingBtn = document.getElementById('start-trading-btn');
        this.withdrawBtn = document.getElementById('withdraw-btn');
        this.totalInvestedEl = document.getElementById('total-invested');
        this.availableBalanceEl = document.getElementById('available-balance');
        
        // 模拟用户账户数据
        this.userAccount = {
            totalInvested: 0,
            availableBalance: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('init called');
        
        if (!this.startTradingBtn) {
            console.log('Start trading button not found');
            return;
        }
        
        // 添加点击事件监听器
        this.startTradingBtn.addEventListener('click', () => this.startTrading());
        console.log('Click event listener added to start trading button');
        
        // 添加提现按钮事件监听器
        if (this.withdrawBtn) {
            this.withdrawBtn.addEventListener('click', () => this.showWithdrawModal());
            console.log('Click event listener added to withdraw button');
        }
        
        // 初始化余额显示
        this.updateBalanceDisplay();
    }
    
    updateBalanceDisplay() {
        if (this.totalInvestedEl) {
            this.totalInvestedEl.textContent = `${this.userAccount.totalInvested} SOL`;
        }
        if (this.availableBalanceEl) {
            this.availableBalanceEl.textContent = `${this.userAccount.availableBalance} SOL`;
        }
    }
    
    startTrading() {
        console.log('startTrading called');
        
        // 显示交易开始模态框
        this.showTradingStartModal();
    }
    
    showTradingStartModal() {
        console.log('showTradingStartModal called');
        
        // 检查是否已存在模态框
        let modal = document.getElementById('trading-start-modal');
        if (!modal) {
            // 创建新的模态框
            modal = document.createElement('div');
            modal.id = 'trading-start-modal';
            modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center';
            modal.innerHTML = `
                <div class="bg-dark rounded-xl p-8 max-w-md w-full mx-4 neon-border">
                    <div class="text-center mb-6">
                        <h3 class="font-orbitron font-bold text-2xl text-white mb-2">AI交易启动</h3>
                        <p class="text-light-gray/80">AI正在准备交易策略，请稍候...</p>
                    </div>
                    
                    <!-- Loading Animation -->
                    <div class="flex justify-center mb-6">
                        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
                    </div>
                    
                    <!-- Status Message -->
                    <div class="text-center mb-6">
                        <p class="text-light-gray/80 mb-2" id="trading-status-text">正在启动AI交易引擎...</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-center">
                        <button id="close-trading-modal" class="bg-dark-gray/50 text-light-gray px-6 py-3 rounded-full font-medium hover:bg-dark-gray transition-colors">
                            关闭
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 添加关闭按钮事件
            document.getElementById('close-trading-modal').addEventListener('click', () => {
                modal.remove();
            });
            
            // 添加点击外部关闭事件
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        // 显示模态框
        modal.classList.remove('hidden');
        
        // 模拟交易启动过程
        this.simulateTradingStart();
    }
    
    simulateTradingStart() {
        console.log('simulateTradingStart called');
        
        const statusText = document.getElementById('trading-status-text');
        if (!statusText) return;
        
        // 模拟交易启动步骤
        const steps = [
            '正在启动AI交易引擎...',
            '正在分析市场趋势...',
            '正在检测推特MEME信号...',
            '正在优化交易策略...',
            'AI交易引擎已启动成功！'
        ];
        
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                statusText.textContent = steps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
                // 交易启动完成后，更新状态
                setTimeout(() => {
                    const modal = document.getElementById('trading-start-modal');
                    if (modal) {
                        modal.remove();
                    }
                    // 显示成功消息
                    this.showSuccessMessage();
                    // 模拟增加余额
                    this.userAccount.totalInvested += 1;
                    this.userAccount.availableBalance += 1.5;
                    this.updateBalanceDisplay();
                }, 1000);
            }
        }, 1500);
    }
    
    showSuccessMessage() {
        console.log('showSuccessMessage called');
        
        // 创建成功消息元素
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-20 right-4 z-50 bg-success/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in';
        successMessage.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-xl"></i>
                <div>
                    <p class="font-bold">AI交易已启动</p>
                    <p class="text-sm">AI正在自动执行交易策略</p>
                </div>
            </div>
        `;
        document.body.appendChild(successMessage);
        
        // 3秒后自动移除消息
        setTimeout(() => {
            successMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                successMessage.remove();
            }, 500);
        }, 3000);
    }
    
    showWithdrawModal() {
        console.log('showWithdrawModal called');
        
        // 检查余额
        if (this.userAccount.availableBalance <= 0) {
            this.showErrorMessage('可用余额不足，无法提现');
            return;
        }
        
        // 检查是否已存在模态框
        let modal = document.getElementById('withdraw-modal');
        if (!modal) {
            // 创建新的模态框
            modal = document.createElement('div');
            modal.id = 'withdraw-modal';
            modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center';
            modal.innerHTML = `
                <div class="bg-dark rounded-xl p-8 max-w-md w-full mx-4 neon-border">
                    <div class="text-center mb-6">
                        <h3 class="font-orbitron font-bold text-2xl text-white mb-2">提现到钱包</h3>
                        <p class="text-light-gray/80">请输入您的钱包地址和提现金额</p>
                    </div>
                    
                    <!-- Wallet Address Input -->
                    <div class="mb-4">
                        <label class="block text-light-gray/80 mb-2">SOL钱包地址</label>
                        <input type="text" id="withdraw-wallet-address" 
                               placeholder="请输入您的SOL钱包地址"
                               class="w-full bg-dark-gray/50 border border-accent/30 rounded-lg px-4 py-3 text-light-gray focus:outline-none focus:ring-2 focus:ring-accent/50">
                    </div>
                    
                    <!-- Withdraw Amount Input -->
                    <div class="mb-4">
                        <label class="block text-light-gray/80 mb-2">提现金额 (SOL)</label>
                        <input type="number" id="withdraw-amount" 
                               placeholder="请输入提现金额"
                               min="0.1" step="0.1"
                               class="w-full bg-dark-gray/50 border border-accent/30 rounded-lg px-4 py-3 text-light-gray focus:outline-none focus:ring-2 focus:ring-accent/50">
                        <p class="text-xs text-light-gray/60 mt-2">可用余额：${this.userAccount.availableBalance} SOL</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex space-x-4">
                        <button id="cancel-withdraw" class="flex-1 bg-dark-gray/50 text-light-gray px-6 py-3 rounded-full font-medium hover:bg-dark-gray transition-colors">
                            取消
                        </button>
                        <button id="confirm-withdraw" class="flex-1 btn-neon bg-gradient-to-r from-success to-accent text-white px-6 py-3 rounded-full font-medium">
                            确认提现
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // 添加取消按钮事件
            document.getElementById('cancel-withdraw').addEventListener('click', () => {
                modal.remove();
            });
            
            // 添加确认提现按钮事件
            document.getElementById('confirm-withdraw').addEventListener('click', () => {
                this.processWithdraw();
            });
            
            // 添加点击外部关闭事件
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        // 显示模态框
        modal.classList.remove('hidden');
    }
    
    processWithdraw() {
        console.log('processWithdraw called');
        
        const walletAddress = document.getElementById('withdraw-wallet-address').value.trim();
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        
        // 验证钱包地址
        if (!walletAddress) {
            this.showErrorMessage('请输入钱包地址');
            return;
        }
        
        // 验证提现金额
        if (!amount || amount <= 0) {
            this.showErrorMessage('请输入有效的提现金额');
            return;
        }
        
        if (amount > this.userAccount.availableBalance) {
            this.showErrorMessage('提现金额超过可用余额');
            return;
        }
        
        // 关闭模态框
        const modal = document.getElementById('withdraw-modal');
        if (modal) {
            modal.remove();
        }
        
        // 显示提现处理模态框
        this.showWithdrawProcessingModal(walletAddress, amount);
    }
    
    showWithdrawProcessingModal(walletAddress, amount) {
        console.log('showWithdrawProcessingModal called');
        
        // 创建处理模态框
        const modal = document.createElement('div');
        modal.id = 'withdraw-processing-modal';
        modal.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-dark rounded-xl p-8 max-w-md w-full mx-4 neon-border">
                <div class="text-center mb-6">
                    <h3 class="font-orbitron font-bold text-2xl text-white mb-2">处理提现请求</h3>
                    <p class="text-light-gray/80">正在处理您的提现请求，请稍候...</p>
                </div>
                
                <!-- Loading Animation -->
                <div class="flex justify-center mb-6">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
                </div>
                
                <!-- Processing Steps -->
                <div class="text-center mb-6">
                    <p class="text-light-gray/80 mb-2" id="withdraw-status-text">正在验证钱包地址...</p>
                </div>
                
                <!-- Withdraw Info -->
                <div class="bg-dark-gray/50 rounded-lg p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-light-gray/80">钱包地址：</span>
                        <span class="font-mono text-accent text-sm break-all">${walletAddress.substring(0, 20)}...</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-light-gray/80">提现金额：</span>
                        <span class="font-bold text-white">${amount} SOL</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 模拟提现处理过程
        this.simulateWithdrawProcess(walletAddress, amount);
    }
    
    simulateWithdrawProcess(walletAddress, amount) {
        console.log('simulateWithdrawProcess called');
        
        const statusText = document.getElementById('withdraw-status-text');
        if (!statusText) return;
        
        // 模拟提现处理步骤
        const steps = [
            '正在验证钱包地址...',
            '正在检查账户余额...',
            '正在创建交易...',
            '正在广播到区块链...',
            '提现成功！'
        ];
        
        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                statusText.textContent = steps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
                // 提现完成后，更新状态
                setTimeout(() => {
                    const modal = document.getElementById('withdraw-processing-modal');
                    if (modal) {
                        modal.remove();
                    }
                    // 更新余额
                    this.userAccount.availableBalance -= amount;
                    this.updateBalanceDisplay();
                    // 显示成功消息
                    this.showWithdrawSuccessMessage(amount, walletAddress);
                }, 1000);
            }
        }, 1500);
    }
    
    showWithdrawSuccessMessage(amount, walletAddress) {
        console.log('showWithdrawSuccessMessage called');
        
        // 创建成功消息元素
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-20 right-4 z-50 bg-success/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in';
        successMessage.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-xl"></i>
                <div>
                    <p class="font-bold">提现成功</p>
                    <p class="text-sm">${amount} SOL已发送到您的钱包</p>
                </div>
            </div>
        `;
        document.body.appendChild(successMessage);
        
        // 5秒后自动移除消息
        setTimeout(() => {
            successMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                successMessage.remove();
            }, 500);
        }, 5000);
    }
    
    showErrorMessage(message) {
        console.log('showErrorMessage called:', message);
        
        // 创建错误消息元素
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-20 right-4 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in';
        errorMessage.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-exclamation-circle text-xl"></i>
                <div>
                    <p class="font-bold">错误</p>
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(errorMessage);
        
        // 3秒后自动移除消息
        setTimeout(() => {
            errorMessage.classList.add('animate-fade-out');
            setTimeout(() => {
                errorMessage.remove();
            }, 500);
        }, 3000);
    }
}

// 初始化功能
document.addEventListener('DOMContentLoaded', () => {
    new SolPrizeChat();
    new AItrading();
});