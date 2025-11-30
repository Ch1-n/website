// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
});

// 移动端菜单切换
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // 动画菜单图标
    const spans = menuToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// 点击导航链接后关闭移动端菜单
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// 平滑滚动
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

// 滚动动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 观察需要动画的元素
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.skill-card, .project-card, .stat-item, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// EmailJS 配置
// 请将以下配置替换为你从EmailJS获取的实际值
const EMAILJS_CONFIG = {
    serviceId: 'QQ service_3vgpasm',      // 替换为你的EmailJS服务ID
    templateId: 'template_ukyfa7m',     // 替换为你的EmailJS模板ID
    publicKey: 'HY_NPIaIkw5fY4BKG'        // 替换为你的EmailJS公钥
};

// 初始化EmailJS（如果已加载）
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

// 表单提交处理
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        // 验证表单
        if (!name || !email || !message) {
            showMessage('请填写所有字段！', 'error');
            return;
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('请输入有效的邮箱地址！', 'error');
            return;
        }
        
        // 检查EmailJS是否已配置
        if (EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' || 
            EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID' || 
            EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            showMessage('邮件服务未配置，请先配置EmailJS！', 'error');
            console.error('请先在script.js中配置EmailJS的serviceId、templateId和publicKey');
            return;
        }
        
        // 获取按钮并更新状态
        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = '发送中...';
        button.disabled = true;
        button.style.opacity = '0.7';
        
        try {
            // 使用EmailJS发送邮件
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS SDK未加载，请检查网络连接');
            }
            
            // 确保EmailJS已初始化
            if (!emailjs.init) {
                emailjs.init(EMAILJS_CONFIG.publicKey);
            }
            
            // 将name、email和message组合成一个完整的消息
            const combinedMessage = `发件人姓名：${name}\n发件人邮箱：${email}\n\n消息内容：\n${message}`;
            
            const templateParams = {
                from_name: name,
                from_email: email,
                message: combinedMessage,
                to_email: 'kvinkin@qq.com', // 你的接收邮箱
                reply_to: email
            };
            
            // 输出调试信息
            console.log('准备发送邮件:', {
                serviceId: EMAILJS_CONFIG.serviceId,
                templateId: EMAILJS_CONFIG.templateId,
                templateParams: templateParams
            });
            
            const result = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                templateParams
            );
            
            console.log('邮件发送成功:', result);
            
            // 发送成功
            button.textContent = '发送成功！';
            button.style.background = '#10b981';
            showMessage('消息已成功发送！我会尽快回复你。', 'success');
            
            // 重置表单
            contactForm.reset();
            
            // 3秒后恢复按钮
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 3000);
            
        } catch (error) {
            // 发送失败 - 显示详细错误信息
            console.error('邮件发送失败 - 详细错误:', {
                error: error,
                message: error.text || error.message,
                status: error.status,
                serviceId: EMAILJS_CONFIG.serviceId,
                templateId: EMAILJS_CONFIG.templateId
            });
            
            let errorMessage = '发送失败，请稍后重试';
            
            // 根据错误类型显示更具体的提示
            if (error.text) {
                if (error.text.includes('Invalid service ID')) {
                    errorMessage = '服务ID无效，请检查EmailJS配置中的serviceId';
                } else if (error.text.includes('Invalid template ID')) {
                    errorMessage = '模板ID无效，请检查EmailJS配置中的templateId';
                } else if (error.text.includes('Invalid public key')) {
                    errorMessage = '公钥无效，请检查EmailJS配置中的publicKey';
                } else {
                    errorMessage = `发送失败: ${error.text}`;
                }
            } else if (error.message) {
                errorMessage = `发送失败: ${error.message}`;
            }
            
            button.textContent = '发送失败';
            button.style.background = '#ef4444';
            showMessage(errorMessage + '。或直接发送邮件到 kvinkin@qq.com', 'error');
            
            // 3秒后恢复按钮
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 5000);
        }
    });
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 移除已存在的消息
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#d1fae5';
        messageDiv.style.color = '#065f46';
        messageDiv.style.border = '1px solid #10b981';
    } else if (type === 'error') {
        messageDiv.style.background = '#fee2e2';
        messageDiv.style.color = '#991b1b';
        messageDiv.style.border = '1px solid #ef4444';
    } else {
        messageDiv.style.background = '#dbeafe';
        messageDiv.style.color = '#1e40af';
        messageDiv.style.border = '1px solid #3b82f6';
    }
    
    // 添加到表单后面
    const contactForm = document.querySelector('.contact-form');
    contactForm.appendChild(messageDiv);
    
    // 5秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// 技能条动画
const skillBars = document.querySelectorAll('.skill-bar');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// 活跃导航链接高亮
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

