<script setup lang="ts">
import { ref } from 'vue'

// Moments clés représentant les 10 années d'amour
// Ces données devraient idéalement être personnalisées avec vos vrais souvenirs
const loveStory = ref([
  {
    year: 1,
    title: "La Rencontre",
    description: "Comme un dresseur novice découvrant son premier Pokémon, nous nous sommes rencontrés et avons commencé cette aventure ensemble.",
    pokemon: "Pichu",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/b/b9/172Pichu.png/250px-172Pichu.png",
    memory: "Notre premier rendez-vous à la gare de Lunel"
  },
  {
    year: 2,
    title: "Premiers Pas Ensemble",
    description: "Notre lien a commencé à se renforcer, comme un Pichu évoluant en Pikachu grâce à l'amitié.",
    pokemon: "Pikachu",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/0/0d/025Pikachu.png/250px-025Pikachu.png",
    memory: "Notre premier voyage ensemble à..."
  },
  {
    year: 3,
    title: "S'installer Ensemble",
    description: "Notre relation a évolué vers quelque chose de plus stable et solide.",
    pokemon: "Raichu",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/8/88/026Raichu.png/250px-026Raichu.png",
    memory: "Notre premier appartement à..."
  },
  {
    year: 4,
    title: "Traverser des Épreuves",
    description: "Comme des dresseurs traversant la Route Victoire, nous avons affronté des défis ensemble.",
    pokemon: "Togetic",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/1/11/176Togetic.png/250px-176Togetic.png",
    memory: "Cette année où nous avons surmonté..."
  },
  {
    year: 5,
    title: "La Mi-parcours",
    description: "À mi-chemin de notre décennie d'amour, notre bonheur rayonnait comme un Togekiss dans le ciel.",
    pokemon: "Togekiss",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/8/87/468Togekiss.png/250px-468Togekiss.png",
    memory: "Notre voyage mémorable à..."
  },
  {
    year: 6,
    title: "Grandir Ensemble",
    description: "Notre amour continue de grandir et d'évoluer, comme un Pokémon rare qui se développe.",
    pokemon: "Gardevoir",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/9/99/282Gardevoir.png/250px-282Gardevoir.png",
    memory: "Cette année nous avons appris à..."
  },
  {
    year: 7,
    title: "Notre Complémentarité",
    description: "Comme Latios et Latias, nous avons découvert à quel point nous sommes complémentaires.",
    pokemon: "Latias",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/2/24/380Latias.png/250px-380Latias.png",
    memory: "Ce moment où nous avons réalisé que..."
  },
  {
    year: 8,
    title: "Des Rêves Partagés",
    description: "Nos rêves s'entremêlent comme les étoiles de Jirachi.",
    pokemon: "Jirachi",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/8/85/385Jirachi.png/250px-385Jirachi.png",
    memory: "Notre projet commun de..."
  },
  {
    year: 9,
    title: "Un Amour Légendaire",
    description: "Notre histoire d'amour est devenue aussi légendaire qu'un Mew rare et précieux.",
    pokemon: "Mew",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/b/b1/151Mew.png/250px-151Mew.png",
    memory: "Cette année magique où nous avons..."
  },
  {
    year: 10,
    title: "10 Ans d'Évolution",
    description: "Dix ans plus tard, notre amour est comme un Pokémon légendaire : rare, puissant et éternel.",
    pokemon: "Mewtwo",
    pokemonUrl: "https://archives.bulbagarden.net/media/upload/thumb/7/78/150Mewtwo.png/250px-150Mewtwo.png",
    memory: "Aujourd'hui, nous célébrons notre décennie d'amour avec cette chasse au trésor spéciale."
  }
])

const activeYear = ref(1)

// Fonction pour changer l'année active
const setActiveYear = (year: any) => {
  activeYear.value = year
}
</script>

<template>
  <div class="our-story-container">
    <!-- En-tête de la page -->
    <div class="our-story-header">
      <h1 class="our-story-title">Notre Évolution d'Amour - 10 Ans</h1>
      <p class="our-story-subtitle">
        Comme les Pokémon évoluent, notre amour a grandi et s'est transformé au fil des années.
      </p>
    </div>

    <!-- Timeline d'évolution -->
    <div class="evolution-timeline">
      <div class="evolution-years">
        <div 
          v-for="year in 10" 
          :key="year"
          class="evolution-year"
          :class="{'active-year': activeYear === year}"
          @click="setActiveYear(year)"
        >
          <span class="year-number">{{ year }}</span>
          <div class="evolution-pokeball">
            <img 
              :src="loveStory[year-1].pokemonUrl" 
              :alt="loveStory[year-1].pokemon" 
              class="mini-pokemon"
            />
          </div>
        </div>
      </div>
      
      <div class="evolution-line"></div>
    </div>
    
    <!-- Carte d'évolution active -->
    <v-card class="evolution-card">
      <div class="evolution-card-inner">
        <div class="evolution-image">
          <img 
            :src="loveStory[activeYear-1].pokemonUrl" 
            :alt="loveStory[activeYear-1].pokemon" 
            class="pokemon-image"
          />
        </div>
        
        <div class="evolution-details">
          <div class="evolution-year-badge">Année {{ activeYear }}</div>
          <h2 class="evolution-title">{{ loveStory[activeYear-1].title }}</h2>
          
          <div class="pokemon-type">
            <div class="pokemon-name">{{ loveStory[activeYear-1].pokemon }}</div>
            <div class="pokemon-heart">❤️</div>
          </div>
          
          <p class="evolution-description">
            {{ loveStory[activeYear-1].description }}
          </p>
          
          <div class="memory-card">
            <div class="memory-header">Souvenir Précieux</div>
            <p class="memory-text">
              "{{ loveStory[activeYear-1].memory }}"
            </p>
          </div>
        </div>
      </div>
    </v-card>
    
    <!-- Boutons de navigation entre les années -->
    <div class="navigation-buttons">
      <v-btn
        color="#FF69B4"
        :disabled="activeYear <= 1"
        @click="activeYear--"
        class="nav-button"
        rounded="pill"
      >
        <span class="nav-text">Année Précédente</span>
      </v-btn>
      
      <v-btn
        color="#FF69B4"
        :disabled="activeYear >= 10"
        @click="activeYear++"
        class="nav-button"
        rounded="pill"
      >
        <span class="nav-text">Année Suivante</span>
      </v-btn>
    </div>
    
    <!-- Message final -->
    <div class="love-message-container">
      <div class="love-message">
        <div class="message-header">
          <img src="https://archives.bulbagarden.net/media/upload/d/d0/Love_Ball_VIII.png" width="40" alt="Love Ball" class="love-ball">
          <h2 class="message-title">Notre Aventure Continue</h2>
          <img src="https://archives.bulbagarden.net/media/upload/d/d0/Love_Ball_VIII.png" width="40" alt="Love Ball" class="love-ball">
        </div>
        <p class="message-content">
          Comme dans le monde des Pokémon, notre histoire ne fait que commencer.
          Chaque jour ensemble est une nouvelle étape de notre évolution.
          Merci pour ces 10 merveilleuses années à mes côtés.
          Je t'aime plus que tous les Pokémon du monde réunis !
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.our-story-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.our-story-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.our-story-title {
  font-size: 2.5rem;
  color: #FF1493;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  display: inline-block;
}

.our-story-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #FF69B4, transparent);
}

.our-story-subtitle {
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

/* Timeline d'évolution */
.evolution-timeline {
  position: relative;
  margin: 60px 0;
}

.evolution-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF1493, #FF69B4);
  z-index: 1;
  transform: translateY(-50%);
}

.evolution-years {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.evolution-year {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.year-number {
  background: #FF69B4;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.active-year .year-number {
  background: #FF1493;
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.6);
}

.evolution-pokeball {
  background: white;
  border: 2px solid #FF69B4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.active-year .evolution-pokeball {
  transform: scale(1.3);
  border-color: #FF1493;
  box-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
}

.mini-pokemon {
  max-width: 30px;
  max-height: 30px;
  transition: all 0.3s ease;
}

.active-year .mini-pokemon {
  transform: scale(1.2);
}

/* Carte d'évolution */
.evolution-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  background: white;
  border: 1px solid rgba(255, 105, 180, 0.3);
}

.evolution-card-inner {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
}

.evolution-image {
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: linear-gradient(135deg, #FFF0F5, #FFC0CB);
}

.pokemon-image {
  max-width: 180px;
  max-height: 180px;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
  animation: floating 3s ease-in-out infinite;
}

.evolution-details {
  flex: 1.5;
  min-width: 300px;
  padding: 30px;
  position: relative;
}

.evolution-year-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #FF1493;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.evolution-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 700;
}

.pokemon-type {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pokemon-name {
  background: #4FC3F7;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 10px;
}

.pokemon-heart {
  font-size: 1.2rem;
  animation: heart-beat 1.5s ease-in-out infinite;
}

.evolution-description {
  color: #555;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 25px;
}

.memory-card {
  background: rgba(255, 182, 193, 0.2);
  border-radius: 15px;
  padding: 20px;
  border-left: 4px solid #FF69B4;
}

.memory-header {
  color: #FF1493;
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.memory-text {
  color: #666;
  font-style: italic;
  line-height: 1.6;
}

/* Boutons de navigation */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
}

.nav-button {
  min-width: 180px;
}

.nav-text {
  color: white;
  font-weight: 500;
}

/* Message final */
.love-message-container {
  margin: 50px 0;
}

.love-message {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(255, 105, 180, 0.2);
  border: 2px solid rgba(255, 105, 180, 0.3);
  text-align: center;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.message-title {
  color: #FF1493;
  font-size: 1.8rem;
  font-weight: 700;
}

.love-ball {
  animation: floating 4s ease-in-out infinite;
}

.message-content {
  color: #555;
  font-size: 1.2rem;
  line-height: 1.8;
  max-width: 700px;
  margin: 0 auto;
}

/* Animation */
@keyframes floating {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* Responsive */
@media (max-width: 768px) {
  .our-story-title {
    font-size: 1.8rem;
  }
  
  .evolution-year {
    transform: scale(0.8);
  }
  
  .evolution-title {
    font-size: 1.5rem;
  }
  
  .message-title {
    font-size: 1.4rem;
  }
  
  .message-content {
    font-size: 1rem;
  }
}
</style>
