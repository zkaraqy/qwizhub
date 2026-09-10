<template>
  <div :class="rankClasses" class="flip7-rank-badge">
    <div class="flip7-rank-avatar-wrapper">
      <img 
        v-if="avatar" 
        :src="avatar" 
        :alt="playerName"
        :class="avatarClasses"
        class="flip7-rank-avatar"
      />
      <div 
        v-else
        :class="avatarClasses"
        class="flip7-rank-avatar flip7-rank-avatar-default"
      >
        {{ playerInitial }}
      </div>
      <div v-if="rank <= 3" class="flip7-rank-medal">
        {{ medalEmoji }}
      </div>
    </div>
    
    <div class="flip7-rank-info">
      <div class="flip7-rank-position">
        {{ positionText }}
      </div>
      <div class="flip7-rank-name">
        {{ playerName }}
      </div>
      <div class="flip7-rank-score" :class="scoreColorClass">
        {{ score }} pts
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rank: number
  playerName: string
  score: number
  avatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  avatar: ''
})

const rankClasses = computed(() => {
  const classes = []
  
  if (props.rank === 1) {
    classes.push('rank-first')
  } else if (props.rank === 2) {
    classes.push('rank-second')
  } else if (props.rank === 3) {
    classes.push('rank-third')
  } else {
    classes.push('rank-default')
  }
  
  return classes.join(' ')
})

const avatarClasses = computed(() => {
  const classes = []
  
  if (props.rank === 1) {
    classes.push('avatar-size-xl')
  } else if (props.rank === 2) {
    classes.push('avatar-size-lg')
  } else if (props.rank === 3) {
    classes.push('avatar-size-md')
  } else {
    classes.push('avatar-size-sm')
  }
  
  return classes.join(' ')
})

const scoreColorClass = computed(() => {
  if (props.rank === 1) return 'score-gold'
  if (props.rank === 2) return 'score-silver'
  if (props.rank === 3) return 'score-coral'
  return 'score-default'
})

const medalEmoji = computed(() => {
  if (props.rank === 1) return '👑'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return ''
})

const positionText = computed(() => {
  const suffix = props.rank === 1 ? 'st' : props.rank === 2 ? 'nd' : props.rank === 3 ? 'rd' : 'th'
  return `${props.rank}${suffix} Place`
})

const playerInitial = computed(() => {
  return props.playerName.charAt(0).toUpperCase()
})
</script>

<style scoped>
.flip7-rank-badge {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--flip7-surface-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-sm);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.flip7-rank-badge:hover {
  transform: translateX(4px);
}

.flip7-rank-badge.rank-first {
  border-left: 4px solid var(--flip7-accent-gold);
  background: linear-gradient(to right, rgba(255, 210, 63, 0.1), var(--flip7-surface-card));
  box-shadow: var(--shadow-accent-glow);
}

.flip7-rank-badge.rank-second {
  border-left: 4px solid #C0C0C0;
  background: linear-gradient(to right, rgba(192, 192, 192, 0.1), var(--flip7-surface-card));
}

.flip7-rank-badge.rank-third {
  border-left: 4px solid var(--flip7-coral);
  background: linear-gradient(to right, rgba(239, 108, 74, 0.1), var(--flip7-surface-card));
}

.flip7-rank-badge.rank-default {
  border-left: 3px solid var(--flip7-primary-teal);
}

.flip7-rank-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.flip7-rank-avatar {
  border-radius: 50%;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fw-extra-bold);
  color: white;
}

.avatar-size-xl {
  width: 64px;
  height: 64px;
  font-size: var(--text-h1);
}

.avatar-size-lg {
  width: 56px;
  height: 56px;
  font-size: var(--text-h2);
}

.avatar-size-md {
  width: 48px;
  height: 48px;
  font-size: var(--text-h3);
}

.avatar-size-sm {
  width: 40px;
  height: 40px;
  font-size: var(--text-body);
}

.rank-first .flip7-rank-avatar-default {
  background: linear-gradient(135deg, var(--flip7-accent-gold), var(--flip7-accent-dark));
}

.rank-second .flip7-rank-avatar-default {
  background: linear-gradient(135deg, #E8E8E8, #A8A8A8);
}

.rank-third .flip7-rank-avatar-default {
  background: linear-gradient(135deg, var(--flip7-coral-light), var(--flip7-coral-dark));
}

.rank-default .flip7-rank-avatar-default {
  background: linear-gradient(135deg, var(--flip7-primary-light), var(--flip7-primary-dark));
}

.flip7-rank-medal {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 20px;
  line-height: 1;
  background: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.rank-first .flip7-rank-medal {
  animation: crown-bounce 1.5s ease-in-out infinite;
}

.flip7-rank-info {
  flex: 1;
  min-width: 0;
}

.flip7-rank-position {
  font-size: var(--text-xs);
  font-weight: var(--fw-bold);
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.flip7-rank-name {
  font-size: var(--text-body);
  font-weight: var(--fw-bold);
  color: var(--flip7-primary-dark);
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flip7-rank-score {
  font-size: var(--text-h3);
  font-weight: var(--fw-extra-bold);
}

.score-gold {
  color: var(--flip7-accent-gold);
  font-size: var(--text-h2);
  text-shadow: 0 1px 3px rgba(255, 210, 63, 0.3);
}

.score-silver {
  color: #A8A8A8;
  font-size: var(--text-h3);
}

.score-coral {
  color: var(--flip7-coral);
}

.score-default {
  color: var(--flip7-primary-teal);
}

.rank-first {
  animation: glow-pulse 2s ease-in-out infinite;
}
</style>
