"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { companyApi } from "@/features/company/api";
import EmployerAccessDenied from "@/features/employer/components/EmployerAccessDenied";
import EmployerCompanyCard from "@/features/employer/components/EmployerCompanyCard";
import EmployerCompanyForm from "@/features/employer/components/EmployerCompanyForm";
import EmployerProfileHeader from "@/features/employer/components/EmployerProfileHeader";
import { getApiErrorMessage } from "@/shared/api/http";
import {
    Company,
    CreateCompanyRequest,
    isCompanyVerified,
} from "@/shared/types/employer";

export default function EmployerProfilePage() {
    const auth = useContext(AuthContext);
    const router = useRouter();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error" | "info";
        text: string;
    } | null>(null);

    useEffect(() => {
        if (auth?.isLoading) return;

        if (!auth?.user) {
            router.push("/");
            return;
        }

        if (auth.user.role !== "EMPLOYER") {
            setLoading(false);
            return;
        }

        loadCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

    const stats = useMemo(() => {
        const verified = companies.filter(isCompanyVerified).length;
        const pending = companies.length - verified;

        return {
            total: companies.length,
            verified,
            pending,
        };
    }, [companies]);

    const loadCompanies = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await companyApi.getMyCompanies(0, 20);
            setCompanies(response.content || []);
        } catch (error) {
            setMessage({
                type: "error",
                text: getApiErrorMessage(error, "Failed to load employer profile."),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (
        data: CreateCompanyRequest,
        verificationFile: File,
        logoFile?: File
    ) => {
        setCreating(true);
        setMessage(null);

        try {
            const created = await companyApi.createCompany(data);

            let updatedCompany = created;

            if (logoFile) {
                updatedCompany = await companyApi.uploadCompanyLogo(created.id, logoFile);
            }

            updatedCompany = await companyApi.uploadVerificationDocument(
                created.id,
                verificationFile
            );

            setCompanies((prev) => [updatedCompany, ...prev]);

            setMessage({
                type: "success",
                text: "Company profile created, logo uploaded, and verification PDF submitted. Please wait for Admin approval before posting jobs.",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: getApiErrorMessage(error, "Failed to create company profile."),
            });
        } finally {
            setCreating(false);
        }
    };

    if (auth?.isLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="lg:col-span-2 h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!auth?.user) return null;

    if (auth.user.role !== "EMPLOYER") {
        return <EmployerAccessDenied />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <EmployerProfileHeader />

                {message && (
                    <div
                        className={`mb-6 rounded-2xl border p-4 text-sm ${message.type === "success"
                            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : message.type === "info"
                                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <aside className="space-y-6">
                        <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                Account Information
                            </h2>

                            <div className="mt-5 space-y-4 text-sm">
                                <Info label="Username" value={auth.user.username} />
                                <Info label="Email" value={auth.user.email} />
                                <Info label="Role" value={auth.user.role} />
                                <Info label="Status" value={auth.user.status} />
                            </div>
                        </section>

                        <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                Company Summary
                            </h2>

                            <div className="grid grid-cols-3 gap-3 mt-5">
                                <Stat label="Total" value={stats.total} />
                                <Stat label="Verified" value={stats.verified} />
                                <Stat label="Pending" value={stats.pending} />
                            </div>

                            <div className="mt-5 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-4 text-sm text-yellow-700 dark:text-yellow-300">
                                Admin approval is required before posting jobs. This supports
                                the moderation flow for the final demo.
                            </div>
                        </section>

                        <EmployerCompanyForm
                            loading={creating}
                            onSubmit={handleCreateCompany}
                        />
                    </aside>

                    <main id="companies" className="lg:col-span-2">
                        <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                Company Profiles
                            </h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Verified companies can be used when posting jobs.
                            </p>

                            <div className="mt-6 space-y-4">
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <EmployerCompanyCard key={company.id} company={company} />
                                    ))
                                ) : (
                                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-8 text-center">
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            No company profile yet
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Create a company profile to start the Admin verification
                                            process.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white break-all">
                {value || "N/A"}
            </p>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    );
}