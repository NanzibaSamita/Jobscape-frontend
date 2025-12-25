"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Building2 } from "lucide-react"
import { EditCompanyDialog } from "./company-edit"
import { api, axiosInstance } from "@/lib/axios/axios"

interface Company {
    id: number
    company_name: string
    logo: string | null
    country_id: number
    sector_id: number
    is_active: number
    country_name: string
    sector_name: string
    company_created_by_full_name: string
    company_updated_by_full_name: string | null
    created_at: string
    updated_at: string
}

const SECTOR_GET_API_ENDPOINT = "/api/v1/sector-select";
const COUNTRY_GET_API_ENDPOINT = "/api/v1/country-select";
export function CompaniesTable() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [editingCompany, setEditingCompany] = useState<Company | null>(null)
    const [countries, setCountries] = useState<{
        id: number;
        name: string;
    }[]>([]);
    const [sectors, setSectors] = useState<{
        id: number;
        name: string;
    }[]>([]);


    function fetchCountries() {
        axiosInstance
            .get(COUNTRY_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setCountries(res.data?.data?.map(({ id, country_name }: { id: string, country_name: string }) => ({ id, name: country_name })) || []);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }

    function fetchSectors() {
        axiosInstance
            .get(SECTOR_GET_API_ENDPOINT, {
                signal: new AbortController().signal,
            })
            .then((res) => {
                setSectors(res.data?.data?.map(({ id, name }: { id: string, name: string }) => ({ id, name: name })) || []);
            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            });
    }


    useEffect(() => {
        fetchCompanies()
        fetchCountries()
        fetchSectors()
    }, [])

    const fetchCompanies = async () => {
        try {
            const response = await api.get("/api/v1/recruiter-companies")
            const data = response.data
            console.log("Fetched companies:", data)
            if (data.code === 200) {
                setCompanies(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch companies:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditSuccess = () => {
        fetchCompanies()
        setEditingCompany(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Sector</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={company.logo || undefined} alt={company.company_name} />
                                            <AvatarFallback>
                                                <Building2 className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{company.company_name}</div>
                                            <div className="text-sm text-muted-foreground">ID: {company.id}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{company.country_name}</TableCell>
                                <TableCell>
                                    <div className="max-w-[200px]">
                                        <div className="truncate text-sm">{company.sector_name}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={company.is_active ? "default" : "secondary"}>
                                        {company.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => setEditingCompany(company)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {editingCompany && (
                <EditCompanyDialog
                    company={editingCompany}
                    open={!!editingCompany}
                    onOpenChange={(open) => !open && setEditingCompany(null)}
                    onSuccess={handleEditSuccess}
                    sectors={sectors}
                    countries={countries}
                />
            )}
        </>
    )
}
