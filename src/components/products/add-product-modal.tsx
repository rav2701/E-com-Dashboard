"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import {
  X,
  Plus,
  Package,
  DollarSign,
  Hash,
  Tag,
  Image,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";
import { resolveProductImage } from "@/lib/product-images";

// ───────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────

export interface NewProductData {
  name: string;
  sku: string;
  price: string;
  originalPrice?: string;
  stock: number;
  category: string;
  description: string;
  imageSeed: string;
}

interface AddProductModalProps {
  categories: string[];
  onClose: () => void;
  onAdd: (product: NewProductData) => void;
}

// ───────────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────────

function generateSku(category: string, index: number): string {
  const prefix = category
    .split(/[\s&-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

// ───────────────────────────────────────────────────────────────
//  Component
// ───────────────────────────────────────────────────────────────

export function AddProductModal({
  categories,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    stock: "100",
    category: categories[0] || "Accessories",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // ── GSAP Entrance ──────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
    tl.fromTo(
      panelRef.current,
      { scale: 0.92, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
      "-=0.1"
    );
    return () => {
      tl.kill();
    };
  }, []);

  // ── Keyboard ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ── Validation ──────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price.trim()) errs.price = "Price is required";
    else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
      errs.price = "Enter a valid price";
    if (form.originalPrice && (isNaN(parseFloat(form.originalPrice)) || parseFloat(form.originalPrice) <= 0))
      errs.originalPrice = "Enter a valid price";
    const stockNum = parseInt(form.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) errs.stock = "Enter a valid stock number";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const product: NewProductData = {
      name: form.name.trim(),
      sku: generateSku(form.category, Date.now()),
      price: `$${parseFloat(form.price).toFixed(2)}`,
      originalPrice: form.originalPrice
        ? `$${parseFloat(form.originalPrice).toFixed(2)}`
        : undefined,
      stock: parseInt(form.stock, 10),
      category: form.category,
      description: form.description.trim(),
      imageSeed: form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    };

    setShowSuccess(true);
    setTimeout(() => {
      onAdd(product);
    }, 800);
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Click outside ───────────────────────────────────────
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg p-4"
    >
      <div
        ref={panelRef}
        className={cn(
          "relative w-full max-w-lg rounded-2xl overflow-hidden",
          "bg-white dark:bg-zinc-900",
          "shadow-2xl ring-1 ring-white/10"
        )}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-200/60 dark:border-zinc-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Product
              </h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Add a new product to your catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Success State ─────────────────────────────── */}
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 mb-4">
              <Check className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Product Added!
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {form.name} has been added to your catalog.
            </p>
          </div>
        ) : (
          /* ── Form ────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Product name */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                <Package className="h-3 w-3" />
                Product Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Wireless Headphones Pro"
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                  errors.name && "border-rose-300 dark:border-rose-800 focus:ring-rose-500/40 focus:border-rose-500"
                )}
              />
              {errors.name && (
                <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                <Tag className="h-3 w-3" />
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm appearance-none",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                  "cursor-pointer"
                )}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 8px center",
                  backgroundSize: "16px",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <DollarSign className="h-3 w-3" />
                  Price
                </label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="129.99"
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-sm",
                    "bg-zinc-50 dark:bg-zinc-800/50",
                    "border border-zinc-200 dark:border-zinc-700",
                    "text-zinc-900 dark:text-zinc-100",
                    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                    errors.price && "border-rose-300 dark:border-rose-800 focus:ring-rose-500/40 focus:border-rose-500"
                  )}
                />
                {errors.price && (
                  <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  <DollarSign className="h-3 w-3" />
                  Original Price
                </label>
                <input
                  type="text"
                  value={form.originalPrice}
                  onChange={(e) => updateField("originalPrice", e.target.value)}
                  placeholder="179.99 (optional)"
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-sm",
                    "bg-zinc-50 dark:bg-zinc-800/50",
                    "border border-zinc-200 dark:border-zinc-700",
                    "text-zinc-900 dark:text-zinc-100",
                    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                    errors.originalPrice && "border-rose-300 dark:border-rose-800 focus:ring-rose-500/40 focus:border-rose-500"
                  )}
                />
                {errors.originalPrice && (
                  <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.originalPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                <Hash className="h-3 w-3" />
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                  errors.stock && "border-rose-300 dark:border-rose-800 focus:ring-rose-500/40 focus:border-rose-500"
                )}
              />
              {errors.stock && (
                <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.stock}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                <Image className="h-3 w-3" />
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your product..."
                rows={3}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-sm resize-none",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500",
                  errors.description && "border-rose-300 dark:border-rose-800 focus:ring-rose-500/40 focus:border-rose-500"
                )}
              />
              {errors.description && (
                <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image preview */}
            {form.category && (
              <div className="rounded-lg overflow-hidden ring-1 ring-zinc-200/60 dark:ring-zinc-700/50">
                <img
                  src={resolveProductImage(form.name || "new product", form.category)}
                  alt={form.category}
                  className="h-24 w-full object-cover"
                />
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  {form.name
                    ? "Image matches product name"
                    : `Auto-selected for ${form.category}`}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold",
                  "bg-indigo-600 text-white",
                  "hover:bg-indigo-700 active:bg-indigo-800",
                  "transition-colors duration-200",
                  "shadow-sm"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Product
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
