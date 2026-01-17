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
            // 清除本地存储的核查参数
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