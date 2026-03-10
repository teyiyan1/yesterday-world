document.addEventListener('DOMContentLoaded', () => {
	gsap.registerPlugin(ScrollTrigger, SplitText);

	// Apple-style smooth scrolling - 苹果风格的平滑滚动
	const lenis = new Lenis({
		duration: 1.2, // 滚动持续时间，数值越大越平滑
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 苹果风格的缓动函数
		smoothWheel: true, // 启用平滑滚轮
		wheelMultiplier: 0.8, // 滚轮灵敏度，降低以获得更平滑的体验
		smoothTouch: false, // 移动设备上禁用平滑触摸（保持原生体验）
		touchMultiplier: 1.5, // 触摸滚动倍数
	});
	
	window.__lenis = lenis;
	lenis.on('scroll', ScrollTrigger.update);
	
	gsap.ticker.add((time) => {
		lenis.raf(time * 1000);
	});
	gsap.ticker.lagSmoothing(0);

	gsap.set('.image-motion', {
		transform: 'rotatex(90deg)',
	});

	gsap.to('.image-motion', {
		transform: 'rotatex(0deg)',
		scrollTrigger: {
			trigger: '.section2',
			start: 'top bottom',
			end: 'bottom top',
			scrub: true,
			markers: false,
		},
	});

	// Apple-style scroll effect for container - 苹果风格的滚动效果
	gsap.fromTo('.section3 .container', {
		opacity: 0,
		y: 80,
		scale: 0.95,
	}, {
		opacity: 1,
		y: 0,
		scale: 1,
		duration: 1.2,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.section3',
			start: 'top 85%',
			end: 'bottom 15%',
			toggleActions: 'play none none reverse',
		},
	});

	// Parallax effect - 视差效果：container 在滚动时稍微滞后
	gsap.to('.section3 .container', {
		y: -50,
		ease: 'none',
		scrollTrigger: {
			trigger: '.section3',
			start: 'top top',
			end: 'bottom top',
			scrub: 1.5, // 平滑的视差效果，数值越大越平滑
		},
	});

	gsap.fromTo('.title', {
		opacity: 0,
		y: 50,
	}, {
		opacity: 1,
		y: 0,
		duration: 1,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.section3',
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none reverse',
		},
	});

	gsap.fromTo('.inline-search', {
		opacity: 0,
		y: 30,
	}, {
		opacity: 1,
		y: 0,
		duration: 0.9,
		delay: 0.15,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.section3',
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none reverse',
		},
	});

	gsap.fromTo('.subtitle', {
		opacity: 0,
		y: 30,
	}, {
		opacity: 1,
		y: 0,
		duration: 0.8,
		delay: 0.3,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.section3',
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none reverse',
		},
	});

	// 引用卡片动画
	gsap.fromTo('.quote-card', {
		opacity: 0,
		y: 50,
	}, {
		opacity: 1,
		y: 0,
		duration: 1,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.text-content',
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none reverse',
		},
	});

	gsap.fromTo('.feature', {
		opacity: 0,
		y: 50,
		scale: 0.9,
	}, {
		opacity: 1,
		y: 0,
		scale: 1,
		stagger: 0.2,
		duration: 0.8,
		ease: 'power3.out',
		scrollTrigger: {
			trigger: '.features',
			start: 'top 80%',
			end: 'bottom 20%',
			toggleActions: 'play none none none',
		},
	});

	// 点击轮播图片添加翻书效果并跳转详情页
	const carouselItems = document.querySelectorAll('.carousel-item');

	carouselItems.forEach((item) => {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();

			const href = item.dataset.href || './people-magazine.html';
			const img = item.querySelector('img');

			if (!img || item.classList.contains('flipping')) return;

			// 添加翻书动画类，暂停轮播动画
			item.classList.add('flipping');

			// 获取当前图片的transform值
			const currentTransform = window.getComputedStyle(img).transform;
			const matrix = new DOMMatrix(currentTransform);
			const currentRotateY = Math.atan2(matrix.m13, matrix.m11) * (180 / Math.PI);

			// 使用GSAP创建流畅的翻书动画
			const tl = gsap.timeline({
				onComplete: () => {
					window.location.href = href;
				}
			});

			tl.to(img, {
				rotationY: currentRotateY + 180,
				scale: 0.85,
				opacity: 0,
				duration: 0.7,
				ease: 'power2.in',
				transformOrigin: 'left center',
			}, 0)
			.to(item, {
				z: 1000,
				duration: 0.1,
			}, 0)
			.to(item.querySelector('.person-info'), {
				opacity: 0,
				duration: 0.3,
			}, 0);
		});
	});

	// 时间轴模态框功能
	const timelineModal = document.getElementById('timeline-modal');
	const timelineFeature = document.querySelector('.feature[data-feature="timeline"]');
	const timelineClose = document.querySelector('.timeline-close');

	console.log('Timeline Modal:', timelineModal);
	console.log('Timeline Feature:', timelineFeature);
	console.log('Timeline Close:', timelineClose);

	// 时间轴模态框功能已改为内容切换，保留关闭功能以防其他地方调用

	// 关闭时间轴模态框
	if (timelineClose && timelineModal) {
		timelineClose.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			closeTimelineModal();
		});
	}

	function closeTimelineModal() {
		const modalContent = document.querySelector('.timeline-modal-content');
		
		// 内容向上滑出
		if (modalContent) {
			gsap.to(modalContent, {
				y: -window.innerHeight,
				opacity: 0,
				duration: 0.4,
				ease: 'power2.in',
			});
		}
		
		// 背景淡出
		gsap.to(timelineModal, {
			opacity: 0,
			duration: 0.3,
			ease: 'power2.in',
			delay: 0.1,
			onComplete: () => {
				timelineModal.classList.remove('active');
				timelineModal.style.display = 'none';
				document.body.style.overflow = '';
			},
		});
	}

	// 点击模态框背景关闭
	if (timelineModal) {
		timelineModal.addEventListener('click', (e) => {
			if (e.target === timelineModal) {
				e.preventDefault();
				e.stopPropagation();
				closeTimelineModal();
			}
		});
	}

	// ESC 键关闭模态框
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && timelineModal && timelineModal.classList.contains('active')) {
			closeTimelineModal();
		}
	});

	// Feature 导航滑动指示器
	const featuresNav = document.getElementById('featuresNav');
	const featureIndicator = document.getElementById('featureIndicator');
	const features = document.querySelectorAll('.feature');

	function updateFeatureIndicator(activeFeature) {
		if (!featureIndicator || !featuresNav || !activeFeature) return;

		const navRect = featuresNav.getBoundingClientRect();
		const featureRect = activeFeature.getBoundingClientRect();
		const scrollLeft = featuresNav.scrollLeft || 0;

		const left = featureRect.left - navRect.left + scrollLeft;
		const width = featureRect.width;

		featureIndicator.style.transform = `translateX(${left}px)`;
		featureIndicator.style.width = `${width}px`;
	}

	// 初始化指示器位置
	if (featuresNav && featureIndicator && features.length > 0) {
		const activeFeature = document.querySelector('.feature.active') || features[0];
		// 延迟初始化以确保 DOM 完全渲染
		setTimeout(() => {
			updateFeatureIndicator(activeFeature);
		}, 100);

		// 监听窗口大小变化
		let resizeTimer;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				const currentActive = document.querySelector('.feature.active') || features[0];
				updateFeatureIndicator(currentActive);
			}, 100);
		});

		// 内容切换功能
		const switchableContent = document.querySelector('.switchable-content');
		const contentPanels = switchableContent ? switchableContent.querySelectorAll('.content-panel') : [];
		
		function switchContent(featureType) {
			// 切换内容面板
			contentPanels.forEach(panel => {
				if (panel.dataset.content === featureType) {
					panel.classList.add('active');
					// 淡入动画
					gsap.fromTo(panel, {
						opacity: 0,
						y: 20
					}, {
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: 'power2.out'
					});
				} else {
					panel.classList.remove('active');
					gsap.set(panel, { opacity: 0 });
				}
			});
		}

		// 点击切换 feature
		features.forEach((feature, index) => {
			feature.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				
				const featureType = feature.dataset.feature;
				
				// 移除所有 active 类
				features.forEach(f => f.classList.remove('active'));
				
				// 添加 active 类到当前 feature
				feature.classList.add('active');
				
				// 更新指示器位置
				updateFeatureIndicator(feature);
				
				// 切换内容面板
				switchContent(featureType);
			});
		});
		
		// 初始化显示时间轴内容
		if (contentPanels.length > 0) {
			const activePanel = switchableContent ? switchableContent.querySelector('.content-panel.active') : null;
			if (activePanel) {
				gsap.set(activePanel, { opacity: 1, y: 0 });
			}
		}

		// 根据 URL hash 切换内容并滚动到 features 区域（支持从 header 导航链接跳转）
		const hash = window.location.hash.slice(1);
		if (hash === 'quotes' || hash === 'thoughts') {
			const targetFeature = document.querySelector(`.feature[data-feature="${hash}"]`);
			if (targetFeature) {
				features.forEach(f => f.classList.remove('active'));
				targetFeature.classList.add('active');
				updateFeatureIndicator(targetFeature);
				switchContent(hash);
			}
		} else if (hash === 'featuresNav' || !hash) {
			// #featuresNav 或无 hash 时，强制显示时间轴并同步 tab 状态
			const timelineFeature = document.querySelector('.feature[data-feature="timeline"]');
			if (timelineFeature) {
				features.forEach(f => f.classList.remove('active'));
				timelineFeature.classList.add('active');
				updateFeatureIndicator(timelineFeature);
				switchContent('timeline');
			}
		}
		if (hash === 'featuresNav' || hash === 'quotes' || hash === 'thoughts') {
			const featuresTarget = document.getElementById('featuresNav');
			if (featuresTarget) {
				setTimeout(() => lenis.scrollTo(featuresTarget, { offset: 0, duration: 1 }), 150);
			}
		}

		// 同步 guard：确保 tab 与内容一致（修复 tab 高亮与内容不同步的 bug）
		const applyHashState = () => {
			const h = window.location.hash.slice(1);
			if (h === 'quotes' || h === 'thoughts') {
				const targetFeature = document.querySelector(`.feature[data-feature="${h}"]`);
				if (targetFeature) {
					features.forEach(f => f.classList.remove('active'));
					targetFeature.classList.add('active');
					updateFeatureIndicator(targetFeature);
					switchContent(h);
				}
			} else {
				// #featuresNav 或无 hash：强制时间轴
				const timelineFeature = document.querySelector('.feature[data-feature="timeline"]');
				if (timelineFeature) {
					features.forEach(f => f.classList.remove('active'));
					timelineFeature.classList.add('active');
					updateFeatureIndicator(timelineFeature);
					switchContent('timeline');
				}
			}
		};
		const syncTabWithContent = () => {
			const activeFeature = document.querySelector('.feature.active');
			const featureType = activeFeature?.dataset?.feature;
			if (featureType) {
				const activePanel = switchableContent?.querySelector('.content-panel.active');
				if (activePanel?.dataset?.content !== featureType) {
					switchContent(featureType);
				}
			}
		};
		syncTabWithContent();
		window.addEventListener('hashchange', applyHashState);
	}
});
