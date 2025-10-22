<template>
  <div class="trainer-journal">
    <!-- En-tête du journal -->
    <div class="journal-header">
      <div class="journal-cover">
        <div class="cover-decoration">
          <div class="cover-badge">
            <span class="badge-icon">📖</span>
          </div>
          <h1 class="journal-title">Journal de Dresseur</h1>
          <p class="journal-subtitle">Nos aventures à travers Lyon</p>
          <div class="journal-date">{{ formatDate(new Date()) }}</div>
        </div>
      </div>
    </div>

    <!-- Contenu du journal -->
    <div class="journal-content">
      <!-- Section des étapes complétées -->
      <section class="journal-section">
        <h2 class="section-title">🏆 Étapes Maîtrisées</h2>
        <div class="steps-grid">
          <div
            v-for="step in completedSteps"
            :key="step.id"
            class="step-card"
          >
            <div class="step-header">
              <h3 class="step-title">{{ step.title }}</h3>
              <div class="step-badge">{{ step.id }}</div>
            </div>
            <div class="step-content">
              <p class="step-description">{{ step.success }}</p>
              <div v-if="(step as any).photo" class="step-photo">
                <img :src="(step as any).photo" :alt="`Photo de ${step.title}`" />
              </div>
            </div>
            <div class="step-footer">
              <span class="step-type">{{ getStepTypeLabel(step.type) }}</span>
              <span class="step-date">{{ formatDate((step as any).completedAt) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section des badges obtenus -->
      <section class="journal-section">
        <h2 class="section-title">🏅 Badges Collectionnés</h2>
        <div class="badges-grid">
          <div
            v-for="badge in earnedBadges"
            :key="badge.id"
            class="badge-card"
          >
            <div class="badge-icon">{{ badge.icon }}</div>
            <h3 class="badge-name">{{ badge.name }}</h3>
            <p class="badge-description">{{ badge.description }}</p>
            <div class="badge-rarity" :class="badge.rarity">{{ badge.rarity }}</div>
          </div>
        </div>
      </section>

      <!-- Section des défis bonus réussis -->
      <section class="journal-section">
        <h2 class="section-title">🎯 Défis Bonus Réussis</h2>
        <div class="bonus-grid">
          <div
            v-for="bonus in completedBonuses"
            :key="bonus.id"
            class="bonus-card"
          >
            <div class="bonus-header">
              <h3 class="bonus-title">{{ bonus.title }}</h3>
              <div class="bonus-type">{{ getBonusTypeLabel((bonus as any).bonusType) }}</div>
            </div>
            <div class="bonus-content">
              <p class="bonus-description">{{ bonus.success }}</p>
              <div v-if="(bonus as any).photo" class="bonus-photo">
                <img :src="(bonus as any).photo" :alt="`Photo du défi ${bonus.title}`" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section des messages romantiques -->
      <section class="journal-section">
        <h2 class="section-title">💕 Messages Romantiques</h2>
        <div class="messages-grid">
          <div
            v-for="(message, index) in romanticMessages"
            :key="index"
            class="message-card"
          >
            <div class="message-content">
              <p class="message-text">{{ message.text }}</p>
            </div>
            <div class="message-footer">
              <span class="message-location">{{ message.location }}</span>
              <span class="message-date">{{ formatDate(message.date) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section finale avec statistiques -->
      <section class="journal-section">
        <h2 class="section-title">📊 Statistiques d'Aventure</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ completedSteps.length }}</div>
            <div class="stat-label">Étapes complétées</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ earnedBadges.length }}</div>
            <div class="stat-label">Badges obtenus</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ completedBonuses.length }}</div>
            <div class="stat-label">Bonus réussis</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ Math.round((completedSteps.length / totalSteps) * 100) }}%</div>
            <div class="stat-label">Aventure accomplie</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer du journal -->
    <div class="journal-footer">
      <div class="footer-message">
        <p>Cette aventure a été créée avec ❤️ pour toi</p>
        <p class="footer-signature">Ton éternel compagnon d'aventure</p>
      </div>
      <div class="footer-actions">
        <button @click="exportJournal" class="export-button">
          📥 Exporter le Journal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from '../composables/useHunt'

// Store et données
const store = useProgress()
const { steps } = useHunt()

// Charger les données sauvegardées du store
store.load()

// Données calculées avec vérification des propriétés existantes
const completedSteps = computed(() => {
  return steps.filter(step => {
    const isCompleted = store.done.has(step.id)
    const isBonus = step.id.endsWith('b')

    if (isBonus) return false // Exclure les étapes bonus de cette section

    // Vérifier si l'étape a des coordonnées (pour s'assurer que c'est une vraie étape géographique)
    const hasCoordinates = 'lat' in step && 'lng' in step

    return isCompleted && hasCoordinates ? {
      ...step,
      completedAt: new Date(), // Date simulée, à remplacer par une vraie date de complétion
      photo: (step as any).photo || null // Photo optionnelle
    } : false
  }).filter(Boolean)
})

const completedBonuses = computed(() => {
  return steps.filter(step => {
    const isBonus = step.id.endsWith('b')
    const isCompleted = store.done.has(step.id)

    if (!isBonus || !isCompleted) return false

    return {
      ...step,
      completedAt: new Date(),
      photo: (step as any).photo || null
    }
  })
})

const earnedBadges = computed(() => {
  // Simulation des badges obtenus basés sur la progression
  const badges = [
    { id: 'first_step', name: 'Premier Pas', description: 'A complété la première étape', icon: '🎯', rarity: 'Commun' },
    { id: 'explorer', name: 'Explorateur', description: 'A découvert 3 lieux différents', icon: '🗺️', rarity: 'Rare' },
    { id: 'romantic', name: 'Romantique', description: 'A collectionné tous les messages d\'amour', icon: '💕', rarity: 'Légendaire' }
  ]

  return badges.filter(badge => {
    if (badge.id === 'first_step') return completedSteps.value.length > 0
    if (badge.id === 'explorer') return completedSteps.value.length >= 3
    if (badge.id === 'romantic') return completedSteps.value.length >= 5
    return false
  })
})

const romanticMessages = computed(() => {
  // Messages romantiques débloqués pendant l'aventure
  const messages = [
    { text: "Chaque pas que nous faisons ensemble est une nouvelle histoire qui s'écrit.", location: "Place Bellecour", date: new Date() },
    { text: "Ton sourire illumine même les rues les plus sombres de Lyon.", location: "Halles Paul Bocuse", date: new Date() },
    { text: "Dans tes yeux, je vois tout l'amour que je ressens pour toi.", location: "Parc de la Tête d'Or", date: new Date() }
  ]

  return messages.slice(0, completedSteps.value.length)
})

const totalSteps = computed(() => steps.filter(s => !s.id.endsWith('b') && 'lat' in s && 'lng' in s).length)

// Méthodes utilitaires
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Non spécifiée'

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'Date invalide'

  return dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStepTypeLabel(type: string): string {
  switch (type) {
    case 'riddle': return 'Énigme'
    case 'choice': return 'Combat'
    case 'bonus': return 'Bonus'
    default: return 'Étape'
  }
}

function getBonusTypeLabel(bonusType: string): string {
  switch (bonusType) {
    case 'photo_challenge': return 'Défi Photo'
    case 'creative_challenge': return 'Défi Créatif'
    case 'nature_challenge': return 'Défi Nature'
    case 'memory_challenge': return 'Défi Mémoire'
    case 'movement_challenge': return 'Défi Mouvement'
    case 'balance_challenge': return 'Défi Équilibre'
    default: return 'Défi Bonus'
  }
}

function exportJournal() {
  // Capturer le journal en image avec html2canvas
  const journalElement = document.querySelector('.trainer-journal')
  if (!journalElement) {
    return
  }

  // Importer html2canvas et jsPDF dynamiquement
  import('html2canvas').then(html2canvas => {
    import('jspdf').then(jsPDF => {
      // Capturer l'élément journal
      html2canvas.default(journalElement, {
        scale: 2, // Haute qualité
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: journalElement.scrollWidth,
        height: journalElement.scrollHeight
      }).then(canvas => {
        // Créer le PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF.default({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        // Calculer les dimensions pour s'adapter à la page
        const imgWidth = 210 // Largeur A4 en mm
        const pageHeight = 295 // Hauteur A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight

        let position = 0

        // Ajouter la première page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Ajouter des pages supplémentaires si nécessaire
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        // Télécharger le PDF
        pdf.save(`journal-dresseur-${formatDate(new Date()).replace(/\s+/g, '-')}.pdf`)
      }).catch(error => {
throw error
        // Fallback vers l'export HTML
        exportJournalAsHTML()
      })
    })
  })
}

function exportJournalAsImage() {
  // Capturer le journal en image avec html2canvas
  const journalElement = document.querySelector('.trainer-journal')
  if (!journalElement) {
    return
  }

  // Importer html2canvas dynamiquement
  import('html2canvas').then(html2canvas => {
    // Capturer l'élément journal
    html2canvas.default(journalElement, {
      scale: 2, // Haute qualité
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#000000',
      width: journalElement.scrollWidth,
      height: journalElement.scrollHeight
    }).then(canvas => {
      // Créer le lien de téléchargement
      const link = document.createElement('a')
      link.download = `journal-dresseur-${formatDate(new Date()).replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }).catch(error => {
      // Fallback vers l'export HTML
      exportJournalAsHTML()
    })
  })
}

function generateJournalContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Journal de Dresseur - ${formatDate(new Date())}</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background: #000000;
          color: white;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
        }
        .journal-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px;
          background: rgba(33, 33, 33, 0.95);
          border-radius: 20px;
          border: 2px solid #FF3D28;
        }
        .journal-title {
          font-size: 2rem;
          margin: 20px 0 10px 0;
          color: white;
        }
        .journal-section {
          margin-bottom: 30px;
          background: rgba(33, 33, 33, 0.8);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .section-title {
          font-size: 1.3rem;
          margin-bottom: 20px;
          color: #FF3D28;
          border-bottom: 2px solid #FF3D28;
          padding-bottom: 10px;
        }
        .step-item {
          margin-bottom: 15px;
          padding: 15px;
          background: rgba(20, 20, 20, 0.9);
          border-radius: 10px;
        }
        .badge-item {
          display: inline-block;
          margin: 10px;
          padding: 10px;
          background: rgba(20, 20, 20, 0.9);
          border-radius: 10px;
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .stat-card {
          background: rgba(33, 33, 33, 0.8);
          padding: 20px;
          text-align: center;
          border-radius: 15px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: white;
        }
        .footer-message {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: rgba(20, 20, 20, 0.9);
          border-radius: 15px;
        }
      </style>
    </head>
    <body>
      <div class="journal-header">
        <h1 class="journal-title">📖 Journal de Dresseur</h1>
        <p>Nos aventures à travers Lyon</p>
        <p><strong>Date d'export :</strong> ${formatDate(new Date())}</p>
      </div>

      <div class="journal-section">
        <h2 class="section-title">🏆 Étapes Maîtrisées (${completedSteps.value.length})</h2>
        ${completedSteps.value.map(step => `
          <div class="step-item">
            <h3>${step.title} (Étape ${step.id})</h3>
            <p>${step.success}</p>
            <small>Type: ${getStepTypeLabel(step.type)} | Complétée le ${formatDate((step as any).completedAt)}</small>
          </div>
        `).join('')}
      </div>

      <div class="journal-section">
        <h2 class="section-title">🏅 Badges Collectionnés (${earnedBadges.value.length})</h2>
        ${earnedBadges.value.map(badge => `
          <div class="badge-item">
            <div>${badge.icon}</div>
            <div><strong>${badge.name}</strong></div>
            <div>${badge.description}</div>
            <div><small>Rareté: ${badge.rarity}</small></div>
          </div>
        `).join('')}
      </div>

      <div class="journal-section">
        <h2 class="section-title">🎯 Défis Bonus Réussis (${completedBonuses.value.length})</h2>
        ${completedBonuses.value.map(bonus => `
          <div class="step-item">
            <h3>${bonus.title}</h3>
            <p>${bonus.success}</p>
            <small>Type: ${getBonusTypeLabel((bonus as any).bonusType)}</small>
          </div>
        `).join('')}
      </div>

      <div class="journal-section">
        <h2 class="section-title">📊 Statistiques d'Aventure</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${completedSteps.value.length}</div>
            <div>Étapes complétées</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${earnedBadges.value.length}</div>
            <div>Badges obtenus</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${completedBonuses.value.length}</div>
            <div>Bonus réussis</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.round((completedSteps.value.length / totalSteps.value) * 100)}%</div>
            <div>Aventure accomplie</div>
          </div>
        </div>
      </div>

      <div class="footer-message">
        <p>Cette aventure a été créée avec ❤️ pour toi</p>
        <p><strong>Ton éternel compagnon d'aventure</strong></p>
      </div>
    </body>
    </html>
  `
}
</script>

<style scoped>
.trainer-journal {
  min-height: 100vh;
  background: var(--pokemon-black);
  color: var(--pokemon-white);
  font-family: var(--font-family-main);
  position: relative;
  overflow-x: hidden;
}

.trainer-journal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(50, 50, 50, 0.3) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.journal-header {
  padding: 40px 20px;
  text-align: center;
  position: relative;
}

.journal-cover {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(33, 33, 33, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(15px);
}

.journal-cover::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 61, 40, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.journal-title {
  font-size: 1.8rem;
  margin: 20px 0 10px 0;
  color: var(--pokemon-white);
  font-weight: 700;
  letter-spacing: 1px;
}

.journal-subtitle {
  font-size: 1rem;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.journal-date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.journal-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.journal-section {
  margin-bottom: 50px;
  background: rgba(33, 33, 33, 0.8);
  padding: 30px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 30px;
  text-align: center;
  color: var(--pokemon-red);
  border-bottom: 2px solid var(--pokemon-red);
  padding-bottom: 10px;
  font-weight: 600;
}

/* Grille des étapes */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.step-card {
  background: linear-gradient(145deg, rgba(33, 33, 33, 0.9), rgba(20, 20, 20, 0.9));
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: var(--pokemon-red);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.step-title {
  font-size: 1.1rem;
  margin: 0;
  color: var(--pokemon-white);
  font-weight: 600;
}

.step-badge {
  background: var(--pokemon-red);
  color: var(--pokemon-white);
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
}

.step-content {
  margin-bottom: 15px;
}

.step-description {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.9);
}

.step-photo {
  border-radius: 10px;
  overflow: hidden;
}

.step-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
}

/* Grille des badges */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.badge-card {
  background: linear-gradient(145deg, rgba(139, 69, 19, 0.8), rgba(160, 82, 45, 0.8));
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 2px solid var(--pokemon-gold);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.badge-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
  border-color: var(--pokemon-gold);
}

.badge-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.badge-name {
  font-size: 1.2rem;
  margin: 15px 0 10px 0;
  color: var(--pokemon-gold);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.badge-description {
  font-size: 0.9rem;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.badge-rarity {
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 10px;
}

.badge-rarity.Commun {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: #D1D5DB;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.4);
}

.badge-rarity.Rare {
  background: linear-gradient(135deg, var(--pokemon-red), #cc2512);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 61, 40, 0.4);
}

.badge-rarity.Légendaire {
  background: linear-gradient(135deg, var(--pokemon-gold), #ffd700);
  color: #8b5a00;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

/* Grille des bonus */
.bonus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.bonus-card {
  background: linear-gradient(145deg, rgba(33, 33, 33, 0.9), rgba(20, 20, 20, 0.9));
  border-radius: 15px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.bonus-header {
  margin-bottom: 15px;
}

.bonus-title {
  font-size: 1rem;
  margin: 0 0 5px 0;
  color: var(--pokemon-white);
  font-weight: 600;
}

.bonus-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.bonus-content {
  margin-bottom: 15px;
}

.bonus-description {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

/* Grille des messages */
.messages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.message-card {
  background: linear-gradient(145deg, rgba(190, 24, 93, 0.8), rgba(219, 39, 119, 0.8));
  border-radius: 15px;
  padding: 20px;
  border: 2px solid var(--pokemon-red);
}

.message-content {
  margin-bottom: 15px;
}

.message-text {
  font-size: 0.9rem;
  line-height: 1.5;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
}

.message-text::before {
  content: '"';
}

.message-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(33, 33, 33, 0.8), rgba(20, 20, 20, 0.8));
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--pokemon-white);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Footer du journal */
.journal-footer {
  padding: 40px 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border-top: 2px solid var(--pokemon-red);
  border-radius: 15px;
  margin: 20px;
}

.footer-message {
  margin-bottom: 30px;
}

.footer-message p {
  margin: 10px 0;
  font-size: 1.1rem;
  color: var(--pokemon-white);
}

.footer-signature {
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}

.export-button {
  background: linear-gradient(135deg, var(--pokemon-red), #ff6b6b);
  color: var(--pokemon-white);
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 61, 40, 0.4);
}

.footer-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.debug-button {
  background: linear-gradient(135deg, #6b73ff, #9c88ff);
  color: var(--pokemon-white);
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 115, 255, 0.4);
}

.debug-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 115, 255, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .journal-cover {
    margin: 0 10px;
    padding: 30px 20px;
  }

  .journal-title {
    font-size: 1.4rem;
  }

  .steps-grid,
  .badges-grid,
  .bonus-grid,
  .messages-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
