"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "./product-grid";
import Pagination from "./pagination";
import { useProducts } from "@/lib/products-context";
import { useToast } from "@/lib/toast";
import type { Product } from "@/lib/types";

const PRODUCTS_PER_PAGE = 12;

export default function ProductsWithSearch() {
  const { products: allProducts, isLoading: globalLoading, refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "name" | "price-low" | "price-high" | "newest"
  >("newest");
  const { addToast } = useToast();

  // Load products on mount and set up categories
  useEffect(() => {
    if (allProducts.length === 0) {
      refreshProducts();
    }
  }, [allProducts.length, refreshProducts]);

  // Extract categories whenever products change
  useEffect(() => {
    if (allProducts.length > 0) {
      const uniqueCategories = Array.from(
        new Set(allProducts.map((p) => p.category))
      );
      setCategories(uniqueCategories);
      
      // Set max price for slider
      const maxPrice = Math.max(...allProducts.map((p) => typeof p.price === 'number' ? p.price : parseFloat(p.price || '0')));
      setPriceRange([0, Math.ceil(maxPrice)]);
      
      // Initialize filtered and paginated products
      setFilteredProducts(allProducts);
      setProducts(allProducts.slice(0, PRODUCTS_PER_PAGE));
    }
  }, [allProducts]);

  // Handle search and filtering
  const handleSearch = useCallback(() => {
    setLoading(true);

    let filtered = [...allProducts];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Sort products
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page
    setProducts(filtered.slice(0, PRODUCTS_PER_PAGE));
    setLoading(false);
  }, [searchTerm, allProducts, priceRange, selectedCategories, sortBy]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setProducts(filteredProducts.slice(startIndex, endIndex));

    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle category toggle
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    const maxPrice = Math.max(...allProducts.map((p) => p.price));
    setPriceRange([0, Math.ceil(maxPrice)]);
    setSelectedCategories([]);
    setSortBy("newest");
    setFilteredProducts(allProducts);
    setCurrentPage(1);
    setProducts(allProducts.slice(0, PRODUCTS_PER_PAGE));
  };

  // Effect to apply filters when they change
  useEffect(() => {
    if (allProducts.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchTerm,
    priceRange,
    selectedCategories,
    sortBy,
    handleSearch,
    allProducts,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const hasActiveFilters =
    searchTerm ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < Math.max(...allProducts.map((p) => p.price));

  return (
    <div className="space-y-6">
      {/* Search Bar and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 dark:text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar productos por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="newest">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="price-low">Precio: Menor a Mayor</option>
            <option value="price-high">Precio: Mayor a Menor</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center dark:border-gray-700 dark:text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            Mostrando {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
            {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}{" "}
            de {filteredProducts.length} productos
            {searchTerm && (
              <span className="ml-2">
                para "<strong>{searchTerm}</strong>"
              </span>
            )}
          </p>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="dark:bg-gray-700"
                >
                  {category}
                  <button
                    className="ml-1 hover:text-red-500"
                    onClick={() => toggleCategory(category)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center dark:text-gray-300"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar Todo
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-in fade-in slide-in-from-top duration-300 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-4 dark:text-white">
                  Rango de Precio
                </h4>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 500]}
                    max={Math.max(
                      500,
                      Math.max(...allProducts.map((p) => p.price))
                    )}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <h4 className="font-medium mb-4 dark:text-white">Categories</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm dark:text-gray-300"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {loading || globalLoading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="dark:text-white">Cargando productos...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <ProductGrid products={products} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Intenta ajustando tus términos de búsqueda o filtros para encontrar lo que 
            estás buscando.
          </p>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="dark:border-gray-700 dark:text-white"
          >
            Limpiar Todos los Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
