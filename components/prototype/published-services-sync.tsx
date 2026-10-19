"use client";

import { useEffect } from "react";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { PrototypeService } from "@/lib/prototype-types";
import { useGetPublishedServicesQuery } from "@/service/api";
import type { ServiceDto } from "@/service/api/types";

function toPrototypeService(service: ServiceDto): PrototypeService {
  return {
    id: service.id,
    providerId: service.providerId,
    categoryId: service.categoryId,
    title: service.title,
    description: service.description,
    imageUrl: service.imageUrl,
    address: service.address,
    lat: service.lat,
    lng: service.lng,
    radiusKm: service.radiusKm,
    priceAmount: service.priceAmount,
    priceUnit: service.priceUnit,
    availability: service.availability,
    status: service.status,
    createdAt: service.createdAt,
  };
}

/** Loads published services from the API into in-memory prototype state. */
export function PublishedServicesSync() {
  const { ready, commit } = usePrototype();
  const { data, isSuccess } = useGetPublishedServicesQuery(undefined, {
    skip: !ready,
  });

  useEffect(() => {
    if (!ready || !isSuccess || !data) return;

    commit((prev) => {
      const fromApi = data.map(toPrototypeService);
      const providers = [...prev.providers];

      for (const service of data) {
        if (!service.providerName) continue;
        const exists = providers.some(
          (provider) => provider.id === service.providerId,
        );
        if (exists) continue;
        providers.push({
          id: service.providerId,
          name: service.providerName,
          phone: "",
          password: "",
          idFrontUrl: "",
          idBackUrl: "",
          status: "verified",
          createdAt: service.createdAt,
        });
      }

      return {
        ...prev,
        providers,
        services: fromApi,
      };
    });
  }, [commit, data, isSuccess, ready]);

  return null;
}
