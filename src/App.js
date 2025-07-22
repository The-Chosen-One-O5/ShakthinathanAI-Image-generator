import React, { useState, useRef, useCallback } from 'react';

// --- Configuration ---
const API_URL = "/.netlify/functions/generate-image";
const REQUESTS_PER_MINUTE_LIMIT = 10;

// --- Helper Components ---
const IconWand = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-custom-purple"><path d="m13 2-3 14 3 6 3-6-3-14Z"></path><path d="M2 13h20"></path></svg> );
const IconGenerate = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> );
const IconPlaceholder = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-custom-purple mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> );
const Loader = () => ( <div className="text-center"><div className="loader mx-auto"></div><p className="text-center mt-4 text-white">Generating your masterpiece...</p></div> );

// --- Main App Component ---
export default function App() {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('img3'); // Re-added state for the model
    const [aspectRatio, setAspectRatio] = useState('1024x1024');
    const [count, setCount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const requestTimestamps = useRef([]);

    const checkRateLimit = useCallback(() => {
        const now = Date.now();
        requestTimestamps.current = requestTimestamps.current.filter(timestamp => now - timestamp < 60000);
        if (requestTimestamps.current.length >= REQUESTS_PER_MINUTE_LIMIT) {
            return false;
        }
        return true;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError({ message: "Please enter a prompt." });
            return;
        }
        if (!checkRateLimit()) {
            setError({ message: `Rate limit exceeded. Please wait a moment.` });
            return;
        }
        setIsLoading(true);
        setError(null);
        setImages([]);
        requestTimestamps.current.push(Date.now());

        const payload = {
            model, // Now uses the selected model from the state
            prompt,
            num_images: parseInt(count, 10),
            size: aspectRatio
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "An unknown error occurred.");
            }

            if (data.images && data.images.length > 0) {
                setImages(data.images);
            } else {
                throw new Error("API returned no images. Please try a different prompt.");
            }
        } catch (err) {
            console.error('Error:', err);
            setError({ message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) return <Loader />;
        if (error) {
            return (
                <div className="w-full text-left text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">
                    <p className="font-semibold text-red-300">An Error Occurred</p>
                    <p className="text-sm mt-1">{error.message}</p>
                </div>
            );
        }
        if (images.length > 0) {
            return (
                <div className="w-full h-full grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))' }}>
                    {images.map((url, index) => (
                        <div key={index} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                            <img src={url} alt={prompt} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center">
                <IconPlaceholder />
                <h3 className="text-xl font-semibold text-white">Ready to Create</h3>
                <p className="text-gray-400 mt-2">Enter a detailed prompt and watch as our AI transforms your<br /> words into stunning visual art.</p>
            </div>
        );
    };

    return (
        <div className="bg-custom-dark text-gray-300 min-h-screen">
            <style>{`
                body { font-family: 'Inter', sans-serif; background-color: #111015; }
                .bg-custom-dark { background-color: #111015; }
                .bg-custom-panel { background-color: #1C1B22; }
                .border-custom-soft { border-color: #333238; }
                .text-custom-purple { color: #A050FF; }
                .title-gradient { background: linear-gradient(90deg, #C38FFF, #A050FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-fill-color: transparent; }
                .focus\\:ring-custom-purple:focus { --tw-ring-color: #A050FF; }
                .loader { width: 48px; height: 48px; border: 5px solid #FFF; border-bottom-color: #A050FF; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
                @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold title-gradient">SHAKTHINATHAN AI</h1>
                    <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                        Transform your imagination into stunning visuals with our advanced AI image generation platform
                    </p>
                </header>
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-custom-panel p-6 rounded-xl border border-custom-soft">
                        <h2 className="text-xl font-semibold text-white flex items-center mb-6"><IconWand />Generation Settings</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                                <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows="4" className="w-full bg-[#2a2931] border border-custom-soft rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-custom-purple transition" placeholder="A majestic dragon soaring through cloudy skies..."></textarea>
                            </div>

                            {/* This is the new AI Model dropdown */}
                            <div>
                                <label htmlFor="ai-model" className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
                                <select id="ai-model" value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-[#2a2931] border border-custom-soft rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-custom-purple transition">
                                    <option value="img3">IMG3 (⚡️ Advanced)</option>
                                    {/* You can add other models here if the API supports them */}
                                    {/* <option value="some-other-model">Other Model</option> */}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                    <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-[#2a2931] border border-custom-soft rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-custom-purple transition">
                                        <option value="1024x1024">Square</option>
                                        <option value="1792x1024">Landscape</option>
                                        <option value="1024x1792">Portrait</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="count" className="block text-sm font-medium text-gray-300 mb-2">Count</label>
                                    <select id="count" value={count} onChange={(e) => setCount(e.target.value)} className="w-full bg-[#2a2931] border border-custom-soft rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-custom-purple transition">
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-[#673AB7] hover:bg-[#5e34a5] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                <IconGenerate />
                                {isLoading ? 'Generating...' : 'Generate Images'}
                            </button>
                        </form>
                    </div>
                    <div className="lg:col-span-2 bg-custom-panel min-h-[400px] lg:min-h-0 p-6 rounded-xl border border-custom-soft flex flex-col items-center justify-center">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
