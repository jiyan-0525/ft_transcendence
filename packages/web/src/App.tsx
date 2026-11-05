const productName = 'Community'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4">
          <span className="text-lg font-semibold tracking-tight text-indigo-600">
            {productName}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
            Frontend foundation
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            One account, one community.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            The React + TypeScript application shell is bootstrapping. Routes,
            design tokens and shared components land next.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-slate-500">
          ft_transcendence — Week 1 foundation
        </div>
      </footer>
    </div>
  )
}
