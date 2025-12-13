import { CompaniesTable } from "@/components/company/company-table";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function CompaniesPage() {
    return (
        <DashboardLayout>
            <div className="mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-balance">Company Management</h1>
                    <p className="text-muted-foreground mt-2">Manage your companies and their information</p>
                </div>
                <CompaniesTable />
            </div>
        </DashboardLayout>
    )
}
