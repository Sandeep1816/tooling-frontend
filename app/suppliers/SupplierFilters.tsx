"use client"

import { useEffect, useState, useCallback } from "react"
import { useApolloClient, useQuery } from "@/lib/apollo/hooks"
import { ChevronDown, Search, MapPin, Tag, X, Loader2 } from "lucide-react"
import {
  INDUSTRIES_QUERY,
  INDUSTRY_CHILDREN_QUERY,
} from "@/lib/graphql/operations"

type Industry = {
  id: string
  name: string
  parentId?: string | null
}

export type SupplierFilterState = {
  name: string
  location: string
  category: string
  featuredOnly: boolean
  industryId: string | null
}

type Props = {
  onFilterChange?: (filters: SupplierFilterState) => void
}

export default function SupplierFilters({ onFilterChange }: Props) {
  const client = useApolloClient()
  const { data, loading: loadingIndustries } = useQuery(INDUSTRIES_QUERY)

  const industries: Industry[] =
    data?.industries?.filter((i: Industry) => !i.parentId) ?? []

  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [childrenCache, setChildrenCache] = useState<Record<string, Industry[]>>({})
  const [loadingChildren, setLoadingChildren] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<SupplierFilterState>({
    name: "",
    location: "",
    category: "",
    featuredOnly: false,
    industryId: null,
  })

  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const emitFilters = useCallback(
    (newFilters: SupplierFilterState) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      const timer = setTimeout(() => {
        onFilterChange?.(newFilters)
      }, 400)
      setDebounceTimer(timer)
    },
    [debounceTimer, onFilterChange]
  )

  const updateFilter = (key: keyof SupplierFilterState, value: string | boolean | null) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    emitFilters(updated)
  }

  const clearFilters = () => {
    const cleared: SupplierFilterState = {
      name: "",
      location: "",
      category: "",
      featuredOnly: false,
      industryId: null,
    }
    setFilters(cleared)
    onFilterChange?.(cleared)
  }

  const loadChildren = async (industryId: string) => {
    if (childrenCache[industryId]) return

    setLoadingChildren((prev) => new Set(prev).add(industryId))
    try {
      const { data: childData } = await client.query<{ industryChildren: Industry[] }>({
        query: INDUSTRY_CHILDREN_QUERY,
        variables: { parentId: industryId },
      })
      setChildrenCache((prev) => ({
        ...prev,
        [industryId]: childData?.industryChildren ?? [],
      }))
    } catch (err) {
      console.error("Failed to load children", err)
      setChildrenCache((prev) => ({ ...prev, [industryId]: [] }))
    } finally {
      setLoadingChildren((prev) => {
        const s = new Set(prev)
        s.delete(industryId)
        return s
      })
    }
  }

  const toggleSection = async (industryId: string) => {
    const newOpen = new Set(openSections)

    if (newOpen.has(industryId)) {
      newOpen.delete(industryId)
    } else {
      newOpen.add(industryId)
      await loadChildren(industryId)
    }

    setOpenSections(newOpen)
  }

  const toggleChildSection = async (childId: string) => {
    const newOpen = new Set(openSections)

    if (newOpen.has(childId)) {
      newOpen.delete(childId)
    } else {
      newOpen.add(childId)
      await loadChildren(childId)
    }

    setOpenSections(newOpen)
  }

  const selectIndustry = (id: string) => {
    const newId = filters.industryId === id ? null : id
    updateFilter("industryId", newId)
  }

  const hasActiveFilters =
    filters.name ||
    filters.location ||
    filters.category ||
    filters.featuredOnly ||
    filters.industryId !== null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-[#0F5B78] text-white px-4 sm:px-5 py-4 rounded-t-lg flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold">Filter Suppliers</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent"
              placeholder="Search by supplier name"
              value={filters.name}
              onChange={(e) => updateFilter("name", e.target.value)}
            />
            {filters.name && (
              <button onClick={() => updateFilter("name", "")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent"
              placeholder="Search by location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
            />
            {filters.location && (
              <button onClick={() => updateFilter("location", "")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B78] focus:border-transparent"
              placeholder="Search by product category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            />
            {filters.category && (
              <button onClick={() => updateFilter("category", "")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md cursor-pointer hover:bg-amber-100 transition">
          <input
            type="checkbox"
            checked={filters.featuredOnly}
            onChange={(e) => updateFilter("featuredOnly", e.target.checked)}
            className="w-4 h-4 text-[#0F5B78] border-gray-300 rounded focus:ring-2 focus:ring-[#0F5B78]"
          />
          <span className="font-semibold text-sm text-amber-900 flex items-center gap-2">
            ⭐ Featured Suppliers Only
          </span>
        </label>

        <div className="border-t border-gray-200" />

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Browse by Industry
          </p>

          {loadingIndustries ? (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading industries...</span>
            </div>
          ) : (
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {industries.map((industry) => {
                const isOpen = openSections.has(industry.id)
                const children = childrenCache[industry.id] ?? []
                const isLoadingChildren = loadingChildren.has(industry.id)
                const isSelected = filters.industryId === industry.id

                return (
                  <div key={industry.id} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="flex items-center">
                      <label className="flex items-center pl-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => selectIndustry(industry.id)}
                          className="w-4 h-4 text-[#0F5B78] border-gray-300 rounded focus:ring-2 focus:ring-[#0F5B78] cursor-pointer"
                        />
                      </label>

                      <button
                        onClick={() => toggleSection(industry.id)}
                        className={`flex-1 flex items-center justify-between px-3 py-2.5 text-left transition
                          ${isSelected ? "bg-[#0F5B78]/5" : "hover:bg-gray-50"}`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? "text-[#0F5B78]" : "text-gray-800"}`}>
                          {industry.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {isLoadingChildren && <Loader2 size={12} className="animate-spin text-gray-400" />}
                          <ChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        {isLoadingChildren ? (
                          <div className="flex items-center gap-2 px-4 py-3 text-gray-400">
                            <Loader2 size={12} className="animate-spin" />
                            <span className="text-xs">Loading...</span>
                          </div>
                        ) : children.length === 0 ? (
                          <p className="text-xs text-gray-400 px-4 py-3">No sub-categories</p>
                        ) : (
                          <div className="py-1">
                            {children.map((child) => {
                              const childOpen = openSections.has(child.id)
                              const grandchildren = childrenCache[child.id] ?? []
                              const isLoadingGrand = loadingChildren.has(child.id)
                              const childSelected = filters.industryId === child.id

                              return (
                                <div key={child.id}>
                                  <div className="flex items-center">
                                    <label className="flex items-center pl-6 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={childSelected}
                                        onChange={() => selectIndustry(child.id)}
                                        className="w-3.5 h-3.5 text-[#0F5B78] border-gray-300 rounded focus:ring-2 focus:ring-[#0F5B78] cursor-pointer"
                                      />
                                    </label>
                                    <button
                                      onClick={() => toggleChildSection(child.id)}
                                      className={`flex-1 flex items-center justify-between px-3 py-2 text-left transition
                                        ${childSelected ? "bg-[#0F5B78]/5" : "hover:bg-gray-100"}`}
                                    >
                                      <span className={`text-xs font-medium ${childSelected ? "text-[#0F5B78]" : "text-gray-700"}`}>
                                        {child.name}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {isLoadingGrand && <Loader2 size={10} className="animate-spin text-gray-400" />}
                                        <ChevronDown
                                          className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${childOpen ? "rotate-180" : ""}`}
                                        />
                                      </div>
                                    </button>
                                  </div>

                                  {childOpen && (
                                    <div className="bg-white border-t border-gray-100">
                                      {isLoadingGrand ? (
                                        <div className="flex items-center gap-2 px-8 py-2 text-gray-400">
                                          <Loader2 size={10} className="animate-spin" />
                                          <span className="text-xs">Loading...</span>
                                        </div>
                                      ) : grandchildren.length === 0 ? (
                                        <p className="text-xs text-gray-400 px-8 py-2">No sub-categories</p>
                                      ) : (
                                        grandchildren.map((grand) => {
                                          const grandSelected = filters.industryId === grand.id
                                          return (
                                            <label
                                              key={grand.id}
                                              className={`flex items-center gap-2.5 px-8 py-2 cursor-pointer transition
                                                ${grandSelected ? "bg-[#0F5B78]/5" : "hover:bg-gray-50"}`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={grandSelected}
                                                onChange={() => selectIndustry(grand.id)}
                                                className="w-3 h-3 text-[#0F5B78] border-gray-300 rounded focus:ring-2 focus:ring-[#0F5B78] cursor-pointer"
                                              />
                                              <span className={`text-xs ${grandSelected ? "text-[#0F5B78] font-medium" : "text-gray-600"}`}>
                                                {grand.name}
                                              </span>
                                            </label>
                                          )
                                        })
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="w-full mt-2 py-2.5 text-sm font-semibold text-[#0F5B78] border border-[#0F5B78] rounded-md hover:bg-[#0F5B78] hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}
