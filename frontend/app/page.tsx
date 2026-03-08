import Link from "next/link";

export default function HomePage() {
  return (
    <div className="animate-page-enter">
      {/* Hero */}
      <div className="relative text-center py-16 px-4 mb-12 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 -z-10" />
        <div
          className="absolute inset-0 opacity-[0.035] -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-500 uppercase mb-3">
          AI-Powered Practice
        </p>
        <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sharpen Your
          </span>
          <br />
          <span className="text-gray-900">Arguments</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
          Practice debate with AI — get scored by a judge in real time.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <Link
            href="/setup?mode=user_vs_ai"
            className="group relative bg-white rounded-2xl border border-gray-200 hover:border-blue-300 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl" />
            <div className="text-4xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              User vs AI
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Choose a topic and position, then debate round-by-round against an
              AI opponent. A judge AI evaluates each round in real time.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm text-blue-600 font-medium">
              Start debating
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/setup?mode=ai_vs_ai"
            className="group relative bg-white rounded-2xl border border-gray-200 hover:border-purple-300 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-purple-600 rounded-t-2xl" />
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI vs AI
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enter a topic and watch two AI agents debate For and Against each
              other. A judge AI scores every round in real time.
            </p>
            <div className="mt-6 flex items-center gap-1 text-sm text-purple-600 font-medium">
              Watch a debate
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.15em] text-gray-400 uppercase mb-8">
            How it works
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                step: "01",
                label: "Pick a topic",
                desc: "Choose from suggestions or enter your own debate topic",
              },
              {
                step: "02",
                label: "Debate rounds",
                desc: "Arguments stream live as each side responds in turn",
              },
              {
                step: "03",
                label: "Get scored",
                desc: "A judge AI evaluates each round and declares a winner",
              },
            ].map(({ step, label, desc }) => (
              <div key={step} className="text-center p-4">
                <div className="text-xs font-mono font-bold text-indigo-400 mb-2">
                  {step}
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {label}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
