"use client";

import { useMemo } from "react";
import { LocationMapPicker } from "@/components/maps/location-map-picker";
import {
  CategorySuggestions,
  DidYouMeanCategory,
} from "@/components/services/category-suggestions";
import {
  FileUpload,
  Input,
  Label,
  Select,
  Textarea,
  Typography,
} from "@/components/ui";
import type { AvailabilitySlot, PriceUnit } from "@/lib/prototype-types";
import {
  isOtherServicesCategory,
  suggestCategories,
  suggestCategoryFromSpecialty,
} from "@/lib/suggest-category";
import type { ServiceCategoryDto, ServiceCityDto } from "@/service/api";
import { AvailabilityFields } from "./availability-fields";

type ServiceFormFieldsProps = {
  title: string;
  cityId: string;
  cities: ServiceCityDto[];
  citiesLoading?: boolean;
  parentCategoryId: string;
  categoryId: string;
  categories: ServiceCategoryDto[];
  categoriesLoading?: boolean;
  description: string;
  specialty: string;
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
  onCityChange: (value: string) => void;
  onParentCategoryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
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
  cityId,
  cities,
  citiesLoading = false,
  parentCategoryId,
  categoryId,
  categories,
  categoriesLoading = false,
  description,
  specialty,
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
  onCityChange,
  onParentCategoryChange,
  onCategoryChange,
  onDescriptionChange,
  onSpecialtyChange,
  onImageChange,
  onAddressChange,
  onPriceAmountChange,
  onPriceUnitChange,
  onRadiusChange,
  onCoordsChange,
  onAvailabilityChange,
}: ServiceFormFieldsProps) {
  const rootCategories = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories],
  );
  const leafCategories = useMemo(
    () => categories.filter((category) => category.parentId !== null),
    [categories],
  );
  const subcategories = useMemo(
    () =>
      leafCategories.filter((category) => category.parentId === parentCategoryId),
    [leafCategories, parentCategoryId],
  );

  const isOther = isOtherServicesCategory(categories, categoryId);
  const suggestions = useMemo(
    () =>
      suggestCategories(leafCategories, { title, description, specialty }),
    [leafCategories, title, description, specialty],
  );
  const didYouMean = useMemo(
    () =>
      isOther ? suggestCategoryFromSpecialty(leafCategories, specialty) : null,
    [isOther, leafCategories, specialty],
  );

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

      <div data-field="cityId">
        <Label htmlFor="service-city">City</Label>
        <Select
          id="service-city"
          value={cityId}
          invalid={Boolean(errors.cityId)}
          disabled={citiesLoading}
          onChange={(event) => onCityChange(event.target.value)}
        >
          <option value="">
            {citiesLoading ? "Loading cities…" : "Select a city"}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </Select>
        {errors.cityId ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.cityId}
          </Typography>
        ) : null}
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
        <div data-field="parentCategoryId">
          <Label htmlFor="service-parent-category">Service category</Label>
          <Select
            id="service-parent-category"
            value={parentCategoryId}
            invalid={Boolean(errors.categoryId)}
            disabled={categoriesLoading}
            onChange={(event) => {
              onParentCategoryChange(event.target.value);
              onCategoryChange("");
            }}
          >
            <option value="">
              {categoriesLoading ? "Loading categories…" : "Select a category"}
            </option>
            {rootCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div data-field="categoryId">
          <Label htmlFor="service-subcategory">Subcategory</Label>
          <Select
            id="service-subcategory"
            value={categoryId}
            invalid={Boolean(errors.categoryId)}
            disabled={categoriesLoading || !parentCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">
              {!parentCategoryId
                ? "Select a category first"
                : "Select a subcategory"}
            </option>
            {subcategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.categoryId ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.categoryId}
            </Typography>
          ) : null}
        </div>
      </div>

      <CategorySuggestions
        suggestions={suggestions}
        selectedId={categoryId}
        onSelect={(id) => {
          const leaf = leafCategories.find((category) => category.id === id);
          if (!leaf?.parentId) {
            onCategoryChange(id);
            return;
          }
          onParentCategoryChange(leaf.parentId);
          onCategoryChange(id);
        }}
      />

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

      {isOther ? (
        <div data-field="specialty">
          <Label htmlFor="service-specialty">Specialty</Label>
          <Textarea
            id="service-specialty"
            value={specialty}
            invalid={Boolean(errors.specialty)}
            onChange={(event) => onSpecialtyChange(event.target.value)}
            placeholder="Describe the kind of work you do (required for Other Services)."
          />
          <DidYouMeanCategory
            suggestion={didYouMean}
            onAccept={(id) => {
              const leaf = leafCategories.find((category) => category.id === id);
              if (leaf?.parentId) {
                onParentCategoryChange(leaf.parentId);
              }
              onCategoryChange(id);
              onSpecialtyChange("");
            }}
          />
          {errors.specialty ? (
            <Typography variant="caption" className="mt-2 block text-error">
              {errors.specialty}
            </Typography>
          ) : null}
        </div>
      ) : null}

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
