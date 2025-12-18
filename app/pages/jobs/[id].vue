<template>
  <div>
    <Loader v-if="loading" />
    <div v-else-if="!job" class="box">
      <div class="notification is-danger">
        <p>Job not found</p>
      </div>
    </div>

    <div v-else>
      <Job
        :job="job"
        :modal="modal"
        :endpoints="endpoints"
        :nosPrice="nosPrice"
        :isJobPoster="isJobPoster"
        :jobInfo="jobInfo"
        :deploymentId="deploymentId"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
// Views
import Job from "~/components/Job/Job.vue";
// Composables
import { useJobPage } from "~/composables/jobs/useJobPage";
const { params, query } = useRoute();

const jobId = ref<string>(params.id as string);
const deploymentId = ref<string | null>(query.deployment as string || null);

const { job, modal, endpoints, nosPrice, isJobPoster, loading, jobInfo } = useJobPage(
  jobId.value
);
</script>

<style lang="scss" scoped>
.loading-message,
.not-found-message {
  color: $text;
  padding: 1rem;
  text-align: center;
}

html.dark-mode {
  .loading-message,
  .not-found-message {
    color: $white;
  }
}
</style>
