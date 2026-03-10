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
			toggleActions: 'play none none reverse',
		},
	});
});