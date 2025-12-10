<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-md">
      <q-avatar size="200px" class="q-mb-md">
        <img src="~assets/quasar-logo-vertical.svg" alt="Quasar logo">
      </q-avatar>

      <div class="text-h2 q-mb-md">Reddit Post Machine</div>
      <div class="text-subtitle1 q-mb-xl">
        Powered by Quasar Framework
      </div>

      <div class="q-gutter-md">
        <q-btn
          push
          color="primary"
          label="Start Posting"
          icon="send"
          @click="startPosting"
        />
        
        <q-btn
          push
          color="secondary"
          label="View Settings"
          icon="settings"
          to="/options"
        />
      </div>

      <div class="q-mt-lg">
        <q-card flat bordered class="q-ma-md">
          <q-card-section>
            <div class="text-h6">Quick Stats</div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col text-center">
                <div class="text-h3 text-positive">{{ stats.postsCreated }}</div>
                <div class="text-caption">Posts Created</div>
              </div>
              <div class="col text-center">
                <div class="text-h3 text-info">{{ stats.successRate }}%</div>
                <div class="text-caption">Success Rate</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const stats = ref({
      postsCreated: 0,
      successRate: 0
    })

    const startPosting = () => {
      // TODO: Implement posting logic
      console.log('Starting posting process...')
    }

    return {
      stats,
      startPosting
    }
  }
})
</script>