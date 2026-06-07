

export const useLayoutStore = defineStore('layout', {
	state: () => ({
		showHeader: true,
		showNavigation: true,
		pageProgress: 0
	}),
	getters: {
		isChapterRoute() {
			return !!useRoute().params.chapter;
		}
	},
	actions: {
		showLayoutComponents() {
			this.showHeader = true;
			this.showNavigation = true;
		},
		hideLayoutComponents() {
			this.showHeader = false;
			this.showNavigation = false;
		},
		toggleLayoutComponents() {
			this.showHeader = !this.showHeader;
			this.showNavigation = !this.showNavigation;
		},
		initialize() {
			const navDelta = 50; // Minimum scroll delta to trigger hide/show in pixels
			const bottomTolerance = 50; // Distance from bottom of page (in pixels) within which the nav re-appears
			let previousPageProgress = 0;

			// On Route Change, reset scroll and progress
			const route = useRoute();
			watch (() => route.path, () => {
				window.scrollTo(0, 0);
				this.pageProgress = 0;
				previousPageProgress = 0;
				this.showLayoutComponents();
			});
			
			// Update progress on scroll
			window.addEventListener('scroll', () => {
				const scrollTop = window.scrollY;
				const docHeight = document.documentElement.scrollHeight - window.innerHeight;
				this.pageProgress = docHeight > 0 ? scrollTop / docHeight : 0;

				// Update visibility if scroll has increased/decreased enough
				if (this.isChapterRoute) {
					if (docHeight - scrollTop <= bottomTolerance) {
						this.showLayoutComponents();
						previousPageProgress = this.pageProgress;
					} else if (this.pageProgress - previousPageProgress > navDelta / docHeight) {
						this.hideLayoutComponents();
						previousPageProgress = this.pageProgress;
					} else if (previousPageProgress - this.pageProgress > navDelta / docHeight) {
						this.showLayoutComponents();
						previousPageProgress = this.pageProgress;
					}
				}
				
			});
		}
	}
});
