import { Component, inject, type OnInit, type OnDestroy, HostListener } from "@angular/core"
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from "@angular/router"
import { AuthService } from "../../../services/auth.service"
import { CommonModule } from "@angular/common"
import { Subject, takeUntil, filter } from "rxjs"

interface NavItem {
  label: string
  route: string
  icon?: string
  exact?: boolean
}

interface Particle {
  x: number
  delay: number
  duration: number
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>()

  authService = inject(AuthService)
  router = inject(Router)

  // Component state
  isLoggedIn = false
  isScrolled = false
  isMobileNavOpen = false
  isUserMenuOpen = false
  logoAnimated = false

  // Navigation items
  navItems: NavItem[] = [
    {
      label: "Home",
      route: "home",
      icon: "M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.4477 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15",
      exact: true,
    },
    {
      label: "About Us",
      route: "about",
      icon: "M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 15.8783 15.6812 14.0591 13.7957 13.2047M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 15.8783 8.31878 14.0591 10.2043 13.2047M10.2043 13.2047C11.1132 12.7147 12.1987 12.4286 13.3571 12.4286C14.5156 12.4286 15.6011 12.7147 16.51 13.2047M10.2043 13.2047C9.29543 12.7147 8.20994 12.4286 7.05143 12.4286M16.51 13.2047C17.4189 12.7147 18.5044 12.4286 19.6629 12.4286M13 7C13 8.65685 11.6569 10 10 10C8.34315 10 7 8.65685 7 7C7 5.34315 8.34315 4 10 4C11.6569 4 13 5.34315 13 7ZM21 7C21 8.65685 19.6569 10 18 10C16.3431 10 15 8.65685 15 7C15 5.34315 16.3431 4 18 4C19.6569 4 21 5.34315 21 7ZM9 7C9 8.65685 7.65685 10 6 10C4.34315 10 3 8.65685 3 7C3 5.34315 4.34315 4 6 4C7.65685 4 9 5.34315 9 7Z",
    },
    {
      label: "Contact Us",
      route: "contact",
      icon: "M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z",
    },
    {
      label: "Register",
      route: "dashboard/register",
      icon: "M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z",
    },
  ]

  // Particles for animation
  particles: Particle[] = []

  // Navigation background effect
  navBackgroundPosition = 0
  navBackgroundWidth = 0
  navBackgroundVisible = false

  // Notifications
  hasNotifications = true
  notificationCount = 3

  // Scroll threshold for header styling
  private scrollThreshold = 50

  constructor() {
    // Listen to route changes to close mobile nav
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.closeMobileNav()
        this.closeUserMenu()
      })
  }

  ngOnInit(): void {
    this.checkLoginStatus()
    this.checkScrollPosition()
    this.generateParticles()

    // Listen for auth state changes using the Observable
    this.authService.authState$.pipe(takeUntil(this.destroy$)).subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  // Listen to scroll events
  @HostListener("window:scroll", ["$event"])
  onWindowScroll(): void {
    this.checkScrollPosition()
  }

  // Listen to resize events to close mobile nav on desktop
  @HostListener("window:resize", ["$event"])
  onWindowResize(): void {
    if (window.innerWidth > 768 && this.isMobileNavOpen) {
      this.closeMobileNav()
    }
  }

  // Listen to clicks outside user menu to close it
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement
    const userMenu = target.closest(".user-menu")

    if (!userMenu && this.isUserMenuOpen) {
      this.closeUserMenu()
    }
  }

  // Listen to escape key to close menus
  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(): void {
    this.closeMobileNav()
    this.closeUserMenu()
  }

  /**
   * Generate floating particles for animation
   */
  generateParticles(): void {
    this.particles = Array.from({ length: 8 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
    }))
  }

  /**
   * Check if user is logged in
   */
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated()
  }

  /**
   * Check scroll position and update header state
   */
  private checkScrollPosition(): void {
    this.isScrolled = window.scrollY > this.scrollThreshold
  }

  /**
   * Logo hover animations
   */
  onLogoHover(): void {
    this.logoAnimated = true
  }

  onLogoLeave(): void {
    setTimeout(() => {
      this.logoAnimated = false
    }, 800)
  }

  /**
   * Navigation hover effects
   */
  onNavHover(index: number): void {
    const navLink = document.querySelectorAll(".nav-link")[index] as HTMLElement
    if (navLink) {
      const rect = navLink.getBoundingClientRect()
      const navContainer = document.querySelector(".nav-links") as HTMLElement
      const containerRect = navContainer.getBoundingClientRect()

      this.navBackgroundPosition = rect.left - containerRect.left
      this.navBackgroundWidth = rect.width
      this.navBackgroundVisible = true
    }
  }

  onNavLeave(index: number): void {
    this.navBackgroundVisible = false
  }

  /**
   * Toggle mobile navigation
   */
  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen

    // Prevent body scroll when mobile nav is open
    if (this.isMobileNavOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }

  /**
   * Close mobile navigation
   */
  closeMobileNav(): void {
    this.isMobileNavOpen = false
    document.body.style.overflow = ""
  }

  /**
   * Toggle user menu dropdown
   */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen
  }

  /**
   * Close user menu dropdown
   */
  closeUserMenu(): void {
    this.isUserMenuOpen = false
  }

  /**
   * Toggle notifications
   */
  toggleNotifications(): void {
    // Implement notifications functionality
    console.log("Toggle notifications")
  }

  /**
   * Handle logout with enhanced UX
   */
  OnLogout(): void {
    // Close any open menus
    this.closeUserMenu()
    this.closeMobileNav()

    // Show loading state (you can add a loading spinner here)
    console.log("Logging out...")

    try {
      // Perform logout
      this.authService.signOut()

      // Navigate to login with smooth transition
      this.router.navigate(["/dashboard/login"], {
        replaceUrl: true,
      })

      // Optional: Show success message
      console.log("Successfully logged out")
    } catch (error) {
      console.error("Logout error:", error)
      // Handle logout error (show toast notification, etc.)
    }
  }

  /**
   * Navigate to route and close mobile nav
   */
  navigateAndClose(route: string): void {
    this.closeMobileNav()
    this.router.navigate([route])
  }

  /**
   * Get current route for active state
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + "/")
  }
}
