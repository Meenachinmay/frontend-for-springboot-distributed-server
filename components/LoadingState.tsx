// src/components/LoadingState.tsx
export default function LoadingState() {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="p-4 mb-6 rounded-md bg-gray-100">
                Loading...
            </div>
            <div className="border rounded-lg h-[400px] bg-white"></div>
        </div>
    );
}