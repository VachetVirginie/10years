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
.pokemon-menu {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  outline: none;
}

.menu-frame {
  background-color: var(--pokemon-gray-100);
  border: 4px solid var(--pokemon-white);
  border-radius: 10px;
  box-shadow: 0 0 0 4px var(--pokemon-black), 0 0 15px rgba(255, 61, 40, 0.3);
  padding: 4px;
  overflow: hidden;
}

.menu-header {
  background-color: var(--pokemon-red);
  color: var(--pokemon-white);
  text-align: center;
  padding: 8px;
  font-weight: bold;
  border-radius: 6px 6px 0 0;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
  margin-bottom: 2px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}

.menu-items {
  padding: 4px 0;
}

.menu-item {
  position: relative;
  padding: 12px 16px 12px 36px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.menu-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.item-selected {
  background-color: rgba(255, 61, 40, 0.2);
}

.item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-selector {
  position: absolute;
  left: 12px;
  color: var(--pokemon-red);
  animation: blink 1s infinite;
}

.item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.item-icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.item-label {
  color: var(--pokemon-white);
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
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
