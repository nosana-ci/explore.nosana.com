<template>
  <nav class="explorer-navbar">
    <div class="navbar-container">
      <div class="section py-0">
        <div class="container is-fluid">
          <div class="navbar-content">
            <!-- Left: Logo + Divider + Title -->
            <div class="navbar-brand">
              <nuxt-link to="/" class="navbar-logo">
                <Logo width="160px" :animated="true" class="light-only" />
                <Logo width="160px" :white="true" :animated="true" class="dark-only" />
              </nuxt-link>
              <div class="vertical-divider mx-4"></div>
              <h2 class="title is-3 mb-0">{{ title }}</h2>
            </div>

            <!-- Center: Navigation Tabs -->
            <div class="navbar-tabs">
              <nuxt-link 
                to="/" 
                class="navbar-tab"
                :class="{ 'is-active': $route.path === '/' || $route.path.startsWith('/jobs') }"
              >
                Jobs
              </nuxt-link>
              <nuxt-link 
                to="/markets" 
                class="navbar-tab"
                :class="{ 'is-active': $route.path.startsWith('/markets') }"
              >
                GPUs
              </nuxt-link>
            </div>

            <!-- Right: Actions -->
            <div class="navbar-actions">
              <!-- Status Link -->
              <a 
                href="https://nosana.statuspage.io" 
                target="_blank" 
                rel="noopener noreferrer"
                class="status-link"
              >
                <div class="status-dot"></div>
                <span>Status</span>
              </a>

              <!-- Dark Mode Toggle -->
              <button 
                class="theme-toggle"
                @click="toggleDarkMode"
                :title="$colorMode.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path v-if="$colorMode.value === 'dark'" fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" fill="currentColor"/>
                  <path v-else d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" fill="currentColor"/>
                </svg>
              </button>

              <!-- Mobile Menu Toggle -->
              <button 
                class="mobile-menu-toggle is-hidden-tablet"
                @click="showMobileMenu = !showMobileMenu"
                :class="{ 'is-active': showMobileMenu }"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>

          <!-- Mobile Menu -->
          <div class="mobile-menu is-hidden-tablet" :class="{ 'is-active': showMobileMenu }">
            <nuxt-link 
              to="/" 
              class="mobile-menu-item"
              :class="{ 'is-active': $route.path === '/' || $route.path.startsWith('/jobs') }"
              @click="showMobileMenu = false"
            >
              Jobs
            </nuxt-link>
            <nuxt-link 
              to="/markets" 
              class="mobile-menu-item"
              :class="{ 'is-active': $route.path.startsWith('/markets') }"
              @click="showMobileMenu = false"
            >
              GPUs
            </nuxt-link>
            <a 
              href="https://nosana.statuspage.io" 
              target="_blank" 
              rel="noopener noreferrer"
              class="mobile-menu-item"
              @click="showMobileMenu = false"
            >
              <div class="status-dot"></div>
              Status
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Logo from './Logo.vue';

defineProps({
  title: {
    type: String,
    required: true,
  }
});

const showMobileMenu = ref(false);

const toggleDarkMode = () => {
  const colorMode = useColorMode();
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<style scoped lang="scss">
@use "sass:color";

.explorer-navbar {
  background: $white;
  border-bottom: 1px solid $grey-lighter;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  gap: 2rem;
}

.navbar-brand {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.vertical-divider {
  width: 1px;
  height: 2rem;
  background-color: $grey;
  flex-shrink: 0;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.navbar-tabs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.navbar-tab {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: $grey;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    color: $text;
    background: $grey-lightest;
  }
  
  &.is-active {
    color: $primary;
    background: rgba($primary, 0.08);
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.status-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: $text;
  text-decoration: none;
  transition: background 0.2s ease;
  
  &:hover {
    background: $grey-lightest;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $success;
  box-shadow: 0 0 8px rgba($success, 0.4);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $grey;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: $grey-lightest;
    color: $text;
  }
}

.mobile-menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  
  span {
    width: 20px;
    height: 2px;
    background: $text;
    border-radius: 10px;
    transition: all 0.3s ease;
    transform-origin: 1px;
  }
  
  &.is-active {
    span:nth-child(1) {
      transform: rotate(45deg);
    }
    
    span:nth-child(2) {
      opacity: 0;
      transform: translateX(20px);
    }
    
    span:nth-child(3) {
      transform: rotate(-45deg);
    }
  }
}

.mobile-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-top: 1px solid $grey-lighter;
  
  &.is-active {
    max-height: 300px;
    padding: 1rem 0;
  }
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: $text;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.2s ease;
  
  &:hover {
    background: $grey-lightest;
  }
  
  &.is-active {
    color: $primary;
    background: rgba($primary, 0.08);
  }
}

// Hide navbar components on mobile
@media screen and (max-width: 1023px) {
  .navbar-tabs {
    display: none;
  }
  
  .status-link {
    display: none;
  }

  .vertical-divider, .title {
    display: none;
  }
}

// Dark mode styles
html.dark-mode {
  .explorer-navbar {
    background: $black-ter;
    border-bottom-color: $grey-dark;
  }

  .vertical-divider {
    background-color: $grey-darker;
  }
  
  .navbar-tab {
    color: $grey-light;
    
    &:hover {
      color: $white;
      background: rgba($white, 0.05);
    }
    
    &.is-active {
      color: $primary;
      background: rgba($primary, 0.15);
    }
  }
  
  .status-link {
    color: $white;
    
    &:hover {
      background: rgba($white, 0.05);
    }
  }
  
  .theme-toggle {
    color: $grey-light;
    
    &:hover {
      background: rgba($white, 0.05);
      color: $white;
    }
  }
  
  .mobile-menu {
    border-top-color: $grey-dark;
  }
  
  .mobile-menu-item {
    color: $white;
    
    &:hover {
      background: rgba($white, 0.05);
    }
    
    &.is-active {
      color: $primary;
      background: rgba($primary, 0.15);
    }
  }
  
  .mobile-menu-toggle span {
    background: $white;
  }
}

.light-only {
  display: block;
}

.dark-only {
  display: none;
}

html.dark-mode {
  .light-only {
    display: none;
  }
  
  .dark-only {
    display: block;
  }
}
</style>
