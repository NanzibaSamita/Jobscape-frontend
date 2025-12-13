"use client"
import { X, Calendar, DollarSign, MapPin, Building, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface MoreFiltersModalProps {
    isOpen: boolean
    onClose: () => void
    filters: {
        dateRange: string
        salaryMin: number
        salaryMax: number
        jobTypes: string[]
        sectors: string[]
        locations: string[]
        jobModes: string[]
        levels: string[]
        statusIds: number[]
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFiltersChange: (filters: any) => void
    onApplyFilters: () => void
    onClearFilters: () => void
}

export function MoreFiltersModal({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
}: MoreFiltersModalProps) {
    if (!isOpen) return null

    const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]
    const sectorOptions = ["Engineering", "Product", "Design", "Marketing", "Sales", "Analytics", "HR", "Finance"]
    const locationOptions = [
        "San Francisco, CA",
        "New York, NY",
        "Los Angeles, CA",
        "Austin, TX",
        "Seattle, WA",
        "Remote",
    ]
    const jobModeOptions = ["Remote", "Onsite", "Hybrid"]
    const levelOptions = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager", "Director"]
    const statusOptions = [
        { id: 1, label: "Active" },
        { id: 2, label: "Draft" },
        { id: 3, label: "Closed" },
    ]

    const handleJobTypeChange = (type: string, checked: boolean) => {
        const updated = checked ? [...filters.jobTypes, type] : filters.jobTypes.filter((t) => t !== type)
        onFiltersChange({ ...filters, jobTypes: updated })
    }

    const handleSectorChange = (sector: string, checked: boolean) => {
        const updated = checked ? [...filters.sectors, sector] : filters.sectors.filter((s) => s !== sector)
        onFiltersChange({ ...filters, sectors: updated })
    }

    const handleLocationChange = (location: string, checked: boolean) => {
        const updated = checked ? [...filters.locations, location] : filters.locations.filter((l) => l !== location)
        onFiltersChange({ ...filters, locations: updated })
    }

    const handleJobModeChange = (jobMode: string, checked: boolean) => {
        const updated = checked ? [...filters.jobModes, jobMode] : filters.jobModes.filter((j) => j !== jobMode)
        onFiltersChange({ ...filters, jobModes: updated })
    }

    const handleLevelChange = (level: string, checked: boolean) => {
        const updated = checked ? [...filters.levels, level] : filters.levels.filter((l) => l !== level)
        onFiltersChange({ ...filters, levels: updated })
    }

    const handleStatusChange = (statusId: number, checked: boolean) => {
        const updated = checked ? [...filters.statusIds, statusId] : filters.statusIds.filter((s) => s !== statusId)
        onFiltersChange({ ...filters, statusIds: updated })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <CardTitle className="text-xl font-semibold">Advanced Filters</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Range */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Posted Date
                            </Label>
                            <Select
                                value={filters.dateRange}
                                onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">Last 7 days</SelectItem>
                                    <SelectItem value="month">Last 30 days</SelectItem>
                                    <SelectItem value="quarter">Last 3 months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Job Status */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Job Status
                            </Label>
                            <div className="flex gap-4">
                                {statusOptions.map((status) => (
                                    <div key={status.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`status-${status.id}`}
                                            checked={filters.statusIds.includes(status.id)}
                                            onCheckedChange={(checked) => handleStatusChange(status.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`status-${status.id}`} className="text-sm">
                                            {status.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Salary Range
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-gray-500">Minimum</Label>
                                <Input
                                    type="number"
                                    placeholder="50,000"
                                    value={filters.salaryMin || ""}
                                    onChange={(e) => onFiltersChange({ ...filters, salaryMin: Number.parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Maximum</Label>
                                <Input
                                    type="number"
                                    placeholder="200,000"
                                    value={filters.salaryMax || ""}
                                    onChange={(e) => onFiltersChange({ ...filters, salaryMax: Number.parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job Type
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {jobTypeOptions.map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`jobtype-${type}`}
                                        checked={filters.jobTypes.includes(type)}
                                        onCheckedChange={(checked) => handleJobTypeChange(type, checked as boolean)}
                                    />
                                    <Label htmlFor={`jobtype-${type}`} className="text-sm">
                                        {type}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sector */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Sector
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {sectorOptions.map((sector) => (
                                <div key={sector} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`sector-${sector}`}
                                        checked={filters.sectors.includes(sector)}
                                        onCheckedChange={(checked) => handleSectorChange(sector, checked as boolean)}
                                    />
                                    <Label htmlFor={`sector-${sector}`} className="text-sm">
                                        {sector}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {locationOptions.map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`location-${location}`}
                                        checked={filters.locations.includes(location)}
                                        onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                                    />
                                    <Label htmlFor={`location-${location}`} className="text-sm">
                                        {location}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Mode */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Job Mode
                        </Label>
                        <div className="flex gap-6">
                            {jobModeOptions.map((jobMode) => (
                                <div key={jobMode} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`jobmode-${jobMode}`}
                                        checked={filters.jobModes.includes(jobMode)}
                                        onCheckedChange={(checked) => handleJobModeChange(jobMode, checked as boolean)}
                                    />
                                    <Label htmlFor={`jobmode-${jobMode}`} className="text-sm">
                                        {jobMode}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Level */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Level
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {levelOptions.map((level) => (
                                <div key={level} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`level-${level}`}
                                        checked={filters.levels.includes(level)}
                                        onCheckedChange={(checked) => handleLevelChange(level, checked as boolean)}
                                    />
                                    <Label htmlFor={`level-${level}`} className="text-sm">
                                        {level}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <Button variant="outline" onClick={onClearFilters}>
                        Clear All Filters
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={onApplyFilters} className="bg-black text-white hover:bg-gray-800">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}