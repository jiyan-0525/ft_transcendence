import { Spinner } from '@/components/ui'

/** Shown while the guards wait for the first session check. */
export default function SessionChecking() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" label="Checking your session" />
    </div>
  )
}
