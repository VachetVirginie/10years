import { ref, Ref } from 'vue'

/**
 * Composable pour créer une valeur booléenne togglable
 * @param initialValue Valeur initiale du booléen
 * @returns Tuple contenant la valeur réactive et une fonction pour la toggler
 */
export function useToggle(initialValue: boolean = false): [Ref<boolean>, () => void] {
  const state = ref(initialValue)
  
  function toggle() {
    state.value = !state.value
  }
  
  return [state, toggle]
}
