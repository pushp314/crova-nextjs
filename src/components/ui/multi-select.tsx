import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export type Option = {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
    disabled
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    const filteredOptions = React.useMemo(() => {
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [options, searchTerm])

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item))
    }

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((i) => i !== value))
        } else {
            onChange([...selected, value])
        }
    }

    const selectedLabels = React.useMemo(() => {
        return selected.map(id => options.find(o => o.value === id)?.label).filter(Boolean)
    }, [selected, options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-auto min-h-10", className)}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
                        {selected.length > 0 && selectedLabels.length <= 3 && (
                            selectedLabels.map((label, i) => (
                                <Badge variant="secondary" key={selected[i]} className="mr-1 mb-1" onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnselect(selected[i])
                                }}>
                                    {label}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary-foreground/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(selected[i]);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </Badge>
                            ))
                        )}
                        {selected.length > 3 && (
                            <Badge variant="secondary" className="mr-1 mb-1">
                                {selected.length} selected
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="start">
                <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                />
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredOptions.length === 0 && <div className="text-center text-sm py-4 text-muted-foreground">No items found.</div>}
                    {filteredOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => handleSelect(option.value)}>
                            <Checkbox
                                id={`ms-${option.value}`}
                                checked={selected.includes(option.value)}
                                onCheckedChange={() => handleSelect(option.value)}
                            />
                            <Label htmlFor={`ms-${option.value}`} className="flex-1 cursor-pointer">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
