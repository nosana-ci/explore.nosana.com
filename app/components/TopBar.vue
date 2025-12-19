<template>
  <div class="navbar-container">
    <div class="section pb-0 pt-4">
      <div class="container is-fluid">
        <div class="topbar-grid">
        <!-- Left: Logo + Divider + Title -->
        <div class="topbar-left">
          <nuxt-link to="/" class="navbar-logo">
            <Logo width="160px" :animated="true" class="light-only" />
            <Logo width="160px" :white="true" :animated="true" class="dark-only" />
          </nuxt-link>
          <div class="vertical-divider mx-4"></div>
          <h2 class="title is-3 mb-0">{{ title }}</h2>
        </div>

        <!-- Center: Navigation Tabs -->
        <div class="topbar-center is-hidden-mobile">
          <div class="navbar-tabs">
            <nuxt-link 
              to="/" 
              class="navbar-tab"
              :class="{ 'is-active': $route.path === '/' || $route.path.startsWith('/jobs') }"
            >
              Jobs
            </nuxt-link>
            <nuxt-link 
              to="/hosts" 
              class="navbar-tab"
              :class="{ 'is-active': $route.path.startsWith('/hosts') }"
            >
              Hosts
            </nuxt-link>
            <nuxt-link 
              to="/markets" 
              class="navbar-tab"
              :class="{ 'is-active': $route.path.startsWith('/markets') }"
            >
              Markets
            </nuxt-link>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="topbar-right">
          <!-- Status Link -->
          <a 
            href="https://nosana.statuspage.io" 
            target="_blank" 
            rel="noopener noreferrer"
            class="status-link is-hidden-mobile"
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
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
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
          to="/hosts" 
          class="mobile-menu-item"
          :class="{ 'is-active': $route.path.startsWith('/hosts') }"
          @click="showMobileMenu = false"
        >
          Hosts
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
const colorMode = useColorMode();

const toggleDarkMode = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
};
</script>

<style scoped lang="scss">
@use "sass:color";

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.topbar-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  min-height: 60px;
}

.topbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.topbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
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

.status-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
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
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  color: #6b7280;
  
  &:hover {
    background-color: #f3f4f6;
    color: #374151;
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
  width: 100%;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: 1rem;
  
  &.is-active {
    max-height: 300px;
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
  border-radius: 8px;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: $grey-lightest;
  }
  
  &.is-active {
    color: $primary;
    background: rgba($primary, 0.08);
  }
}

// Tablet and below - adjust grid layout
@media screen and (max-width: 1023px) {
  .topbar-grid {
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }
  
  .topbar-center {
    display: none;
  }
  
  .topbar-left {
    grid-column: 1;
  }
  
  .topbar-right {
    grid-column: 2;
  }
}

// Mobile - hide title and divider
@media screen and (max-width: 768px) {
  .vertical-divider, .title {
    display: none;
  }
}

// Dark mode styles
.dark-mode {
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
      color: $white;
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
    color: #9ca3af;
    
    &:hover {
      background-color: #374151;
      color: #d1d5db;
    }
  }
  
  .mobile-menu-item {
    color: $white;
    
    &:hover {
      background: rgba($white, 0.05);
    }
    
    &.is-active {
      color: $white;
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

.dark-mode {
  .light-only {
    display: none;
  }
  
  .dark-only {
    display: block;
  }
}
</style>
