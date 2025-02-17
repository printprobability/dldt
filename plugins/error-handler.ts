export default defineNuxtPlugin((nuxtApp) => {
  // Get runtime config
  const runtimeConfig = useRuntimeConfig()

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {

    if (runtimeConfig.public.APP_ENV !== 'production') {
      // handle error, e.g. report to a service
      console.error(error)
      console.log("======================================");
      console.log("errorHandler");
      console.log(`error: ${JSON.stringify(error)}`);
      console.log(`info: ${info}`);
    }
  }

  // Also possible
  nuxtApp.hook('vue:error', (error, instance, info) => {

    if (runtimeConfig.public.APP_ENV !== 'production') {
      // handle error, e.g. report to a service
      console.error(error)
      console.log("======================================");
      console.log("vue:error");
      console.log(`error: ${JSON.stringify(error)}`);
      console.log(`info: ${info}`);
    }
  })
})
