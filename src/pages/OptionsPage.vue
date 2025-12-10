<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Extension Settings</div>
    
    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="general" label="General" />
        <q-tab name="reddit" label="Reddit" />
        <q-tab name="templates" label="Templates" />
        <q-tab name="advanced" label="Advanced" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general">
          <div class="text-h6 q-mb-md">General Settings</div>
          
          <q-toggle
            v-model="settings.enableNotifications"
            label="Enable notifications"
            color="primary"
          />
          
          <q-toggle
            v-model="settings.autoSave"
            label="Auto-save drafts"
            color="primary"
          />
          
          <q-select
            v-model="settings.theme"
            :options="themeOptions"
            label="Theme"
            class="q-mt-md"
          />
        </q-tab-panel>

        <q-tab-panel name="reddit">
          <div class="text-h6 q-mb-md">Reddit Integration</div>
          
          <q-input
            v-model="settings.reddit.username"
            label="Reddit Username"
            class="q-mb-md"
          />
          
          <q-input
            v-model="settings.reddit.defaultSubreddits"
            label="Default Subreddits (comma separated)"
            type="textarea"
            class="q-mb-md"
          />
          
          <q-toggle
            v-model="settings.reddit.enableAnalytics"
            label="Enable post analytics"
            color="primary"
          />
        </q-tab-panel>

        <q-tab-panel name="templates">
          <div class="text-h6 q-mb-md">Post Templates</div>
          
          <q-list bordered separator>
            <q-item
              v-for="template in templates"
              :key="template.id"
              clickable
              v-ripple
            >
              <q-item-section>
                <q-item-label>{{ template.name }}</q-item-label>
                <q-item-label caption>{{ template.description }}</q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn size="12px" flat dense round icon="edit" />
                  <q-btn size="12px" flat dense round icon="delete" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          
          <q-btn
            color="primary"
            icon="add"
            label="Add Template"
            class="q-mt-md"
            @click="addTemplate"
          />
        </q-tab-panel>

        <q-tab-panel name="advanced">
          <div class="text-h6 q-mb-md">Advanced Settings</div>
          
          <q-input
            v-model="settings.advanced.apiEndpoint"
            label="API Endpoint"
            class="q-mb-md"
          />
          
          <q-input
            v-model="settings.advanced.timeout"
            label="Request Timeout (ms)"
            type="number"
            class="q-mb-md"
          />
          
          <q-toggle
            v-model="settings.advanced.debugMode"
            label="Debug mode"
            color="primary"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <div class="q-mt-md text-right">
      <q-btn
        color="primary"
        label="Save Settings"
        @click="saveSettings"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'OptionsPage',
  setup() {
    const tab = ref('general')
    
    const settings = ref({
      enableNotifications: true,
      autoSave: true,
      theme: 'auto',
      reddit: {
        username: '',
        defaultSubreddits: '',
        enableAnalytics: true
      },
      advanced: {
        apiEndpoint: 'https://api.reddit.com',
        timeout: 30000,
        debugMode: false
      }
    })

    const themeOptions = ['auto', 'light', 'dark']

    const templates = ref([
      {
        id: 1,
        name: 'Product Launch',
        description: 'Template for product announcements'
      },
      {
        id: 2,
        name: 'Community Update',
        description: 'Regular community updates'
      }
    ])

    const addTemplate = () => {
      console.log('Adding new template...')
      // TODO: Implement template creation
    }

    const saveSettings = () => {
      console.log('Saving settings:', settings.value)
      // TODO: Implement settings save
    }

    return {
      tab,
      settings,
      themeOptions,
      templates,
      addTemplate,
      saveSettings
    }
  }
})
</script>