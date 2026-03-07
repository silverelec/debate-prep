import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Debate Prep</h1>
        <p className="text-lg text-gray-500">
          Practice debate with AI — sharpen your arguments, learn from a judge.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/setup?mode=user_vs_ai"
          className="group bg-white rounded-2xl border border-blue-200 hover:border-blue-400 p-8 transition-all hover:shadow-lg"
        >
          <div className="text-4xl mb-4">🎤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User vs AI
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Choose a topic and position, then debate round-by-round against an
            AI opponent. A judge AI evaluates each round in real time.
          </p>
          <div className="mt-4 text-sm text-blue-600 font-medium group-hover:underline">
            Start debating →
          </div>
        </Link>

        <Link
          href="/setup?mode=ai_vs_ai"
          className="group bg-white rounded-2xl border border-purple-200 hover:border-purple-400 p-8 transition-all hover:shadow-lg"
        >
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI vs AI
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter a topic and watch two AI agents debate For and Against each
            other. A judge AI scores every round in real time.
          </p>
          <div className="mt-4 text-sm text-purple-600 font-medium group-hover:underline">
            Watch a debate →
          </div>
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/history"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          View past sessions →
        </Link>
      </div>
    </div>
  );
}
