<script setup lang="ts">
const productName = 'Community'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-16 w-full max-w-5xl items-center px-4">
        <span class="text-lg font-semibold tracking-tight text-indigo-600">
          {{ productName }}
        </span>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-16">
      <section class="max-w-2xl">
        <p class="text-sm font-medium uppercase tracking-wider text-indigo-600">
          Frontend foundation
        </p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          One account, one community.
        </h1>
        <p class="mt-4 text-lg text-slate-600">
          The Vue 3 application shell is bootstrapping. Routes, design tokens and
          shared components land next.
        </p>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white">
      <div class="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-slate-500">
        ft_transcendence — Week 1 foundation
      </div>
    </footer>
  </div>
</template>
