<script setup lang="ts">
import { ref } from 'vue';

interface MenuItem {
  id: string | number;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

const props = defineProps({
  items: {
    type: Array as () => MenuItem[],
    required: true
  },
  title: {
    type: String,
    default: 'MENU'
  }
});

const emit = defineEmits(['select']);
const selectedIndex = ref(0);

// Navigation dans le menu avec les flèches
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    navigatePrevious();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    navigateNext();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    selectItem();
  }
}

// Naviguer vers l'élément précédent du menu
function navigatePrevious() {
  let newIndex = selectedIndex.value - 1;
  
  // Boucle pour éviter les éléments désactivés
  while (newIndex >= 0) {
    if (!props.items[newIndex].disabled) {
      selectedIndex.value = newIndex;
      return;
    }
    newIndex--;
  }
  
  // Si on arrive au début, on va à la fin
  if (newIndex < 0) {
    navigateLast();
  }
}

// Naviguer vers l'élément suivant du menu
function navigateNext() {
  let newIndex = selectedIndex.value + 1;
  
  // Boucle pour éviter les éléments désactivés
  while (newIndex < props.items.length) {
    if (!props.items[newIndex].disabled) {
      selectedIndex.value = newIndex;
      return;
    }
    newIndex++;
  }
  
  // Si on arrive à la fin, on revient au début
  if (newIndex >= props.items.length) {
    navigateFirst();
  }
}

// Aller au premier élément actif
function navigateFirst() {
  for (let i = 0; i < props.items.length; i++) {
    if (!props.items[i].disabled) {
      selectedIndex.value = i;
      return;
    }
  }
}

// Aller au dernier élément actif
function navigateLast() {
  for (let i = props.items.length - 1; i >= 0; i--) {
    if (!props.items[i].disabled) {
      selectedIndex.value = i;
      return;
    }
  }
}

// Sélectionner l'élément courant
function selectItem() {
  const item = props.items[selectedIndex.value];
  if (item && !item.disabled) {
    emit('select', item);
  }
}

// Gérer le clic sur un élément du menu
function handleItemClick(item: MenuItem, index: number) {
  if (!item.disabled) {
    selectedIndex.value = index;
    emit('select', item);
  }
}

// S'assurer que l'élément initial sélectionné est actif
navigateFirst();
</script>

<template>
  <div 
    class="pokemon-menu" 
    tabindex="0" 
    @keydown="handleKeyDown"
  >
    <div class="menu-frame glass-dark depth-shadow">
      <!-- Background decoration -->
      <div class="menu-background-decoration"></div>
      
      <div class="menu-header glass-primary" v-if="title">
        <span class="title-text">{{ title }}</span>
      </div>
      
      <div class="menu-items">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="menu-item touch-target"
          :class="{
            'item-selected': index === selectedIndex,
            'item-disabled': item.disabled
          }"
          @click="handleItemClick(item, index)"
          @mouseover="!item.disabled && (selectedIndex = index)"
        >
          <div class="item-selector glow-red" v-if="index === selectedIndex">▶</div>
          <div class="item-content">
            <div v-if="item.icon" class="item-icon" :style="{ color: item.color || 'var(--pokemon-white)' }">
              {{ item.icon }}
              <!-- icon-glow retiré -->
            </div>
            <div class="item-label">{{ item.label }}</div>
          </div>
          <!-- item-shine retiré -->
        </div>
      </div>
      
      <!-- Decoration separator -->
      <div class="glass-separator"></div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-menu {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  outline: none;
}

.menu-frame {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(40, 40, 40, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-xl);
  padding: 15px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Background decoration with particles effect */
.menu-background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 61, 40, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

.menu-header {
  background: var(--gradient-primary);
  color: var(--pokemon-white);
  text-align: center;
  padding: 12px 16px;
  font-weight: 700;
  border-radius: var(--border-radius-lg);
  text-transform: uppercase;
  font-size: 1rem;
  letter-spacing: 1px;
  margin-bottom: 15px;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.header-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(30deg);
  animation: header-shine 4s infinite linear;
  z-index: 0;
}

.title-text {
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.menu-items {
  padding: 5px 0;
  position: relative;
  z-index: 1;
}

.menu-item {
  position: relative;
  padding: 14px 18px 14px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  border-radius: var(--border-radius-lg);
  margin-bottom: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
}

.menu-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
}

.item-selected {
  background: rgba(255, 61, 40, 0.1) !important;
  box-shadow: var(--shadow-md), 0 0 15px rgba(255, 61, 40, 0.2) !important;
  border: 1px solid rgba(255, 61, 40, 0.2) !important;
}

.item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.item-selector {
  position: absolute;
  left: 15px;
  color: var(--pokemon-red);
  animation: blink 1s infinite;
  font-size: 1rem;
  filter: drop-shadow(0 0 5px rgba(255, 61, 40, 0.5));
  z-index: 1;
}

.item-content {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
}

.item-icon {
  margin-right: 15px;
  font-size: 1.3rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  z-index: -1;
  animation: pulse-glow 2s infinite alternate ease-in-out;
}

.item-label {
  color: var(--pokemon-white);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0;
}

/* Shine effect for selected item */
.item-shine {
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  z-index: 1;
  animation: item-shine 3s infinite;
}

/* Keyframes animations */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes header-shine {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

@keyframes item-shine {
  0% { left: -150%; }
  100% { left: 150%; }
}

/* Hover lift effect for menu items */
.hover-lift-subtle {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* Click feedback effect - version sans mouvement */
.click-feedback:active {
  opacity: 0.9;
  transition: opacity 0.1s ease;
}

/* Responsive styles */
@media (max-width: 768px) {
  .menu-frame {
    padding: 12px;
  }
  
  .menu-header {
    padding: 10px 14px;
    font-size: 0.95rem;
  }
  
  .menu-item {
    padding: 12px 16px 12px 36px;
    margin-bottom: 5px;
  }
  
  .item-icon {
    font-size: 1.2rem;
  }
  
  .item-label {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .pokemon-menu {
    max-width: 340px;
  }
  
  .menu-frame {
    padding: 10px;
    border-radius: var(--border-radius-lg);
  }
  
  .menu-header {
    padding: 8px 12px;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .menu-item {
    padding: 10px 12px 10px 32px;
    margin-bottom: 4px;
  }
  
  .item-selector {
    left: 12px;
    font-size: 0.9rem;
  }
  
  .item-label {
    font-size: 0.9rem;
  }
  
  .item-icon {
    margin-right: 12px;
    font-size: 1.1rem;
  }
  
  /* Optimize touch targets for mobile */
  .touch-target {
    min-height: 44px;
  }
}
</style>
