<script setup lang="ts">
import { ref } from 'vue'
import { useProgress } from '../store/progress'
const props = defineProps<{ step: { id:string; prompt:string; answer:string; success?:string; hint?:string } }>()

const answer = ref('')
const feedback = ref('')
const store = useProgress()
store.load()

function check() {
  const ok = answer.value.trim().toLowerCase() === props.step.answer.toLowerCase()
  feedback.value = ok ? (props.step.success ?? 'Correct !') : 'Mauvaise réponse.'
  if (ok) store.markDone(props.step.id)
}
</script>

<template>
  <section aria-labelledby="riddle-title">
    <h2 id="riddle-title" class="mb-4">{{ props.step.prompt }}</h2>
    <v-text-field
      v-model="answer"
      label="Votre réponse"
      hide-details="auto"
      @keyup.enter="check"
      aria-describedby="hint"
    />
    <div class="d-flex gap-2">
      <v-btn color="primary" @click="check">Valider</v-btn>
      <v-btn variant="text" v-if="props.step.hint" :aria-controls="'hint'">Indice</v-btn>
    </div>
    <p id="hint" v-if="props.step.hint" class="mt-2">Indice : {{ props.step.hint }}</p>
    <p aria-live="polite" class="mt-2">{{ feedback }}</p>
  </section>
</template>
