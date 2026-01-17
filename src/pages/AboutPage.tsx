export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-2xl font-medium text-white mb-10 tracking-tight">About LoopBack</h1>

                <div className="space-y-5">
                    <section className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <h2 className="text-base font-medium text-white mb-4">Purpose</h2>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            LoopBack is a simple tool designed to help you process difficult situations, identify what matters most to you, and take meaningful steps forward.
                        </p>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            When you're stuck in a loop of worry, indecision, or emotional overwhelm, LoopBack guides you through:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-2 ml-4 leading-relaxed">
                            <li>Clearly articulating the situation you're facing</li>
                            <li>Naming and acknowledging your emotions</li>
                            <li>Identifying what truly matters to you in this context</li>
                            <li>Generating concrete, actionable steps - from the smallest gesture to bolder moves</li>
                        </ul>
                        <p className="text-sm text-gray-400 leading-relaxed mt-5">
                            By breaking down complex feelings into structured thoughts and actionable steps, LoopBack helps you move from feeling stuck to taking meaningful action.
                        </p>
                    </section>

                    <section className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <h2 className="text-base font-medium text-white mb-4">Privacy</h2>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            <strong className="text-gray-300">Your data stays local.</strong> LoopBack stores all your loops exclusively in your browser's localStorage. This means:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-2 ml-4 leading-relaxed">
                            <li>Your data never leaves your device</li>
                            <li>No accounts, no servers, no tracking</li>
                            <li>No one else can access your loops</li>
                            <li>Your information remains completely private</li>
                        </ul>
                        <p className="text-sm text-gray-400 leading-relaxed mt-5">
                            Because your data is stored locally, if you clear your browser data or use LoopBack on a different device, you'll need to export your loops first if you want to preserve them. Use the "Export JSON" feature on any loop to save it as a file.
                        </p>
                    </section>

                    <section className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <h2 className="text-base font-medium text-white mb-4">How It Works</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            LoopBack uses a deterministic algorithm to generate steps based on your inputs. This means the same situation, emotion, and values will always produce the same suggested steps. No external APIs are used, and all processing happens entirely in your browser.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

