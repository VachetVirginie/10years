<script setup lang="ts">
import { ref } from 'vue';

interface MenuItem {
  id: string | number;
  label: string;
  icon?: string;
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
    <div class="menu-frame">
      <div class="menu-header" v-if="title">
        {{ title }}
      </div>
      
      <div class="menu-items">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="menu-item"
          :class="{
            'item-selected': index === selectedIndex,
            'item-disabled': item.disabled
          }"
          @click="handleItemClick(item, index)"
          @mouseover="!item.disabled && (selectedIndex = index)"
        >
          <div class="item-selector" v-if="index === selectedIndex">▶</div>
          <div class="item-content">
            <div v-if="item.icon" class="item-icon">{{ item.icon }}</div>
            <div class="item-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.pokemon-menu {
  width: 100%;
  max-width: 611px;
  margin: 0 auto;
  outline: none;
}

.menu-frame {
  background-color: rgba(33, 33, 33, 0.7);
  border: 1px solid var(--glass-border-light);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  padding: 8px;
  overflow: hidden;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
}

.pokemon-menu:hover .menu-frame {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px var(--glass-shadow-strong);
}

.menu-header {
  background: var(--glass-pokemon-red);
  color: var(--pokemon-white);
  text-align: center;
  padding: 12px;
  font-weight: bold;
  border-radius: 10px 10px 0 0;
  text-transform: uppercase;
  font-size: 0.95rem;
  letter-spacing: 1px;
  margin-bottom: 4px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  border-bottom: 1px solid var(--glass-border-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  position: relative;
  overflow: hidden;
}

.menu-header::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.15), transparent 70%);
  pointer-events: none;
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  position: relative;
  padding: 14px 18px 14px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  border-radius: 10px;
  margin: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.menu-item:not(:last-child) {
  margin-bottom: 8px;
}

.item-selected {
  background: var(--glass-bg-medium);
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 4px 15px var(--glass-shadow-medium);
  transform: translateY(-2px);
}

.menu-item:hover:not(.item-selected):not(.item-disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-selector {
  position: absolute;
  left: 15px;
  color: white;
  animation: blink 1s infinite;
  text-shadow: 0 0 5px var(--glass-pokemon-red), 0 0 10px rgba(255, 0, 0, 0.7);
  font-size: 1.1rem;
}

.item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.item-icon {
  margin-right: 14px;
  font-size: 1.3rem;
  background: rgba(0, 0, 0, 0.3);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  transition: var(--glass-transition);
}

.item-selected .item-icon {
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--glass-pokemon-red);
}

.item-label {
  color: var(--pokemon-white);
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@media (max-width: 480px) {
  .menu-item {
    padding: 10px 12px 10px 30px;
  }
  
  .item-selector {
    left: 10px;
  }
  
  .item-label {
    font-size: 0.75rem;
  }
}
</style>
