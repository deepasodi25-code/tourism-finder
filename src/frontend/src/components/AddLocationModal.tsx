import { useState } from "react";
import { useAddLocation } from "../hooks/useQueries";
import { Category } from "../backend.d";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: Category.hotel, label: "Hotel" },
  { value: Category.museum, label: "Museum" },
  { value: Category.park, label: "Park" },
  { value: Category.beach, label: "Beach" },
  { value: Category.landmark, label: "Landmark" },
  { value: Category.restaurant, label: "Restaurant" },
];

interface FormState {
  name: string;
  description: string;
  category: Category | "";
  address: string;
  city: string;
  country: string;
  directions: string;
  imageUrl: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: "",
  address: "",
  city: "",
  country: "",
  directions: "",
  imageUrl: "",
};

export function AddLocationModal({ open, onClose }: AddLocationModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const addLocation = useAddLocation();

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.category) return toast.error("Category is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.address.trim()) return toast.error("Address is required");
    if (!form.city.trim()) return toast.error("City is required");
    if (!form.country.trim()) return toast.error("Country is required");
    if (!form.directions.trim()) return toast.error("Directions are required");

    try {
      await addLocation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category as Category,
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        directions: form.directions.trim(),
        imageUrl: form.imageUrl.trim(),
      });
      toast.success(`"${form.name}" added successfully!`);
      setForm(EMPTY_FORM);
      onClose();
    } catch {
      toast.error("Failed to add location. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Add New Location
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="loc-name">Name *</Label>
            <Input
              id="loc-name"
              placeholder="e.g. Eiffel Tower"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => updateField("category", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="loc-desc">Description *</Label>
            <Textarea
              id="loc-desc"
              placeholder="Describe this place..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="loc-addr">Address *</Label>
            <Input
              id="loc-addr"
              placeholder="e.g. Champ de Mars, 5 Avenue Anatole France"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loc-city">City *</Label>
              <Input
                id="loc-city"
                placeholder="e.g. Paris"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc-country">Country *</Label>
              <Input
                id="loc-country"
                placeholder="e.g. France"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>
          </div>

          {/* Directions */}
          <div className="space-y-1.5">
            <Label htmlFor="loc-directions">Directions *</Label>
            <Textarea
              id="loc-directions"
              placeholder="How to get there? List steps on separate lines..."
              value={form.directions}
              onChange={(e) => updateField("directions", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="loc-image">Image URL (optional)</Label>
            <Input
              id="loc-image"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={addLocation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={addLocation.isPending}
            >
              {addLocation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Location"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
