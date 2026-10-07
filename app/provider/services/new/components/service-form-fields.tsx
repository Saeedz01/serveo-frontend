"use client";

import { LocationMapPicker } from "@/components/maps/location-map-picker";
import {
  FileUpload,
  Input,
  Label,
  Select,
  Textarea,
  Typography,
} from "@/components/ui";
import type { AvailabilitySlot, PriceUnit } from "@/lib/prototype-types";
import { serviceCategories } from "@/lib/services-catalog";
import { AvailabilityFields } from "./availability-fields";

type ServiceFormFieldsProps = {
  title: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  address: string;
  priceAmount: number;
  priceUnit: PriceUnit;
  radiusKm: number;
  lat: number;
  lng: number;
  availability: AvailabilitySlot[];
  errors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPriceAmountChange: (value: number) => void;
  onPriceUnitChange: (value: PriceUnit) => void;
  onRadiusChange: (value: number) => void;
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
  onAvailabilityChange: (value: AvailabilitySlot[]) => void;
};

export function ServiceFormFields({
  title,
  categoryId,
  description,
  imageUrl,
  address,
  priceAmount,
  priceUnit,
  radiusKm,
  lat,
  lng,
  availability,
  errors,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  onImageChange,
  onAddressChange,
  onPriceAmountChange,
  onPriceUnitChange,
  onRadiusChange,
  onCoordsChange,
  onAvailabilityChange,
}: ServiceFormFieldsProps) {
  return (
    <>
      <div data-field="title">
        <Label htmlFor="service-title">Title</Label>
        <Input
          id="service-title"
          value={title}
          invalid={Boolean(errors.title)}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="IKEA furniture assembly"
        />
        {errors.title ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.title}
          </Typography>
        ) : null}
      </div>

      <div data-field="categoryId">
        <Label htmlFor="service-category">Service category</Label>
        <Select
          id="service-category"
          value={categoryId}
          invalid={Boolean(errors.categoryId)}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {serviceCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </Select>
        {errors.categoryId ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.categoryId}
          </Typography>
        ) : null}
      </div>

      <div data-field="description">
        <Label htmlFor="service-description">Description</Label>
        <Textarea
          id="service-description"
          value={description}
          invalid={Boolean(errors.description)}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="What is included, typical duration, and tools you bring."
        />
        {errors.description ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.description}
          </Typography>
        ) : null}
      </div>

      <div data-field="imageUrl">
        <FileUpload
          label="Service image"
          valueUrl={imageUrl}
          onChange={onImageChange}
          error={errors.imageUrl}
        />
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div data-field="priceAmount">
          <Label htmlFor="service-price">Price amount ($)</Label>
          <Input
            id="service-price"
            type="number"
            min={1}
            step={1}
            value={priceAmount}
            invalid={Boolean(errors.priceAmount)}
            onChange={(event) => onPriceAmountChange(Number(event.target.value))}
          />
          {errors.priceAmount ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.priceAmount}
            </Typography>
          ) : null}
        </div>
        <div>
          <Label htmlFor="service-price-unit">Pricing type</Label>
          <Select
            id="service-price-unit"
            value={priceUnit}
            onChange={(event) =>
              onPriceUnitChange(event.target.value as PriceUnit)
            }
          >
            <option value="project">Starting project price</option>
            <option value="hour">Hourly rate</option>
            <option value="flat">Flat rate</option>
          </Select>
        </div>
      </div>

      <div data-field="address">
        <Label htmlFor="service-address">Address</Label>
        <Input
          id="service-address"
          value={address}
          invalid={Boolean(errors.address)}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="Neighborhood, city"
        />
        {errors.address ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.address}
          </Typography>
        ) : null}
      </div>

      <LocationMapPicker
        lat={lat}
        lng={lng}
        radiusKm={radiusKm}
        onChange={onCoordsChange}
        onAddressResolved={onAddressChange}
      />

      <div data-field="radiusKm">
        <Label htmlFor="service-radius">Area radius (km)</Label>
        <Input
          id="service-radius"
          type="number"
          min={1}
          max={50}
          value={radiusKm}
          invalid={Boolean(errors.radiusKm)}
          onChange={(event) => onRadiusChange(Number(event.target.value))}
        />
        {errors.radiusKm ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.radiusKm}
          </Typography>
        ) : null}
      </div>

      <AvailabilityFields value={availability} onChange={onAvailabilityChange} />
    </>
  );
}
