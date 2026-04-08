import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Student Internship",
    description: "Internship dashboard for students",
};

export default function InternshipPage() {
    return (
        <main className="p-6">
            <section className="mx-auto max-w-5xl space-y-4">
                <h1 className="text-2xl font-semibold">Internship Portal</h1>
                <p className="text-sm text-gray-600">
                    Manage internship applications, status, and documents here.
                </p>

                <div className="rounded-xl border p-4">
                    <h2 className="text-lg font-medium">Overview</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Boilerplate page. Replace this content with your actual UI.
                    </p>
                </div>
            </section>
        </main>
    );
}